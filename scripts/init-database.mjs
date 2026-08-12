import { initializeDatabase, getDatabasePath, closeDatabase } from '../server/utils/database.ts'

try {
  const db = await initializeDatabase()
  const migration = await db.get('SELECT MAX(version) AS version FROM schema_migrations')
  let tables
  if (db.engine === 'mysql') {
    tables = await db.get("SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE()")
  } else {
    tables = await db.get("SELECT COUNT(*) AS count FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  }
  const formulas = await db.get('SELECT COUNT(*) AS count FROM formulas')
  console.log(`Database ready: ${getDatabasePath()} (engine: ${db.engine})`)
  console.log(`Schema version: ${migration?.version}; tables: ${tables?.count}; formulas: ${formulas?.count}`)
} finally {
  await closeDatabase()
}
