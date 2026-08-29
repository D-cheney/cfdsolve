---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c7a6bf9a1fa2"
title: "OpenFOAM 14 源码解析：globalMeshData.H"
summary: "该文件声明或实现 `polyMesh`、`distributionMap`、`EdgeMap`、`globalIndex`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/globalMeshData/globalMeshData.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：globalMeshData.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/globalMeshData/globalMeshData.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：654 行
- 文件标识：`c7a6bf9a1fa2`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`distributionMap`、`EdgeMap`、`globalIndex`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Various mesh related information for a parallel run. Upon construction, constructs all info using parallel communication. Requires: - all processor patches to have correct ordering. - all processorPatches to have their transforms set. The shared point and edge addressing calculates addressing for points and edges on coupled patches. In the 'old' way a distinction was made between points/edges that are only on two processors and those that are on multiple processors. The problem is that those on multiple processors do not allow any transformations and require a global reduction on the master processor. The alternative is to have an exchange schedule (through a 'distributionMap') which sends all point/edge data (no distinction is made between those on two and those on more than two coupled patches) to the local 'master'. This master then does any calculation and sends the result back to th

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 101 |
| `distributionMap` | 103 |
| `EdgeMap` | 104 |
| `globalIndex` | 105 |
| `globalIndexAndTransform` | 106 |
| `PackedBoolList` | 107 |
| `globalMeshData` | 112 |
| `ListPlusEqOp` | 322 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `operator` | 327 |
| `parallel` | 380 |
| `nTotalPoints` | 387 |
| `nTotalFaces` | 394 |
| `nTotalCells` | 400 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`processorTopology.H`](../../../04-core-runtime/files/ae/processortopology.h--aec6878e3ab1.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)
- [`indirectPrimitivePatch.H`](../../../04-core-runtime/files/ab/indirectprimitivepatch.h--ab8f04d3f0d8.md)
- [`globalMeshDataTemplates.C`](../../../04-core-runtime/files/ea/globalmeshdatatemplates.c--ea9db10e986f.md)

## 8. 直接上层引用

- [applications/test/globalMeshData/Test-globalMeshData.C](../../../17-other-libraries/files/58/test-globalmeshdata.c--58e9c0f472e3.md)
- [applications/utilities/deprecated/topoSet/topoSet.C](../../../03-utilities/files/be/toposet.c--be4f2cd4c3af.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/targetVolumeToCell/targetVolumeToCell.C](../../../03-utilities/files/e6/targetvolumetocell.c--e67bdaf2abfe.md)
- [applications/utilities/mesh/advanced/selectCells/selectCells.C](../../../03-utilities/files/2d/selectcells.c--2d96d40d84b3.md)
- [applications/utilities/mesh/manipulation/checkMesh/checkMesh.C](../../../03-utilities/files/db/checkmesh.c--dbfffe8b27fb.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsight/ensightMesh.C](../../../03-utilities/files/a7/ensightmesh.c--a778f6731f98.md)
- [applications/utilities/surface/surfaceMeshTriangulate/surfaceMeshTriangulate.C](../../../03-utilities/files/70/surfacemeshtriangulate.c--7010d3f6111a.md)
- [applications/utilities/surface/surfaceToPatch/surfaceToPatch.C](../../../03-utilities/files/ed/surfacetopatch.c--edf5bace5e40.md)
- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricBoundaryField.C](../../../05-finite-volume/files/95/geometricboundaryfield.c--95bac8ffd44f.md)
- [src/finiteVolume/interpolation/volPointInterpolation/pointConstraints.C](../../../05-finite-volume/files/20/pointconstraints.c--20082c9a9e51.md)
- [src/finiteVolume/pointMesh/pointBoundaryMesh/pointBoundaryMesh.C](../../../05-finite-volume/files/dc/pointboundarymesh.c--dc4e14d1f38a.md)
- [src/finiteVolume/pointMesh/pointMesh.C](../../../05-finite-volume/files/47/pointmesh.c--472ce4343416.md)
- [src/fvMeshDistributors/loadBalancer/loadBalancer_fvMeshDistributor.C](../../../17-other-libraries/files/27/loadbalancer_fvmeshdistributor.c--2743614737e7.md)
- [src/lagrangian/basic/Cloud/Cloud.C](../../../11-lagrangian/files/bc/cloud.c--bc5dc5c9517f.md)
- [src/meshCheck/mergeAndWrite/mergeAndWrite.C](../../../07-mesh-geometry/files/1d/mergeandwrite.c--1d44e2ccb325.md)
- [src/meshTools/algorithms/FaceCellWave/FaceCellWave.C](../../../07-mesh-geometry/files/2c/facecellwave.c--2c9cb85bfb1b.md)
- [src/meshTools/algorithms/PatchEdgeFaceWave/PatchEdgeFaceWave.C](../../../07-mesh-geometry/files/40/patchedgefacewave.c--4078323253d5.md)
- [src/meshTools/algorithms/PointEdgeWave/PointEdgeWave.C](../../../07-mesh-geometry/files/b2/pointedgewave.c--b262a71dbe03.md)
- [src/meshTools/cellClassification/cellClassification.C](../../../07-mesh-geometry/files/50/cellclassification.c--504eded4b322.md)
- [src/OpenFOAM/meshes/polyMesh/globalMeshData/globalMeshData.C](../../../04-core-runtime/files/6f/globalmeshdata.c--6f552c644673.md)
- [src/OpenFOAM/meshes/polyMesh/globalMeshData/globalMeshDataTemplates.C](../../../04-core-runtime/files/ea/globalmeshdatatemplates.c--ea9db10e986f.md)
- [src/OpenFOAM/meshes/polyMesh/polyBoundaryMesh/polyBoundaryMesh.C](../../../04-core-runtime/files/0f/polyboundarymesh.c--0f9173e45c8c.md)
- [src/OpenFOAM/meshes/polyMesh/polyMesh.C](../../../04-core-runtime/files/44/polymesh.c--4420b33f414e.md)
- [src/OpenFOAM/meshes/polyMesh/polyMeshClear.C](../../../04-core-runtime/files/f8/polymeshclear.c--f8efbf4b9e0b.md)
- [src/OpenFOAM/meshes/polyMesh/polyMeshFromShapeMesh.C](../../../04-core-runtime/files/09/polymeshfromshapemesh.c--0929c3672860.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
