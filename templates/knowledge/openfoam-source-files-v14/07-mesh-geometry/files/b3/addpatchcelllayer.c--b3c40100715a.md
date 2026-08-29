---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b3c40100715a"
title: "OpenFOAM 14 源码解析：addPatchCellLayer.C"
summary: "该文件实现 `nbrFace`、`addVertex`、`sameEdgeNeighbour`、`getEdgeString` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyTopoChange/addPatchCellLayer.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：addPatchCellLayer.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyTopoChange/addPatchCellLayer.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1771 行
- 文件标识：`b3c40100715a`

## 2. 功能说明

该文件实现 `nbrFace`、`addVertex`、`sameEdgeNeighbour`、`getEdgeString` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::addPatchCellLayer::nbrFace` | 49 |
| `Foam::addPatchCellLayer::addVertex` | 68 |
| `Foam::addPatchCellLayer::sameEdgeNeighbour` | 89 |
| `Foam::addPatchCellLayer::getEdgeString` | 114 |
| `Foam::addPatchCellLayer::addSideFace` | 219 |
| `Foam::addPatchCellLayer::findProcPatch` | 364 |
| `Foam::addPatchCellLayer::addedCells` | 409 |
| `Foam::addPatchCellLayer::globalEdgeFaces` | 444 |
| `Foam::addPatchCellLayer::calcSidePatch` | 489 |
| `Foam::addPatchCellLayer::setRefinement` | 670 |
| `Foam::addPatchCellLayer::topoChange` | 1693 |
| `Foam::addPatchCellLayer::updateZones` | 1756 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`addPatchCellLayer.H`](../../../07-mesh-geometry/files/49/addpatchcelllayer.h--4998d5ed595f.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
