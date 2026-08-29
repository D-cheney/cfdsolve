---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2a70eaf45a9b"
title: "OpenFOAM 14 源码解析：cellCuts.H"
summary: "该文件声明或实现 `polyMesh`、`cellLooper`、`refineCell`、`plane`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/meshCut/cellCuts/cellCuts.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：cellCuts.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/meshCut/cellCuts/cellCuts.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：642 行
- 文件标识：`2a70eaf45a9b`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`cellLooper`、`refineCell`、`plane`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Description of cuts across cells. Description of cut is given as list of vertices and list of edges to be cut (and position on edge). Does some checking of correctness/non-overlapping of cuts. 2x2x2 refinement has to be done in three passes since cuts can not overlap (would make addressing too complicated) Introduces concept of 'cut' which is either an existing vertex or a edge. Input can either be -# list of cut vertices and list of cut edges. Constructs cell circumference walks ('cellLoops'). -# list of cell circumference walks. Will filter them so they don't overlap. -# cellWalker and list of cells to refine (refineCell). Constructs cellLoops and does B. cellWalker is class which can cut a single cell using a plane through the cell centre and in a certain normal direction CellCuts constructed from cellLoops (B, C) can have multiple cut-edges and/or cut-point as long as there is per fa

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 106 |
| `cellLooper` | 107 |
| `refineCell` | 108 |
| `plane` | 109 |
| `cellCuts` | 114 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `nLoops` | 576 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`edgeVertex.H`](../../../07-mesh-geometry/files/a8/edgevertex.h--a8ece904d126.md)
- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`DynamicList.H`](../../../04-core-runtime/files/d0/dynamiclist.h--d0fb805f1b2f.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)

## 8. 直接上层引用

- [applications/utilities/mesh/advanced/refineWallLayer/refineWallLayer.C](../../../03-utilities/files/d2/refinewalllayer.c--d2773cf92eb3.md)
- [applications/utilities/mesh/advanced/splitCells/splitCells.C](../../../03-utilities/files/2f/splitcells.c--2f7c73e3ee10.md)
- [src/polyTopoChange/meshCut/cellCuts/cellCuts.C](../../../07-mesh-geometry/files/5e/cellcuts.c--5e5afec32e79.md)
- [src/polyTopoChange/meshCut/meshModifiers/meshCutter/meshCutter.C](../../../07-mesh-geometry/files/0f/meshcutter.c--0f4dadfb453e.md)
- [src/polyTopoChange/meshCut/meshModifiers/refinementIterator/refinementIterator.C](../../../07-mesh-geometry/files/c4/refinementiterator.c--c4ab84f209b9.md)
- [src/polyTopoChange/meshCut/meshModifiers/undoableMeshCutter/undoableMeshCutter.C](../../../07-mesh-geometry/files/5e/undoablemeshcutter.c--5e57d9cd12cd.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
