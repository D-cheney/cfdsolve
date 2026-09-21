# 知识库数据库快照 (db/cfdsolve.sqlite)

本目录存放 cfdsolve.com 知识库的 SQLite 数据库**快照**，便于完整备份 / 迁移 / 复核。

## 内容

- `cfdsolve.sqlite` — 线上知识库数据库的一致性快照（`VACUUM INTO` 生成，已 `VACUUM`）。
- 知识正文与分类全部保留：
  - `content_items` 500（全部为深度文章，与 `templates/knowledge/**` 的 500 篇源文件一一对应）
  - `categories` 46、`tags` 1261、`content_tags` 2756、`formulas` 5
  - `schema_migrations`、`system_settings`（站点配置）
- 为保护隐私，上传前已清空以下**个人 / 审计类**数据（表结构保留）：
  - `audit_logs`、`notifications`、`forum_posts`、`forum_topics`、`forum_sections`、`bookmarks`
  - `users.password_hash` 置空

> 2026-09-20 变更：382 篇扩展文章完成"空壳审计 + 全量重写"；同时删除了一条由种子数据反复写入的永久空壳条目 `content-simple`（`simple-method`，正文为空且无对应源文件），主知识库因此从 501 条收敛为 500 条。

## 数据来源与再生成

知识库的**唯一事实来源**是 `templates/knowledge/**` 下的 Markdown 源文件。主知识库精确包含 500 篇深度文章；`openfoam-source-files-v14` 中的 10,907 份逐文件源码卡只作为离线源码索引，不导入主知识库。

本快照由这些源文件经导入脚本生成：

```bash
# 只同步 500 篇深度文章到主知识库（推荐，不含逐文件源码卡）
npm run knowledge:sync:articles

# 校验（不写库）
npm run knowledge:sync:articles -- --dry-run
```

注意：`npm run knowledge:sync` 会把整个 `templates/knowledge` 目录树导入，**包含 10,907 份源码卡**，会把主知识库从 500 篇撑到 11,407 条。它适用于离线源码索引的单独构建，不要用来同步主知识库。

线上运行库位于 `data/cfdsolve.sqlite`（被 .gitignore 忽略，避免提交运行时变更）。
如需刷新本快照，可执行：

```bash
# 1) 只同步深度文章，避免源码卡进入主知识库
npm run knowledge:sync:articles

# 2) 导出一致性快照并清除个人 / 审计数据（VACUUM INTO 自带 VACUUM）
#    参见 scripts/check-database.mjs 与 docs/DATABASE.md
```

> 注意：不要把 `data/cfdsolve.sqlite`（含运行时 WAL）直接提交到公开仓库。
> 刷新快照前建议先做 `PRAGMA wal_checkpoint(TRUNCATE)`，避免陈旧 WAL 与快照文件不一致。
