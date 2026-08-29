---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1d3a143688db"
title: "OpenFOAM 14 源码解析：polyDistributionMap.H"
summary: "该文件声明或实现 `polyMesh`、`polyDistributionMap`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyDistributionMap/polyDistributionMap.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：polyDistributionMap.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyDistributionMap/polyDistributionMap.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：286 行
- 文件标识：`1d3a143688db`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyDistributionMap`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Class containing mesh-to-mesh mapping information after a mesh distribution where we send parts of meshes (using subsetting) to other processors and receive and reconstruct mesh. We store mapping from the bits-to-send to the complete starting mesh (subXXXMap) and from the received bits to their location in the new mesh (constructXXXMap).

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 56 |
| `polyDistributionMap` | 60 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `nOldPoints` | 164 |
| `nOldFaces` | 170 |
| `nOldCells` | 176 |
| `distributePointData` | 228 |
| `distributeFaceData` | 235 |
| `distributeCellData` | 242 |
| `distributePatchData` | 249 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`distributionMap.H`](../../../04-core-runtime/files/2c/distributionmap.h--2c72c12e6e17.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/functionObjects/populationBalanceSizeDistribution/populationBalanceSizeDistribution.C](../../../02-solver-modules/files/6c/populationbalancesizedistribution.c--6c9ba4365b5b.md)
- [applications/utilities/parallelProcessing/redistributePar/redistributePar.C](../../../03-utilities/files/34/redistributepar.c--3437e376b409.md)
- [src/finiteVolume/fvMesh/fvMeshStitchers/fvMeshStitcher/fvMeshStitcher.C](../../../05-finite-volume/files/1b/fvmeshstitcher.c--1b99736895d7.md)
- [src/functionObjects/field/cutLayerAverage/cutLayerAverage.C](../../../14-postprocessing/files/a0/cutlayeraverage.c--a027223cec90.md)
- [src/functionObjects/field/fieldValues/surfaceFieldValue/surfaceFieldValue.C](../../../14-postprocessing/files/0d/surfacefieldvalue.c--0db15651c985.md)
- [src/functionObjects/field/fieldValues/volFieldValue/volFieldValue.C](../../../14-postprocessing/files/32/volfieldvalue.c--32d20e9db19e.md)
- [src/functionObjects/field/histogram/histogram.C](../../../14-postprocessing/files/82/histogram.c--82e22970b831.md)
- [src/functionObjects/field/layerAverage/layerAverage.C](../../../14-postprocessing/files/53/layeraverage.c--5348dfa80f98.md)
- [src/functionObjects/field/patchCutLayerAverage/patchCutLayerAverage.C](../../../14-postprocessing/files/51/patchcutlayeraverage.c--51c8d1291fe7.md)
- [src/functionObjects/field/streamlines/streamlines.C](../../../14-postprocessing/files/c4/streamlines.c--c407278a704a.md)
- [src/functionObjects/forces/sectionalForcesBase/sectionalForcesBase.C](../../../14-postprocessing/files/ef/sectionalforcesbase.c--ef6d57e454d5.md)
- [src/fvMeshDistributors/distributor/distributor_fvMeshDistributor.C](../../../17-other-libraries/files/ec/distributor_fvmeshdistributor.c--ec9239b703e0.md)
- [src/lagrangian/basic/Cloud/Cloud.C](../../../11-lagrangian/files/bc/cloud.c--bc5dc5c9517f.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMesh.C](../../../11-lagrangian/files/ea/lagrangianmesh.c--eafb2e318052.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C](../../../07-mesh-geometry/files/38/meshrefinement.c--3812c4bc1bde.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementRefine.C](../../../07-mesh-geometry/files/31/meshrefinementrefine.c--31acf059fb90.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.C](../../../07-mesh-geometry/files/6e/snappylayerdriver.c--6e5dc56e8a5d.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyRefineDriver.C](../../../07-mesh-geometry/files/73/snappyrefinedriver.c--7392231fe379.md)
- [src/meshTools/cutPoly/cellEdgeAddressing.C](../../../07-mesh-geometry/files/b6/celledgeaddressing.c--b60157a70728.md)
- [src/OpenFOAM/meshes/polyMesh/meshObjects/cpuLoad/cpuLoad.C](../../../04-core-runtime/files/92/cpuload.c--922332c17c10.md)
- [src/OpenFOAM/meshes/polyMesh/polyDistributionMap/polyDistributionMap.C](../../../04-core-runtime/files/62/polydistributionmap.c--620532dcf45f.md)
- [src/pointMeshMovers/displacementPoints0/displacementPoints0.C](../../../07-mesh-geometry/files/67/displacementpoints0.c--67ff73be9b8e.md)
- [src/polyTopoChange/fvMeshDistribute/fvMeshDistribute.C](../../../07-mesh-geometry/files/e6/fvmeshdistribute.c--e642c27347c1.md)
- [src/polyTopoChange/polyTopoChange/hexRef8/hexRef8.C](../../../07-mesh-geometry/files/5f/hexref8.c--5fea5dbb8cd1.md)
- [src/polyTopoChange/polyTopoChange/hexRef8/hexRef8Data.C](../../../07-mesh-geometry/files/73/hexref8data.c--7326312406f7.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
