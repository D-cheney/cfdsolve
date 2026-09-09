import { getDatabase } from '../../utils/database'
import { caeKnowledgeCategorySlugs } from '../../utils/knowledge-collections'

function parseBodyJson(value: unknown) {
  try { return JSON.parse(String(value || '{}')) as Record<string, any> } catch { return {} }
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = String(query.q || '').trim()
  const category = String(query.category || '').trim()
  const collection = String(query.collection || '').trim()
  const requestedLimit = Number(query.limit)
  const requestedOffset = Number(query.offset)
  const limit = Math.min(100, Math.max(1, Number.isFinite(requestedLimit) ? Math.trunc(requestedLimit) : 30))
  const offset = Math.max(0, Number.isFinite(requestedOffset) ? Math.trunc(requestedOffset) : 0)
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
  } else if (collection === 'meshfree') {
    conditions.push(`c.slug LIKE 'meshfree-%'`)
  } else if (collection === 'openfoam') {
    conditions.push(`c.slug LIKE 'openfoam-%'`)
  } else if (collection === 'modelica') {
    conditions.push(`(c.slug = 'modelica' OR c.slug LIKE 'modelica-%')`)
  } else if (collection === 'cae') {
    conditions.push(`c.slug IN (${caeKnowledgeCategorySlugs.map(() => '?').join(', ')})`)
    params.push(...caeKnowledgeCategorySlugs)
  } else if (collection === 'cfd') {
    conditions.push(`c.slug NOT LIKE 'openfoam-%' AND c.slug NOT LIKE 'meshfree-%' AND c.slug <> 'modelica' AND c.slug NOT LIKE 'modelica-%'
      AND c.slug NOT IN (${caeKnowledgeCategorySlugs.map(() => '?').join(', ')})`)
    params.push(...caeKnowledgeCategorySlugs)
  }
  const where = conditions.join(' AND ')
  const rows = db.prepare(`SELECT ci.id, ci.slug, ci.title, ci.summary, ci.body_json,
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
        publishedAt: row.published_at,
        updatedAt: row.updated_at
      }
    }),
    total: Number(count.total),
    limit,
    offset,
    hasMore: offset + rows.length < Number(count.total)
  }
})
