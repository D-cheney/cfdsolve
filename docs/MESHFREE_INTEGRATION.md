# 无网格法网站集成

## 入口与内容

- `/meshfree`：学习路径、模型版本说明、48 万粒子案例、八个独立播放器、模型资料下载。
- `/knowledge?collection=meshfree`：9 篇文章，支持分类、搜索和分页。
- `templates/knowledge/meshfree/`：6 篇原文适配文章及 3 篇方法/验证说明；沿用现有导入器和 KaTeX。
- `public/meshfree/`：原始文档副本、模型输入与代码、视频和封面、原始校核 JSON、文件清单和模型 ZIP。

## 资料来源与版本

项目根目录的《无网格法山体滑坡模拟技术方案》、`jilong_debrisflow_model` 下五份说明文档及模型文件为原始来源。集成过程只读取原件，生成网站副本；`sources/` 保持只读。学习文章中的外部理论参考链接已随正文标注。

八个视频来自原文指向的 `cloud_480k_90min/presentation` 完整成果目录；读取其相邻运行摘要，确认完成、480000 粒子、5400 秒与 237 个状态。保留原始 `quality_check.json` 和 `motion_quality_check.json`，网站文件清单另记每个发布文件的大小和 SHA-256。原机器的完整路径只保留在研究文档/脚本中供复现适配，不用于网站链接。

三种层次在页面上独立说明：固体 SPH 滑坡技术方案；1200 个一维动力粒子和 6000 个展示子粒子的历史模型；48 万个独立动力粒子的三维流体原型。没有把历史到达时间、六倍裹挟或未实现的土体破坏能力归入三维模型。

数值结果和历史数值校核来自已有运行，本次不重新执行 GPU 求解。质量守恒和有限值检查不等于现场物理确认或粒子收敛。视频全部本地托管、按需加载；没有把大量逐帧数组、检查点或云图缓存提交到 Git。

## 运行与发布

```powershell
npm ci
npm run knowledge:validate -- templates/knowledge/meshfree
npm run db:backup
npm run knowledge:import -- templates/knowledge/meshfree
npm run test:meshfree
npm run typecheck
npm run build
npm run start
```

首次新建数据库可先运行 `npm run db:init`；首次没有数据库时无需执行备份。全量 `npm run knowledge:sync` 同样包含新专题，`deploy:local` 已纳入专题测试。网站源码构建不会自动导入文章；部署时必须执行导入或全量同步。

原始资料更新时，在原件仍存在的项目根目录执行：

```powershell
node scripts/integrate-meshfree.mjs <已完成的presentation目录>
python scripts/package-meshfree.py
npm run knowledge:validate -- templates/knowledge/meshfree
npm run test:meshfree
```

导入脚本仅接受白名单文件类型，并检查预期算例的完成元数据；不递归复制原始成果目录。ZIP 使用固定时间戳和排序，可重复生成。3 篇手写学习文章及资料包说明不由导入脚本覆盖。未来换成其他粒子数或时长的案例，应同步修改元数据检查、页面描述、文章、测试与版本记录。

## 验证范围

`test:meshfree` 使用临时 SQLite 数据库检查实际知识 API 的集合隔离、搜索、分类、分页、重复导入，同时校验 9 篇文章、内部链接、公式渲染、52 个发布文件的 SHA-256 和八段视频对应的历史解码记录。测试数据库不接触用户数据库。

发布前还需通过全知识库校验、原知识导入测试、统一目录审计、类型检查与生产构建，并在浏览器中核查桌面/手机布局、知识列表与公式详情、模型下载及视频播放/互斥暂停。原研究资料不执行程序级重算。

### 2026-09-10 验证记录

- `knowledge:validate` 全量通过：11,016 篇；原知识导入测试、统一目录审计和 CAE 知识审计通过。
- `test:meshfree`、`typecheck` 和最终生产构建通过。
- `npm run test:meshfree-http -- http://127.0.0.1:4317` 通过：9 篇文章服务端渲染、分类列表/详情 API、缺失文章 404、52 个实际 HTTP 下载的字节哈希与视频 MIME 类型。
- 八段发布视频重新完整解码通过；浏览器中全部成功加载，验证了播放时间推进和其他播放器自动暂停。
- 1440 px 桌面、390 px 手机布局检查通过；手机单列、无页面水平溢出，公式详情可阅读，Wendland 搜索返回 2 篇相关内容，模型 ZIP 下载事件确认。
- 已对本地知识数据库备份后导入新文章。Git 暂存文件检查排除了密钥、环境文件、原始同步资料、数据库和缓存，并确认暂存区 52 个资料文件与清单哈希一致。

## 提交边界

只提交网站代码、知识内容、明确选取的发布资料与验证文档。采用普通 Git 推送，提交前重新获取远端分支；远端推进时先整合其修改，禁止强制覆盖。原始资料目录和 `AGENTS.md` 不纳入本次提交，数据库、备份、日志、`.env`、token 与密钥文件不纳入提交。
