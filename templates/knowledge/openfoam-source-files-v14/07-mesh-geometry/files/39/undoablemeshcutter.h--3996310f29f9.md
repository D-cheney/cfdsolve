---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3996310f29f9"
title: "OpenFOAM 14 源码解析：undoableMeshCutter.H"
summary: "该文件声明或实现 `polyMesh`、`polyTopoChange`、`refineCell`、`splitCell`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/meshCut/meshModifiers/undoableMeshCutter/undoableMeshCutter.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：undoableMeshCutter.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/meshCut/meshModifiers/undoableMeshCutter/undoableMeshCutter.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：221 行
- 文件标识：`3996310f29f9`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyTopoChange`、`refineCell`、`splitCell`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：The main refinement handler. Gets cellCuts which is structure that describes which cells are to be cut and in what way. Maintains an undo list (if told so during construction). Apart from undo list is just wrapper around meshCutter. Undo list: contains a refinement tree (of type splitCell; cell labels are of no consequence) and a list of visible splitCells, i.e. the top of the tree (where the cell labels are valid). Now every cell added gets put on the tree and every topoChange action updates the labels of visible splitcells. We can now ask this structure for a list of visible split cells or the list of faces between these. These can be passed to removeFaces for actual deletion and we delete the top splitCell and update the now newly visible underlying cells for the new cell number (passed back from removeFaces). NOTE: Undoing note properly tested. Expect it to fail if the faces to be re

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 91 |
| `polyTopoChange` | 92 |
| `refineCell` | 93 |
| `splitCell` | 94 |
| `undoableMeshCutter` | 99 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`edgeVertex.H`](../../../07-mesh-geometry/files/a8/edgevertex.h--a8ece904d126.md)
- [`refineCell.H`](../../../07-mesh-geometry/files/3e/refinecell.h--3ee7a1ee0652.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`cellLooper.H`](../../../07-mesh-geometry/files/d2/celllooper.h--d22d96b6518c.md)
- [`meshCutter.H`](../../../07-mesh-geometry/files/4b/meshcutter.h--4be046e8ab20.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`removeFaces.H`](../../../07-mesh-geometry/files/59/removefaces.h--59f6e14b41aa.md)

## 8. 直接上层引用

- [src/polyTopoChange/meshCut/meshModifiers/multiDirRefinement/multiDirRefinement.C](../../../07-mesh-geometry/files/01/multidirrefinement.c--0101e9a9c8a4.md)
- [src/polyTopoChange/meshCut/meshModifiers/refinementIterator/refinementIterator.C](../../../07-mesh-geometry/files/c4/refinementiterator.c--c4ab84f209b9.md)
- [src/polyTopoChange/meshCut/meshModifiers/undoableMeshCutter/undoableMeshCutter.C](../../../07-mesh-geometry/files/5e/undoablemeshcutter.c--5e57d9cd12cd.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
