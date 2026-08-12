import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, extname, basename } from 'node:path'
import { closeDatabase } from '../server/utils/database.ts'
import { importKnowledgeArticle, parseKnowledgeTemplate } from '../server/services/knowledge-importer.ts'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const input = args.find(arg => !arg.startsWith('--'))

if (!input) {
  console.error('用法：npm run knowledge:import -- <文章.md或目录> [--dry-run]')
  process.exitCode = 1
} else {
  const target = resolve(process.cwd(), input)
  if (!existsSync(target)) {
    console.error(`文件或目录不存在：${target}`)
    process.exitCode = 1
  } else {
    const collect = path => {
      if (statSync(path).isFile()) return [path]
      return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
        const child = resolve(path, entry.name)
        if (entry.isDirectory()) return collect(child)
        return entry.isFile() ? [child] : []
      })
    }
    const files = collect(target).filter(file =>
      extname(file).toLowerCase() === '.md' &&
      !basename(file).endsWith('.template.md') &&
      !['FORMAT.md', 'README.md'].includes(basename(file))
    ).sort()

    if (!files.length) {
      console.error(`没有找到可导入的 Markdown 文章：${target}`)
      process.exitCode = 1
    } else {
      try {
        const parsed = files.map(file => parseKnowledgeTemplate(readFileSync(file, 'utf8'), file))
        if (dryRun) {
          for (const article of parsed) console.log(`[valid] ${article.slug} | ${article.title} | ${article.status}`)
          console.log(`校验通过：${parsed.length} 个文件；未写入数据库。`)
        } else {
          for (const article of parsed) {
            const result = await importKnowledgeArticle(article)
            console.log(`[${result.action}] ${result.slug} | ${result.title} | ${result.status} | ${result.tags} tags`)
          }
          console.log(`导入完成：${parsed.length} 个文件。`)
        }
      } catch (error) {
        console.error(error instanceof Error ? error.message : error)
        process.exitCode = 1
      } finally {
        await closeDatabase()
      }
    }
  }
}
