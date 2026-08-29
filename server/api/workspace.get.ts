import { DEMO_USER_ID, getDatabase } from "../utils/database";
import { assertLocalWorkspaceRequest } from "../utils/local-access";
import { recentModelicaSnapshotsSql } from "../database/workspace-statements";

function parseJson(value: unknown, fallback: unknown) {
  try {
    return JSON.parse(String(value ?? ""));
  } catch {
    return fallback;
  }
}

export default defineEventHandler((event) => {
  assertLocalWorkspaceRequest(event);
  const db = getDatabase();
  const userRow = db
    .prepare(`SELECT display_name, username FROM users WHERE id = ?`)
    .get(DEMO_USER_ID) as {
    display_name: string;
    username: string;
  };
  const bookmarks = db
    .prepare(
      `SELECT resource_key FROM bookmarks
    WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(DEMO_USER_ID) as Array<{ resource_key: string }>;
  const notifications = db
    .prepare(
      `SELECT id, title, body, is_read FROM notifications
    WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(DEMO_USER_ID) as Array<{
    id: string;
    title: string;
    body: string;
    is_read: number;
  }>;
  const tasks = db
    .prepare(
      `SELECT st.id, tool.slug AS tool, tool.name AS tool_name, st.status,
      st.created_at, st.duration_ms, st.params_json, st.result_json, st.warnings_json
    FROM simulation_tasks st
    JOIN simulation_tools tool ON tool.id = st.tool_id
    WHERE st.user_id = ? ORDER BY st.created_at DESC LIMIT 500`,
    )
    .all(DEMO_USER_ID) as Array<Record<string, unknown>>;
  const projects = db
    .prepare(
      `SELECT p.id, p.name, p.slug, p.template, p.updated_at, p.status,
      p.last_compile, p.metadata_json, COALESCE((SELECT mf.content FROM modelica_files mf
        WHERE mf.project_id = p.id AND mf.path LIKE '%.mo' ORDER BY mf.updated_at DESC, mf.path LIMIT 1), '') AS code
    FROM modelica_projects p
    WHERE p.user_id = ? ORDER BY p.updated_at DESC`,
    )
    .all(DEMO_USER_ID) as Array<Record<string, unknown>>;
  const snapshots = db
    .prepare(recentModelicaSnapshotsSql)
    .all(DEMO_USER_ID) as Array<Record<string, unknown>>;
  const runsByProject = new Map<string, unknown[]>();
  snapshots.forEach((item) => {
    const id = String(item.project_id);
    const runs = runsByProject.get(id) ?? [];
    if (runs.length < 12)
      runs.push(
        parseJson(item.manifest_json, {
          id: item.id,
          label: item.label,
          createdAt: item.created_at,
        }),
      );
    runsByProject.set(id, runs);
  });

  return {
    database: true,
    user: {
      name: userRow.display_name,
      username: userRow.username,
      role: "注册用户",
    },
    bookmarks: bookmarks.map((item) => item.resource_key),
    notifications: notifications.map((item) => ({
      id: item.id,
      title: item.title,
      text: item.body,
      read: Boolean(item.is_read),
    })),
    tasks: tasks.map((item) => ({
      id: item.id,
      tool: item.tool,
      toolName: item.tool_name,
      status: item.status,
      createdAt: item.created_at,
      duration: Number(item.duration_ms || 0),
      params: parseJson(item.params_json, {}),
      result: item.result_json ? parseJson(item.result_json, {}) : undefined,
      warnings: parseJson(item.warnings_json, []),
    })),
    projects: projects.map((item) => {
      const metadata = parseJson(item.metadata_json, {}) as Record<
        string,
        unknown
      >;
      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        template: item.template,
        updatedAt: item.updated_at,
        code: item.code,
        status: item.status,
        lastCompile: item.last_compile,
        experiment: metadata.experiment,
        diagram: metadata.diagram,
        algorithms: metadata.algorithms,
        runs: runsByProject.get(String(item.id)) ?? [],
      };
    }),
  };
});
