import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { initializeDatabase, getDatabasePath, closeDatabase } from '../server/utils/database.ts'

const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
const target = resolve(process.cwd(), 'backups', `cfdsolve-${stamp}.sqlite`)
mkdirSync(dirname(target), { recursive: true })

try {
  const db = initializeDatabase()
  const checkpoint = db.prepare('PRAGMA wal_checkpoint(FULL)').get()
  if (Number(checkpoint.busy || 0) > 0) throw new Error('WAL checkpoint is busy; database backup was not created')

  // VACUUM INTO reads a transactionally consistent snapshot, including pages
  // that another connection may still have in WAL. Copying only the main file
  // is not safe while the local service is running.
  db.prepare('VACUUM INTO ?').run(target)

  const backup = new DatabaseSync(target, { readOnly: true })
  try {
    const integrity = backup.prepare('PRAGMA integrity_check').get()
    if (integrity.integrity_check !== 'ok') throw new Error(`Backup integrity check failed: ${integrity.integrity_check}`)
    const foreignKeys = backup.prepare('PRAGMA foreign_key_check').all()
    if (foreignKeys.length) throw new Error(`Backup contains ${foreignKeys.length} foreign key violation(s)`)
  } finally {
    backup.close()
  }

  console.log(`Database backup created: ${target}`)
  console.log(`Source: ${getDatabasePath()}; WAL pages checkpointed: ${Number(checkpoint.checkpointed || 0)}`)
} finally {
  closeDatabase()
}
