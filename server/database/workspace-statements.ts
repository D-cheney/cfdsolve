export const upsertSimulationTaskSql = `INSERT INTO simulation_tasks
  (id, user_id, tool_id, tool_version_id, status, params_json, result_json, warnings_json, duration_ms, created_at, finished_at)
  VALUES (?, ?, ?, (SELECT id FROM simulation_tool_versions WHERE tool_id = ? AND status = 'ACTIVE' LIMIT 1), ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    status = excluded.status,
    result_json = excluded.result_json,
    warnings_json = excluded.warnings_json,
    duration_ms = excluded.duration_ms,
    finished_at = COALESCE(simulation_tasks.finished_at, excluded.finished_at)`

export const upsertModelicaFileSql = `INSERT INTO modelica_files
  (id, project_id, path, content, revision, updated_at)
  VALUES (?, ?, ?, ?, 1, ?)
  ON CONFLICT(id) DO UPDATE SET
    path = excluded.path,
    content = excluded.content,
    revision = modelica_files.revision + CASE
      WHEN modelica_files.content <> excluded.content THEN 1 ELSE 0
    END,
    updated_at = CASE
      WHEN modelica_files.content <> excluded.content OR modelica_files.path <> excluded.path
        THEN excluded.updated_at
      ELSE modelica_files.updated_at
    END
  WHERE modelica_files.project_id = excluded.project_id`

export const recentModelicaSnapshotsSql = `WITH ranked_snapshots AS (
  SELECT s.id, s.project_id, s.label, s.manifest_json, s.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY s.project_id
      ORDER BY s.created_at DESC, s.id DESC
    ) AS snapshot_rank
  FROM modelica_snapshots s
  JOIN modelica_projects p ON p.id = s.project_id
  WHERE p.user_id = ?
)
SELECT id, project_id, label, manifest_json, created_at
FROM ranked_snapshots
WHERE snapshot_rank <= 12
ORDER BY project_id, created_at DESC, id DESC`
