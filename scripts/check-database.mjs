import assert from 'node:assert/strict'
import { initializeDatabase, closeDatabase } from '../server/utils/database.ts'

try {
  const db = await initializeDatabase()

  const requiredTables = [
    'users', 'roles', 'categories', 'content_items', 'formulas', 'forum_topics',
    'simulation_tools', 'simulation_tasks', 'modelica_projects', 'modelica_files',
    'bookmarks', 'notifications', 'system_settings', 'audit_logs'
  ]

  if (db.engine === 'sqlite') {
    const integrity = await db.get('PRAGMA integrity_check')
    assert.equal(integrity.integrity_check, 'ok', 'database integrity check failed')
    const foreignKeys = await db.all('PRAGMA foreign_key_check')
    assert.equal(foreignKeys.length, 0, 'foreign key violations found')
  }

  const tableRows = db.engine === 'mysql'
    ? await db.all("SELECT table_name AS table_name FROM information_schema.tables WHERE table_schema = DATABASE()")
    : await db.all("SELECT name FROM sqlite_schema WHERE type = 'table'")
  const existing = new Set(tableRows.map(row => String(row.table_name ?? row.TABLE_NAME ?? row.name ?? '')))
  for (const table of requiredTables) assert.equal(existing.has(table), true, `missing table: ${table}`)

  const formulaCount = Number((await db.get('SELECT COUNT(*) AS count FROM formulas'))?.count)
  const toolCount = Number((await db.get('SELECT COUNT(*) AS count FROM simulation_tools'))?.count)
  assert.ok(formulaCount >= 5, 'formula seed data is incomplete')
  assert.equal(toolCount, 4, 'simulation tool seed data is incomplete')

  if (db.engine === 'sqlite') {
    const plan = await db.all(`EXPLAIN QUERY PLAN
      SELECT * FROM simulation_tasks WHERE user_id = ? ORDER BY created_at DESC`, 'user-demo')
    assert.equal(plan.some(row => String(row.detail).includes('idx_simulation_tasks_user_created')), true, 'task index is not used')
  } else {
    const plan = await db.all(`EXPLAIN SELECT * FROM simulation_tasks WHERE user_id = ? ORDER BY created_at DESC`, 'user-demo')
    assert.ok(plan.some(row => String(row.key).includes('idx_tasks_user_created')), 'task index is not used')
  }
  console.log(`database checks passed (${db.engine}): ${requiredTables.length} tables, ${formulaCount} formulas, ${toolCount} tools`)
} finally {
  await closeDatabase()
}
