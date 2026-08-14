import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { KNOWLEDGE_ASSET_ROOT } from '../../../services/knowledge-assets'

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

/**
 * GET /api/knowledge/assets/<slug>/<fileName>
 * 读取 data/uploads/knowledge/<slug>/<fileName> 返回图片文件。
 * 路径做了归一化与越界检查，防止目录穿越。
 */
export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path') || ''
  const segments = path.split('/').filter(Boolean)
  if (segments.length !== 2) {
    throw createError({ statusCode: 400, statusMessage: '无效的资源路径' })
  }
  const [slug, fileName] = segments
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug) || /[\\/\0]/.test(fileName)) {
    throw createError({ statusCode: 400, statusMessage: '无效的资源路径' })
  }

  const root = resolve(KNOWLEDGE_ASSET_ROOT, slug)
  const filePath = resolve(root, fileName)
  if (!filePath.startsWith(root + '/') || !existsSync(filePath) || !statSync(filePath).isFile()) {
    throw createError({ statusCode: 404, statusMessage: '资源不存在' })
  }

  const ext = extname(filePath).toLowerCase()
  setHeader(event, 'content-type', MIME_BY_EXT[ext] || 'application/octet-stream')
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(filePath))
})
