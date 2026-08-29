---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4be046e8ab20"
title: "OpenFOAM 14 源码解析：meshCutter.H"
summary: "该文件声明或实现 `Time`、`polyTopoChange`、`cellCuts`、`polyMesh`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/meshCut/meshModifiers/meshCutter/meshCutter.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：meshCutter.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/meshCut/meshModifiers/meshCutter/meshCutter.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：318 行
- 文件标识：`4be046e8ab20`

## 2. 功能说明

该文件声明或实现 `Time`、`polyTopoChange`、`cellCuts`、`polyMesh`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Cuts (splits) cells. Description of cut is given as a loop of 'cuts' per cell (see cellCuts). setRefinement() takes this cut description and inserts the necessary topoActions (add points/faces/cells) into the polyTopoChange. Stores added cells/faces/points. Cut description gives orientation to cut by calculating 'anchorPoints'. The side of the cell that contains the anchorPoints is the master cell. Likewise the cells' edges will have the split added as a duplicate of the master (anchor) point. Think of it as the cell with the anchor points at the bottom. Add a face at the bottom to split the cell and then sweep this face up to be through the middle of the cell. -# Start: cell with anchor points at bottom \verbatim +-------+ | + | + | + | + | + | + | + +-------+ anchor anchor \endverbatim -# Topo change: splitface introduced at bottom of cell, introducing a new cell and splitting the side

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Time` | 125 |
| `polyTopoChange` | 126 |
| `cellCuts` | 127 |
| `polyMesh` | 128 |
| `face` | 129 |
| `meshCutter` | 134 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
2. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`edgeVertex.H`](../../../07-mesh-geometry/files/a8/edgevertex.h--a8ece904d126.md)
- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)

## 8. 直接上层引用

- [applications/utilities/mesh/advanced/refineWallLayer/refineWallLayer.C](../../../03-utilities/files/d2/refinewalllayer.c--d2773cf92eb3.md)
- [applications/utilities/mesh/advanced/splitCells/splitCells.C](../../../03-utilities/files/2f/splitcells.c--2f7c73e3ee10.md)
- [src/polyTopoChange/meshCut/meshModifiers/meshCutter/meshCutter.C](../../../07-mesh-geometry/files/0f/meshcutter.c--0f4dadfb453e.md)
- [src/polyTopoChange/meshCut/meshModifiers/undoableMeshCutter/undoableMeshCutter.C](../../../07-mesh-geometry/files/5e/undoablemeshcutter.c--5e57d9cd12cd.md)
- [src/polyTopoChange/meshCut/meshModifiers/undoableMeshCutter/undoableMeshCutter.H](../../../07-mesh-geometry/files/39/undoablemeshcutter.h--3996310f29f9.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
