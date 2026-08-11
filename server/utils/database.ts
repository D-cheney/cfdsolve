import { DatabaseSync } from 'node:sqlite'
import { dirname, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { databaseMigrations, defaultModelicaSource, seedData } from '../database/schema'

const DEMO_USER_ID = 'user-demo'
let connection: DatabaseSync | undefined
let databasePath = ''

function resolveDatabasePath() {
  return resolve(process.env.CFDSOLVE_DB_PATH || resolve(process.cwd(), 'data', 'cfdsolve.sqlite'))
}

function runMigrations(db: DatabaseSync) {
  db.prepare(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run()

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map(row => Number(row.version))
  )

  for (const migration of databaseMigrations) {
    if (applied.has(migration.version)) continue
    db.exec('BEGIN IMMEDIATE')
    try {
      for (const statement of migration.statements) db.prepare(statement).run()
      db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name)
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
}

function seedDatabase(db: DatabaseSync) {
  db.exec('BEGIN IMMEDIATE')
  try {
    db.prepare(`INSERT OR IGNORE INTO users (id, email, username, display_name, status)
      VALUES (?, ?, ?, ?, 'ACTIVE')`).run(DEMO_USER_ID, 'engineer@example.com', 'lin-cfd', '林工程师')

    const roleStatement = db.prepare('INSERT OR IGNORE INTO roles (id, code, name) VALUES (?, ?, ?)')
    for (const [id, code, name] of seedData.roles) roleStatement.run(id, code, name)

    const permissionStatement = db.prepare('INSERT OR IGNORE INTO permissions (id, code, name) VALUES (?, ?, ?)')
    for (const [id, code, name] of seedData.permissions) permissionStatement.run(id, code, name)

    db.prepare('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)').run(DEMO_USER_ID, 'role-user')
    for (const permissionId of ['perm-content-read', 'perm-simulation-run', 'perm-project-write', 'perm-forum-write']) {
      db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)').run('role-user', permissionId)
    }
    for (const permissionId of seedData.permissions.map(item => item[0])) {
      db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)').run('role-admin', permissionId)
    }

    const categoryStatement = db.prepare(`INSERT OR IGNORE INTO categories
      (id, parent_id, kind, slug, name, sort_order) VALUES (?, ?, ?, ?, ?, ?)`)
    for (const [id, parentId, kind, slug, name, sortOrder] of seedData.categories) {
      categoryStatement.run(id, parentId, kind, slug, name, sortOrder)
    }

    const formulaStatement = db.prepare(`INSERT OR IGNORE INTO formulas
      (id, category_id, slug, name, latex, unicode_math, plain_text, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    for (const formula of seedData.formulas) formulaStatement.run(...formula)

    const sectionStatement = db.prepare(`INSERT OR IGNORE INTO forum_sections
      (id, slug, name, description, sort_order) VALUES (?, ?, ?, ?, ?)`)
    for (const section of seedData.forumSections) sectionStatement.run(...section)

    const toolStatement = db.prepare(`INSERT OR IGNORE INTO simulation_tools
      (id, slug, name, description, status) VALUES (?, ?, ?, ?, 'ACTIVE')`)
    const versionStatement = db.prepare(`INSERT OR IGNORE INTO simulation_tool_versions
      (id, tool_id, version, input_schema_json, result_schema_json, status)
      VALUES (?, ?, '1.0.0', '{}', '{}', 'ACTIVE')`)
    for (const [id, slug, name, description] of seedData.tools) {
      toolStatement.run(id, slug, name, description)
      versionStatement.run(`${id}-v1`, id)
    }

    const settingStatement = db.prepare(`INSERT OR IGNORE INTO system_settings
      (key, value_json, description) VALUES (?, ?, ?)`)
    for (const setting of seedData.settings) settingStatement.run(...setting)

    const contentStatement = db.prepare(`INSERT OR IGNORE INTO content_items
      (id, category_id, author_id, kind, slug, title, summary, body_json, body_html, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, '{}', '', 'PUBLISHED', CURRENT_TIMESTAMP)`)
    const content = [
      ['content-navier-stokes', 'cat-equations', DEMO_USER_ID, 'article', 'navier-stokes', '从连续方程到 Navier–Stokes 方程', '从质量与动量守恒出发建立不可压缩流动控制方程。'],
      ['content-finite-volume', 'cat-numerics', DEMO_USER_ID, 'article', 'finite-volume', '有限体积法：守恒离散的核心思路', '理解控制体积分、面通量和离散系数。'],
      ['content-simple', 'cat-numerics', DEMO_USER_ID, 'algorithm', 'simple-method', 'SIMPLE 压力—速度耦合算法', '推导压力修正方程并理解收敛判据。'],
      ['content-wall-y-plus', 'cat-physics', DEMO_USER_ID, 'article', 'wall-y-plus', 'y+、首层网格与近壁面处理', '估算首层高度并核对近壁面模型要求。']
    ] as const
    for (const item of content) contentStatement.run(...item)

    db.prepare(`INSERT OR IGNORE INTO forum_topics
      (id, section_id, author_id, title, status, views)
      VALUES ('topic-1001', 'section-theory', ?, '方腔流 Re=100 时中心线速度偏差如何定位？', 'RESOLVED', 1264)`).run(DEMO_USER_ID)
    db.prepare(`INSERT OR IGNORE INTO forum_posts
      (id, topic_id, author_id, body, accepted, likes)
      VALUES ('post-1001-1', 'topic-1001', ?, '使用 65×65 网格计算时，结果与公开基准仍有约 4% 偏差，应优先检查哪些设置？', 0, 6)`).run(DEMO_USER_ID)

    db.prepare(`INSERT OR IGNORE INTO modelica_projects
      (id, user_id, name, slug, template, status, last_compile)
      VALUES ('demo-project', ?, '质量—弹簧—阻尼系统', 'mass-spring-damper', 'MassSpringDamper', 'ACTIVE', '成功')`).run(DEMO_USER_ID)
    db.prepare(`INSERT OR IGNORE INTO modelica_files
      (id, project_id, path, content, revision)
      VALUES ('demo-project-main', 'demo-project', 'MassSpringDamper.mo', ?, 1)`).run(defaultModelicaSource)

    db.prepare(`INSERT OR IGNORE INTO notifications
      (id, user_id, title, body, is_read)
      VALUES ('notification-welcome', ?, '数据库已连接', '项目、任务、收藏和通知现在会保存到本地 SQLite 数据库。', 0)`).run(DEMO_USER_ID)
    db.prepare(`INSERT OR IGNORE INTO notifications
      (id, user_id, title, body, is_read)
      VALUES ('notification-benchmark', ?, '方腔流基准案例已更新', 'Re=100 的参考中心线数据现在已经可用。', 0)`).run(DEMO_USER_ID)

    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function initializeDatabase() {
  if (connection) return connection
  databasePath = resolveDatabasePath()
  mkdirSync(dirname(databasePath), { recursive: true })
  const db = new DatabaseSync(databasePath)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec('PRAGMA busy_timeout = 5000')
  runMigrations(db)
  seedDatabase(db)
  db.exec('PRAGMA optimize')
  connection = db
  return db
}

export function getDatabase() {
  return initializeDatabase()
}

export function getDatabasePath() {
  if (!databasePath) databasePath = resolveDatabasePath()
  return databasePath
}

export function closeDatabase() {
  connection?.close()
  connection = undefined
}

export { DEMO_USER_ID }
