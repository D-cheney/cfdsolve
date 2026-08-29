---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-312b3d9c79c5"
title: "OpenFOAM 14 源码解析：localPointRegion.H"
summary: "该文件声明或实现 `primitiveMesh`、`polyMesh`、`face`、`polyTopoChangeMap`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/regionSplit/localPointRegion.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：localPointRegion.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/regionSplit/localPointRegion.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：211 行
- 文件标识：`312b3d9c79c5`

## 2. 功能说明

该文件声明或实现 `primitiveMesh`、`polyMesh`、`face`、`polyTopoChangeMap`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Takes mesh with 'baffles' (= boundary faces sharing points). Determines for selected points on boundary faces the 'point region' it is connected to. Each region can be visited by a cell-face-cell walk. Used in duplicating points after splitting baffles. Regions are not consecutive per processor. They will be -1..nRegions_. Note: coupled boundaries (cyclics, parallel) not fully tested.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `primitiveMesh` | 65 |
| `polyMesh` | 66 |
| `face` | 67 |
| `polyTopoChangeMap` | 68 |
| `localPointRegion` | 73 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`faceList.H`](../../../04-core-runtime/files/bc/facelist.h--bc39a0876345.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)

## 8. 直接上层引用

- [applications/utilities/mesh/manipulation/mergeBaffles/mergeBaffles.C](../../../03-utilities/files/36/mergebaffles.c--3626b1abb409.md)
- [applications/utilities/mesh/manipulation/splitBaffles/splitBaffles.C](../../../03-utilities/files/a6/splitbaffles.c--a6e73e01af9e.md)
- [src/mesh/snappyHexMesh/externalDisplacementMeshMover/externalDisplacement_pointMeshMover.C](../../../07-mesh-geometry/files/42/externaldisplacement_pointmeshmover.c--42cb3757b03f.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C](../../../07-mesh-geometry/files/38/meshrefinement.c--3812c4bc1bde.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementBaffles.C](../../../07-mesh-geometry/files/80/meshrefinementbaffles.c--80cdc3e05caf.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.C](../../../07-mesh-geometry/files/6e/snappylayerdriver.c--6e5dc56e8a5d.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyRefineDriver.C](../../../07-mesh-geometry/files/73/snappyrefinedriver.c--7392231fe379.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappySnapDriver.C](../../../07-mesh-geometry/files/40/snappysnapdriver.c--40de51c15316.md)
- [src/meshTools/regionSplit/localPointRegion.C](../../../07-mesh-geometry/files/11/localpointregion.c--11fe56076a77.md)
- [src/parallel/decompose/decompositionMethods/decompositionConstraints/preserveBaffles/preserveBafflesConstraint.C](../../../13-parallel/files/4d/preservebafflesconstraint.c--4d89cd511db0.md)
- [src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.C](../../../13-parallel/files/c1/decompositionmethod.c--c1194bcc0467.md)
- [src/polyTopoChange/polyTopoChange/duplicatePoints.C](../../../07-mesh-geometry/files/55/duplicatepoints.c--55a052601ab2.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
