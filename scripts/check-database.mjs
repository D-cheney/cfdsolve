import assert from 'node:assert/strict'
import { initializeDatabase, closeDatabase } from '../server/utils/database.ts'

try {
  const db = initializeDatabase()
  const integrity = db.prepare('PRAGMA integrity_check').get()
  assert.equal(integrity.integrity_check, 'ok', 'database integrity check failed')
  const foreignKeys = db.prepare('PRAGMA foreign_key_check').all()
  assert.equal(foreignKeys.length, 0, 'foreign key violations found')

  const requiredTables = [
    'users', 'roles', 'categories', 'content_items', 'formulas', 'forum_topics',
    'simulation_tools', 'simulation_tasks', 'modelica_projects', 'modelica_files',
    'bookmarks', 'notifications', 'system_settings', 'audit_logs'
  ]
  const existing = new Set(db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table'").all().map(row => row.name))
  for (const table of requiredTables) assert.equal(existing.has(table), true, `missing table: ${table}`)

  const formulaCount = Number(db.prepare('SELECT COUNT(*) AS count FROM formulas').get().count)
  const toolCount = Number(db.prepare('SELECT COUNT(*) AS count FROM simulation_tools').get().count)
  assert.ok(formulaCount >= 5, 'formula seed data is incomplete')
  assert.equal(toolCount, 4, 'simulation tool seed data is incomplete')

  const plan = db.prepare(`EXPLAIN QUERY PLAN
    SELECT * FROM simulation_tasks WHERE user_id = ? ORDER BY created_at DESC`).all('user-demo')
  assert.equal(plan.some(row => String(row.detail).includes('idx_simulation_tasks_user_created')), true, 'task index is not used')
  console.log(`database checks passed: ${requiredTables.length} tables, ${formulaCount} formulas, ${toolCount} tools`)
} finally {
  closeDatabase()
}
