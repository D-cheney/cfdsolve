# 流研工坊 FlowLab 配置与运行手册

> 文档基线：当前工作区代码，更新日期 2026-08-04  
> 适用范围：本地开发、功能演示、单机 Node.js 部署

## 1. 系统概览

流研工坊是一个 Nuxt 3 全栈应用。浏览器端负责页面交互、CFD 教学计算、公式转换和 Modelica 演示；Nitro 服务端提供 SQLite 数据库访问和工作区持久化接口。

当前运行栈：

| 层级 | 技术 | 当前用途 |
|---|---|---|
| Web 框架 | Nuxt 3.21 | SSR、页面路由、Nitro API |
| 前端 | Vue 3.5、TypeScript | 页面、表单、图表与交互 |
| 状态管理 | Pinia 3 | 用户演示状态、任务、项目、收藏、通知 |
| 数据库 | Node.js `node:sqlite` | 单机 SQLite 持久化 |
| 公式排版 | KaTeX 0.16 | LaTeX 解析与预览 |
| 图标 | lucide-vue-next | 界面图标 |
| 构建目标 | Nitro `node-server` | Node.js 服务端部署 |

## 2. 环境要求

| 项目 | 最低要求 | 建议 |
|---|---:|---:|
| 操作系统 | Windows 10、Linux 或 macOS | Windows 11 / Linux LTS |
| Node.js | 22.5 | 24.x |
| npm | 随 Node.js 提供 | 最新兼容版本 |
| 内存 | 2 GB 可用 | 4 GB 以上 |
| 磁盘 | 500 MB | 2 GB 以上，另预留数据库与备份空间 |

SQLite 随 Node.js 运行，不需要单独安装 MySQL、Redis 或数据库客户端。

确认环境：

```powershell
node --version
npm --version
```

## 3. 项目位置与目录

项目根目录：

```text
D:\openclaw\software\cfdsolve
```

关键目录：

| 路径 | 用途 |
|---|---|
| `components/pages/` | 各业务页面组件 |
| `components/formulas/` | 公式修复与转换工作台 |
| `stores/` | Pinia 状态和数据库同步逻辑 |
| `server/api/` | Nitro API |
| `server/database/` | 数据库迁移结构与种子定义 |
| `server/utils/` | SQLite 连接、迁移和初始化 |
| `utils/` | 内容、CFD 求解逻辑与公式转换 |
| `data/` | 默认 SQLite 数据库 |
| `backups/` | 手工备份输出，默认不纳入版本控制 |
| `scripts/` | 数据库初始化、检查和备份脚本 |
| `docs/` | 配置、数据库和功能文档 |

## 4. 安装与首次初始化

在 PowerShell 中执行：

```powershell
cd D:\openclaw\software\cfdsolve
npm install
npm run db:init
npm run db:check
```

正确初始化时会显示数据库路径、Schema 版本、表数量、公式数量和工具数量。

`db:init` 可以重复执行。已经应用的迁移不会重复运行，采用唯一键的种子数据不会被重复插入。

## 5. 环境变量

项目提供 `.env.example`。按需复制为 `.env`：

```powershell
Copy-Item .env.example .env
```

当前业务环境变量：

| 变量 | 是否必需 | 默认值 | 说明 |
|---|---|---|---|
| `CFDSOLVE_DB_PATH` | 否 | `./data/cfdsolve.sqlite` | SQLite 文件位置；相对路径基于启动目录解析 |

常用 Nitro 运行变量：

| 变量 | 示例 | 说明 |
|---|---|---|
| `NITRO_PORT` | `3000` | 生产服务监听端口 |
| `NITRO_HOST` | `127.0.0.1` | 监听地址；局域网部署可设为 `0.0.0.0` |

PowerShell 临时配置示例：

```powershell
$env:CFDSOLVE_DB_PATH='D:\flowlab-data\production.sqlite'
$env:NITRO_PORT='3000'
$env:NITRO_HOST='127.0.0.1'
node .output/server/index.mjs
```

注意：生产数据库不要放在 `.output` 内，因为重新构建可能替换该目录。

## 6. 开发运行

```powershell
cd D:\openclaw\software\cfdsolve
npm run dev
```

默认地址通常为：

```text
http://localhost:3000
```

如需允许局域网访问：

```powershell
npm run dev -- --host 0.0.0.0
```

仅在可信网络中开放开发服务器。

## 7. 生产构建与运行

```powershell
npm run typecheck
npm run test:formula
npm run db:check
npm run build
node .output/server/index.mjs
```

生产服务启动前应确保：

1. `CFDSOLVE_DB_PATH` 指向持久化磁盘；
2. 运行账户对数据库目录拥有读写权限；
3. 数据库目录和备份目录不对外提供静态访问；
4. 反向代理负责 HTTPS、请求大小限制和访问日志；
5. 已明确当前固定演示用户模式不能作为公开多人认证使用。

## 8. npm 命令

| 命令 | 用途 | 是否修改数据 |
|---|---|---|
| `npm run dev` | 启动开发服务器 | 首次访问 API 时可能初始化数据库 |
| `npm run build` | 构建生产版本 | 否 |
| `npm run preview` | 预览 Nuxt 构建 | 可能访问数据库 |
| `npm run typecheck` | TypeScript/Nuxt 类型检查 | 否 |
| `npm run test:formula` | 运行公式转换测试 | 否 |
| `npm run test:knowledge` | 运行知识模板解析、校验和 HTML 清理测试 | 否 |
| `npm run db:init` | 创建数据库、执行迁移、写入种子数据 | 是，可重复执行 |
| `npm run db:check` | 完整性、外键、表、种子和索引检查 | 只读；可能先初始化空库 |
| `npm run db:backup` | 复制数据库到 `backups/` | 新增备份文件 |
| `npm run knowledge:validate -- <文件或目录>` | 只校验知识模板，不写入数据库 | 否 |
| `npm run knowledge:import -- <文件或目录>` | 导入或更新知识文章 | 是，事务写入并记录审计 |
| `npm run generate` | 生成静态输出 | 不建议用于依赖 API 的完整运行模式 |

## 9. 数据库配置

默认数据库：

```text
D:\openclaw\software\cfdsolve\data\cfdsolve.sqlite
```

连接初始化会执行：

- `journal_mode = WAL`；
- `foreign_keys = ON`；
- `busy_timeout = 5000`；
- 未应用迁移；
- 可重复种子初始化；
- `PRAGMA optimize`。

数据库当前包含 25 张业务及迁移表，Schema 版本为 1。详细表结构和迁移规则见 `docs/DATABASE.md`。

### 9.1 健康检查

服务启动后访问：

```text
GET /api/health/database
```

正常响应包含：

```json
{
  "ok": true,
  "engine": "SQLite",
  "sqliteVersion": "3.x",
  "schemaVersion": 1,
  "path": ".../data/cfdsolve.sqlite",
  "counts": {
    "users": 1,
    "formulas": 5,
    "tools": 4,
    "projects": 1
  }
}
```

不要在公开生产环境直接返回数据库绝对路径。正式部署时应删除或脱敏 `path` 字段，并限制健康接口访问范围。

### 9.2 备份

```powershell
npm run db:backup
```

备份写入：

```text
backups/cfdsolve-<ISO时间>.sqlite
```

推荐策略：

- 单机演示：每次升级前手动备份；
- 日常运行：每日备份，保留 7～30 天；
- 重要部署：备份同步到另一磁盘，并定期执行恢复演练；
- 复制数据库前使用现有备份脚本，使应用连接先正常关闭。

### 9.3 迁移规则

迁移定义位于 `server/database/schema.ts`。

新增迁移时：

1. 在 `databaseMigrations` 末尾增加更高的 `version`；
2. 每个数组元素只放一个 SQL 语句；
3. 不修改已经发布并执行过的历史迁移；
4. 为实际查询条件增加索引；
5. 先备份，再在旧版本数据库副本上测试升级；
6. 运行 `npm run db:check` 和 `npm run build`。

## 10. 业务配置项

以下默认项已写入 `system_settings` 表：

| 配置键 | 默认值 | 计划用途 | 当前执行状态 |
|---|---:|---|---|
| `site.registration_enabled` | `true` | 是否开放注册 | 已存储，尚未用于拦截注册 |
| `site.content_review_enabled` | `true` | 内容审核开关 | 已存储，管理流程为演示 |
| `simulation.daily_task_limit` | `20` | 每日任务配额 | 已存储，尚未服务端限流 |
| `simulation.concurrent_task_limit` | `2` | 并发任务限制 | 已存储，浏览器求解未使用队列 |
| `simulation.result_retention_days` | `90` | 结果保留周期 | 已存储，尚无自动清理任务 |
| `modelica.compiler_default_version` | `1.0.0` | 默认编译器版本 | 页面展示使用 |
| `modelica.language_profile` | `PlatformModelica-1.0` | 语言子集 | 页面展示使用 |
| `modelica.project_limit` | `20` | 每用户活动项目数 | 已存储，尚未服务端限制 |
| `modelica.compile_timeout_seconds` | `120` | 编译超时 | 已存储，演示检查器未使用 |
| `modelica.simulation_timeout_seconds` | `300` | 仿真超时 | 已存储，演示响应未使用 |
| `modelica.max_flat_equations` | `50000` | 扁平方程上限 | 预留 |
| `modelica.max_result_mb` | `200` | 单次结果上限 | 预留 |
| `forum.new_user_post_cooldown_hours` | `1` | 新用户发帖冷却 | 预留 |
| `forum.report_sla_hours` | `24` | 举报处理 SLA | 页面展示使用 |

配置项目前没有管理 API。直接修改数据库只适用于开发调试；正式管理功能应增加鉴权、输入校验和审计接口。

## 11. 浏览器本地存储

即使 SQLite 不可用，网站仍会保存一份降级数据：

| Key | 内容 | 权威性 |
|---|---|---|
| `flowlab-state-v1` | 演示登录状态、收藏、通知、任务、Modelica 项目、最近搜索 | 数据库可用时为缓存；不可用时为临时数据源 |
| `flowlab-formula-history-v1` | 最近 20 条公式转换记录 | 仅本机浏览器保存，不上传数据库 |

不要依赖 `localStorage` 保存敏感凭据、正式用户密码或重要生产结果。

## 12. API 配置

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/health/database` | 数据库健康与计数 |
| `GET` | `/api/formulas` | 已发布公式；支持 `q` 查询参数 |
| `GET` | `/api/knowledge` | 已发布知识文章列表；支持 `q`、`category`、`limit`、`offset` |
| `GET` | `/api/knowledge/:slug` | 单篇知识文章和安全渲染后的正文 |
| `GET` | `/api/workspace` | 加载固定演示用户的收藏、通知、任务和项目 |
| `PUT` | `/api/workspace` | 事务性同步工作区并写入审计日志 |

当前 API 没有正式会话鉴权，只适用于本地和受信任的单用户部署。不要直接暴露到公网。

## 13. 安全配置基线

当前版本上线到公网前必须完成：

- 密码使用 Argon2id 或同等级算法哈希，禁止明文保存；
- 实现服务端会话、CSRF 防护、登录限流和邮箱验证；
- 所有工作区查询按会话用户隔离，不再使用固定 `user-demo`；
- 管理路由和管理 API实施 RBAC；
- 健康接口脱敏数据库路径；
- 论坛、内容和项目输入执行服务端校验与长度限制；
- 配置 HTTPS、安全响应头、日志脱敏和备份访问权限；
- 将大型仿真结果移到对象存储；
- 将计算任务移到隔离 Worker，不在 Web 请求中执行不可信代码。

## 14. 常见故障

### 14.1 数据库无法创建

检查：

```powershell
Test-Path .\data
npm run db:init
```

确认运行账户对数据库父目录有创建和写入权限。也可以把 `CFDSOLVE_DB_PATH` 指向确定可写的绝对路径。

### 14.2 数据库被占用

先确认没有多个开发或生产进程同时操作同一个单机数据库。停止不需要的实例后运行：

```powershell
npm run db:check
```

不要手工删除 `.sqlite-wal` 或 `.sqlite-shm` 文件来“解锁”数据库。

### 14.3 页面显示浏览器降级模式

依次检查：

1. `GET /api/health/database` 是否返回 200；
2. `CFDSOLVE_DB_PATH` 是否正确；
3. 数据库目录是否可写；
4. 终端中是否有迁移或 SQL 错误；
5. `npm run db:check` 是否通过。

### 14.4 公式页没有数据库内容

```powershell
npm run db:init
npm run db:check
```

公式接口失败时页面会使用 `utils/content.ts` 中的静态公式作为回退，因此页面仍可打开。

### 14.5 构建失败

```powershell
npm install
npm run typecheck
npm run build
```

确认 Node.js 版本满足要求，且没有把 `.output` 当作源码目录手工修改。

## 15. 发布前检查清单

- [ ] Node.js 版本符合要求；
- [ ] `.env` 已配置且未公开；
- [ ] 数据库路径位于持久化磁盘；
- [ ] 已执行 `npm run db:backup`；
- [ ] `npm run db:check` 通过；
- [ ] `npm run typecheck` 通过；
- [ ] `npm run test:formula` 通过；
- [ ] `npm run test:knowledge` 通过；
- [ ] `npm run build` 通过；
- [ ] `/api/health/database` 返回正常；
- [ ] 已理解当前版本是固定演示用户模式；
- [ ] 若公开部署，已完成第 13 节安全改造。
