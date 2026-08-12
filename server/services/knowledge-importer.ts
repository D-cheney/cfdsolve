import { createHash, randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'
import { DEMO_USER_ID, getDatabase, type Database } from '../utils/database'

const TEMPLATE_VERSION = 'flowlab-knowledge/1.0'
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const idPattern = /^[A-Za-z0-9._-]+$/
const allowedStatuses = new Set(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'])
const allowedLevels = new Set(['入门', '进阶', '工程', '专题'])

const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: false })

export interface KnowledgeHeading {
  level: number
  text: string
}

export interface ParsedKnowledgeArticle {
  templateVersion: string
  id?: string
  slug: string
  title: string
  summary: string
  category: { slug: string; name: string }
  level: string
  readingMinutes: number
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED'
  authorUsername: string
  publishedAt: string | null
  tags: string[]
  seo: { title: string; description: string; keywords: string[] }
  markdown: string
  html: string
  headings: KnowledgeHeading[]
  sourceFile: string
}

export interface KnowledgeImportResult {
  action: 'created' | 'updated'
  id: string
  slug: string
  title: string
  status: string
  category: string
  tags: number
}

export class KnowledgeTemplateError extends Error {
  issues: string[]

  constructor(issues: string[]) {
    super(`知识模板校验失败：\n- ${issues.join('\n- ')}`)
    this.name = 'KnowledgeTemplateError'
    this.issues = issues
  }
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(cleanText).filter(Boolean))]
}

function validDate(value: unknown) {
  const text = cleanText(value)
  if (!text) return null
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function safeHtml(source: string) {
  return sanitizeHtml(markdown.render(source), {
    allowedTags: [
      'p', 'br', 'hr', 'blockquote', 'pre', 'code', 'strong', 'em', 's',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a'
    ],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard'
  })
}

function extractHeadings(source: string): KnowledgeHeading[] {
  const tokens = markdown.parse(source, {})
  const headings: KnowledgeHeading[] = []
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.type !== 'heading_open') continue
    const inline = tokens[index + 1]
    headings.push({ level: Number(token.tag.slice(1)), text: inline?.content?.trim() || '' })
  }
  return headings.filter(item => item.text)
}

export function parseKnowledgeTemplate(source: string, sourceFile = 'inline.md'): ParsedKnowledgeArticle {
  const parsed = matter(source)
  const data = parsed.data as Record<string, any>
  const issues: string[] = []
  const templateVersion = cleanText(data.template_version)
  const id = cleanText(data.id) || undefined
  const slug = cleanText(data.slug)
  const title = cleanText(data.title)
  const summary = cleanText(data.summary)
  const categorySlug = cleanText(data.category?.slug)
  const categoryName = cleanText(data.category?.name)
  const level = cleanText(data.level)
  const readingMinutes = Number(data.reading_minutes)
  const status = cleanText(data.status).toUpperCase()
  const authorUsername = cleanText(data.author_username) || 'lin-cfd'
  const publishedAtText = cleanText(data.published_at)
  const publishedAt = validDate(data.published_at)
  const tags = stringList(data.tags)
  const seoKeywords = stringList(data.seo?.keywords)
  const seoTitle = cleanText(data.seo?.title) || title
  const seoDescription = cleanText(data.seo?.description) || summary
  const body = parsed.content.trim()

  if (templateVersion !== TEMPLATE_VERSION) issues.push(`template_version 必须为 ${TEMPLATE_VERSION}`)
  if (id && (!idPattern.test(id) || id.length > 120)) issues.push('id 只能包含字母、数字、点、下划线和连字符，且不超过 120 字符')
  if (!slugPattern.test(slug) || slug.length > 120) issues.push('slug 必须使用小写字母、数字和连字符，且不超过 120 字符')
  if (slug === 'replace-with-article-slug') issues.push('slug 仍是模板占位值，请修改后再导入')
  if (title.length < 3 || title.length > 200) issues.push('title 长度必须为 3～200 字符')
  if (title.includes('在这里填写')) issues.push('title 仍是模板占位内容，请修改后再导入')
  if (summary.length < 10 || summary.length > 500) issues.push('summary 长度必须为 10～500 字符')
  if (!slugPattern.test(categorySlug) || categorySlug.length > 120) issues.push('category.slug 格式无效')
  if (!categoryName || categoryName.length > 80) issues.push('category.name 必填且不超过 80 字符')
  if (!allowedLevels.has(level)) issues.push('level 必须为：入门、进阶、工程、专题')
  if (!Number.isInteger(readingMinutes) || readingMinutes < 1 || readingMinutes > 240) issues.push('reading_minutes 必须为 1～240 的整数')
  if (!allowedStatuses.has(status)) issues.push('status 必须为 DRAFT、REVIEW、PUBLISHED 或 ARCHIVED')
  if (!slugPattern.test(authorUsername) && !/^[A-Za-z0-9._-]+$/.test(authorUsername)) issues.push('author_username 格式无效')
  if (publishedAtText && !publishedAt) issues.push('published_at 必须是有效的 ISO 8601 时间')
  if (tags.length > 20) issues.push('tags 最多 20 个')
  if (tags.some(tag => tag.length > 40)) issues.push('单个标签不能超过 40 字符')
  if (seoTitle.length > 200) issues.push('seo.title 不能超过 200 字符')
  if (seoDescription.length > 300) issues.push('seo.description 不能超过 300 字符')
  if (seoKeywords.length > 20 || seoKeywords.some(keyword => keyword.length > 60)) issues.push('seo.keywords 最多 20 个，单项不超过 60 字符')
  if (body.length < 100) issues.push('Markdown 正文不能少于 100 字符')
  if (!/^#\s+.+/m.test(body)) issues.push('正文必须包含一个一级标题')

  if (issues.length) throw new KnowledgeTemplateError(issues.map(issue => `${sourceFile}: ${issue}`))

  return {
    templateVersion,
    id,
    slug,
    title,
    summary,
    category: { slug: categorySlug, name: categoryName },
    level,
    readingMinutes,
    status: status as ParsedKnowledgeArticle['status'],
    authorUsername,
    publishedAt: status === 'PUBLISHED' ? (publishedAt || new Date().toISOString()) : publishedAt,
    tags,
    seo: { title: seoTitle, description: seoDescription, keywords: seoKeywords },
    markdown: body,
    html: safeHtml(body),
    headings: extractHeadings(body),
    sourceFile
  }
}

function stableId(prefix: string, value: string) {
  return `${prefix}-${createHash('sha256').update(value).digest('hex').slice(0, 16)}`
}

export async function importKnowledgeArticle(article: ParsedKnowledgeArticle, db?: Database): Promise<KnowledgeImportResult> {
  const d = db || (await getDatabase())
  const existing = await d.get(`SELECT id FROM content_items WHERE slug = ?`, article.slug) as { id: string } | undefined
  const action = existing ? 'updated' : 'created'
  const contentId = existing?.id || article.id || `content-${article.slug}`

  return d.transaction(async () => {
    let category = await d.get(`SELECT id FROM categories WHERE kind = 'knowledge' AND slug = ?`, article.category.slug) as { id: string } | undefined
    if (!category) {
      const categoryId = stableId('category-knowledge', article.category.slug)
      await d.run(`INSERT INTO categories (id, kind, slug, name, sort_order)
        VALUES (?, 'knowledge', ?, ?, 100)`, categoryId, article.category.slug, article.category.name)
      category = { id: categoryId }
    }

    const author = await d.get('SELECT id FROM users WHERE username = ? AND status = ?', article.authorUsername, 'ACTIVE') as { id: string } | undefined
    if (!author) throw new KnowledgeTemplateError([`${article.sourceFile}: author_username ${article.authorUsername} 不存在或不可用`])

    const bodyJson = JSON.stringify({
      templateVersion: article.templateVersion,
      markdown: article.markdown,
      headings: article.headings,
      level: article.level,
      readingMinutes: article.readingMinutes,
      seo: article.seo,
      sourceFile: article.sourceFile
    })

    await d.run(`INSERT INTO content_items
      (id, category_id, author_id, kind, slug, title, summary, body_json, body_html, status, published_at, updated_at)
      VALUES (?, ?, ?, 'article', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(slug) DO UPDATE SET
        category_id = excluded.category_id,
        author_id = excluded.author_id,
        kind = 'article',
        title = excluded.title,
        summary = excluded.summary,
        body_json = excluded.body_json,
        body_html = excluded.body_html,
        status = excluded.status,
        published_at = excluded.published_at,
        updated_at = CURRENT_TIMESTAMP`,
      contentId, category.id, author.id, article.slug, article.title, article.summary,
      bodyJson, article.html, article.status, article.publishedAt
    )

    await d.run('DELETE FROM content_tags WHERE content_id = ?', contentId)
    for (const tagName of article.tags) {
      const ascii = tagName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const tagSlug = ascii || stableId('tag', tagName).replace('tag-', 'unicode-')
      let tag = await d.get('SELECT id FROM tags WHERE slug = ? OR name = ? LIMIT 1', tagSlug, tagName) as { id: string } | undefined
      if (!tag) {
        const tagId = stableId('tag', tagName)
        await d.run('INSERT INTO tags (id, slug, name) VALUES (?, ?, ?)', tagId, tagSlug, tagName)
        tag = { id: tagId }
      }
      await d.run('INSERT OR IGNORE INTO content_tags (content_id, tag_id) VALUES (?, ?)', contentId, tag.id)
    }

    await d.run(`INSERT INTO audit_logs
      (id, actor_id, action, resource_type, resource_id, after_json, request_id)
      VALUES (?, ?, ?, 'content_item', ?, ?, ?)`,
      randomUUID(), author.id, `knowledge.import.${action}`, contentId,
      JSON.stringify({ slug: article.slug, status: article.status, category: article.category.slug, tags: article.tags, sourceFile: article.sourceFile }),
      randomUUID()
    )
    return { action, id: contentId, slug: article.slug, title: article.title, status: article.status, category: article.category.name, tags: article.tags.length }
  })
}

export async function parseAndImportKnowledge(source: string, sourceFile: string, db?: Database): Promise<KnowledgeImportResult> {
  return importKnowledgeArticle(parseKnowledgeTemplate(source, sourceFile), db)
}

export { TEMPLATE_VERSION, DEMO_USER_ID }
