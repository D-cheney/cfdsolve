import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, extname, basename } from 'node:path'
import { closeDatabase } from '../server/utils/database.ts'
import { importKnowledgeArticles, parseKnowledgeTemplate } from '../server/services/knowledge-importer.ts'

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
    const markdownFiles = collect(target).filter(file =>
      extname(file).toLowerCase() === '.md' &&
      !basename(file).endsWith('.template.md') &&
      !['FORMAT.md', 'README.md'].includes(basename(file))
    ).sort()
    const files = markdownFiles.filter(file => {
      const source = readFileSync(file, 'utf8')
      return /^---\s*\r?\n[\s\S]*?template_version:\s*["']?flowlab-knowledge\/1\.0["']?/m.test(source)
    })
    const skipped = markdownFiles.length - files.length

    if (!files.length) {
      console.error(`没有找到可导入的 Markdown 文章：${target}`)
      process.exitCode = 1
    } else {
      try {
        const parsed = files.map(file => parseKnowledgeTemplate(
          readFileSync(file, 'utf8'),
          relative(process.cwd(), file).replaceAll('\\', '/')
        ))
        if (dryRun) {
          const preview = parsed.length <= 40 ? parsed : [...parsed.slice(0, 20), ...parsed.slice(-5)]
          for (const article of preview) console.log(`[valid] ${article.slug} | ${article.title} | ${article.status}`)
          if (parsed.length > preview.length) console.log(`... 省略 ${parsed.length - preview.length} 条校验明细`)
          console.log(`校验通过：${parsed.length} 个知识文件；忽略 ${skipped} 个导航/报告文件；未写入数据库。`)
        } else {
          const results = importKnowledgeArticles(parsed)
          const created = results.filter(result => result.action === 'created').length
          const updated = results.length - created
          const preview = results.length <= 40 ? results : [...results.slice(0, 20), ...results.slice(-5)]
          for (const result of preview) console.log(`[${result.action}] ${result.slug} | ${result.title} | ${result.status} | ${result.tags} tags`)
          if (results.length > preview.length) console.log(`... 省略 ${results.length - preview.length} 条导入明细`)
          console.log(`导入完成：${results.length} 个知识文件（新建 ${created}，更新 ${updated}）；忽略 ${skipped} 个导航/报告文件。`)
        }
      } catch (error) {
        console.error(error instanceof Error ? error.message : error)
        process.exitCode = 1
      } finally {
        closeDatabase()
      }
    }
  }
}
