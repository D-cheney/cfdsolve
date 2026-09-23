# Linux 计算服务部署与当前范围

生产构建 `npm run build` 同时生成网站入口 `.output/server/index.mjs` 和独立计算入口 `.output/server/worker-service.mjs`。两者必须由同一 Linux 用户运行，并使用相同的 `CFD_DATA_ROOT` 或 `CFD_ANALYSIS_JOB_DIR`。计算输入快照、任务状态和结果默认保存在 `$CFD_DATA_ROOT/.run/analysis-jobs`；请把 `$CFD_DATA_ROOT` 放在持久化磁盘并纳入备份。浏览器不访问这个目录。

部署时在 Linux 主机执行 `npm ci`、`npm run build`，确保安装的是 Linux 平台依赖。不要复制 Windows 的 `node_modules`。创建专用 `cfdsolve` 用户，以及仅该用户可写的 `/var/lib/cfdsolve`。示例 systemd 文件位于 `deploy/cfdsolve-solver.service.example` 和 `deploy/cfdsolve-web.service.example`；按实际 Node 路径、部署目录及端口调整，保存为 `/etc/systemd/system/cfdsolve-solver.service` 与 `/etc/systemd/system/cfdsolve-web.service`，再启动两项服务。网页的“Linux 内置计算服务”状态来自 Worker 心跳，在线时才能提交计算。

网站 API 只校验并把不可变请求快照写入队列。独立服务按队列领取任务，在单独线程执行原生二维求解；关闭网站页面不会停止任务。服务意外中断后，重启时将遗留的运行中任务标为失败并保留输入，需重新提交。停止任务可终止计算线程。正式生产应由 systemd 自动重启服务。

目前内置计算范围为规则映射方腔流动、二维线弹性三角形 FEM、沿 x 方向的薄通道单向/双向流固耦合。OpenFOAM、CalculiX、preCICE 尚未接入任务执行，页面如实显示“未安装”，即使主机上存在可执行文件也不宣称支持任意网格 CFD 或通用 FSI。网格生成仍使用现有 Python 服务，并未从网站 API 迁移到独立网格 Worker；完整规格中的服务端工程修订、独立结果处理、任意网格流体、动画与报告也仍待实现。请勿将本部署说明视为完整规格验收通过。

运行检查：访问 `/api/analysis/capabilities`，确认 `native.workerReady` 为 `true`；提交后在 `/api/analysis/jobs/<任务 ID>` 观察任务状态。停掉计算服务时，新提交会在界面阻止；执行中的任务如中断，服务恢复后显示失败并说明原因。备份与恢复时应同步保存任务目录和网站数据库，并在停写状态下复制。
