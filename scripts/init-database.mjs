import { initializeDatabase, getDatabasePath, closeDatabase } from '../server/utils/database.ts'

try {
  const db = initializeDatabase()
  const migration = db.prepare('SELECT MAX(version) AS version FROM schema_migrations').get()
  const tables = db.prepare("SELECT COUNT(*) AS count FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").get()
  const formulas = db.prepare('SELECT COUNT(*) AS count FROM formulas').get()
  console.log(`Database ready: ${getDatabasePath()}`)
  console.log(`Schema version: ${migration.version}; tables: ${tables.count}; formulas: ${formulas.count}`)
} finally {
  closeDatabase()
}
