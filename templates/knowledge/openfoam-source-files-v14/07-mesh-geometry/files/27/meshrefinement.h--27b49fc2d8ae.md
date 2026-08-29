---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-27b49fc2d8ae"
title: "OpenFOAM 14 源码解析：meshRefinement.H"
summary: "该文件声明或实现 `fvMesh`、`polyDistributionMap`、`decompositionMethod`、`refinementSurfaces`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/mesh/snappyHexMesh/meshRefinement/meshRefinement.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：meshRefinement.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/mesh/snappyHexMesh/meshRefinement/meshRefinement.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1147 行
- 文件标识：`27b49fc2d8ae`

## 2. 功能说明

该文件声明或实现 `fvMesh`、`polyDistributionMap`、`decompositionMethod`、`refinementSurfaces`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Helper class which maintains intersections of (changing) mesh with (static) surfaces. Maintains - per face any intersections of the cc-cc segment with any of the surfaces

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 68 |
| `polyDistributionMap` | 69 |
| `decompositionMethod` | 70 |
| `refinementSurfaces` | 71 |
| `refinementFeatures` | 72 |
| `refinementRegions` | 73 |
| `removeCells` | 74 |
| `fvMeshDistribute` | 75 |
| `searchableSurface` | 76 |
| `regionSplit` | 77 |
| `globalIndex` | 78 |
| `removePoints` | 79 |
| `localPointRegion` | 80 |
| `snapParameters` | 81 |
| `meshRefinement` | 87 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `mergeDistance` | 626 |
| `overwrite` | 633 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`hexRef8.H`](../../../07-mesh-geometry/files/2a/hexref8.h--2aa96b1f7395.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)
- [`indirectPrimitivePatch.H`](../../../04-core-runtime/files/ab/indirectprimitivepatch.h--ab8f04d3f0d8.md)
- [`pointFieldsFwd.H`](../../../05-finite-volume/files/55/pointfieldsfwd.h--55dc00cdab43.md)
- [`Tuple2.H`](../../../04-core-runtime/files/ab/tuple2.h--ab8ee5c9d4ce.md)
- [`pointIndexHit.H`](../../../04-core-runtime/files/71/pointindexhit.h--711d8d27684c.md)
- [`refinementParameters.H`](../../../07-mesh-geometry/files/a9/refinementparameters.h--a92046b22eea.md)
- [`meshRefinementTemplates.C`](../../../07-mesh-geometry/files/54/meshrefinementtemplates.c--54c2c88a2c87.md)

## 8. 直接上层引用

- [src/mesh/snappyHexMesh/externalDisplacementMeshMover/medialAxisMeshMover.C](../../../07-mesh-geometry/files/19/medialaxismeshmover.c--19b44ead8f3d.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C](../../../07-mesh-geometry/files/38/meshrefinement.c--3812c4bc1bde.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementBaffles.C](../../../07-mesh-geometry/files/80/meshrefinementbaffles.c--80cdc3e05caf.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementMerge.C](../../../07-mesh-geometry/files/28/meshrefinementmerge.c--2842dfeede57.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementProblemCells.C](../../../07-mesh-geometry/files/4f/meshrefinementproblemcells.c--4f5c81fd4bd2.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementRefine.C](../../../07-mesh-geometry/files/31/meshrefinementrefine.c--31acf059fb90.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementTemplates.C](../../../07-mesh-geometry/files/54/meshrefinementtemplates.c--54c2c88a2c87.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.C](../../../07-mesh-geometry/files/6e/snappylayerdriver.c--6e5dc56e8a5d.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.H](../../../07-mesh-geometry/files/b6/snappylayerdriver.h--b6cbac8c0529.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyRefineDriver.C](../../../07-mesh-geometry/files/73/snappyrefinedriver.c--7392231fe379.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappySnapDriver.H](../../../07-mesh-geometry/files/71/snappysnapdriver.h--712279c72a90.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
