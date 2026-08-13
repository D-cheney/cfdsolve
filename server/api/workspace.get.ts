import { DEMO_USER_ID, getDatabase } from '../utils/database'

function parseJson(value: unknown, fallback: unknown) {
  try { return JSON.parse(String(value ?? '')) } catch { return fallback }
}

export default defineEventHandler(async () => {
  const db = await getDatabase()
  const userRow = await db.get(`SELECT display_name, username FROM users WHERE id = ?`, DEMO_USER_ID) as {
    display_name: string
    username: string
  }
  const bookmarks = await db.all(`SELECT resource_key FROM bookmarks
    WHERE user_id = ? ORDER BY created_at DESC`, DEMO_USER_ID) as Array<{ resource_key: string }>
  const notifications = await db.all(`SELECT id, title, body, is_read FROM notifications
    WHERE user_id = ? ORDER BY created_at DESC`, DEMO_USER_ID) as Array<{ id: string; title: string; body: string; is_read: number }>
  const tasks = await db.all(`SELECT st.id, tool.slug AS tool, tool.name AS tool_name, st.status,
      st.created_at, st.duration_ms, st.params_json, st.result_json, st.warnings_json
    FROM simulation_tasks st
    JOIN simulation_tools tool ON tool.id = st.tool_id
    WHERE st.user_id = ? ORDER BY st.created_at DESC`, DEMO_USER_ID) as Array<Record<string, unknown>>
  const projects = await db.all(`SELECT p.id, p.name, p.slug, p.template, p.updated_at, p.status,
      p.last_compile, COALESCE(f.content, '') AS code
    FROM modelica_projects p
    LEFT JOIN modelica_files f ON f.project_id = p.id AND f.path LIKE '%.mo'
    WHERE p.user_id = ? ORDER BY p.updated_at DESC`, DEMO_USER_ID) as Array<Record<string, unknown>>

  return {
    database: true,
    user: { name: userRow.display_name, username: userRow.username, role: '注册用户' },
    bookmarks: bookmarks.map(item => item.resource_key),
    notifications: notifications.map(item => ({ id: item.id, title: item.title, text: item.body, read: Boolean(item.is_read) })),
    tasks: tasks.map(item => {
      const params = parseJson(item.params_json, {}) as Record<string, unknown>
      return {
        id: item.id,
        tool: item.tool,
        toolName: item.tool_name,
        status: item.status,
        createdAt: item.created_at,
        duration: Number(item.duration_ms || 0),
        params,
        discipline: String(params.__discipline || 'CFD'),
        result: item.result_json ? parseJson(item.result_json, {}) : undefined,
        warnings: parseJson(item.warnings_json, [])
      }
    }),
    projects: projects.map(item => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      template: item.template,
      updatedAt: item.updated_at,
      code: item.code,
      status: item.status,
      lastCompile: item.last_compile
    }))
  }
})
