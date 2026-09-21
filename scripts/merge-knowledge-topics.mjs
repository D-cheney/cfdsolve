import { existsSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, extname, relative, resolve, sep } from 'node:path'
import matter from 'gray-matter'

const expandedRoot = resolve(process.cwd(), 'templates', 'knowledge', 'expanded')
const apply = process.argv.includes('--apply')

function collect(path) {
  if (statSync(path).isFile()) return [path]
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const child = resolve(path, entry.name)
    return entry.isDirectory() ? collect(child) : [child]
  })
}

function topicParts(title) {
  const separator = title.indexOf('：')
  return separator < 0
    ? { topic: title.trim(), angle: '' }
    : { topic: title.slice(0, separator).trim(), angle: title.slice(separator + 1).trim() }
}

function angleKind(article) {
  const suffix = article.data.slug
  const angle = article.angle
  if (suffix.endsWith('-engineering-setup') || /工程设置|参数选择|实现|配置/u.test(angle)) return 'setup'
  if (suffix.endsWith('-diagnosis-validation') || /诊断|验证|验收|可信度/u.test(angle)) return 'validation'
  return 'principle'
}

function combinedTitle(topic, kinds) {
  const has = kind => kinds.includes(kind)
  if (has('principle') && has('setup') && has('validation')) return `${topic}：原理、设置与验证`
  if (has('principle') && has('setup')) return `${topic}：原理与工程设置`
  if (has('principle') && has('validation')) return `${topic}：原理与诊断验证`
  if (has('setup') && has('validation')) return `${topic}：工程设置与诊断验证`
  return `${topic}：综合指南`
}

function stripDocumentTitle(body) {
  return body.replace(/^\s*#\s+[^\r\n]+\r?\n/u, '').trim()
}

function demoteHeadings(body) {
  return body.replace(/^(#{2,5})(?=\s)/gmu, '#$1')
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function assertInsideRoot(path) {
  const absolute = resolve(path)
  if (!absolute.startsWith(`${expandedRoot}${sep}`)) {
    throw new Error(`拒绝修改 expanded 目录之外的文件：${absolute}`)
  }
}

if (!existsSync(expandedRoot)) throw new Error(`目录不存在：${expandedRoot}`)

const articles = collect(expandedRoot)
  .filter(file => extname(file).toLowerCase() === '.md' && !basename(file).endsWith('.template.md'))
  .map(file => {
    const parsed = matter(readFileSync(file, 'utf8'))
    const { topic, angle } = topicParts(String(parsed.data.title || ''))
    return { file, data: parsed.data, body: parsed.content.trim(), topic, angle }
  })

const groups = new Map()
for (const article of articles) {
  const key = `${article.data.category?.slug || ''}\u0000${article.topic}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(article)
}

const candidates = [...groups.values()].filter(group => group.length > 1)
const report = []

for (const group of candidates) {
  const ordered = [...group].sort((left, right) => {
    const priority = { principle: 0, setup: 1, validation: 2 }
    const leftStableSlug = /-(?:modeling|engineering-setup|diagnosis-validation)$/u.test(left.data.slug) ? 1 : 0
    const rightStableSlug = /-(?:modeling|engineering-setup|diagnosis-validation)$/u.test(right.data.slug) ? 1 : 0
    return leftStableSlug - rightStableSlug || priority[angleKind(left)] - priority[angleKind(right)] || left.data.slug.localeCompare(right.data.slug)
  })
  const canonical = ordered[0]
  const kinds = unique(ordered.map(angleKind))
  const title = combinedTitle(canonical.topic, kinds)
  const labels = { principle: '原理与适用范围', setup: '工程设置与参数选择', validation: '诊断与可信度验证' }
  const sections = ordered.map(article => {
    const original = stripDocumentTitle(article.body)
    return `## ${labels[angleKind(article)]}\n\n${demoteHeadings(original)}`
  })
  const primarySummary = String(canonical.data.summary || '').trim()
  const coverage = `全文同时覆盖${kinds.map(kind => labels[kind]).join('、')}，保留关键方程、量化参数、可执行示例、失败模式与参考资料。`
  const summary = `${primarySummary}${primarySummary ? ' ' : ''}${coverage}`.slice(0, 500)
  const tags = unique(ordered.flatMap(article => Array.isArray(article.data.tags) ? article.data.tags : [])).slice(0, 20)
  const keywords = unique(ordered.flatMap(article => Array.isArray(article.data.seo?.keywords) ? article.data.seo.keywords : [])).slice(0, 20)
  const readingMinutes = Math.min(240, ordered.reduce((sum, article) => sum + Number(article.data.reading_minutes || 0), 0))

  const data = {
    ...canonical.data,
    title,
    summary,
    reading_minutes: readingMinutes,
    tags,
    seo: {
      ...(canonical.data.seo || {}),
      title,
      description: summary.slice(0, 300),
      keywords
    }
  }
  const body = `# ${title}\n\n${sections.join('\n\n')}\n`
  const removed = ordered.filter(article => article !== canonical)

  report.push({
    topic: canonical.topic,
    category: canonical.data.category.slug,
    target: relative(process.cwd(), canonical.file).replaceAll('\\', '/'),
    sources: ordered.map(article => article.data.slug),
    removed: removed.map(article => relative(process.cwd(), article.file).replaceAll('\\', '/'))
  })

  if (!apply) continue
  assertInsideRoot(canonical.file)
  writeFileSync(canonical.file, matter.stringify(body, data), 'utf8')
  for (const article of removed) {
    assertInsideRoot(article.file)
    unlinkSync(article.file)
  }
}

const removedCount = report.reduce((sum, item) => sum + item.removed.length, 0)
console.log(`${apply ? '已合并' : '待合并'} ${report.length} 个同主题组，${articles.length} 篇扩展文章将减少 ${removedCount} 篇，保留 ${articles.length - removedCount} 篇。`)
for (const item of report) {
  console.log(`- [${item.category}] ${item.topic}：${item.sources.length} 篇 -> ${item.target}`)
}
