import { getDatabase } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '')
  const db = await getDatabase()
  const row = await db.get(`SELECT ci.id, ci.slug, ci.title, ci.summary, ci.body_json, ci.body_html,
      ci.published_at, ci.updated_at, c.slug AS category_slug, c.name AS category,
      u.display_name AS author,
      COALESCE((SELECT json_group_array(t.name) FROM content_tags ct JOIN tags t ON t.id = ct.tag_id WHERE ct.content_id = ci.id), '[]') AS tags_json
    FROM content_items ci
    LEFT JOIN categories c ON c.id = ci.category_id
    LEFT JOIN users u ON u.id = ci.author_id
    WHERE ci.kind = 'article' AND ci.status = 'PUBLISHED' AND ci.slug = ?`, slug) as Record<string, unknown> | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: '知识文章不存在或尚未发布' })
  let body: Record<string, any> = {}
  try { body = JSON.parse(String(row.body_json || '{}')) } catch { /* 使用空元数据 */ }
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category,
    categorySlug: row.category_slug,
    level: body.level || '入门',
    readingMinutes: Number(body.readingMinutes || 10),
    author: row.author,
    tags: JSON.parse(String(row.tags_json || '[]')),
    headings: body.headings || [],
    seo: body.seo || {},
    bodyHtml: row.body_html,
    publishedAt: row.published_at,
    updatedAt: row.updated_at
  }
})
