import { getDatabase, getDatabasePath } from '../../utils/database'

export default defineEventHandler(async () => {
  const db = await getDatabase()
  const engine = db.engine
  const versionRow = await db.get('SELECT sqlite_version() AS version') as { version: string }
  const migration = await db.get('SELECT MAX(version) AS version FROM schema_migrations') as { version: number | null }
  const counts = await db.get(`SELECT
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM formulas) AS formulas,
    (SELECT COUNT(*) FROM simulation_tools) AS tools,
    (SELECT COUNT(*) FROM modelica_projects) AS projects`) as Record<string, number>
  return {
    ok: true,
    engine,
    version: versionRow.version,
    schemaVersion: Number(migration?.version || 0),
    path: getDatabasePath(),
    counts
  }
})
