---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9f84126e18a8"
title: "OpenFOAM 14 源码解析：cyclicPolyPatch.H"
summary: "该文件声明或实现 `cyclicPolyPatch`、`ownToNbrCyclicOrderData`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/cyclic/cyclicPolyPatch.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：cyclicPolyPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/cyclic/cyclicPolyPatch.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：343 行
- 文件标识：`9f84126e18a8`

## 2. 功能说明

该文件声明或实现 `cyclicPolyPatch`、`ownToNbrCyclicOrderData`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Cyclic plane patch. Note: morph patch face ordering uses geometric matching so with the following restrictions: -coupled patches should be flat planes. -no rotation in patch plane Uses coupledPolyPatch::calcFaceTol to calculate tolerance per face which might need tweaking. Switch on 'cyclicPolyPatch' debug flag to write .obj files to show the matching.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `cyclicPolyPatch` | 70 |
| `ownToNbrCyclicOrderData` | 79 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `transformGlobalFace` | 295 |

## 5. 算法与控制流程

1. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`coupledPolyPatch.H`](../../../04-core-runtime/files/8b/coupledpolypatch.h--8b491e684549.md)
- [`cyclicTransform.H`](../../../04-core-runtime/files/93/cyclictransform.h--93e7df8d3e18.md)
- [`edgeList.H`](../../../04-core-runtime/files/04/edgelist.h--04a5bb284762.md)
- [`polyBoundaryMesh.H`](../../../04-core-runtime/files/55/polyboundarymesh.h--55eed959a136.md)
- [`diagTensorField.H`](../../../04-core-runtime/files/e6/diagtensorfield.h--e6affbc6eec2.md)
- [`coupleGroupIdentifier.H`](../../../04-core-runtime/files/d8/couplegroupidentifier.h--d8704a18101d.md)

## 8. 直接上层引用

- [applications/utilities/deprecated/topoSet/topoSetSources/topoSets/pointZoneSet.C](../../../03-utilities/files/10/pointzoneset.c--10226f7998c8.md)
- [applications/utilities/mesh/conversion/fluent3DMeshToFoam/fluent3DMeshToFoam.L](../../../03-utilities/files/12/fluent3dmeshtofoam.l--129276eff7c8.md)
- [applications/utilities/mesh/generation/blockMesh/blockMesh.C](../../../03-utilities/files/4c/blockmesh.c--4cd46440d1d3.md)
- [applications/utilities/mesh/generation/extrudeToRegionMesh/extrudeToRegionMesh.C](../../../03-utilities/files/3d/extrudetoregionmesh.c--3d777298811a.md)
- [applications/utilities/mesh/manipulation/createPatch/createPatch.C](../../../03-utilities/files/14/createpatch.c--140367ac7497.md)
- [src/conversion/mergedCyclic/polyMeshUnMergeCyclics.C](../../../17-other-libraries/files/ae/polymeshunmergecyclics.c--ae0858b59589.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/cyclic/cyclicFvPatch.H](../../../05-finite-volume/files/dd/cyclicfvpatch.h--ddbbe2353ea1.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/cyclic/cyclicPointPatch.H](../../../05-finite-volume/files/04/cyclicpointpatch.h--0466134d5867.md)
- [src/lagrangian/basic/particle/particleTemplates.C](../../../11-lagrangian/files/73/particletemplates.c--73e94845b546.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/cyclic/cyclicLagrangianPatch.H](../../../11-lagrangian/files/6f/cycliclagrangianpatch.h--6f92d7b32d04.md)
- [src/mesh/blockMesh/blockMesh/blockMeshTopology.C](../../../07-mesh-geometry/files/fc/blockmeshtopology.c--fcfdb6a0bfe3.md)
- [src/meshTools/algorithms/FaceCellWave/FaceCellWave.C](../../../07-mesh-geometry/files/2c/facecellwave.c--2c9cb85bfb1b.md)
- [src/meshTools/algorithms/PointEdgeWave/PointEdgeWave.C](../../../07-mesh-geometry/files/b2/pointedgewave.c--b262a71dbe03.md)
- [src/meshTools/nonConformal/polyPatches/nonConformal/nonConformalPolyPatch.H](../../../07-mesh-geometry/files/50/nonconformalpolypatch.h--50e688b5a483.md)
- [src/meshTools/nonConformal/polyPatches/nonConformalCoupled/nonConformalCoupledPolyPatch.H](../../../07-mesh-geometry/files/99/nonconformalcoupledpolypatch.h--99f481a588ec.md)
- [src/meshTools/nonConformal/polyPatches/nonConformalCyclic/nonConformalCyclicPolyPatch.H](../../../07-mesh-geometry/files/65/nonconformalcyclicpolypatch.h--65e4405a8265.md)
- [src/meshTools/regionSplit/regionSplit.C](../../../07-mesh-geometry/files/32/regionsplit.c--325739a932a7.md)
- [src/OpenFOAM/meshes/polyMesh/globalMeshData/globalPoints.C](../../../04-core-runtime/files/8b/globalpoints.c--8bed96bf51c7.md)
- [src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/cyclic/cyclicPolyPatch.C](../../../04-core-runtime/files/bb/cyclicpolypatch.c--bb6f96621fd6.md)
- [src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/cyclicSlip/cyclicSlipPolyPatch.H](../../../04-core-runtime/files/18/cyclicslippolypatch.h--18cc2469119a.md)
- [src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/processorCyclic/processorCyclicPolyPatch.C](../../../04-core-runtime/files/f2/processorcyclicpolypatch.c--f266485a4917.md)
- [src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/processorCyclic/processorCyclicPolyPatch.H](../../../04-core-runtime/files/e4/processorcyclicpolypatch.h--e4e5ec311bce.md)
- [src/OpenFOAM/meshes/polyMesh/syncTools/syncToolsTemplates.C](../../../04-core-runtime/files/6f/synctoolstemplates.c--6f01fe0e5367.md)
- [src/OpenFOAM/primitives/globalIndexAndTransform/globalIndexAndTransform.C](../../../04-core-runtime/files/d4/globalindexandtransform.c--d4e449df8a00.md)
- [src/polyTopoChange/fvMeshSubset/fvMeshSubset.C](../../../07-mesh-geometry/files/34/fvmeshsubset.c--3471dd3106ae.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
