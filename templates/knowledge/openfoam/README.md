# OpenFOAM 独立知识库

本目录是一套可单独校验和导入的 OpenFOAM 中文知识库。除各级 `README.md` 外，每个 Markdown 文件均采用 `flowlab-knowledge/1.0` Front Matter；文章 slug 统一以 `openfoam-` 开头，不会覆盖现有通用 CFD 内容。

> OpenFOAM 存在 OpenFOAM Foundation 与 OpenCFD 两条主要发行线。二者在版本号、求解器组织、字典项和工具名称上可能不同。本文库讲解稳定的工作方法，并要求实际使用时以所安装发行版的命令行帮助和官方文档为准。

## 功能分类

| 分类 | 解决的问题 | 文章 |
|---|---|---|
| 01 入门与案例组织 | 安装验证、案例目录、字典语法、求解器选择 | [索引](01-getting-started/README.md) |
| 02 网格 | blockMesh、snappyHexMesh、网格质量 | [索引](02-meshing/README.md) |
| 03 物理模型 | 湍流、传热、可压缩、多相与组分 | [索引](03-physics/README.md) |
| 04 边界与数值设置 | 边界/初始场、离散格式、线性求解与时间步 | [索引](04-numerics-boundaries/README.md) |
| 05 运行与自动化 | 串并行运行、分解重构、脚本化与可复现 | [索引](05-running-automation/README.md) |
| 06 后处理与排错 | functionObjects、守恒检查、发散诊断 | [索引](06-post-troubleshooting/README.md) |
| 07 OpenFOAM 14 源码 | 架构、离散、求解链以及 10,907 个逐文件源码卡 | [专题解析](../openfoam-source-v14/README.md) · [逐文件参考](../openfoam-source-files-v14/README.md) |

## 推荐路线

1. 首个案例：01 → 02 → 04 → 05 → 06；
2. 湍流换热：01 → 02 → 03 → 04 → 05 → 06；
3. 多相或可压缩：先完成单相基准，再进入 03，最后按 06 的守恒清单验收；
4. 集群批处理：01 → 04 → 05，并将版本、字典和日志一并归档。

## 校验与导入

```powershell
npm run knowledge:validate -- templates\knowledge\openfoam
npm run knowledge:import -- templates\knowledge\openfoam
```
