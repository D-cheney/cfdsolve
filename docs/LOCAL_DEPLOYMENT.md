# 流研工坊本地全量部署

本文适用于 Windows PowerShell。本项目使用随 Node.js 运行的 SQLite，不需要另外安装 MySQL、PostgreSQL 或 Redis。

## 一、环境要求

- Windows 10/11
- Node.js 22.5 或更高版本，推荐 Node.js 24
- npm（随 Node.js 安装）
- 项目目录：`D:\openclaw\software\cfdsolve`

检查环境：

```powershell
node --version
npm --version
```

## 二、一键全量部署

打开 PowerShell，执行：

```powershell
cd D:\openclaw\software\cfdsolve
npm run deploy:local
```

该命令会依次完成：停止旧实例、创建 `.env`、安装锁定版本依赖、备份现有数据库、执行数据库迁移与完整性检查、审计生产依赖、运行类型检查和测试、构建生产版本、启动服务并检查数据库接口。

部署成功后访问：

```text
http://127.0.0.1:3000/
```

## 三、日常管理命令

```powershell
# 查看状态
npm run local:status

# 停止网站
npm run local:stop

# 启动已经构建好的网站
npm run local:start

# 重新执行完整部署
npm run deploy:local
```

服务日志位于 `logs/server.out.log` 和 `logs/server.err.log`。数据库默认位于 `data/cfdsolve.sqlite`，部署前的自动备份位于 `backups/`。

## 四、配置

首次部署会自动从 `.env.example` 创建 `.env`：

```dotenv
CFDSOLVE_DB_PATH=./data/cfdsolve.sqlite
NITRO_HOST=127.0.0.1
NITRO_PORT=3000
```

- 仅本机访问：保持 `NITRO_HOST=127.0.0.1`。
- 允许同一局域网内其他设备访问：改为 `NITRO_HOST=0.0.0.0`，并在 Windows 防火墙中仅对可信专用网络开放所用端口。
- 修改 `.env` 后执行 `npm run local:stop`，再执行 `npm run local:start`。

临时换端口部署：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1 -Port 3100
```

## 五、知识库内容导入

校验模板文章，不写数据库：

```powershell
npm run knowledge:validate -- templates\knowledge\examples
```

导入文章到 SQLite：

```powershell
npm run knowledge:import -- templates\knowledge\examples
```

## 六、部署问题排查

```powershell
npm run local:status
npm run db:check
Get-Content -Tail 100 .\logs\server.err.log
```

如果 3000 端口被其他程序占用，可查找占用进程：

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000 |
  Select-Object LocalAddress, LocalPort, OwningProcess
```

本版本适合本机或可信局域网内的单用户使用。当前登录态是演示模式，尚未实现面向公网的正式身份认证、会话隔离和安全加固，因此不要直接暴露到公网。
