# 流研工坊统一知识库

本目录是网站知识内容的唯一源目录。部署程序会递归识别带有 `flowlab-knowledge/1.0` Front Matter 的 Markdown 文件，先全量校验，再以单个数据库事务同步到 SQLite；普通 `README.md`、索引和生成报告只用于仓库导航，不写入文章表。

## 内容集合

| 集合 | 位置 | 可导入文章 | 说明 |
|---|---|---:|---|
| CFD/CAE 专题库 | [`library/`](library/README.md) | 56 | CFD 基础、数值方法、网格、V&V、结构、电磁、声学、多物理、优化与降阶 |
| OpenFOAM 工程库 | [`openfoam/`](openfoam/README.md) | 16 | 安装、案例、网格、物理模型、数值设置、运行与排错 |
| Modelica 专题库 | [`modelica/`](modelica/README.md) | 13 | 语言、组件、DAE、事件、物理域、求解与联合仿真 |
| OpenFOAM 14 架构库 | [`openfoam-source-v14/`](openfoam-source-v14/README.md) | 14 | 源码架构、离散、求解流程、模型基础设施与二次开发 |
| OpenFOAM 14 逐文件库 | [`openfoam-source-files-v14/`](openfoam-source-files-v14/README.md) | 10,907 | 固定源码基线的逐文件中文解析与 17 类导航 |
| 导入示例 | [`examples/`](examples/) | 1 | 模板与导入链路回归样例 |
| 无网格法专题 | [`meshfree/`](meshfree/README.md) | 9 | SPH 原理、山体滑坡方案、吉隆案例、验证与复现 |

合计 11,016 篇可导入 Markdown 文章。逐文件库属于“源码参考”层级，静态分析结论应结合编译、调试和算例验证；其路径、行数和显式依赖为确定性提取，宏展开、模板实例及运行时选择关系可能不完整。

## 全量同步

```powershell
npm run knowledge:validate -- templates\knowledge
npm run knowledge:sync
```

`npm run deploy:local` 已自动执行上述校验与同步。相同 `slug` 会更新现有文章，不会生成重复记录。
