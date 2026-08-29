---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9ad3af9fe142"
title: "OpenFOAM 14 源码解析：polyTopoChangeMap.H"
summary: "该文件声明或实现 `polyMesh`、`polyTopoChangeMap`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyTopoChangeMap/polyTopoChangeMap.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：polyTopoChangeMap.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyTopoChangeMap/polyTopoChangeMap.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：477 行
- 文件标识：`9ad3af9fe142`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyTopoChangeMap`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Class containing mesh-to-mesh mapping information after a change in polyMesh topology. General: - pointMap/faceMap/cellMap: \n from current mesh back to previous mesh. (so to 'pull' the information onto the current mesh) - reversePointMap/faceMap/cellMap: \n from previous mesh to current. (so to 'push' information) In the topology change points/faces/cells - can be unchanged. (faces might be renumbered though) - can be removed (into nothing) - can be removed into/merged with existing same entity (so point merged with other point, face with other face, cell with other cell. Note that probably only cell with cell is relevant) - can be added from existing same 'master' entity (so point from point, face from face and cell from cell) - can be appended: added 'out of nothing'. All this information is necessary to correctly map fields. \par points - unchanged: - pointMap[pointi] contains old po

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 125 |
| `polyTopoChangeMap` | 131 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `nOldPoints` | 253 |
| `nOldInternalFaces` | 259 |
| `nOldFaces` | 265 |
| `nOldCells` | 271 |
| `mergedPoint` | 330 |
| `mergedFace` | 361 |
| `mergedCell` | 392 |
| `hasOldCellVolumes` | 450 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`objectMap.H`](../../../04-core-runtime/files/e1/objectmap.h--e15614fcdabc.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/functionObjects/populationBalanceSizeDistribution/populationBalanceSizeDistribution.C](../../../02-solver-modules/files/6c/populationbalancesizedistribution.c--6c9ba4365b5b.md)
- [applications/test/fieldMapping/Test-fieldMapping.C](../../../17-other-libraries/files/4a/test-fieldmapping.c--4af4581d46e7.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/topoSets/cellZoneSet.C](../../../03-utilities/files/38/cellzoneset.c--38d7560bb1ff.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/topoSets/faceZoneSet.C](../../../03-utilities/files/56/facezoneset.c--561f4ef278dd.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/topoSets/pointZoneSet.C](../../../03-utilities/files/10/pointzoneset.c--10226f7998c8.md)
- [applications/utilities/mesh/advanced/combinePatchFaces/combinePatchFaces.C](../../../03-utilities/files/b5/combinepatchfaces.c--b574ad8fad04.md)
- [applications/utilities/mesh/advanced/splitCells/splitCells.C](../../../03-utilities/files/2f/splitcells.c--2f7c73e3ee10.md)
- [applications/utilities/mesh/manipulation/mergeMeshes/mergePolyMesh.C](../../../03-utilities/files/29/mergepolymesh.c--292f1be23b74.md)
- [applications/utilities/mesh/manipulation/mirrorMesh/mirrorMesh.C](../../../03-utilities/files/14/mirrormesh.c--14ecc6775225.md)
- [applications/utilities/mesh/manipulation/polyDualMesh/meshDualiser.C](../../../03-utilities/files/fb/meshdualiser.c--fb57e8a46cc8.md)
- [applications/utilities/mesh/manipulation/polyDualMesh/polyDualMesh.C](../../../03-utilities/files/9a/polydualmesh.c--9a25d496f593.md)
- [applications/utilities/mesh/manipulation/subsetMesh/subsetMesh.C](../../../03-utilities/files/05/subsetmesh.c--05905647986f.md)
- [src/finiteVolume/cfdTools/general/MRF/MRFZone.C](../../../05-finite-volume/files/5d/mrfzone.c--5d7f3845929c.md)
- [src/finiteVolume/fvMesh/fvMesh.C](../../../05-finite-volume/files/5f/fvmesh.c--5fa1db101175.md)
- [src/finiteVolume/fvMesh/fvMeshMapper/fvPatchMapper.C](../../../05-finite-volume/files/2d/fvpatchmapper.c--2dfad9c60790.md)
- [src/finiteVolume/fvMesh/fvMeshMapper/fvSurfaceMapper.C](../../../05-finite-volume/files/93/fvsurfacemapper.c--935d98f59e21.md)
- [src/finiteVolume/fvMesh/fvMeshMapper/fvSurfaceMapper.H](../../../05-finite-volume/files/1d/fvsurfacemapper.h--1d2b0fbe7eaa.md)
- [src/finiteVolume/fvMesh/fvMeshStitchers/fvMeshStitcher/fvMeshStitcher.C](../../../05-finite-volume/files/1b/fvmeshstitcher.c--1b99736895d7.md)
- [src/finiteVolume/fvMesh/fvMeshTopoChangers/list/list_fvMeshTopoChanger.C](../../../05-finite-volume/files/35/list_fvmeshtopochanger.c--35db63a229ca.md)
- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/patchDistMethod/patchDistMethod.H](../../../05-finite-volume/files/f7/patchdistmethod.h--f75c6ffc5601.md)
- [src/finiteVolume/pointMesh/pointMeshMapper/pointMapper.C](../../../05-finite-volume/files/40/pointmapper.c--40944d9a79e7.md)
- [src/finiteVolume/pointMesh/pointMeshMapper/pointPatchMapper.C](../../../05-finite-volume/files/c8/pointpatchmapper.c--c89f8e71c2bd.md)
- [src/functionObjects/field/cutLayerAverage/cutLayerAverage.C](../../../14-postprocessing/files/a0/cutlayeraverage.c--a027223cec90.md)
- [src/functionObjects/field/fieldValues/surfaceFieldValue/surfaceFieldValue.C](../../../14-postprocessing/files/0d/surfacefieldvalue.c--0db15651c985.md)
- [src/functionObjects/field/fieldValues/volFieldValue/volFieldValue.C](../../../14-postprocessing/files/32/volfieldvalue.c--32d20e9db19e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
