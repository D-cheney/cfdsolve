---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2c72c12e6e17"
title: "OpenFOAM 14 源码解析：distributionMap.H"
summary: "该文件声明或实现 `globalIndexAndTransform`、`distributionMap`、`transform`、`Container`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyDistributionMap/distributionMap.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：distributionMap.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyDistributionMap/distributionMap.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：667 行
- 文件标识：`2c72c12e6e17`

## 2. 功能说明

该文件声明或实现 `globalIndexAndTransform`、`distributionMap`、`transform`、`Container`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Class containing processor-to-processor mapping information. We store mapping from the bits-to-send to the complete starting list (subXXXMap) and from the received bits to their location in the new list (constructXXXMap). Schedule is a list of processor pairs (one send, one receive. One of them will be myself) which forms a scheduled (i.e. non-buffered) exchange. See distribute on how to use it. Note2: number of items sent on one processor have to equal the number of items received on the other processor. To aid constructing these maps there are the constructors from global numbering, either with or without transforms. - without transforms: Constructors using compact numbering: layout is - all my own elements first (whether used or not) - followed by used-only remote elements sorted by remote processor. So e.g 4 procs and on proc 1 the compact table will first have all globalIndex.localS

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `globalIndexAndTransform` | 148 |
| `distributionMap` | 153 |
| `transform` | 210 |
| `Container` | 257 |
| `transformPosition` | 269 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `operator` | 215 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`distributionMapBase.H`](../../../04-core-runtime/files/d5/distributionmapbase.h--d5c749aa999f.md)
- [`transformer.H`](../../../04-core-runtime/files/a9/transformer.h--a93fc1ec30f1.md)
- [`coupledPolyPatch.H`](../../../04-core-runtime/files/8b/coupledpolypatch.h--8b491e684549.md)
- [`EdgeMap.H`](../../../04-core-runtime/files/05/edgemap.h--059471dfcf16.md)
- [`distributionMapTemplates.C`](../../../04-core-runtime/files/d9/distributionmaptemplates.c--d9f971a1ce68.md)

## 8. 直接上层引用

- [applications/test/globalMeshData/Test-globalMeshData.C](../../../17-other-libraries/files/58/test-globalmeshdata.c--58e9c0f472e3.md)
- [applications/test/parallel-nonBlocking/Test-parallel-nonBlocking.C](../../../17-other-libraries/files/4f/test-parallel-nonblocking.c--4f2df640a6e6.md)
- [applications/test/parallel/Test-parallel.C](../../../17-other-libraries/files/d3/test-parallel.c--d3dee993bb44.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsight/ensightMesh.C](../../../03-utilities/files/a7/ensightmesh.c--a778f6731f98.md)
- [applications/utilities/surface/surfaceRedistributePar/surfaceRedistributePar.C](../../../03-utilities/files/5c/surfaceredistributepar.c--5c7950ca913c.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToCell/extendedCellToCellStencil.H](../../../05-finite-volume/files/3d/extendedcelltocellstencil.h--3d35f2554a6b.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToCell/extendedCentredCellToCellStencil.C](../../../05-finite-volume/files/6c/extendedcentredcelltocellstencil.c--6c3125d76bf1.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/extendedCellToFaceStencil.H](../../../05-finite-volume/files/de/extendedcelltofacestencil.h--de520d120da2.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/extendedCentredCellToFaceStencil.C](../../../05-finite-volume/files/f7/extendedcentredcelltofacestencil.c--f70298347198.md)
- [src/finiteVolume/fvMesh/extendedStencil/faceToCell/extendedCentredFaceToCellStencil.C](../../../05-finite-volume/files/b1/extendedcentredfacetocellstencil.c--b178f4db84ea.md)
- [src/finiteVolume/fvMesh/extendedStencil/faceToCell/extendedFaceToCellStencil.H](../../../05-finite-volume/files/b5/extendedfacetocellstencil.h--b5c2e362b27b.md)
- [src/meshTools/cellsToCells/cellsToCells/cellsToCells.H](../../../07-mesh-geometry/files/95/cellstocells.h--952adc8844fa.md)
- [src/meshTools/mappedPatches/mappedInternalPatchBase/mappedInternalPatchBase.H](../../../07-mesh-geometry/files/15/mappedinternalpatchbase.h--15ccf2937d62.md)
- [src/meshTools/patchToPatch/patchToPatch/patchToPatch.C](../../../07-mesh-geometry/files/8a/patchtopatch.c--8abbb58f95c6.md)
- [src/meshTools/patchToPatch/patchToPatch/patchToPatch.H](../../../07-mesh-geometry/files/08/patchtopatch.h--08d6ca742155.md)
- [src/meshTools/patchToPatchTools/patchToPatchTools.H](../../../07-mesh-geometry/files/84/patchtopatchtools.h--84e4c229c681.md)
- [src/OpenFOAM/matrices/lduMatrix/solvers/GAMG/GAMGAgglomerations/GAMGAgglomeration/GAMGAgglomerationTemplates.C](../../../06-linear-algebra/files/21/gamgagglomerationtemplates.c--21ee17b32185.md)
- [src/OpenFOAM/meshes/polyMesh/globalMeshData/globalMeshData.C](../../../04-core-runtime/files/6f/globalmeshdata.c--6f552c644673.md)
- [src/OpenFOAM/meshes/polyMesh/globalMeshData/globalMeshDataTemplates.C](../../../04-core-runtime/files/ea/globalmeshdatatemplates.c--ea9db10e986f.md)
- [src/OpenFOAM/meshes/polyMesh/globalMeshData/globalPoints.C](../../../04-core-runtime/files/8b/globalpoints.c--8bed96bf51c7.md)
- [src/OpenFOAM/meshes/polyMesh/polyDistributionMap/distributionMap.C](../../../04-core-runtime/files/e9/distributionmap.c--e995f1e2ff03.md)
- [src/OpenFOAM/meshes/polyMesh/polyDistributionMap/IOdistributionMap.H](../../../04-core-runtime/files/01/iodistributionmap.h--014898bf43ad.md)
- [src/OpenFOAM/meshes/polyMesh/polyDistributionMap/lagrangianDistributionMap.H](../../../04-core-runtime/files/66/lagrangiandistributionmap.h--6665957691b5.md)
- [src/OpenFOAM/meshes/polyMesh/polyDistributionMap/polyDistributionMap.H](../../../04-core-runtime/files/1d/polydistributionmap.h--1d3a143688db.md)
- [src/OpenFOAM/meshes/polyMesh/syncTools/syncTools.H](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
