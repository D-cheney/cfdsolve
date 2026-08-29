---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-file-reference
title: OpenFOAM 14 逐文件源码解析
summary: 对 OpenFOAM 14 固定补丁基线的全部源码和构建文件生成独立中文文件卡，并按功能、依赖、符号和算法组织索引。
category: { slug: openfoam-v14-source-files, name: OpenFOAM 14 逐文件解析 }
level: 源码参考
reading_minutes: 12
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
tags: [OpenFOAM14, 源码解析, 静态分析, 算法]
---

# OpenFOAM 14 逐文件源码解析

本模块基于 `OpenFOAM-14@20260724` 完整、大小写敏感源码树生成。每个源码/脚本/构建文件都有独立 Markdown 文件卡，正文保留真实路径；输出文件名附加 SHA-1 短哈希，避免 Windows 对 `PointHit.H` 与 `pointHit.H` 等路径发生覆盖。

## 覆盖范围

- 文件卡：10907 份
- 源码总行数：1,788,255
- 功能分类：17 类
- 分析内容：职责、类型、函数、算法特征、数学关系、直接依赖、反向引用、运行时注册和阅读建议

## 分类入口

| 分类 | 文件数 | 内容 |
|---|---:|---|
| [求解器入口](01-solver-entry/README.md) | 42 | 命令行求解器、统一运行入口及时间循环调度。 |
| [模块化求解器](02-solver-modules/README.md) | 1069 | 求解器模块生命周期、方程装配与物理场耦合。 |
| [前后处理工具](03-utilities/README.md) | 849 | 网格、场、格式转换、后处理与诊断工具。 |
| [核心运行时](04-core-runtime/README.md) | 1486 | 对象注册、I/O、时间、容器、内存与运行时选择机制。 |
| [有限体积离散](05-finite-volume/README.md) | 1581 | fvc/fvm 算子、fvMatrix、边界离散与压力速度耦合。 |
| [矩阵与线性求解](06-linear-algebra/README.md) | 198 | lduMatrix、求解器、预条件器、平滑器及多重网格。 |
| [网格与几何](07-mesh-geometry/README.md) | 996 | 网格表示、拓扑变化、运动网格、表面和搜索算法。 |
| [热物性与反应](08-thermophysical/README.md) | 603 | 状态方程、热力学、输运性质、组分和化学反应。 |
| [湍流与输运](09-turbulence-transport/README.md) | 335 | 层流、RANS、LES、动量与热物性输运闭合。 |
| [多相与界面](10-multiphase/README.md) | 101 | VOF、欧拉多相、相变、空化和相间交换。 |
| [拉格朗日与颗粒](11-lagrangian/README.md) | 1200 | 颗粒/液滴轨迹、云模型、源项回写和统计。 |
| [边界、源项与约束](12-boundaries-sources/README.md) | 142 | 边界条件、fvModels、fvConstraints 和区域耦合。 |
| [并行与域分解](13-parallel/README.md) | 118 | Pstream、MPI、域分解、重构和分布式网格。 |
| [功能对象与采样](14-postprocessing/README.md) | 361 | 运行时后处理、采样、力、统计和结果写出。 |
| [构建与配置](15-build-config/README.md) | 92 | wmake、环境脚本、代码模板和构建清单。 |
| [测试与教程脚本](16-tests-tutorials/README.md) | 503 | 测试程序、教程自动化和回归入口。 |
| [其他物理与支撑库](17-other-libraries/README.md) | 1231 | 未归入上述类别的物理模型和通用支撑实现。 |

## 调用链与全局索引

- [核心调用链](CALL_CHAINS.md)
- [真实源码路径总索引](SOURCE_PATH_INDEX.md)
- [生成与质量报告](GENERATION_REPORT.md)
- [原有架构/离散/求解专题](../openfoam-source-v14/README.md)

## 使用边界

文件卡由静态规则生成，能够可靠报告路径、行数、直接 include、显式类型/函数和已出现的离散算子；宏展开、模板实例、动态链接和运行时选择关系可能无法仅靠文本完全恢复。核心算法应结合专题文章、编译产物、调试栈和算例验证交叉确认。
