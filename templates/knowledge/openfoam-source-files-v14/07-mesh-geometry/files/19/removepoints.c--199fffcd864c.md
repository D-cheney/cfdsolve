---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-199fffcd864c"
title: "OpenFOAM 14 源码解析：removePoints.C"
summary: "该文件声明或实现 `faceEqOp`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyTopoChange/removePoints.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：removePoints.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyTopoChange/removePoints.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：892 行
- 文件标识：`199fffcd864c`

## 2. 功能说明

该文件声明或实现 `faceEqOp`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `faceEqOp` | 50 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `operator` | 55 |
| `Foam::removePoints::modifyFace` | 81 |
| `Foam::removePoints::countPointUsage` | 129 |
| `Foam::removePoints::setRefinement` | 279 |
| `Foam::removePoints::topoChange` | 440 |
| `Foam::removePoints::getUnrefimentSet` | 543 |
| `Foam::removePoints::setUnrefinement` | 753 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`BiIndirectList.H`](../../../04-core-runtime/files/93/biindirectlist.h--93bd72857d26.md)
- [`removePoints.H`](../../../07-mesh-geometry/files/db/removepoints.h--db2e62bb9c83.md)
- [`PstreamReduceOps.H`](../../../04-core-runtime/files/ca/pstreamreduceops.h--ca44c1f2f0ec.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`faceSet.H`](../../../07-mesh-geometry/files/f3/faceset.h--f3dc94c0b8ee.md)
- [`dummyTransform.H`](../../../04-core-runtime/files/97/dummytransform.h--9701088b2fcb.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
