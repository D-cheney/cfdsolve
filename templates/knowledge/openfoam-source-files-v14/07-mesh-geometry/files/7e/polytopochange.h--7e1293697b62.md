---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7e1293697b62"
title: "OpenFOAM 14 源码解析：polyTopoChange.H"
summary: "该文件声明或实现 `face`、`primitiveMesh`、`polyMesh`、`fvMesh`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyTopoChange/polyTopoChange.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：polyTopoChange.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyTopoChange/polyTopoChange.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：533 行
- 文件标识：`7e1293697b62`

## 2. 功能说明

该文件声明或实现 `face`、`primitiveMesh`、`polyMesh`、`fvMesh`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Direct mesh changes based on v1.3 polyTopoChange syntax. Instead of recording changes and executing them all in one go (as did v1.3 polyTopoChange) this class actually holds the current points/faces/cells and does the change immediately. It can be asked to compress out all unused points/faces/cells and renumber everything to be consistent. Note: - polyTopoChange can be copied. - adding a face using non-existing cells causes all intermediate cells to be added. So always first add cells/points and then faces. (or set strict checking) - strict checking: - any added/modified face can only use already existing vertices - any added face can only use already existing cells - no item can be removed more than once. - removed cell: cell set to 0 faces. - removed face: face set to 0 vertices. - removed point: coordinate set to vector::max (vGreat,vGreat,vGreat). Note that this might give problems i

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `face` | 86 |
| `primitiveMesh` | 87 |
| `polyMesh` | 88 |
| `fvMesh` | 89 |
| `Time` | 90 |
| `fileName` | 91 |
| `polyBoundaryMesh` | 92 |
| `polyPatch` | 93 |
| `dictionary` | 94 |
| `topoAction` | 95 |
| `objectMap` | 96 |
| `IOobject` | 97 |
| `CompactListList` | 98 |
| `polyTopoChange` | 103 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`DynamicList.H`](../../../04-core-runtime/files/d0/dynamiclist.h--d0fb805f1b2f.md)
- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`PackedBoolList.H`](../../../04-core-runtime/files/6e/packedboollist.h--6eaf5d33f077.md)
- [`polyTopoChangeI.H`](../../../07-mesh-geometry/files/e3/polytopochangei.h--e3490e555159.md)
- [`polyTopoChangeTemplates.C`](../../../07-mesh-geometry/files/55/polytopochangetemplates.c--55bb39b273e2.md)

## 8. 直接上层引用

- [applications/test/fieldMapping/Test-fieldMapping.C](../../../17-other-libraries/files/4a/test-fieldmapping.c--4af4581d46e7.md)
- [applications/utilities/mesh/advanced/collapseEdges/collapseEdges.C](../../../03-utilities/files/48/collapseedges.c--485ee63a7a94.md)
- [applications/utilities/mesh/advanced/combinePatchFaces/combinePatchFaces.C](../../../03-utilities/files/b5/combinepatchfaces.c--b574ad8fad04.md)
- [applications/utilities/mesh/advanced/refineWallLayer/refineWallLayer.C](../../../03-utilities/files/d2/refinewalllayer.c--d2773cf92eb3.md)
- [applications/utilities/mesh/advanced/removeFaces/removeFaces.C](../../../03-utilities/files/8a/removefaces.c--8a43f8b2c182.md)
- [applications/utilities/mesh/advanced/splitCells/splitCells.C](../../../03-utilities/files/2f/splitcells.c--2f7c73e3ee10.md)
- [applications/utilities/mesh/conversion/fluent3DMeshToFoam/fluent3DMeshToFoam.L](../../../03-utilities/files/12/fluent3dmeshtofoam.l--129276eff7c8.md)
- [applications/utilities/mesh/generation/blockMesh/blockMesh.C](../../../03-utilities/files/4c/blockmesh.c--4cd46440d1d3.md)
- [applications/utilities/mesh/generation/extrude2DMesh/extrude2DMesh.C](../../../03-utilities/files/46/extrude2dmesh.c--46db24f754eb.md)
- [applications/utilities/mesh/generation/extrude2DMesh/extrude2DMesh/extrude2DMesh/extrude2DMesh.C](../../../03-utilities/files/d6/extrude2dmesh.c--d61d0d05db8d.md)
- [applications/utilities/mesh/generation/extrudeMesh/extrudeMesh.C](../../../03-utilities/files/c8/extrudemesh.c--c85ecbc45ccd.md)
- [applications/utilities/mesh/generation/extrudeToRegionMesh/extrudeToRegionMesh.C](../../../03-utilities/files/3d/extrudetoregionmesh.c--3d777298811a.md)
- [applications/utilities/mesh/manipulation/createBaffles/createBaffles.C](../../../03-utilities/files/af/createbaffles.c--afcc4752f76c.md)
- [applications/utilities/mesh/manipulation/createPatch/createPatch.C](../../../03-utilities/files/14/createpatch.c--140367ac7497.md)
- [applications/utilities/mesh/manipulation/mergeBaffles/mergeBaffles.C](../../../03-utilities/files/36/mergebaffles.c--3626b1abb409.md)
- [applications/utilities/mesh/manipulation/mergeMeshes/mergePolyMesh.H](../../../03-utilities/files/5c/mergepolymesh.h--5c81b36268ae.md)
- [applications/utilities/mesh/manipulation/polyDualMesh/meshDualiser.C](../../../03-utilities/files/fb/meshdualiser.c--fb57e8a46cc8.md)
- [applications/utilities/mesh/manipulation/polyDualMesh/polyDualMesh.C](../../../03-utilities/files/9a/polydualmesh.c--9a25d496f593.md)
- [applications/utilities/mesh/manipulation/refineMesh/refineMesh.C](../../../03-utilities/files/1f/refinemesh.c--1f4ab1528bf7.md)
- [applications/utilities/mesh/manipulation/renumberMesh/renumberMesh.C](../../../03-utilities/files/f3/renumbermesh.c--f30a3a4012f2.md)
- [applications/utilities/mesh/manipulation/splitBaffles/splitBaffles.C](../../../03-utilities/files/a6/splitbaffles.c--a6e73e01af9e.md)
- [applications/utilities/mesh/manipulation/splitMeshRegions/splitMeshRegions.C](../../../03-utilities/files/82/splitmeshregions.c--826288c5299e.md)
- [applications/utilities/surface/surfaceToPatch/surfaceToPatch.C](../../../03-utilities/files/ed/surfacetopatch.c--edf5bace5e40.md)
- [src/conversion/mergedCyclic/polyMeshUnMergeCyclics.C](../../../17-other-libraries/files/ae/polymeshunmergecyclics.c--ae0858b59589.md)
- [src/fvMeshTopoChangers/refiner/refiner_fvMeshTopoChanger.C](../../../07-mesh-geometry/files/42/refiner_fvmeshtopochanger.c--42600080d050.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
