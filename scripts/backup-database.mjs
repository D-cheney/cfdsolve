import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { initializeDatabase, getDatabasePath, closeDatabase } from '../server/utils/database.ts'

initializeDatabase()
const source = getDatabasePath()
closeDatabase()
const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
const target = resolve(process.cwd(), 'backups', `cfdsolve-${stamp}.sqlite`)
mkdirSync(dirname(target), { recursive: true })
copyFileSync(source, target)
console.log(`Database backup created: ${target}`)
