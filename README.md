# 流研工坊 FlowLab

实现的 Nuxt 3 工程仿真平台。项目使用随应用运行的 SQLite 数据库保存内容、公式、仿真任务、Modelica 项目、收藏、通知、权限、设置和审计记录；数据库暂时不可用时，前端会自动降级到浏览器本地存储。

## 项目文档

- [配置与运行手册](docs/CONFIGURATION.md)
- [本地全量部署](docs/LOCAL_DEPLOYMENT.md)
- [网站逻辑与功能总结](docs/SITE_LOGIC_AND_FEATURES.md)
- [数据库运行说明](docs/DATABASE.md)
- [文档索引](docs/README.md)

## 本地运行

```bash
npm install
npm run db:init
npm run dev
```

Windows 本地生产部署可直接执行：

```powershell
npm run deploy:local
```

该命令会完成依赖安装、数据库备份与初始化、检查测试、生产构建、后台启动和健康检查。详细说明见 `docs/LOCAL_DEPLOYMENT.md`。

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

完整知识库包含 9 个专题和 40 个独立知识块（含站内知识地图），总索引见 `templates/knowledge/library/README.md`。批量导入：

```powershell
npm run knowledge:validate -- templates\knowledge\library
npm run knowledge:import -- templates\knowledge\library
```

## 本地降级功能

- 四个 CFD 工具在浏览器内运行并生成结果曲线。
- 数据库异常时，任务、Modelica 项目、收藏、通知和演示账号暂存在 `localStorage`。
- CFD 结果可导出 JSON 清单和 CSV 数据。
- Modelica 工作台提供源码保存、基础语法/结构检查、编译摘要和动态响应示例。

关键工程结果仍需使用经过验证的生产求解器复核。
