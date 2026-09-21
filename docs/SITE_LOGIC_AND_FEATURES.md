# CFD菜鸟 网站逻辑与功能总结

> 依据当前代码形成，更新日期 2026-09-21。
> 本文描述“现在实际运行的逻辑”，不等同于《CFD 网站设计大纲》中规划的全部生产功能。

## 1. 产品定位

当前网站是一个 CFD 与 Modelica 工程学习和仿真平台原型，形成了以下主要入口：

1. CFD/数值方法知识库；
2. 算法和工程公式速查；
3. 乱码公式修复与多格式转换；
4. 四个浏览器端 CFD 教学工具；
5. Modelica 项目、画布、源码检查、受控模板仿真与后处理；
6. 工程社区内容展示与页面内回复；
7. 无账号本地使用；
8. SQLite 数据库存储与浏览器降级缓存。

## 2. 当前实现等级

本文使用三个等级描述功能：

| 等级 | 含义 |
|---|---|
| 可用 | 逻辑真实执行，并能形成可验证结果或持久化数据 |
| 演示 | 可以交互和展示流程，但算法或身份链路是简化实现 |
| 占位 | 已有界面或入口，后端业务尚未实现 |

总体状态：

| 模块 | 等级 | 说明 |
|---|---|---|
| 页面导航与响应式界面 | 可用 | Nuxt 路由分发，桌面和移动导航可用 |
| 知识库 | 可用/混合 | 数据库导入文章可读取和展示，历史演示文章继续作为静态回退 |
| 算法与全站搜索 | 演示 | 搜索和筛选可用，算法和顶部快速搜索主要来自静态种子数组 |
| 公式库 | 可用 | 优先读取 SQLite，失败后使用静态回退 |
| 公式乱码转换 | 可用 | 本地执行编码修复、格式识别、预览和复制 |
| 四个 CFD 工具 | 可用/教学 | 真实执行当前 TypeScript 数学逻辑，不是通用工业 CFD 求解器 |
| CFD 任务记录 | 可用 | 结果保存到 SQLite；失败时保存到浏览器 |
| Modelica 项目编辑 | 可用 | 项目和源码可保存 |
| Modelica 编译 | 演示/受控 | 使用结构、参数和方程签名检查，不是完整 Modelica 编译器 |
| Modelica 动态仿真 | 可用/受限 | 四个内置模板使用 Euler/RK4 积分；方程签名被修改、参数越界或结果非有限时拒绝成功，不调用 SUNDIALS |
| 社区浏览 | 演示 | 内容来自静态数据；新增回复仅存在当前页面内存 |
| 账号体系 | 已取消 | 不提供登录、注册、个人中心、通知和管理后台入口 |
| SQLite 数据层 | 可用 | 迁移、种子、索引、事务、审计和备份均可执行 |

## 3. 总体架构

```mermaid
flowchart TD
  B["浏览器"] --> N["Nuxt 页面与组件"]
  N --> P["Pinia 工作区状态"]
  N --> L["浏览器本地计算"]
  L --> C["CFD 教学求解器"]
  L --> F["公式修复与 KaTeX 预览"]
  L --> M["Modelica 方程签名检查与受控模板积分"]
  P --> LS["localStorage 降级缓存"]
  P --> API["Nitro /api/workspace"]
  N --> FA["Nitro /api/formulas"]
  API --> DB["SQLite"]
  FA --> DB
  DB --> SEED["迁移、种子、索引与审计"]
```

核心设计特点：

- 页面使用单个 catch-all Nuxt 路由，再由 `PageRouter.vue` 分发业务组件；
- CFD、公式转换和 Modelica Lite 数值积分在浏览器运行；方腔求解由 Web Worker 执行；
- Pinia 负责跨页面工作区状态；
- SQLite 是任务、项目、收藏和通知的持久化主路径；
- `localStorage` 是数据库异常时的降级缓存；
- 公式历史因隐私设计仍只保存在当前浏览器。

## 4. 页面路由逻辑

Nuxt 文件路由入口：

- `/` 使用 `pages/index.vue`；
- 其他路径由 `pages/[...slug].vue` 接收；
- `components/PageRouter.vue` 按显式入口和受控子路径选择页面组件；
- 未匹配页面、工具、文章和主题显示自定义 404，并在服务端可判定时返回 HTTP 404。

### 4.1 路由分发

| 路径 | 页面组件 | 功能 |
|---|---|---|
| `/` | `HomePage` | 首页、模块入口、公式和工具推荐 |
| `/knowledge*` | `LibraryPage` | 知识列表和文章详情 |
| `/algorithms` | `LibraryPage` | 算法筛选与对比 |
| `/formulas` | `LibraryPage` | 数据库公式列表 |
| `/formulas/convert` | `FormulaConverter` | 乱码公式修复与转换 |
| `/search` | `LibraryPage` | 聚合搜索结果 |
| `/simulation*` | `SimulationPage` | CFD 工具、运行和结果 |
| `/simulation/lab` | `SimulationLabPage` | 参数扫描、工况对比和可信度清单 |
| `/modelica*` | `ModelicaPage` | Modelica 工作台 |
| `/forum*` | `CommunityPage` | 社区列表和帖子详情 |
| `/terms`、`/privacy`、`/disclaimer` | `LegalPage` | 本地条款、隐私和仿真边界说明 |

### 4.2 主要子路由

| 路径模式 | 逻辑 |
|---|---|
| `/knowledge/:slug` | 根据静态文章 `slug` 显示文章详情 |
| `/simulation/:toolSlug` | 打开对应 CFD 参数工作台 |
| `/simulation/lab` | 打开参数扫描与工况对比实验室 |
| `/simulation/tasks/:taskId` | 从 Pinia/数据库状态中查找并展示结果 |
| `/modelica/projects` | 项目列表 |
| `/modelica/projects/:id/editor` | Modelica 源码编辑器 |
| `/modelica/runs/:id` | 受控模板积分结果和后处理 |
| `/modelica/libraries` | 组件库列表 |
| `/modelica/templates` | 项目模板列表 |
| `/forum/posts/:id` | 社区帖子和回复 |

## 5. 全局页面框架

### 5.1 顶部导航

`AppHeader.vue` 实现：

- 品牌首页入口；
- 知识库、算法与公式、CFD 仿真、Modelica、社区主导航；
- 桌面和移动端导航；
- `Ctrl/Cmd + K` 打开全站搜索；
- `Esc` 关闭搜索或抽屉；
- `↑`/`↓` 选择快速搜索结果，`Enter` 打开选择项或完整搜索；
- 跳到主要内容的无障碍链接。

### 5.2 全站搜索

当前搜索数据来自 `utils/content.ts` 中的：

- 文章；
- 算法；
- 静态公式；
- CFD 工具；
- 论坛主题。

输入后在前端进行标题包含匹配，最多显示 7 条快速结果。可用上下键选中结果；未选中时按 Enter 进入 `/search?q=` 聚合页。最近搜索保存在 `flowlab-state-v1`。

当前限制：全站搜索没有查询 SQLite 全文索引，数据库中新增加的非公式内容不会自动进入顶部快速搜索。

## 6. 首页逻辑

首页聚合展示：

- 产品主张和 CFD 仿真/知识库入口；
- CFD 流场与 Modelica 拓扑的 CSS 示意；
- 知识文章卡片；
- 算法摘要；
- 四个仿真工具；
- 公式快速复制和“乱码转换”入口；
- Modelica 与社区入口。

首页内容当前来自 `utils/content.ts`，不是由数据库运营位动态配置。

## 7. 知识库、算法和公式库

### 7.1 知识库

功能：

- 分类过滤；
- 标题、摘要和标签搜索；
- 文章详情、章节侧栏、页内目录；
- 公式/代码示例；
- 行内与独立 LaTeX 公式的 KaTeX + MathML 安全渲染；
- 收藏切换；
- 相关文章与工具入口。

数据来源采用混合模式：

1. 页面请求 `GET /api/knowledge`；
2. 数据库文章按 `slug` 与 `utils/content.ts` 中的历史演示文章合并；
3. 数据库记录优先覆盖同 slug 元数据；
4. 新导入文章直接加入列表；
5. 带有 `body_html` 的文章详情使用服务端清理后的 HTML；
6. 旧演示文章没有数据库正文时继续显示原页面正文。

知识文章以 YAML Front Matter + Markdown 文件维护。当前统一源目录包含 11,247 篇可导入文章，其中网站主库使用 340 篇按主题合并的深度文章，另有 10,907 份逐文件源码卡作为离线索引。公式在导入阶段进行 KaTeX 语法校验，服务端生成 HTML/MathML 后再执行白名单清理。大规模列表使用服务端搜索、集合/分类过滤和分页，不再一次向浏览器发送全部正文或全部元数据。模板、校验和导入流程见 `templates/knowledge/FORMAT.md`。

### 7.2 算法页

展示 SIMPLE、PISO、Rhie–Chow、QUICK、GMRES 等条目的适用场景、阶数、稳定性、成本和限制。

当前属于静态对比内容，不执行算法求解。

### 7.3 公式库

加载流程：

1. `LibraryPage` 服务端/客户端请求 `GET /api/formulas`；
2. API 查询 `formulas` 和 `categories` 表；
3. 只返回 `PUBLISHED` 状态条目；
4. 按分类顺序和名称排序；
5. API 失败或无数据时使用 `utils/content.ts` 的静态公式；
6. 用户可以搜索、收藏，并复制 LaTeX 或纯文本。

## 8. 公式乱码修复与转换

入口：`/formulas/convert`。

### 8.1 输入支持

- 常见 UTF-8 被 Windows/Latin-1 错误解码的乱码；
- HTML 实体；
- Unicode 数学符号；
- UnicodeMath；
- LaTeX；
- Presentation MathML；
- 从剪贴板 HTML 中提取的 `<math>` 内容。

### 8.2 转换流程

```mermaid
flowchart LR
  I["粘贴输入"] --> E["HTML 实体解码"]
  E --> N["Unicode NFC 与字符清理"]
  N --> R["乱码逆解码候选"]
  R --> S["异常字符评分"]
  S --> D["格式识别"]
  D --> X["统一转换为 LaTeX"]
  X --> K["KaTeX 解析和预览"]
  X --> U["UnicodeMath / 纯文本"]
  K --> M["MathML"]
  U --> C["复制到 Word/WPS 或其他文档"]
  M --> C
```

### 8.3 输出

- Word/WPS 使用的 UnicodeMath 文本；
- LaTeX；
- MathML；
- Unicode 纯文本；
- KaTeX 可视预览；
- 多 MIME 剪贴板写入，失败时回退纯文本复制。

### 8.4 检查与限制

- 检查圆括号、方括号和花括号数量；
- 检测不可恢复字符 `�`；
- 显示候选、评分和置信度；
- 不尝试伪造已经完全丢失的原始字符；
- 当前不支持图片公式 OCR；
- MathML 只覆盖转换器中定义的常见 Presentation MathML 元素；
- 转换结果用于辅助整理，工程公式仍需人工核对。

公式转换历史最多保留 20 条，保存在 `flowlab-formula-history-v1`，不会写入 SQLite。

## 9. CFD 仿真模块

### 9.1 公共运行流程

```mermaid
sequenceDiagram
  participant U as 用户
  participant P as 参数工作台
  participant S as 浏览器求解逻辑
  participant Store as Pinia
  participant API as 工作区 API
  participant DB as SQLite
  U->>P: 选择工具并填写参数
  P->>S: solveTool(slug, params)
  P->>Store: addTask(RUNNING)
  S-->>P: 数值结果、摘要、警告
  P->>Store: finishTask(SUCCEEDED)
  Store->>API: PUT /api/workspace
  API->>DB: 事务 Upsert 任务并写审计
  P-->>U: 在当前工作台展示结果
```

页面提供：

- 工具列表与参数范围、单位和物理含义提示；
- 默认参数恢复；
- 分阶段进度动画；
- 模型方程、边界条件、计算域和输出定义；
- 在同页结果页签中展示物理场/剖面、曲线、摘要和可信度；
- 完整任务报告、数据表和求解日志；
- 参数快照；
- JSON 清单和 CSV 数据下载；
- 警告信息。

### 9.2 四个工具

| 工具 | 路由 | 当前计算逻辑 | 主要输出 | 适用限制 |
|---|---|---|---|---|
| 一维对流—扩散 | `/simulation/convection-diffusion` | 结构化一维有限体积三对角求解，支持迎风/中心格式并与解析解比较 | Péclet 数、L2/L∞ 误差、有界性、数值/参考曲线 | 教学求解器，不是通用多维 FVM |
| 方腔顶盖驱动流 | `/simulation/lid-driven-cavity` | 二维涡量—流函数显式迭代，按 x/y 网格、Re、容差和迭代上限求解 | 速度模值场、速度矢量、残差历史、迭代次数、主涡中心 | 教学求解器；浏览器计算上限为 65×65、5000 步 |
| 圆管充分发展层流 | `/simulation/pipe-flow` | Hagen–Poiseuille 解析关系 | Re、速度剖面、流量、压降、壁面剪切、入口段长度与摩阻系数 | Re≥2300 时提示层流假设失效，入口段超过管长时提示未充分发展 |
| 湍流与近壁参数 | `/simulation/turbulence-compare` | 工程关联式计算 k、ε、ω、摩擦速度和首层高度 | Re、摩擦速度、湍流量、首层高度与边界层网格累计高度 | 只用于预估，不能替代网格和模型验证 |

### 9.3 参数扫描与可信度检查

`/simulation/lab` 在四个现有求解器之上提供单变量线性/对数扫描、批量运行、趋势图、逐工况详情、取消、历史回看以及 CSV/JSON 导出。每个成功工况按输入、收敛、模型适用性、参考解和可复现性生成 A–D 可信度提示。方腔批量计算在 Web Worker 中运行；详细设计与边界见 `docs/SIMULATION_EXPERIMENT_LAB.md`。

### 9.4 任务状态

类型定义支持：

- `QUEUED`；
- `RUNNING`；
- `SUCCEEDED`；
- `FAILED`；
- `CANCELLED`。

页面先产生 `RUNNING`，并记录实际浏览器耗时；求解器收敛后写入 `SUCCEEDED`，未收敛或数值失败写入 `FAILED`，同时保留警告和可检查结果。

## 10. Modelica 模块

### 10.1 页面能力

- Modelica 产品介绍和能力边界；
- 项目列表；
- 从模板创建项目；
- 画布元件、连线、元件算法草稿与源码编辑；
- 画布、源码声明和实验参数的同名参数同步；
- 脏状态提示和保存；
- 项目文件树和模型大纲；
- 基础语法/结构诊断；
- 编译输出摘要；
- 组件库和四个受控模板展示；
- Euler/RK4 实验、变量筛选、派生导数量、统计和 CSV 导出。

### 10.2 项目持久化

创建或保存项目时：

1. Pinia 更新 `projects`；
2. 立即写入浏览器缓存；
3. 180 ms 防抖后调用 `PUT /api/workspace`；
4. API Upsert `modelica_projects`；
5. 主 `.mo` 文件 Upsert 到 `modelica_files`；
6. 只有源码内容实际变化时修订号才加 1；
7. 同步动作写入 `audit_logs`。

### 10.3 当前诊断规则

检查器当前检测：

- 是否存在顶层 `model` 声明；
- 是否存在匹配形式的 `end <name>;`；
- 圆括号数量是否一致；
- `Real` 声明是否可能缺少分号；
- 粗略统计参数、Real 变量和等式数量。

诊断码：

| 代码 | 含义 |
|---|---|
| `MO1001` | 缺少顶层 model 声明 |
| `MO1002` | 缺少匹配的 end 语句 |
| `MO1003` | 圆括号不匹配 |
| `MO1004` | 方程签名与受支持模板不一致 |
| `MO2001` | 声明可能缺少分号 |
| `MO9005` | 参数、导数、状态或派生量出现非有限值/数值发散 |

### 10.4 重要边界

当前检查器和运行时属于受控 Modelica Lite 子集：

- 没有完整词法、语法、AST、名称解析或类型系统；
- 没有实例化、连接展开、方程平衡、BLT 或 DAE 分析；
- 没有代码生成、原生编译或制品缓存；
- 没有真正接入 IDA、CVODE、KINSOL 或 KLU；
- 只执行质量—弹簧—阻尼、双容腔热网络、液压容腔和单轴转子四个已校验方程签名；
- 使用固定步长 Euler/RK4 并逐步检查非有限值，不执行任意用户算法脚本；
- 组件目录仍是本地静态清单。

因此它可用于这四类模板的受控实验、教学和工作流验证，不能声称为完整 Modelica 编译仿真平台；修改受支持方程会明确失败，而不会静默运行硬编码模型。

## 11. 社区模块

已实现：

- 板块和主题列表展示；
- 状态、浏览量和回复数展示；
- 帖子详情；
- 采纳答案样式；
- 页面内添加回复；
- 相关主题和社区规则展示。

当前限制：

- 主题和初始回复来自静态内容；
- 页面内新增回复只保存在 Vue 内存，刷新即丢失；
- 发布主题、点赞、举报和回复在当前页面会话内有明确反馈，但没有数据库写入；
- 数据库已有论坛表和种子主题，但页面尚未接入论坛 API；
- 社区写入没有服务端权限校验、频率限制、内容审核或通知链路。

## 12. 无账号模式

网站不提供登录、注册、退出、个人中心、通知和管理后台页面。社区主题与回复在当前页面会话内直接使用本地访客身份；CFD 任务、Modelica 项目、收藏和最近搜索继续保存在本机工作区。

## 13. Pinia 状态逻辑

`stores/platform.ts` 是主要前端状态中心。

### 13.1 状态字段

| 字段 | 用途 |
|---|---|
| `ready` | 是否完成本地初始化 |
| `databaseConnected` | 最近一次数据库读写是否成功 |
| `databaseError` | 最近数据库错误消息 |
| `bookmarks` | 收藏资源键 |
| `notifications` | 通知及已读状态 |
| `tasks` | CFD 任务、输入和结果 |
| `projects` | Modelica 项目和源码 |
| `recentSearches` | 最近搜索词 |

派生状态：

- `unread`：未读通知数量；
- `activeTasks`：`RUNNING` 或 `QUEUED` 任务数量。

### 13.2 初始化顺序

```mermaid
flowchart TD
  A["AppHeader onMounted"] --> B["store.init()"]
  B --> C["读取 flowlab-state-v1"]
  C --> D["没有项目时创建演示项目"]
  D --> E["GET /api/workspace"]
  E -->|成功| F["按 ID、时间与终态合并本地和数据库任务/项目"]
  E -->|失败| G["保留浏览器数据并标记降级"]
  F --> H["更新浏览器缓存"]
  G --> H
```

收藏取并集，通知保留本地已读状态；浏览器存储不可用时仍继续访问 SQLite。

### 13.3 持久化顺序

每次收藏、任务、项目或通知变化时：

1. 同步写入 `localStorage`；
2. 重置 180 ms 同步计时器；
3. `PUT /api/workspace`，仅发送本次变化的资源分区；
4. 成功后设置 `databaseConnected = true`；
5. 失败后保留浏览器副本并设置错误状态。

这一设计保证基础功能不会因数据库短暂异常立即丢失，并避免一次收藏操作重写任务或 Modelica 源码。当前合并仍是单机启发式策略；多人或多设备模式需要引入实体 revision、服务端所有权和冲突处理。

## 14. 服务端 API 逻辑

### 14.1 `GET /api/health/database`

返回 SQLite 版本、Schema 版本和核心表计数，不暴露数据库绝对路径。

### 14.2 `GET /api/formulas`

查询参数：

| 参数 | 类型 | 说明 |
|---|---|---|
| `q` | string，可选 | 在名称、备注和纯文本中执行 `LIKE` 搜索 |

返回：

```json
{
  "items": [
    {
      "id": "formula-reynolds",
      "slug": "reynolds-number",
      "name": "雷诺数",
      "latex": "Re = \\rho U L / \\mu",
      "unicodeMath": "Re = ρUL/μ",
      "plain": "Re = ρUL/μ",
      "note": "惯性力与黏性力之比",
      "category": "无量纲数"
    }
  ],
  "total": 1
}
```

### 14.3 `GET /api/knowledge`、`GET /api/knowledge/categories` 与 `GET /api/knowledge/:slug`

列表接口只返回 `PUBLISHED` 文章，支持：

- `q`：标题、摘要和正文搜索；
- `category`：分类 slug；
- `collection`：`cfd`、`openfoam`、`modelica` 或 `cae`；
- `limit`：1～100；
- `offset`：分页偏移。

分类接口返回各分类的文章数和所属集合，用于构建知识树；详情接口返回文章元数据、标签、标题目录、SEO 数据和服务端清理后的 `bodyHtml`。原始 Markdown保存在数据库 `body_json` 中，不通过公开详情接口返回。

知识导入不是公开 HTTP 写接口，而是本机后台命令：

```powershell
npm run knowledge:validate -- <文件或目录>
npm run knowledge:import -- <文件或目录>
npm run knowledge:sync
```

这样可以在管理员认证尚未完成时避免暴露匿名内容写入入口。

### 14.4 `GET /api/workspace`

默认只允许回环主机访问，并返回 `Cache-Control: no-store`。

按固定 `user-demo` 读取：

- 用户展示资料；
- 收藏；
- 通知；
- 仿真任务和 JSON 结果；
- Modelica 项目及主 `.mo` 文件。

数据库 JSON 字段解析失败时使用空对象或空数组回退。

### 14.5 `PUT /api/workspace`

除回环主机限制外，还拒绝跨站来源并校验 `Origin` 与请求 `Host` 一致。

在单个 `BEGIN IMMEDIATE` 事务中：

- 更新演示用户显示名；
- 全量替换该用户收藏；
- 按本次变化分区 Upsert 通知、任务或项目；
- 校验任务状态和工具 slug 后 Upsert 任务；
- 校验项目状态/编译状态后 Upsert 项目和源码；
- 写一条 `workspace.sync` 审计记录；
- 任一步失败则整体回滚。

服务端限制：

| 数据 | 上限 |
|---|---:|
| 收藏 | 500 条 |
| 通知 | 200 条 |
| 任务 | 500 条 |
| 项目 | 100 个 |
| 项目源码 | 每个 2,000,000 UTF-8 字节 |
| Modelica 元数据 | 每项目 1,000,000 UTF-8 字节 |
| Modelica 运行快照 | 每条 4,000,000 UTF-8 字节；每项目保留 12 条 |

当前不足：没有正式会话鉴权、跨用户资源所有权判断和反向代理级请求体总大小限制，因此只支持本地单用户部署。

## 15. SQLite 数据模型

当前表按领域划分：

### 15.1 身份与权限

- `users`；
- `roles`；
- `permissions`；
- `user_roles`；
- `role_permissions`。

### 15.2 内容与公式

- `categories`；
- `content_items`；
- `tags`；
- `content_tags`；
- `formulas`。

### 15.3 社区

- `forum_sections`；
- `forum_topics`；
- `forum_posts`。

### 15.4 CFD

- `simulation_tools`；
- `simulation_tool_versions`；
- `simulation_tasks`。

### 15.5 Modelica

- `modelica_projects`；
- `modelica_files`；
- `modelica_snapshots`。

### 15.6 工作区与运营

- `bookmarks`；
- `notifications`；
- `formula_conversions`；
- `system_settings`；
- `audit_logs`；
- `schema_migrations`。

数据库结构完整说明见 `docs/DATABASE.md`。

## 16. 数据来源矩阵

| 页面数据 | 当前主来源 | 回退/补充来源 |
|---|---|---|
| 首页内容 | `utils/content.ts` | 无 |
| 知识文章 | SQLite `/api/knowledge` | `utils/content.ts` 中的历史演示内容 |
| 算法 | `utils/content.ts` | 无 |
| 公式页 | SQLite `/api/formulas` | `utils/content.ts` |
| 顶部快速搜索 | `utils/content.ts` | 最近搜索在 localStorage |
| CFD 工具定义 | `utils/content.ts` | 数据库保存对应工具版本元数据 |
| CFD 任务 | SQLite 工作区 | `flowlab-state-v1` |
| Modelica 项目/源码 | SQLite 工作区 | `flowlab-state-v1` |
| Modelica 模板/组件库 | 页面静态数组 | 无 |
| 社区主题 | `utils/content.ts` | 数据库表尚未接页面 |
| 社区新增回复 | 当前页面内存 | 无，刷新丢失 |
| 公式转换历史 | `flowlab-formula-history-v1` | 无 |
| 管理指标 | 静态演示 + Pinia 任务 | 数据库连接状态 |

## 17. 错误与降级逻辑

### 17.1 数据库失败

- 初始化 API 失败：保留浏览器缓存；
- 同步 API 失败：状态仍写入浏览器，显示降级模式；
- 公式 API 失败：使用静态公式；
- 下次用户操作会再次尝试同步工作区。

当前没有后台定时重试；重试由下一次 `persist()` 操作触发。

### 17.2 找不到任务或项目

- CFD 任务页显示空状态并提供返回工具列表入口；
- Modelica 编辑器默认回退到第一个项目；
- 不存在的业务路径由 PageRouter 显示 404。

### 17.3 公式解析失败

- 生成诊断信息；
- 显示安全转义后的预览错误；
- 不执行受信 HTML 或任意 KaTeX 扩展；
- `trust` 为 `false`。

## 18. 测试和验证

当前自动验证：

| 命令 | 覆盖范围 |
|---|---|
| `npm run test:formula` | 13 个乱码修复、非法实体、Unicode、Word 线性公式、LaTeX 和诊断场景 |
| `npm run test:knowledge` | 模板解析、字段校验、目录提取、KaTeX/MathML 渲染、非法公式拒绝和 HTML 清理 |
| `npm run test:cae-knowledge` | 19 个 CAE 算法知识块、6 个专题、推导结构、公式、MathML、参考资料和全景图覆盖词 |
| `npm run test:solvers` | CFD 求解器正常工况、边界输入、矩形方腔、收敛状态和尺度一致性 |
| `npm run test:lab` | 线性/对数/整数扫描、指标提取、层流适用性和未收敛可信度检查 |
| `npm run test:modelica` | 四个模板、方程签名、参数边界、非有限结果和时间积分 |
| `npm run test:database` | 终态时间、源码 revision、主文件稳定性、快照上限和并发迁移 |
| `npm run typecheck` | Nuxt/Vue/TypeScript 类型检查 |
| `npm run db:check` | Schema 3、SQLite integrity、外键、JSON 合法性、快照表/索引和中文种子修复 |
| `npm run build` | 客户端、SSR 和 Nitro API 生产构建 |

当前缺口：

- 没有组件单元测试；
- 没有浏览器 E2E；
- 尚缺更完整的公开 CFD 基准误差阈值；
- 没有正式认证和跨用户权限测试。

## 19. 当前已知限制

1. 固定演示用户，未实现生产认证；
2. 管理页面有本地角色门禁，但没有服务端会话与完整 RBAC；
3. SQLite 适合单机，不适合高并发多实例直接共享；
4. CFD 工具是教学/工程估算逻辑，不是工业通用求解器；
5. 方腔流使用浏览器二维涡量—流函数教学求解器；为避免阻塞界面，网格与迭代规模受 65×65、5000 步上限约束；
6. Modelica 不是完整编译器或运行时；
7. 社区发布、点赞、举报和审核没有持久化；
8. 顶部快速搜索仍以静态内容为主，尚未统一查询知识数据库；
9. 管理设置存储在数据库，但多数尚未真正约束业务；
10. 方腔已有浏览器 Web Worker；仍没有服务端任务队列、Redis、对象存储、邮件服务或监控告警；
11. 没有多设备冲突解决；
12. 公式转换不支持图片 OCR，且无法确定性恢复已经丢失的字符。

## 20. 建议开发顺序

### P0：完善本地单用户应用

1. 文章、算法、论坛接入数据库 CRUD；
2. 增加 API 集成测试和浏览器 E2E；
3. 健康接口脱敏，增加日志和请求 ID。

### P1：计算执行链

1. 将任务提交和计算执行拆分；
2. 引入任务队列与隔离 Worker；
3. 为四个 CFD 工具建立公开基准和误差阈值；
4. 结果文件进入对象存储，数据库保存清单；
5. 增加取消、超时、失败重试和保留期清理。

### P2：Modelica 实际能力

1. 冻结 `PlatformModelica-1.0` 语法语义范围；
2. 实现词法、语法、AST、名称和类型检查；
3. 实例化、连接展开、方程平衡和 DAE 分析；
4. 代码生成、隔离编译和制品缓存；
5. 集成 SUNDIALS，并建立正/负语料与数值基准；
6. 项目快照、实验版本和结果可追溯。

## 21. 关键源码索引

| 文件 | 职责 |
|---|---|
| `components/PageRouter.vue` | 路径前缀到业务页面的分发 |
| `components/AppHeader.vue` | 导航和全站搜索入口 |
| `components/pages/LibraryPage.vue` | 知识、算法、公式和搜索页面 |
| `components/formulas/FormulaConverter.vue` | 公式转换工作台 |
| `utils/formula/converter.ts` | 公式修复、识别、转换和预览核心 |
| `components/pages/SimulationPage.vue` | CFD 参数、运行进度和结果展示 |
| `utils/solvers.ts` | 四个浏览器端求解/估算逻辑 |
| `components/pages/ModelicaPage.vue` | Modelica 项目、编辑、检查和结果演示 |
| `components/pages/CommunityPage.vue` | 社区列表与详情 |
| `stores/platform.ts` | 工作区状态、本地缓存和数据库同步 |
| `server/api/workspace.get.ts` | 工作区读取 |
| `server/api/workspace.put.ts` | 工作区事务写入 |
| `server/api/formulas.get.ts` | 公式数据库查询 |
| `templates/knowledge/KNOWLEDGE_ARTICLE.template.md` | 知识文章标准模板 |
| `server/services/knowledge-importer.ts` | 模板解析、校验、安全渲染和事务导入 |
| `scripts/import-knowledge.mjs` | 单文件/目录批量导入命令 |
| `server/api/knowledge/` | 已发布知识文章读取接口 |
| `server/utils/database.ts` | SQLite 初始化、迁移与种子 |
| `server/database/schema.ts` | 表结构、索引和默认数据定义 |

## 22. 结论

当前版本已经形成可运行的 Nuxt 网站、SQLite 持久化、公式转换、四个本地 CFD 工具、Modelica 项目编辑演示和完整页面体系。它适合作为产品原型、教学演示和后续工程开发基线。

需要特别保持边界清晰：当前为无账号本地单用户模式，社区写入属于页面内演示能力，方腔 CFD 是受规模限制的教学求解器，Modelica Lite 仅执行经过方程签名校验的内置模板。正式上线前仍需按第 20 节补齐服务端业务、任务隔离、数值验证和端到端测试。
