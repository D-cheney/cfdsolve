import { getDatabase } from '../../utils/database'
import { knowledgeCollectionFor } from '../../utils/knowledge-collections'

export default defineEventHandler(() => {
  const db = getDatabase()
  const rows = db.prepare(`SELECT c.slug, c.name, COUNT(ci.id) AS article_count
    FROM categories c
    JOIN content_items ci ON ci.category_id = c.id
    WHERE ci.kind = 'article' AND ci.status = 'PUBLISHED'
    GROUP BY c.id, c.slug, c.name
    HAVING COUNT(ci.id) > 0
    ORDER BY c.sort_order, c.name`).all() as Array<{ slug: string; name: string; article_count: number }>

  const items = rows.map(row => ({
    slug: row.slug,
    name: row.name,
    count: Number(row.article_count),
    collection: knowledgeCollectionFor(row.slug)
  }))

  return {
    items,
    totalArticles: items.reduce((sum, item) => sum + item.count, 0)
  }
})
