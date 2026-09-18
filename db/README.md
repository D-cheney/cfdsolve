# 知识库数据库快照 (db/cfdsolve.sqlite)

本目录存放 cfdsolve.com 知识库的 SQLite 数据库**快照**，便于完整备份 / 迁移 / 复核。

## 内容

- `cfdsolve.sqlite` — 线上知识库数据库的一致性快照（`sqlite3 .backup` 生成，已 `VACUUM`）。
- 知识正文与分类全部保留：
  - `content_items` 122（其中 `article` 121、`algorithm` 1）
  - `categories` 41、`tags` 474、`content_tags` 661、`formulas` 5
  - `schema_migrations`、`system_settings`（站点配置）
- 为保护隐私，上传前已清空以下**个人 / 审计类**数据（表结构保留）：
  - `audit_logs`、`notifications`、`forum_posts`、`forum_topics`、`forum_sections`、`bookmarks`
  - `users.password_hash` 置空

## 数据来源与再生成

知识库的**唯一事实来源**是 `templates/knowledge/**` 下的 Markdown 源文件；
本快照由这些源文件经导入脚本生成：

```bash
# 从 templates/knowledge 重新导入到 SQLite
node scripts/import-knowledge.mjs templates/knowledge        # 需要 Node 22
```

线上运行库位于 `data/cfdsolve.sqlite`（被 .gitignore 忽略，避免提交运行时变更）。
如需刷新本快照，可执行：

```bash
sqlite3 data/cfdsolve.sqlite ".backup 'db/cfdsolve.sqlite'"
sqlite3 db/cfdsolve.sqlite "PRAGMA foreign_keys=OFF; \
  DELETE FROM audit_logs; DELETE FROM notifications; \
  DELETE FROM forum_posts; DELETE FROM forum_topics; DELETE FROM forum_sections; \
  DELETE FROM bookmarks; UPDATE users SET password_hash=''; VACUUM;"
```

> 注意：不要把 `data/cfdsolve.sqlite`（含运行时 WAL）直接提交到公开仓库。
