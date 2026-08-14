import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, extname, isAbsolute, resolve } from 'node:path'

/**
 * 知识库图片资源处理
 *
 * 导入规则：
 *   - Markdown 中使用标准图片语法：![替代文本](./images/示意图.png)
 *   - 相对路径以文章文件所在目录为基准；
 *   - 导入时把图片文件复制到 data/uploads/knowledge/<slug>/ 下，
 *     并在数据库中登记到 knowledge_assets 表；
 *   - 正文中的 src 统一改写为 /api/knowledge/assets/<slug>/<文件名>，
 *     由服务端 API 路由读取磁盘返回；
 *   - http(s):// 外部图片不下载，直接保留原地址并登记到表内。
 */

/** 图片资源在磁盘上的根目录（以项目根目录为基准，与 data/cfdsolve.sqlite 同级） */
export const KNOWLEDGE_ASSET_ROOT = resolve(process.cwd(), 'data', 'uploads', 'knowledge')

export interface KnowledgeImage {
  /** 原始引用路径（Markdown 中的 src） */
  originalSrc: string
  /** 改写后的访问路径（写入正文 HTML） */
  urlPath: string
  /** 本地文件的绝对路径；外部图片为 undefined */
  localPath?: string
  /** 是否外部图片 */
  isExternal: boolean
  /** 替代文本 */
  alt: string
  /** 登记键：knowledge/<slug>/<文件名> */
  fileKey: string
  /** 原始文件名 */
  fileName: string
  mimeType: string
}

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff'
}

function mimeOf(fileName: string) {
  return MIME_BY_EXT[extname(fileName).toLowerCase()] || 'application/octet-stream'
}

/**
 * 扫描 Markdown 正文中的图片引用并改写 src。
 * 返回改写后的正文与图片清单（本地图片同时给出待复制的绝对路径）。
 */
export function rewriteImageRefs(
  source: string,
  sourceFile: string,
  slug: string
): { markdown: string; images: KnowledgeImage[] } {
  const images: KnowledgeImage[] = []
  const seen = new Set<string>()

  const rewritten = source.replace(
    /!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g,
    (_whole, altText: string, src: string) => {
      const alt = (altText || '').trim()
      const trimmed = src.trim()

      // 外部图片 / 锚点 / data URI：保留原样，仅登记
      if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('#')) {
        const key = `knowledge/${slug}/${trimmed.replace(/^https?:\/\//i, 'external-').replace(/[^a-zA-Z0-9._-]/g, '-')}`
        if (!seen.has(key)) {
          seen.add(key)
          images.push({
            originalSrc: trimmed,
            urlPath: trimmed,
            isExternal: true,
            alt,
            fileKey: key,
            fileName: basename(trimmed.split('?')[0]) || 'external',
            mimeType: mimeOf(trimmed.split('?')[0])
          })
        }
        return _whole
      }

      // 绝对路径（以 / 开头）：按站内路径处理，不复制文件
      if (trimmed.startsWith('/')) {
        const key = `knowledge/${slug}/${basename(trimmed)}`
        if (!seen.has(key)) {
          seen.add(key)
          images.push({
            originalSrc: trimmed,
            urlPath: trimmed,
            isExternal: true,
            alt,
            fileKey: key,
            fileName: basename(trimmed),
            mimeType: mimeOf(trimmed)
          })
        }
        return _whole
      }

      // 本地相对路径：改写为站内 API 路径
      const fileName = basename(trimmed.split('?')[0])
      const urlPath = `/api/knowledge/assets/${slug}/${encodeURIComponent(fileName)}`
      const key = `knowledge/${slug}/${fileName}`
      const localPath = isAbsolute(trimmed)
        ? trimmed
        : resolve(dirname(sourceFile === 'inline.md' ? process.cwd() : sourceFile), trimmed)

      if (!seen.has(key)) {
        seen.add(key)
        images.push({
          originalSrc: trimmed,
          urlPath,
          localPath,
          isExternal: false,
          alt,
          fileKey: key,
          fileName,
          mimeType: mimeOf(fileName)
        })
      }
      return `![${alt}](${urlPath})`
    }
  )

  return { markdown: rewritten, images }
}

export interface CopiedAsset {
  fileKey: string
  urlPath: string
  localPath?: string
  isExternal: boolean
  fileName: string
  mimeType: string
  fileSize: number
  fileSha256: string
}

/**
 * 把本地图片复制到上传目录，返回登记所需信息。
 * 外部图片不复制，fileSize/fileSha256 置 0/空。
 * 文件不存在时抛出错误（整篇导入回滚）。
 */
export function copyKnowledgeImage(image: KnowledgeImage, slug: string): CopiedAsset {
  if (image.isExternal) {
    return {
      fileKey: image.fileKey,
      urlPath: image.urlPath,
      isExternal: true,
      fileName: image.fileName,
      mimeType: image.mimeType,
      fileSize: 0,
      fileSha256: ''
    }
  }

  const sourcePath = image.localPath as string
  if (!existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
    throw new Error(`图片文件不存在：${image.originalSrc}（已尝试 ${sourcePath}）`)
  }

  const targetDir = resolve(KNOWLEDGE_ASSET_ROOT, slug)
  const targetPath = resolve(targetDir, image.fileName)
  // 防目录穿越：目标必须仍在 slug 目录内
  if (!targetPath.startsWith(targetDir + '/')) {
    throw new Error(`非法的图片文件名：${image.fileName}`)
  }

  mkdirSync(targetDir, { recursive: true })
  copyFileSync(sourcePath, targetPath)

  const stat = statSync(targetPath)
  const sha256 = createHash('sha256').update(readFileSync(targetPath)).digest('hex')

  return {
    fileKey: image.fileKey,
    urlPath: image.urlPath,
    localPath: targetPath,
    isExternal: false,
    fileName: image.fileName,
    mimeType: image.mimeType,
    fileSize: stat.size,
    fileSha256: sha256
  }
}
