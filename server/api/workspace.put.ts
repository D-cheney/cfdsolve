import { randomUUID } from "node:crypto";
import { DEMO_USER_ID, getDatabase } from "../utils/database";
import { assertSameOriginWorkspaceWrite } from "../utils/local-access";
import {
  upsertModelicaFileSql,
  upsertSimulationTaskSql,
} from "../database/workspace-statements";

const taskStatuses = new Set([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
]);
const projectStatuses = new Set(["ACTIVE", "ARCHIVED"]);
const compileStatuses = new Set(["未编译", "成功", "有诊断"]);

function serializeWithin(value: unknown, maxLength: number, label: string) {
  const serialized = JSON.stringify(value);
  if (Buffer.byteLength(serialized, "utf8") > maxLength)
    throw createError({
      statusCode: 413,
      message: `${label}超过本地存储上限`,
    });
  return serialized;
}

export default defineEventHandler(async (event) => {
  assertSameOriginWorkspaceWrite(event);
  const body = await readBody<Record<string, any>>(event);
  if (!body || typeof body !== "object")
    throw createError({ statusCode: 400, message: "请求数据无效" });
  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE");
  try {
    if (body.user?.name) {
      db.prepare(
        `UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      ).run(String(body.user.name).slice(0, 80), DEMO_USER_ID);
    }

    if (Array.isArray(body.bookmarks)) {
      db.prepare("DELETE FROM bookmarks WHERE user_id = ?").run(DEMO_USER_ID);
      const bookmarkStatement = db.prepare(`INSERT INTO bookmarks
        (user_id, resource_type, resource_key) VALUES (?, ?, ?)`);
      for (const key of body.bookmarks.slice(0, 500)) {
        const value = String(key).slice(0, 300);
        bookmarkStatement.run(
          DEMO_USER_ID,
          value.startsWith("formula-") ? "formula" : "content",
          value,
        );
      }
    }

    if (Array.isArray(body.notifications)) {
      const notificationStatement = db.prepare(`INSERT INTO notifications
        (id, user_id, title, body, is_read) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET title = excluded.title, body = excluded.body, is_read = excluded.is_read`);
      for (const item of body.notifications.slice(0, 200)) {
        notificationStatement.run(
          String(item.id || randomUUID()),
          DEMO_USER_ID,
          String(item.title || "").slice(0, 200),
          String(item.text || "").slice(0, 2000),
          item.read ? 1 : 0,
        );
      }
    }

    if (Array.isArray(body.tasks)) {
      const toolLookup = db.prepare(
        "SELECT id FROM simulation_tools WHERE slug = ?",
      );
      const taskStatement = db.prepare(upsertSimulationTaskSql);
      for (const item of body.tasks.slice(0, 500)) {
        const tool = toolLookup.get(String(item.tool || "")) as
          { id: string } | undefined;
        if (!tool || !taskStatuses.has(String(item.status))) continue;
        const finished = ["SUCCEEDED", "FAILED", "CANCELLED"].includes(
          item.status,
        )
          ? new Date().toISOString()
          : null;
        const duration = Number(item.duration || 0);
        const createdAt = String(item.createdAt || new Date().toISOString());
        if (!Number.isFinite(duration) || Number.isNaN(Date.parse(createdAt)))
          continue;
        taskStatement.run(
          String(item.id).slice(0, 100),
          DEMO_USER_ID,
          tool.id,
          tool.id,
          String(item.status),
          serializeWithin(item.params || {}, 200_000, "仿真参数"),
          item.result
            ? serializeWithin(item.result, 4_000_000, "仿真结果")
            : null,
          serializeWithin(item.warnings || [], 100_000, "仿真警告"),
          Math.max(0, duration),
          createdAt,
          finished,
        );
      }
    }

    if (Array.isArray(body.projects)) {
      const projectStatement = db.prepare(`INSERT INTO modelica_projects
        (id, user_id, name, slug, template, status, last_compile, metadata_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, template = excluded.template,
          status = excluded.status, last_compile = excluded.last_compile, metadata_json = excluded.metadata_json, updated_at = excluded.updated_at`);
      const fileStatement = db.prepare(upsertModelicaFileSql);
      const snapshotStatement = db.prepare(`INSERT INTO modelica_snapshots
        (id, project_id, label, manifest_json, created_at) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET label = excluded.label, manifest_json = excluded.manifest_json, created_at = excluded.created_at`);
      for (const item of body.projects.slice(0, 100)) {
        const id = String(item.id).slice(0, 100);
        const status = projectStatuses.has(String(item.status))
          ? String(item.status)
          : "ACTIVE";
        const lastCompile = compileStatuses.has(String(item.lastCompile))
          ? String(item.lastCompile)
          : "未编译";
        const updatedAt = String(item.updatedAt || new Date().toISOString());
        const experiment =
          item.experiment && typeof item.experiment === "object"
            ? item.experiment
            : {};
        const diagram =
          item.diagram && typeof item.diagram === "object"
            ? item.diagram
            : undefined;
        const algorithms = Array.isArray(item.algorithms)
          ? item.algorithms.slice(0, 100)
          : [];
        const code = String(item.code || "");
        if (Buffer.byteLength(code, "utf8") > 2_000_000)
          throw createError({
            statusCode: 413,
            message: "Modelica 源码超过本地存储上限",
          });
        projectStatement.run(
          id,
          DEMO_USER_ID,
          String(item.name).slice(0, 200),
          String(item.slug).slice(0, 200),
          String(item.template).slice(0, 200),
          status,
          lastCompile,
          serializeWithin(
            { experiment, diagram, algorithms },
            1_000_000,
            "Modelica 项目元数据",
          ),
          updatedAt,
        );
        fileStatement.run(
          `${id}-main`,
          id,
          `${String(item.template || "Model")}.mo`,
          code,
          updatedAt,
        );
        if (Array.isArray(item.runs)) {
          for (const run of item.runs.slice(0, 12)) {
            if (!run || typeof run !== "object") continue;
            const runId = String(run.id || "").slice(0, 120);
            if (!runId) continue;
            snapshotStatement.run(
              runId,
              id,
              String(run.label || "实验").slice(0, 200),
              serializeWithin(run, 4_000_000, "Modelica 运行快照"),
              String(run.createdAt || updatedAt),
            );
          }
          db.prepare(
            `DELETE FROM modelica_snapshots WHERE project_id = ? AND id NOT IN
            (SELECT id FROM modelica_snapshots WHERE project_id = ? ORDER BY created_at DESC LIMIT 12)`,
          ).run(id, id);
        }
      }
    }

    db.prepare(
      `INSERT INTO audit_logs
      (id, actor_id, action, resource_type, resource_id, after_json, request_id)
      VALUES (?, ?, 'workspace.sync', 'workspace', ?, ?, ?)`,
    ).run(
      randomUUID(),
      DEMO_USER_ID,
      DEMO_USER_ID,
      JSON.stringify({
        bookmarks: body.bookmarks?.length || 0,
        tasks: body.tasks?.length || 0,
        projects: body.projects?.length || 0,
      }),
      getRequestHeader(event, "x-request-id") || randomUUID(),
    );
    db.exec("COMMIT");
    return { ok: true };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
});
