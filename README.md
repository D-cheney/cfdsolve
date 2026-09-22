# CFD菜鸟

根据《CFD 网站设计大纲》实现的 Nuxt 3 工程仿真平台。项目使用随应用运行的 SQLite 数据库保存内容、公式、仿真任务、Modelica 项目、收藏、通知、权限、设置和审计记录；数据库暂时不可用时，前端会自动降级到浏览器本地存储。

## 项目文档

- [配置与运行手册](docs/CONFIGURATION.md)
- [本地全量部署](docs/LOCAL_DEPLOYMENT.md)
- [网站逻辑与功能总结](docs/SITE_LOGIC_AND_FEATURES.md)
- [数据库运行说明](docs/DATABASE.md)
- [深度审计与测试报告（2026-08-24）](docs/DEEP_AUDIT_AND_TEST_REPORT_2026-08-24.md)
- [布局系统与响应式规范](docs/LAYOUT_SYSTEM.md)
- [参数扫描与工况对比实验室](docs/SIMULATION_EXPERIMENT_LAB.md)
- [文档索引](docs/README.md)

## 本地运行

```bash
npm install
npm run db:init
npm run knowledge:sync
npm run dev
```

Windows 本地生产部署可直接执行：

```powershell
npm run deploy:local
```

该命令会完成依赖安装、数据库备份与初始化、11,247 篇知识源校验与 340 篇主库文章同步、检查测试、生产构建、后台启动和健康检查。详细说明见 `docs/LOCAL_DEPLOYMENT.md`。

Linux 生产环境需要 Node.js 22.5 或更高版本、Python 3.12 和 Gmsh 4.15.2。Debian／Ubuntu 可按以下方式准备网格运行环境：

```bash
sudo apt-get install -y libglu1-mesa python3-venv
python3 -m venv .venv
.venv/bin/python3 -m pip install -r services/meshing/requirements.txt
export CFDSOLVE_PYTHON_BIN="$PWD/.venv/bin/python3"
npm ci
npm run check:meshing-runtime
npm run build
npm start
```

生产构建会将网格脚本和依赖清单复制到 `.output/server/meshing`，因此只部署 `.output` 时网格 API 也能找到运行内核。若虚拟环境不在项目目录，可通过 `CFDSOLVE_PYTHON_BIN` 指定 Python；也可用 `CFDSOLVE_MESHING_SCRIPT` 指定网格脚本的绝对路径。

打开终端显示的本地地址即可。生产构建使用：

```bash
npm run build
npm run preview
```

## 数据库

默认数据库位于 `data/cfdsolve.sqlite`。首次运行 `npm run db:init` 会自动执行迁移和可重复的种子数据初始化；直接启动网站时也会自动初始化。

```bash
npm run db:check
npm run db:backup
```

数据库接口：

- `GET /api/health/database`：连接状态、版本和数据统计。
- `GET /api/formulas`：从数据库查询公式。
- `GET /api/workspace`：加载任务、项目、收藏和通知。
- `PUT /api/workspace`：持久化工作区数据。

完整说明见 `docs/DATABASE.md`。

## 知识库文章导入

知识文章使用 YAML Front Matter + Markdown 模板：

```text
templates/knowledge/KNOWLEDGE_ARTICLE.template.md
```

```bash
npm run knowledge:validate -- templates/knowledge/my-article.md
npm run knowledge:import -- templates/knowledge/my-article.md
```

格式说明见 `templates/knowledge/FORMAT.md`。导入程序会校验元数据、清理生成的 HTML、自动关联分类和标签，并按 `slug` 创建或更新数据库记录。

统一知识库包含 CFD/CAE 专题、无网格法、OpenFOAM 工程实践、Modelica、OpenFOAM 14 架构和 10,907 份逐文件源码卡，共 11,247 篇可导入文章。总索引见 `templates/knowledge/README.md`。

主知识库只包含其中 **340 篇按主题合并的深度文章**（逐文件源码卡仅作离线源码索引，不导入主知识库）：

```bash
# 同步 340 篇深度文章到主知识库（推荐）
npm run knowledge:sync:articles

# 全量校验（含源码卡）
npm run knowledge:validate -- templates/knowledge
```

> `npm run knowledge:sync` 会把整个目录树（含 10,907 份源码卡）导入，会把主知识库撑到 11,247 条，仅适用于离线源码索引的单独构建。

## 本地降级功能

- 四个 CFD 工具在浏览器内运行并生成结果曲线。
- 参数实验室支持线性/对数扫描、工况趋势对比、逐工况可信度清单和 CSV/JSON 导出。
- 数据库异常时，任务、Modelica 项目、收藏、通知和演示账号暂存在 `localStorage`。
- CFD 结果可导出 JSON 清单和 CSV 数据。
- Modelica 工作台提供画布/源码/参数同步、结构与方程签名检查、四个受控模板的 Euler/RK4 积分、结果后处理和 CSV 导出。

关键工程结果仍需使用经过验证的生产求解器复核。
