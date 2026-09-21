import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, extname, basename } from 'node:path'
import { closeDatabase, getDatabase } from '../server/utils/database.ts'
import { importKnowledgeArticles, parseKnowledgeTemplate } from '../server/services/knowledge-importer.ts'

// 主知识库只包含经过主题合并后的深度文章。
// `templates/knowledge/openfoam-source-files-v14` 下的 10,907 份逐文件源码卡只作为离线源码索引，
// 不导入主知识库（`npm run knowledge:sync` 会导入整个目录树，含源码卡，不适合用于主知识库同步）。
const ARTICLE_ROOTS = [
  'assets',
  'examples',
  'library',
  'meshfree',
  'modelica',
  'openfoam',
  'openfoam-source-v14',
  'expanded'
]

const knowledgeRoot = resolve(process.cwd(), 'templates', 'knowledge')
const dryRun = process.argv.includes('--dry-run')

const collect = path => {
  if (statSync(path).isFile()) return [path]
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const child = resolve(path, entry.name)
    if (entry.isDirectory()) return collect(child)
    return entry.isFile() ? [child] : []
  })
}

const files = ARTICLE_ROOTS.flatMap(root => {
  const dir = resolve(knowledgeRoot, root)
  if (!existsSync(dir)) return []
  return collect(dir)
}).filter(file =>
  extname(file).toLowerCase() === '.md' &&
  !basename(file).endsWith('.template.md') &&
  !['FORMAT.md', 'README.md'].includes(basename(file)) &&
  /^---\s*\r?\n[\s\S]*?template_version:\s*["']?flowlab-knowledge\/1\.0["']?/m.test(readFileSync(file, 'utf8'))
).sort()

if (!files.length) {
  console.error('没有找到可导入的深度文章')
  process.exitCode = 1
} else {
  const parsed = files.map(file => parseKnowledgeTemplate(
    readFileSync(file, 'utf8'),
    relative(process.cwd(), file).replaceAll('\\', '/')
  ))
  if (dryRun) {
    console.log(`校验通过：${parsed.length} 篇深度文章（不含逐文件源码卡）`)
  } else {
    if (parsed.length < 100) throw new Error(`仅找到 ${parsed.length} 篇深度文章，拒绝执行可能不完整的同步`)
    const db = getDatabase()
    const results = importKnowledgeArticles(parsed, db)
    const created = results.filter(result => result.action === 'created').length
    const sourceSlugs = new Set(parsed.map(article => article.slug))
    const importedRows = db.prepare(`SELECT id, slug, body_json FROM content_items WHERE kind = 'article'`).all()
      .filter(row => {
        try {
          return JSON.parse(String(row.body_json || '{}')).templateVersion === 'flowlab-knowledge/1.0'
        } catch {
          return false
        }
      })
    const staleRows = importedRows.filter(row => !sourceSlugs.has(String(row.slug)))
    db.exec('BEGIN IMMEDIATE')
    try {
      const remove = db.prepare('DELETE FROM content_items WHERE id = ?')
      for (const row of staleRows) remove.run(row.id)
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    console.log(`主知识库同步完成：${results.length} 篇深度文章（新建 ${created}，更新 ${results.length - created}，移除旧入口 ${staleRows.length}）；逐文件源码卡未导入。`)
  }
}

closeDatabase()
