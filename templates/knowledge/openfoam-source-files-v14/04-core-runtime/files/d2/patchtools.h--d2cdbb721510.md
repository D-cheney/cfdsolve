---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d2cdbb721510"
title: "OpenFOAM 14 源码解析：PatchTools.H"
summary: "该文件声明或实现 `polyMesh`、`PackedBoolList`、`boundBox`、`PatchTools`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/primitiveMesh/PatchTools/PatchTools.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：PatchTools.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/primitiveMesh/PatchTools/PatchTools.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：281 行
- 文件标识：`d2cdbb721510`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`PackedBoolList`、`boundBox`、`PatchTools`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：A collection of tools for searching, sorting PrimitivePatch information. The class could also be extended to include more that just static methods.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 63 |
| `PackedBoolList` | 65 |
| `boundBox` | 66 |
| `PatchTools` | 71 |
| `FaceList1` | 167 |
| `PointField1` | 168 |
| `FaceList2` | 169 |
| `PointField2` | 170 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`PrimitivePatch.H`](../../../04-core-runtime/files/42/primitivepatch.h--42f4e9325c61.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`PatchTools.C`](../../../04-core-runtime/files/8b/patchtools.c--8b948e504da9.md)

## 8. 直接上层引用

- [applications/test/patchRegion/Test-patchRegion.C](../../../17-other-libraries/files/aa/test-patchregion.c--aa21ce819eaf.md)
- [applications/test/PatchTools/Test-PatchTools.C](../../../17-other-libraries/files/af/test-patchtools.c--af9a7ccf8164.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/faceSources/regionToFace/regionToFace.C](../../../03-utilities/files/f4/regiontoface.c--f4b51e0f7383.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/faceZoneSources/planeToFaceZone/planeToFaceZone.C](../../../03-utilities/files/1e/planetofacezone.c--1e4208e272b5.md)
- [applications/utilities/mesh/generation/extrude2DMesh/extrude2DMesh/patchToPoly2DMesh/patchToPoly2DMesh.C](../../../03-utilities/files/40/patchtopoly2dmesh.c--4092bd33857b.md)
- [applications/utilities/mesh/generation/extrudeToRegionMesh/extrudeToRegionMesh.C](../../../03-utilities/files/3d/extrudetoregionmesh.c--3d777298811a.md)
- [applications/utilities/surface/surfaceCheck/surfaceCheck.C](../../../03-utilities/files/47/surfacecheck.c--475642cf2b03.md)
- [src/functionObjects/field/fieldValues/surfaceFieldValue/surfaceFieldValue.C](../../../14-postprocessing/files/0d/surfacefieldvalue.c--0db15651c985.md)
- [src/functionObjects/field/streamlines/streamlines.C](../../../14-postprocessing/files/c4/streamlines.c--c407278a704a.md)
- [src/mesh/snappyHexMesh/externalDisplacementMeshMover/medialAxisMeshMover.C](../../../07-mesh-geometry/files/19/medialaxismeshmover.c--19b44ead8f3d.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.C](../../../07-mesh-geometry/files/6e/snappylayerdriver.c--6e5dc56e8a5d.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriverShrink.C](../../../07-mesh-geometry/files/43/snappylayerdrivershrink.c--4351d2260c13.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappySnapDriver.C](../../../07-mesh-geometry/files/40/snappysnapdriver.c--40de51c15316.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappySnapDriverFeature.C](../../../07-mesh-geometry/files/33/snappysnapdriverfeature.c--33ffae06c302.md)
- [src/meshCheck/checkGeometry.C](../../../07-mesh-geometry/files/8e/checkgeometry.c--8eea2af78670.md)
- [src/meshCheck/mergeAndWrite/mergeAndWrite.C](../../../07-mesh-geometry/files/1d/mergeandwrite.c--1d44e2ccb325.md)
- [src/meshTools/algorithms/PatchEdgeFaceWave/PatchEdgeFaceWave.C](../../../07-mesh-geometry/files/40/patchedgefacewave.c--4078323253d5.md)
- [src/meshTools/cellsToCells/cellsToCells/cellsToCells.C](../../../07-mesh-geometry/files/c8/cellstocells.c--c82a949c0928.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMeshTemplates.C](../../../07-mesh-geometry/files/7d/extendededgemeshtemplates.c--7d3b13bf40b0.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedFeatureEdgeMesh/extendedFeatureEdgeMeshTemplates.C](../../../07-mesh-geometry/files/b7/extendedfeatureedgemeshtemplates.c--b758778414e4.md)
- [src/meshTools/meshToMesh/meshToMesh.C](../../../07-mesh-geometry/files/92/meshtomesh.c--925d1dc4c86b.md)
- [src/meshTools/searchableSurfaces/searchableSurfaceList/searchableSurfaceList.C](../../../07-mesh-geometry/files/a4/searchablesurfacelist.c--a436aed7b9fa.md)
- [src/meshTools/searchableSurfaces/triSurface/triSurface_searchableSurface.C](../../../07-mesh-geometry/files/28/trisurface_searchablesurface.c--289598fc3174.md)
- [src/meshTools/triSurface/triSurfaceSearch/triSurfaceRegionSearch.C](../../../07-mesh-geometry/files/88/trisurfaceregionsearch.c--88d114064d3d.md)
- [src/meshTools/triSurface/triSurfaceSearch/triSurfaceSearch.C](../../../07-mesh-geometry/files/1d/trisurfacesearch.c--1d6e3677b4aa.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
