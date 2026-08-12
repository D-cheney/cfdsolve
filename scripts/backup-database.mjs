import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { initializeDatabase, getDatabasePath, closeDatabase } from '../server/utils/database.ts'

const db = await initializeDatabase()
const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
mkdirSync(resolve(process.cwd(), 'backups'), { recursive: true })

if (db.engine === 'mysql') {
  const target = resolve(process.cwd(), 'backups', `cfdsolve-${stamp}.sql`)
  const host = process.env.MYSQL_HOST || '127.0.0.1'
  const port = process.env.MYSQL_PORT || '3306'
  const user = process.env.MYSQL_USER || 'wechat_user'
  const database = process.env.MYSQL_DATABASE || 'cfdsolve'
  const password = process.env.MYSQL_PASSWORD || ''
  execSync(
    `mysqldump --no-tablespaces --single-transaction -h${host} -P${port} -u${user} -p${password} ${database} > ${target}`,
    { stdio: 'inherit', shell: '/bin/bash' }
  )
  console.log(`Database backup created: ${target} (mysql dump)`)
} else {
  const source = getDatabasePath()
  const target = resolve(process.cwd(), 'backups', `cfdsolve-${stamp}.sqlite`)
  copyFileSync(source, target)
  console.log(`Database backup created: ${target}`)
}

await closeDatabase()
