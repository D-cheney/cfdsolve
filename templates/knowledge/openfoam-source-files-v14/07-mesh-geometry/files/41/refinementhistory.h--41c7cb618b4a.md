---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-41c7cb618b4a"
title: "OpenFOAM 14 源码解析：refinementHistory.H"
summary: "该文件实现 `refinementHistory` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyTopoChange/hexRef8/refinementHistory.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：refinementHistory.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyTopoChange/hexRef8/refinementHistory.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：432 行
- 文件标识：`41c7cb618b4a`

## 2. 功能说明

该文件实现 `refinementHistory` 相关对象的读取、写出或流序列化。

中文导航角色：OpenFOAM 支撑代码。

上游说明：All refinement history. Used in unrefinement. - visibleCells: valid for the current mesh and contains per cell -1 (cell unrefined) or an index into splitCells_. - splitCells: for every split contains the parent (also index into splitCells) and optionally a subsplit as 8 indices into splitCells. Note that the numbers in splitCells are not cell labels, they are purely indices into splitCells. E.g. 2 cells, cell 1 gets refined so end up with 9 cells: \verbatim // splitCells 9 ( -1 (1 2 3 4 5 6 7 8) 0 0() 0 0() 0 0() 0 0() 0 0() 0 0() 0 0() 0 0() ) // visibleCells 9(-1 1 2 3 4 5 6 7 8) \endverbatim So cell0 (visibleCells=-1) is unrefined. Cells 1-8 have all valid splitCells entries which are: - parent:0 - subsplits:0() The parent 0 refers back to the splitcell entries.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyTopoChangeMap` | 94 |
| `polyDistributionMap` | 95 |
| `refinementHistory` | 99 |
| `splitCell8` | 115 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `active` | 293 |
| `parentIndex` | 305 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`DynamicList.H`](../../../04-core-runtime/files/d0/dynamiclist.h--d0fb805f1b2f.md)
- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`FixedList.H`](../../../04-core-runtime/files/56/fixedlist.h--5633be515ee5.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`regIOobject.H`](../../../04-core-runtime/files/7f/regioobject.h--7f9eca9df0dd.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)

## 8. 直接上层引用

- [src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C](../../../07-mesh-geometry/files/38/meshrefinement.c--3812c4bc1bde.md)
- [src/parallel/decompose/decompositionMethods/decompositionConstraints/refinementHistory/refinementHistoryConstraint.C](../../../13-parallel/files/72/refinementhistoryconstraint.c--723cc228c751.md)
- [src/polyTopoChange/polyTopoChange/hexRef8/hexRef8.H](../../../07-mesh-geometry/files/2a/hexref8.h--2aa96b1f7395.md)
- [src/polyTopoChange/polyTopoChange/hexRef8/hexRef8Data.C](../../../07-mesh-geometry/files/73/hexref8data.c--7326312406f7.md)
- [src/polyTopoChange/polyTopoChange/hexRef8/refinementHistory.C](../../../07-mesh-geometry/files/23/refinementhistory.c--2346b724c035.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
