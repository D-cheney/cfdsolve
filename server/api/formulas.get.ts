import { getDatabase } from '../utils/database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = String(query.q || '').trim()
  const db = await getDatabase()
  const rows = search
    ? await db.all(`SELECT f.id, f.slug, f.name, f.latex, f.unicode_math AS unicodeMath,
        f.plain_text AS plain, f.note, f.assumptions, c.name AS category
      FROM formulas f
      LEFT JOIN categories c ON c.id = f.category_id
      WHERE f.status = 'PUBLISHED'
        AND (f.name LIKE ? OR f.note LIKE ? OR f.plain_text LIKE ?)
      ORDER BY c.sort_order, f.name`, `%${search}%`, `%${search}%`, `%${search}%`)
    : await db.all(`SELECT f.id, f.slug, f.name, f.latex, f.unicode_math AS unicodeMath,
        f.plain_text AS plain, f.note, f.assumptions, c.name AS category
      FROM formulas f
      LEFT JOIN categories c ON c.id = f.category_id
      WHERE f.status = 'PUBLISHED'
      ORDER BY c.sort_order, f.name`)
  return { items: rows, total: rows.length }
})
