import { randomUUID } from 'node:crypto'
import { DEMO_USER_ID, getDatabase } from '../utils/database'

const taskStatuses = new Set(['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'])
const projectStatuses = new Set(['ACTIVE', 'ARCHIVED'])
const compileStatuses = new Set(['未编译', '成功', '有诊断'])

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, any>>(event)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: '请求数据无效' })
  const db = getDatabase()
  db.exec('BEGIN IMMEDIATE')
  try {
    if (body.user?.name) {
      db.prepare(`UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(String(body.user.name).slice(0, 80), DEMO_USER_ID)
    }

    if (Array.isArray(body.bookmarks)) {
      db.prepare('DELETE FROM bookmarks WHERE user_id = ?').run(DEMO_USER_ID)
      const bookmarkStatement = db.prepare(`INSERT INTO bookmarks
        (user_id, resource_type, resource_key) VALUES (?, ?, ?)`)
      for (const key of body.bookmarks.slice(0, 500)) {
        const value = String(key).slice(0, 300)
        bookmarkStatement.run(DEMO_USER_ID, value.startsWith('formula-') ? 'formula' : 'content', value)
      }
    }

    if (Array.isArray(body.notifications)) {
      const notificationStatement = db.prepare(`INSERT INTO notifications
        (id, user_id, title, body, is_read) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET title = excluded.title, body = excluded.body, is_read = excluded.is_read`)
      for (const item of body.notifications.slice(0, 200)) {
        notificationStatement.run(
          String(item.id || randomUUID()), DEMO_USER_ID,
          String(item.title || '').slice(0, 200), String(item.text || '').slice(0, 2000), item.read ? 1 : 0
        )
      }
    }

    if (Array.isArray(body.tasks)) {
      const toolLookup = db.prepare('SELECT id FROM simulation_tools WHERE slug = ?')
      const taskStatement = db.prepare(`INSERT INTO simulation_tasks
        (id, user_id, tool_id, tool_version_id, status, params_json, result_json, warnings_json, duration_ms, created_at, finished_at)
        VALUES (?, ?, ?, (SELECT id FROM simulation_tool_versions WHERE tool_id = ? AND status = 'ACTIVE' LIMIT 1), ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET status = excluded.status, params_json = excluded.params_json,
          result_json = excluded.result_json, warnings_json = excluded.warnings_json,
          duration_ms = excluded.duration_ms, finished_at = excluded.finished_at`)
      for (const item of body.tasks.slice(0, 500)) {
        const tool = toolLookup.get(String(item.tool || '')) as { id: string } | undefined
        if (!tool || !taskStatuses.has(String(item.status))) continue
        const finished = ['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(item.status) ? new Date().toISOString() : null
        taskStatement.run(
          String(item.id).slice(0, 100), DEMO_USER_ID, tool.id, tool.id, String(item.status),
          JSON.stringify({ ...(item.params || {}), __discipline: item.discipline || 'CFD' }), item.result ? JSON.stringify(item.result) : null,
          JSON.stringify(item.warnings || []), Math.max(0, Number(item.duration || 0)),
          String(item.createdAt || new Date().toISOString()), finished
        )
      }
    }

    if (Array.isArray(body.projects)) {
      const projectStatement = db.prepare(`INSERT INTO modelica_projects
        (id, user_id, name, slug, template, status, last_compile, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, template = excluded.template,
          status = excluded.status, last_compile = excluded.last_compile, updated_at = excluded.updated_at`)
      const fileStatement = db.prepare(`INSERT INTO modelica_files
        (id, project_id, path, content, revision, updated_at) VALUES (?, ?, ?, ?, 1, ?)
        ON CONFLICT(project_id, path) DO UPDATE SET content = excluded.content,
          revision = modelica_files.revision + 1, updated_at = excluded.updated_at`)
      for (const item of body.projects.slice(0, 100)) {
        const id = String(item.id).slice(0, 100)
        const status = projectStatuses.has(String(item.status)) ? String(item.status) : 'ACTIVE'
        const lastCompile = compileStatuses.has(String(item.lastCompile)) ? String(item.lastCompile) : '未编译'
        const updatedAt = String(item.updatedAt || new Date().toISOString())
        projectStatement.run(id, DEMO_USER_ID, String(item.name).slice(0, 200), String(item.slug).slice(0, 200), String(item.template).slice(0, 200), status, lastCompile, updatedAt)
        fileStatement.run(`${id}-main`, id, `${String(item.template || 'Model')}.mo`, String(item.code || '').slice(0, 2_000_000), updatedAt)
      }
    }

    db.prepare(`INSERT INTO audit_logs
      (id, actor_id, action, resource_type, resource_id, after_json, request_id)
      VALUES (?, ?, 'workspace.sync', 'workspace', ?, ?, ?)`).run(
        randomUUID(), DEMO_USER_ID, DEMO_USER_ID,
        JSON.stringify({ bookmarks: body.bookmarks?.length || 0, tasks: body.tasks?.length || 0, projects: body.projects?.length || 0 }),
        getRequestHeader(event, 'x-request-id') || randomUUID()
      )
    db.exec('COMMIT')
    return { ok: true }
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
})
