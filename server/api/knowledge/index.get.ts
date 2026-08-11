import { getDatabase } from '../../utils/database'

function parseBodyJson(value: unknown) {
  try { return JSON.parse(String(value || '{}')) as Record<string, any> } catch { return {} }
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = String(query.q || '').trim()
  const category = String(query.category || '').trim()
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 30))
  const offset = Math.max(0, Number(query.offset) || 0)
  const db = getDatabase()
  const conditions = [`ci.kind = 'article'`, `ci.status = 'PUBLISHED'`]
  const params: Array<string | number> = []
  if (search) {
    conditions.push('(ci.title LIKE ? OR ci.summary LIKE ? OR ci.body_html LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (category) {
    conditions.push('c.slug = ?')
    params.push(category)
  }
  const where = conditions.join(' AND ')
  const rows = db.prepare(`SELECT ci.id, ci.slug, ci.title, ci.summary, ci.body_json, ci.body_html,
      ci.published_at, ci.updated_at, c.slug AS category_slug, c.name AS category,
      u.display_name AS author,
      COALESCE((SELECT json_group_array(t.name) FROM content_tags ct JOIN tags t ON t.id = ct.tag_id WHERE ct.content_id = ci.id), '[]') AS tags_json
    FROM content_items ci
    LEFT JOIN categories c ON c.id = ci.category_id
    LEFT JOIN users u ON u.id = ci.author_id
    WHERE ${where}
    ORDER BY COALESCE(ci.published_at, ci.created_at) DESC
    LIMIT ? OFFSET ?`).all(...params, limit, offset) as Array<Record<string, unknown>>
  const count = db.prepare(`SELECT COUNT(*) AS total FROM content_items ci
    LEFT JOIN categories c ON c.id = ci.category_id WHERE ${where}`).get(...params) as { total: number }

  return {
    items: rows.map(row => {
      const body = parseBodyJson(row.body_json)
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        category: row.category,
        categorySlug: row.category_slug,
        level: body.level || '入门',
        readingMinutes: Number(body.readingMinutes || 10),
        read: `${Number(body.readingMinutes || 10)} 分钟`,
        author: row.author,
        tags: JSON.parse(String(row.tags_json || '[]')),
        bodyHtml: row.body_html,
        publishedAt: row.published_at,
        updatedAt: row.updated_at
      }
    }),
    total: Number(count.total),
    limit,
    offset
  }
})
