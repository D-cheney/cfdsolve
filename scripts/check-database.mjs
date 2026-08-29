import assert from 'node:assert/strict'
import { initializeDatabase, closeDatabase } from '../server/utils/database.ts'
import { databaseMigrations } from '../server/database/schema.ts'

try {
  const db = initializeDatabase()
  const integrity = db.prepare('PRAGMA integrity_check').get()
  assert.equal(integrity.integrity_check, 'ok', 'database integrity check failed')
  const foreignKeys = db.prepare('PRAGMA foreign_key_check').all()
  assert.equal(foreignKeys.length, 0, 'foreign key violations found')

  const requiredTables = [
    'users', 'roles', 'categories', 'content_items', 'formulas', 'forum_topics',
    'simulation_tools', 'simulation_tasks', 'modelica_projects', 'modelica_files',
    'modelica_snapshots', 'bookmarks', 'notifications', 'system_settings', 'audit_logs',
    'schema_migrations'
  ]
  const existing = new Set(db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table'").all().map(row => row.name))
  for (const table of requiredTables) assert.equal(existing.has(table), true, `missing table: ${table}`)

  const formulaCount = Number(db.prepare('SELECT COUNT(*) AS count FROM formulas').get().count)
  const toolCount = Number(db.prepare('SELECT COUNT(*) AS count FROM simulation_tools').get().count)
  assert.ok(formulaCount >= 5, 'formula seed data is incomplete')
  assert.equal(toolCount, 4, 'simulation tool seed data is incomplete')

  const latestMigration = databaseMigrations.at(-1)
  const migration = db.prepare('SELECT version, name FROM schema_migrations ORDER BY version DESC LIMIT 1').get()
  assert.equal(Number(migration.version), latestMigration.version, 'database schema is not at the latest migration')
  assert.equal(migration.name, latestMigration.name, 'latest migration name does not match the source ledger')

  const projectColumns = new Set(db.prepare(`PRAGMA table_info('modelica_projects')`).all().map(row => row.name))
  assert.equal(projectColumns.has('metadata_json'), true, 'modelica_projects.metadata_json is missing')

  const jsonChecks = [
    ['content_items.body_json', `SELECT COUNT(*) AS invalid_count FROM content_items WHERE NOT json_valid(body_json)`],
    ['simulation_tasks.params_json', `SELECT COUNT(*) AS invalid_count FROM simulation_tasks WHERE NOT json_valid(params_json)`],
    ['simulation_tasks.result_json', `SELECT COUNT(*) AS invalid_count FROM simulation_tasks WHERE result_json IS NOT NULL AND NOT json_valid(result_json)`],
    ['simulation_tasks.warnings_json', `SELECT COUNT(*) AS invalid_count FROM simulation_tasks WHERE NOT json_valid(warnings_json)`],
    ['modelica_projects.metadata_json', `SELECT COUNT(*) AS invalid_count FROM modelica_projects WHERE NOT json_valid(metadata_json)`],
    ['modelica_snapshots.manifest_json', `SELECT COUNT(*) AS invalid_count FROM modelica_snapshots WHERE NOT json_valid(manifest_json)`],
    ['system_settings.value_json', `SELECT COUNT(*) AS invalid_count FROM system_settings WHERE NOT json_valid(value_json)`]
  ]
  for (const [label, sql] of jsonChecks) {
    const invalid = Number(db.prepare(sql).get().invalid_count)
    assert.equal(invalid, 0, `invalid JSON found in ${label}`)
  }

  const snapshotIndexes = new Set(db.prepare(`PRAGMA index_list('modelica_snapshots')`).all().map(row => row.name))
  assert.equal(snapshotIndexes.has('idx_modelica_snapshots_project_created'), true, 'snapshot recency index is missing')

  const repairedSeed = db.prepare(`SELECT u.display_name, p.name AS project_name
    FROM users u JOIN modelica_projects p ON p.id = 'demo-project'
    WHERE u.id = 'user-demo'`).get()
  assert.equal(repairedSeed.display_name, '林工程师', 'demo user encoding repair was not applied')
  assert.equal(repairedSeed.project_name, '质量—弹簧—阻尼系统', 'demo project encoding repair was not applied')

  const plan = db.prepare(`EXPLAIN QUERY PLAN
    SELECT * FROM simulation_tasks WHERE user_id = ? ORDER BY created_at DESC`).all('user-demo')
  assert.equal(plan.some(row => String(row.detail).includes('idx_simulation_tasks_user_created')), true, 'task index is not used')
  console.log(`database checks passed: schema ${migration.version}, ${requiredTables.length} tables, ${formulaCount} formulas, ${toolCount} tools`)
} finally {
  closeDatabase()
}
