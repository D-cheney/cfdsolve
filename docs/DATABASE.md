# 数据库运行说明

## 方案

当前可运行版本使用 Node.js 内置 SQLite，数据库文件默认保存为 `data/cfdsolve.sqlite`。它不需要另行安装 MySQL 服务，适合本地开发、演示和单机部署，同时保留了迁移、索引、外键、审计和备份能力。

数据库包含 25 张业务及迁移表，覆盖：

- 用户、角色、权限与用户角色关系；
- 知识文章、算法、分类、标签和公式；
- 论坛板块、主题和回复；
- CFD 工具、工具版本和仿真任务；
- Modelica 项目、源码文件与快照；
- 收藏、通知、公式转换记录、系统设置和审计日志。

## 初始化

要求 Node.js 22.5 或更高版本。

```powershell
cd D:\openclaw\software\cfdsolve
npm install
npm run db:init
npm run db:check
npm run dev
```

初始化命令可以重复执行，不会重复插入角色、工具、公式或演示项目。网站启动后第一次访问数据库接口时也会自动执行未应用的迁移。

## 数据库位置

默认位置：

```text
D:\openclaw\software\cfdsolve\data\cfdsolve.sqlite
```

可以通过环境变量更改：

```powershell
$env:CFDSOLVE_DB_PATH='D:\data\cfdsolve-production.sqlite'
npm run dev
```

开发环境变量示例保存在 `.env.example`。

## 迁移与种子数据

- 表结构与索引：`server/database/schema.ts`
- 迁移执行和种子数据：`server/utils/database.ts`
- 手动初始化：`scripts/init-database.mjs`
- 完整性检查：`scripts/check-database.mjs`

新增字段或表时，在 `databaseMigrations` 数组末尾增加更高版本号的迁移，不要修改已经执行过的迁移。迁移记录保存在 `schema_migrations` 表。

## 备份

执行：

```powershell
npm run db:backup
```

备份文件写入 `backups/`。生产环境还应在应用外配置定时备份，并定期验证备份文件可以打开和通过 `PRAGMA integrity_check`。

## API

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/health/database` | 检查 SQLite、迁移版本和数据量 |
| GET | `/api/formulas` | 查询已发布公式，支持 `?q=` 搜索 |
| GET | `/api/knowledge` | 查询已发布知识文章，支持搜索、分类和分页 |
| GET | `/api/knowledge/:slug` | 读取文章元数据、目录和安全 HTML 正文 |
| GET | `/api/workspace` | 读取演示用户的任务、项目、收藏与通知 |
| PUT | `/api/workspace` | 事务性保存工作区，并写入审计日志 |

当前版本使用固定演示用户连接数据库，适合本地完整功能演示。公开部署前应增加正式密码哈希、会话、邮箱验证和基于用户身份的数据隔离；数据库结构已经预留相关字段与权限关系。

## 知识文章导入

模板位于 `templates/knowledge/KNOWLEDGE_ARTICLE.template.md`，格式说明位于 `templates/knowledge/FORMAT.md`。

```powershell
npm run knowledge:validate -- templates\knowledge\my-article.md
npm run knowledge:import -- templates\knowledge\my-article.md
```

导入程序位于 `server/services/knowledge-importer.ts`，负责校验、Markdown 渲染、HTML 白名单清理、分类和标签关联、文章 Upsert、事务回滚及审计记录。命令行入口为 `scripts/import-knowledge.mjs`。

## MySQL 生产迁移

设计大纲的完整生产架构建议使用 MySQL、Redis 和对象存储。当前 SQLite 模型可作为单机版本和后续 MySQL 迁移基线。迁移到多人生产环境时，应保持表的业务含义，同时替换数据库访问层、引入任务队列，并将大型结果文件放入对象存储，不要把二进制结果直接写入关系数据库。
