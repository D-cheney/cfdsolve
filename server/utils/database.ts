import { DatabaseSync } from 'node:sqlite'
import { dirname, resolve } from 'node:path'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { AsyncLocalStorage } from 'node:async_hooks'
import mysql from 'mysql2/promise'
import { databaseMigrations, defaultModelicaSource, seedData } from '../database/schema'

// 运行时加载项目根目录 .env（node .output/server/index.mjs 不会自动读取 .env）
function loadEnvFile() {
  try {
    const path = resolve(process.cwd(), '.env')
    if (!existsSync(path)) return
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (!match || line.trimStart().startsWith('#')) continue
      let value = match[2]
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (process.env[match[1]] === undefined) process.env[match[1]] = value
    }
  } catch {
    /* .env 不存在或不可读时忽略 */
  }
}

loadEnvFile()

export const DEMO_USER_ID = 'user-demo'

// ---------------------------------------------------------------------------
// 统一异步数据库接口：SQLite（默认，node:sqlite）与 MySQL（生产，mysql2）
// 切换方式：.env 设置 CFDSOLVE_DB_ENGINE=mysql（配合 MYSQL_* 连接参数）
// ---------------------------------------------------------------------------
export interface DbResult {
  changes: number
  lastInsertRowid?: number | bigint
}

export interface Database {
  engine: 'sqlite' | 'mysql'
  get<T = any>(sql: string, ...params: any[]): Promise<T | undefined>
  all<T = any>(sql: string, ...params: any[]): Promise<T[]>
  run(sql: string, ...params: any[]): Promise<DbResult>
  exec(sql: string): Promise<void>
  transaction<T>(fn: () => Promise<T>): Promise<T>
  close(): Promise<void>
}

// ---------------------------------------------------------------------------
// SQLite 后端
// ---------------------------------------------------------------------------
class SqliteDatabase implements Database {
  readonly engine = 'sqlite' as const
  constructor(private readonly db: DatabaseSync) {}

  async get<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
    return this.db.prepare(sql).get(...params) as T | undefined
  }

  async all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
    return this.db.prepare(sql).all(...params) as T[]
  }

  async run(sql: string, ...params: any[]): Promise<DbResult> {
    const info = this.db.prepare(sql).run(...params)
    return { changes: Number(info.changes), lastInsertRowid: info.lastInsertRowid as number | bigint | undefined }
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql)
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    this.db.exec('BEGIN IMMEDIATE')
    try {
      const result = await fn()
      this.db.exec('COMMIT')
      return result
    } catch (error) {
      this.db.exec('ROLLBACK')
      throw error
    }
  }

  async close(): Promise<void> {
    this.db.close()
  }
}

// ---------------------------------------------------------------------------
// MySQL 后端（mysql2 连接池；事务连接通过 AsyncLocalStorage 绑定到当前调用链）
// ---------------------------------------------------------------------------
const txStorage = new AsyncLocalStorage<mysql.PoolConnection>()

/** 把代码中的 SQLite 方言翻译为 MySQL 方言 */
function translateSqliteToMysql(sql: string): string {
  let s = sql
  // INSERT OR IGNORE → INSERT IGNORE
  s = s.replace(/\bINSERT\s+OR\s+IGNORE\b/gi, 'INSERT IGNORE')
  // ON CONFLICT(cols) DO UPDATE SET ... excluded.col → ON DUPLICATE KEY UPDATE ... VALUES(`col`)
  s = s.replace(/ON\s+CONFLICT\s*\([^)]*\)\s*DO\s+UPDATE\s+SET\s+([\s\S]*)$/i, (_match, setClause: string) => {
    const translated = setClause.replace(/\bexcluded\.(\w+)/g, (_m, col: string) => `VALUES(\`${col}\`)`)
    return `ON DUPLICATE KEY UPDATE ${translated}`
  })
  // 聚合函数差异
  s = s.replace(/\bjson_group_array\s*\(/gi, 'JSON_ARRAYAGG(')
  s = s.replace(/\bsqlite_version\s*\(/gi, 'VERSION(')
  return s
}

interface MysqlConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

class MysqlDatabase implements Database {
  readonly engine = 'mysql' as const
  private readonly pool: mysql.Pool

  constructor(config: MysqlConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: 'utf8mb4_unicode_ci',
      dateStrings: true,
      connectionLimit: Number(process.env.MYSQL_POOL_SIZE || 10),
      waitForConnections: true,
      queueLimit: 0
    })
  }

  private async query<T = any>(sql: string, params: any[], mode: 'get' | 'all'): Promise<T> {
    const tx = txStorage.getStore()
    const conn = tx || (await this.pool.getConnection())
    try {
      const [rows] = await conn.query(translateSqliteToMysql(sql), params)
      if (mode === 'get') return (rows as any[])[0] as T
      return rows as T
    } finally {
      if (!tx) conn.release()
    }
  }

  async get<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
    return this.query<T | undefined>(sql, params, 'get')
  }

  async all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
    return this.query<T[]>(sql, params, 'all')
  }

  async run(sql: string, ...params: any[]): Promise<DbResult> {
    const tx = txStorage.getStore()
    const conn = tx || (await this.pool.getConnection())
    try {
      const [result] = await conn.query<mysql.ResultSetHeader>(translateSqliteToMysql(sql), params)
      return { changes: result.affectedRows, lastInsertRowid: result.insertId }
    } finally {
      if (!tx) conn.release()
    }
  }

  async exec(sql: string): Promise<void> {
    if (/^\s*PRAGMA/i.test(sql)) return // PRAGMA 仅 SQLite 支持，MySQL 下忽略
    const tx = txStorage.getStore()
    const conn = tx || (await this.pool.getConnection())
    try {
      await conn.query(sql)
    } finally {
      if (!tx) conn.release()
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const conn = await this.pool.getConnection()
    await conn.beginTransaction()
    try {
      const result = await txStorage.run(conn, fn)
      await conn.commit()
      return result
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}

// ---------------------------------------------------------------------------
// 初始化
// ---------------------------------------------------------------------------
let connection: Database | undefined
let databasePath = ''

function resolveDatabasePath() {
  return resolve(process.env.CFDSOLVE_DB_PATH || resolve(process.cwd(), 'data', 'cfdsolve.sqlite'))
}

function mysqlConfig(): MysqlConfig {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'wechat_user',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'cfdsolve'
  }
}

function isMysqlMode() {
  return (process.env.CFDSOLVE_DB_ENGINE || '').toLowerCase() === 'mysql'
}

async function runMigrations(db: Database) {
  if (db.engine === 'mysql') {
    // MySQL 表结构由 scripts/mysql-schema.sql 预建（TEXT 主键等 SQLite 语法无法在 MySQL 执行）
    await db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (version)
    )`)
    const tables = await db.all<{ table_name?: string; TABLE_NAME?: string }>(
      `SELECT table_name AS table_name FROM information_schema.tables WHERE table_schema = DATABASE()`
    )
    const have = new Set(tables.map(row => String(row.table_name ?? row.TABLE_NAME ?? '')))
    const required = ['users', 'roles', 'content_items', 'formulas', 'forum_sections', 'simulation_tools', 'modelica_projects', 'notifications', 'audit_logs']
    const missing = required.filter(name => !have.has(name))
    if (missing.length) {
      throw new Error(`MySQL 数据库缺少表：${missing.join(', ')}。请先执行 scripts/mysql-schema.sql 建表。`)
    }
    await db.transaction(async () => {
      for (const migration of databaseMigrations) {
        await db.run('INSERT IGNORE INTO schema_migrations (version, name) VALUES (?, ?)', migration.version, migration.name)
      }
    })
    return
  }

  // SQLite：沿用原有迁移逻辑
  await db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)

  const applied = new Set(
    (await db.all<{ version: number }>('SELECT version FROM schema_migrations')).map(row => Number(row.version))
  )

  for (const migration of databaseMigrations) {
    if (applied.has(migration.version)) continue
    await db.transaction(async () => {
      for (const statement of migration.statements) await db.run(statement)
      await db.run('INSERT INTO schema_migrations (version, name) VALUES (?, ?)', migration.version, migration.name)
    })
  }
}

async function seedDatabase(db: Database) {
  await db.transaction(async () => {
    await db.run(`INSERT OR IGNORE INTO users (id, email, username, display_name, status)
      VALUES (?, ?, ?, ?, 'ACTIVE')`, DEMO_USER_ID, 'engineer@example.com', 'lin-cfd', '林工程师')

    for (const [id, code, name] of seedData.roles) {
      await db.run('INSERT OR IGNORE INTO roles (id, code, name) VALUES (?, ?, ?)', id, code, name)
    }

    for (const [id, code, name] of seedData.permissions) {
      await db.run('INSERT OR IGNORE INTO permissions (id, code, name) VALUES (?, ?, ?)', id, code, name)
    }

    await db.run('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)', DEMO_USER_ID, 'role-user')
    for (const permissionId of ['perm-content-read', 'perm-simulation-run', 'perm-project-write', 'perm-forum-write']) {
      await db.run('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', 'role-user', permissionId)
    }
    for (const permissionId of seedData.permissions.map(item => item[0])) {
      await db.run('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', 'role-admin', permissionId)
    }

    for (const [id, parentId, kind, slug, name, sortOrder] of seedData.categories) {
      await db.run(`INSERT OR IGNORE INTO categories
        (id, parent_id, kind, slug, name, sort_order) VALUES (?, ?, ?, ?, ?, ?)`, id, parentId, kind, slug, name, sortOrder)
    }

    for (const formula of seedData.formulas) {
      await db.run(`INSERT OR IGNORE INTO formulas
        (id, category_id, slug, name, latex, unicode_math, plain_text, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ...formula)
    }

    for (const section of seedData.forumSections) {
      await db.run(`INSERT OR IGNORE INTO forum_sections
        (id, slug, name, description, sort_order) VALUES (?, ?, ?, ?, ?)`, ...section)
    }

    for (const [id, slug, name, description] of seedData.tools) {
      await db.run(`INSERT OR IGNORE INTO simulation_tools
        (id, slug, name, description, status) VALUES (?, ?, ?, ?, 'ACTIVE')`, id, slug, name, description)
      await db.run(`INSERT OR IGNORE INTO simulation_tool_versions
        (id, tool_id, version, input_schema_json, result_schema_json, status)
        VALUES (?, ?, '1.0.0', '{}', '{}', 'ACTIVE')`, `${id}-v1`, id)
    }

    for (const setting of seedData.settings) {
      await db.run(`INSERT OR IGNORE INTO system_settings
        (\`key\`, value_json, description) VALUES (?, ?, ?)`, ...setting)
    }

    const content = [
      ['content-navier-stokes', 'cat-equations', DEMO_USER_ID, 'article', 'navier-stokes', '从连续方程到 Navier–Stokes 方程', '从质量与动量守恒出发建立不可压缩流动控制方程。'],
      ['content-finite-volume', 'cat-numerics', DEMO_USER_ID, 'article', 'finite-volume', '有限体积法：守恒离散的核心思路', '理解控制体积分、面通量和离散系数。'],
      ['content-simple', 'cat-numerics', DEMO_USER_ID, 'algorithm', 'simple-method', 'SIMPLE 压力—速度耦合算法', '推导压力修正方程并理解收敛判据。'],
      ['content-wall-y-plus', 'cat-physics', DEMO_USER_ID, 'article', 'wall-y-plus', 'y+、首层网格与近壁面处理', '估算首层高度并核对近壁面模型要求。']
    ] as const
    for (const item of content) {
      await db.run(`INSERT OR IGNORE INTO content_items
        (id, category_id, author_id, kind, slug, title, summary, body_json, body_html, status, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, '{}', '', 'PUBLISHED', CURRENT_TIMESTAMP)`, ...item)
    }

    await db.run(`INSERT OR IGNORE INTO forum_topics
      (id, section_id, author_id, title, status, views)
      VALUES ('topic-1001', 'section-theory', ?, '方腔流 Re=100 时中心线速度偏差如何定位？', 'RESOLVED', 1264)`, DEMO_USER_ID)
    await db.run(`INSERT OR IGNORE INTO forum_posts
      (id, topic_id, author_id, body, accepted, likes)
      VALUES ('post-1001-1', 'topic-1001', ?, '使用 65×65 网格计算时，结果与公开基准仍有约 4% 偏差，应优先检查哪些设置？', 0, 6)`, DEMO_USER_ID)

    await db.run(`INSERT OR IGNORE INTO modelica_projects
      (id, user_id, name, slug, template, status, last_compile)
      VALUES ('demo-project', ?, '质量—弹簧—阻尼系统', 'mass-spring-damper', 'MassSpringDamper', 'ACTIVE', '成功')`, DEMO_USER_ID)
    await db.run(`INSERT OR IGNORE INTO modelica_files
      (id, project_id, path, content, revision)
      VALUES ('demo-project-main', 'demo-project', 'MassSpringDamper.mo', ?, 1)`, defaultModelicaSource)

    await db.run(`INSERT OR IGNORE INTO notifications
      (id, user_id, title, body, is_read)
      VALUES ('notification-welcome', ?, '数据库已连接', '项目、任务、收藏和通知现在会保存到本地数据库。', 0)`, DEMO_USER_ID)
    await db.run(`INSERT OR IGNORE INTO notifications
      (id, user_id, title, body, is_read)
      VALUES ('notification-benchmark', ?, '方腔流基准案例已更新', 'Re=100 的参考中心线数据现在已经可用。', 0)`, DEMO_USER_ID)
  })
}

export async function initializeDatabase(): Promise<Database> {
  if (connection) return connection

  if (isMysqlMode()) {
    const db = new MysqlDatabase(mysqlConfig())
    await runMigrations(db)
    await seedDatabase(db)
    connection = db
    return db
  }

  databasePath = resolveDatabasePath()
  mkdirSync(dirname(databasePath), { recursive: true })
  const raw = new DatabaseSync(databasePath)
  raw.exec('PRAGMA journal_mode = WAL')
  raw.exec('PRAGMA foreign_keys = ON')
  raw.exec('PRAGMA busy_timeout = 5000')
  const db = new SqliteDatabase(raw)
  await runMigrations(db)
  await seedDatabase(db)
  raw.exec('PRAGMA optimize')
  connection = db
  return db
}

export function getDatabase(): Promise<Database> {
  return initializeDatabase()
}

export function getDatabasePath(): string {
  if (isMysqlMode()) {
    return `mysql://${mysqlConfig().user}@${mysqlConfig().host}:${mysqlConfig().port}/${mysqlConfig().database}`
  }
  if (!databasePath) databasePath = resolveDatabasePath()
  return databasePath
}

export async function closeDatabase(): Promise<void> {
  await connection?.close()
  connection = undefined
}
