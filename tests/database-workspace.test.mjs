import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { databaseMigrations } from '../server/database/schema.ts'
import {
  recentModelicaSnapshotsSql,
  upsertModelicaFileSql,
  upsertSimulationTaskSql
} from '../server/database/workspace-statements.ts'

const db = new DatabaseSync(':memory:')
try {
  db.exec('PRAGMA foreign_keys = ON')
  for (const migration of databaseMigrations) {
    for (const statement of migration.statements) db.prepare(statement).run()
  }

  db.prepare(`INSERT INTO users (id, username, display_name, status)
    VALUES ('test-user', 'test-user', '测试用户', 'ACTIVE')`).run()
  db.prepare(`INSERT INTO simulation_tools (id, slug, name, status)
    VALUES ('tool-test', 'tool-test', '测试工具', 'ACTIVE')`).run()
  db.prepare(`INSERT INTO simulation_tool_versions (id, tool_id, version, status)
    VALUES ('tool-test-v1', 'tool-test', '1.0.0', 'ACTIVE')`).run()

  const task = db.prepare(upsertSimulationTaskSql)
  const taskValues = (status, finishedAt) => [
    'task-1', 'test-user', 'tool-test', 'tool-test', status,
    '{}', status === 'SUCCEEDED' ? '{"ok":true}' : null, '[]', 20,
    '2026-08-24T00:00:00.000Z', finishedAt
  ]
  task.run(...taskValues('RUNNING', null))
  task.run(...taskValues('SUCCEEDED', '2026-08-24T00:01:00.000Z'))
  task.run(...taskValues('SUCCEEDED', '2026-08-24T00:10:00.000Z'))
  const savedTask = db.prepare('SELECT status, finished_at FROM simulation_tasks WHERE id = ?').get('task-1')
  assert.equal(savedTask.status, 'SUCCEEDED')
  assert.equal(savedTask.finished_at, '2026-08-24T00:01:00.000Z', 'terminal timestamp must be written once')

  db.prepare(`INSERT INTO modelica_projects
    (id, user_id, name, slug, template, status, last_compile, metadata_json)
    VALUES ('project-1', 'test-user', '测试项目', 'test-project', 'MassSpringDamper', 'ACTIVE', '未编译', '{}')`).run()

  const file = db.prepare(upsertModelicaFileSql)
  file.run('project-1-main', 'project-1', 'MassSpringDamper.mo', 'model A end A;', '2026-08-24T00:00:00.000Z')
  file.run('project-1-main', 'project-1', 'MassSpringDamper.mo', 'model A end A;', '2026-08-24T00:01:00.000Z')
  let savedFile = db.prepare('SELECT path, content, revision, updated_at FROM modelica_files WHERE id = ?').get('project-1-main')
  assert.equal(savedFile.revision, 1, 'unchanged source must not increment revision')
  assert.equal(savedFile.updated_at, '2026-08-24T00:00:00.000Z', 'unchanged source must preserve updated_at')

  file.run('project-1-main', 'project-1', 'MassSpringDamper.mo', 'model B end B;', '2026-08-24T00:02:00.000Z')
  savedFile = db.prepare('SELECT path, content, revision, updated_at FROM modelica_files WHERE id = ?').get('project-1-main')
  assert.equal(savedFile.revision, 2, 'changed source must increment revision once')

  file.run('project-1-main', 'project-1', 'Renamed.mo', 'model B end B;', '2026-08-24T00:03:00.000Z')
  savedFile = db.prepare('SELECT path, content, revision, updated_at FROM modelica_files WHERE id = ?').get('project-1-main')
  assert.equal(savedFile.path, 'Renamed.mo', 'the stable file id must allow a path change')
  assert.equal(savedFile.revision, 2, 'a path-only change must not claim a source revision')
  assert.equal(savedFile.updated_at, '2026-08-24T00:03:00.000Z')

  const insertSnapshot = db.prepare(`INSERT INTO modelica_snapshots
    (id, project_id, label, manifest_json, created_at) VALUES (?, 'project-1', ?, ?, ?)`)
  for (let index = 1; index <= 15; index++) {
    const id = `run-${String(index).padStart(2, '0')}`
    insertSnapshot.run(id, id, JSON.stringify({ id }), `2026-08-${String(index).padStart(2, '0')}T00:00:00.000Z`)
  }
  const snapshots = db.prepare(recentModelicaSnapshotsSql).all('test-user')
  assert.equal(snapshots.length, 12, 'workspace query must read at most 12 snapshots per project')
  assert.equal(snapshots[0].id, 'run-15')
  assert.equal(snapshots.at(-1).id, 'run-04')

  console.log('database workspace tests passed: terminal timestamp, source revision, stable file id, snapshot limit')
} finally {
  db.close()
}

const projectRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const tsxCli = fileURLToPath(new URL('../node_modules/tsx/dist/cli.mjs', import.meta.url))
const initScript = fileURLToPath(new URL('../scripts/init-database.mjs', import.meta.url))
const temporaryRoot = mkdtempSync(join(tmpdir(), 'cfdsolve-migration-test-'))
const temporaryDatabase = join(temporaryRoot, 'concurrent.sqlite')

function initializeInChild() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tsxCli, initScript], {
      cwd: projectRoot,
      env: { ...process.env, CFDSOLVE_DB_PATH: temporaryDatabase },
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.once('error', reject)
    child.once('close', code => resolve({ code, stdout, stderr }))
  })
}

try {
  const attempts = await Promise.all([initializeInChild(), initializeInChild()])
  for (const attempt of attempts) {
    assert.equal(attempt.code, 0, `concurrent database initialization failed:\n${attempt.stdout}\n${attempt.stderr}`)
  }
  const migrated = new DatabaseSync(temporaryDatabase, { readOnly: true })
  try {
    const rows = migrated.prepare('SELECT version, COUNT(*) AS copies FROM schema_migrations GROUP BY version ORDER BY version').all()
    assert.deepEqual(rows.map(row => Number(row.version)), databaseMigrations.map(item => item.version))
    assert.equal(rows.every(row => Number(row.copies) === 1), true, 'a migration was recorded more than once')
  } finally {
    migrated.close()
  }
  console.log('database migration concurrency test passed')
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
