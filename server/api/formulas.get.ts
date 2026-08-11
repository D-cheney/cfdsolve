import { getDatabase } from '../utils/database'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = String(query.q || '').trim()
  const db = getDatabase()
  const rows = search
    ? db.prepare(`SELECT f.id, f.slug, f.name, f.latex, f.unicode_math AS unicodeMath,
        f.plain_text AS plain, f.note, f.assumptions, c.name AS category
      FROM formulas f
      LEFT JOIN categories c ON c.id = f.category_id
      WHERE f.status = 'PUBLISHED'
        AND (f.name LIKE ? OR f.note LIKE ? OR f.plain_text LIKE ?)
      ORDER BY c.sort_order, f.name`).all(`%${search}%`, `%${search}%`, `%${search}%`)
    : db.prepare(`SELECT f.id, f.slug, f.name, f.latex, f.unicode_math AS unicodeMath,
        f.plain_text AS plain, f.note, f.assumptions, c.name AS category
      FROM formulas f
      LEFT JOIN categories c ON c.id = f.category_id
      WHERE f.status = 'PUBLISHED'
      ORDER BY c.sort_order, f.name`).all()
  return { items: rows, total: rows.length }
})
