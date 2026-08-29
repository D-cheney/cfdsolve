# Modelica Lite 仿真工作台

## 目的与边界

工作台借鉴 OMEdit 的源码编辑、变量浏览、消息面板、实验设置和结果曲线工作流，但当前部署不捆绑 OpenModelica 编译器。为保证离线可用和安全，浏览器只执行内置模板对应的数值方程，不执行任意 Modelica 代码、外部函数或系统命令。

## 已支持的流程

1. 新建或选择四类模板：`MassSpringDamper`、`ThermalNetwork`、`HydraulicCircuit`、`SingleSpool`。
2. 在编辑器中检查 `model`、`end`、括号、声明、符号和方程段。
3. 在检查器内覆盖参数，设置起止时间、输出间隔及 `RK4` / `Euler` 求解器。
4. 运行后保存时间序列、参数快照、摘要、消息和变量单位；结果页可选两条曲线并导出 CSV。

## 图形建模与后处理

- 编辑器提供“图形画布/源码”双模式。画布可添加、选择、拖拽、删除元件，创建物理连线；画布元件、坐标与连线随项目保存。
- 画布可将内置模板生成带元件注释的源码；也可恢复为与模板匹配的默认画布。当前不尝试把任意连接图自动编译成通用 Modelica 模型。
- 选中元件可以编辑标签和局部参数，并保存算法草稿。算法草稿可作为后续 `omc` 后端任务的输入审阅材料，当前不会在浏览器执行。
- 结果页可筛选时间窗、切换曲线/表格/统计，选择两条变量曲线，计算一次数值导数量，并导出原始 CSV。

## 持久化

- 无数据库时：项目和最近运行保存在浏览器 `localStorage`，网站仍可使用。
- 数据库可用时：`PUT /api/workspace` 会同步源码、实验配置与最近 12 个运行快照。
- 数据库迁移 v2 为 `modelica_projects` 增加 `metadata_json`，并为 `modelica_snapshots` 增加项目/创建时间索引。执行 `npm run db:init` 可自动应用。

## 开发与验证

```powershell
npm run test:modelica
npm run typecheck
npm run build
npm run db:init
npm run db:check
```

## 后续接入完整 OpenModelica

应通过后端受控作业队列调用已安装的 `omc`，将每次运行置于隔离目录并限制 CPU、内存、时长和可访问文件；前端仅轮询任务状态和读取经过筛选的 MAT/CSV 结果。不要在浏览器或 API 中直接执行用户提供的 Modelica、脚本或系统命令。
