import { getDatabase, getDatabasePath } from '../../utils/database'

export default defineEventHandler(() => {
  const db = getDatabase()
  const sqlite = db.prepare('SELECT sqlite_version() AS version').get() as { version: string }
  const migration = db.prepare('SELECT MAX(version) AS version FROM schema_migrations').get() as { version: number | null }
  const counts = db.prepare(`SELECT
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM formulas) AS formulas,
    (SELECT COUNT(*) FROM simulation_tools) AS tools,
    (SELECT COUNT(*) FROM modelica_projects) AS projects`).get()
  return {
    ok: true,
    engine: 'SQLite',
    sqliteVersion: sqlite.version,
    schemaVersion: Number(migration.version || 0),
    path: getDatabasePath(),
    counts
  }
})
