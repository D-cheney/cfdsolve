---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3f1816147c33"
title: "OpenFOAM 14 源码解析：globalIndex.H"
summary: "该文件声明或实现 `globalIndex`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/globalMeshData/globalIndex.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：globalIndex.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/globalMeshData/globalIndex.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：277 行
- 文件标识：`3f1816147c33`

## 2. 功能说明

该文件声明或实现 `globalIndex`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Calculates a unique integer (label so might not have enough room - 2G max) for processor + local index. E.g. globalIndex globalFaces(mesh.nFaces()); label globalFacei = globalFaces.toGlobal(facei);

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `globalIndex` | 59 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `gather` | 177 |
| `scatter` | 237 |

## 5. 算法与控制流程

1. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Pstream.H`](../../../04-core-runtime/files/2f/pstream.h--2f930fcee072.md)
- [`globalIndexTemplates.C`](../../../04-core-runtime/files/2c/globalindextemplates.c--2c41bbe5f00a.md)
- [`globalIndexI.H`](../../../04-core-runtime/files/c2/globalindexi.h--c2e0a2880398.md)

## 8. 直接上层引用

- [applications/test/globalIndex/Test-globalIndex.C](../../../17-other-libraries/files/ff/test-globalindex.c--ffcf3fa16899.md)
- [applications/test/patchRegion/Test-patchRegion.C](../../../17-other-libraries/files/aa/test-patchregion.c--aa21ce819eaf.md)
- [applications/utilities/mesh/generation/extrude2DMesh/extrude2DMesh.C](../../../03-utilities/files/46/extrude2dmesh.c--46db24f754eb.md)
- [applications/utilities/mesh/generation/extrudeMesh/extrudeMesh.C](../../../03-utilities/files/c8/extrudemesh.c--c85ecbc45ccd.md)
- [applications/utilities/parallelProcessing/redistributePar/redistributePar.C](../../../03-utilities/files/34/redistributepar.c--3437e376b409.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsight/ensightField.C](../../../03-utilities/files/66/ensightfield.c--66b8c7b2d7e1.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsight/ensightMesh.C](../../../03-utilities/files/a7/ensightmesh.c--a778f6731f98.md)
- [applications/utilities/preProcessing/faceAgglomerate/faceAgglomerate.C](../../../03-utilities/files/06/faceagglomerate.c--0676c78885e7.md)
- [applications/utilities/surface/surfaceMeshTriangulate/surfaceMeshTriangulate.C](../../../03-utilities/files/70/surfacemeshtriangulate.c--7010d3f6111a.md)
- [src/finiteVolume/fields/fvPatchFields/derived/externalCoupledMixed/externalCoupledMixedFvPatchField.C](../../../05-finite-volume/files/2f/externalcoupledmixedfvpatchfield.c--2fd521aa3e73.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToCell/globalIndexStencils/cellToCellStencil.H](../../../05-finite-volume/files/8b/celltocellstencil.h--8b94482f31e3.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/extendedCellToFaceStencil.C](../../../05-finite-volume/files/1f/extendedcelltofacestencil.c--1faba71486fc.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/globalIndexStencils/cellToFaceStencil.H](../../../05-finite-volume/files/76/celltofacestencil.h--76d7e6f36247.md)
- [src/finiteVolume/fvMesh/extendedStencil/faceToCell/globalIndexStencils/faceToCellStencil.H](../../../05-finite-volume/files/6c/facetocellstencil.h--6c38284cd372.md)
- [src/finiteVolume/fvMesh/fvMeshStitchers/fvMeshStitcher/fvMeshStitcher.C](../../../05-finite-volume/files/1b/fvmeshstitcher.c--1b99736895d7.md)
- [src/functionObjects/field/nearWallFields/nearWallFields.C](../../../14-postprocessing/files/b7/nearwallfields.c--b790bbd776fc.md)
- [src/functionObjects/field/streamlines/streamlines.C](../../../14-postprocessing/files/c4/streamlines.c--c407278a704a.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianAccumulationSchemes/cellPoint/cellPointLagrangianAddressor.C](../../../11-lagrangian/files/89/cellpointlagrangianaddressor.c--897d1aefafbd.md)
- [src/lagrangian/parcel/clouds/Templates/SprayCloud/SprayCloud.H](../../../11-lagrangian/files/29/spraycloud.h--29ba341c4c4e.md)
- [src/lagrangian/parcel/submodels/CloudFunctionObjects/FacePostProcessing/FacePostProcessing.C](../../../11-lagrangian/files/08/facepostprocessing.c--08c22996629e.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/CellZoneInjection/CellZoneInjection.C](../../../11-lagrangian/files/13/cellzoneinjection.c--130ab3427c34.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C](../../../07-mesh-geometry/files/38/meshrefinement.c--3812c4bc1bde.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementTemplates.C](../../../07-mesh-geometry/files/54/meshrefinementtemplates.c--54c2c88a2c87.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/refinementParameters/refinementParameters.C](../../../07-mesh-geometry/files/58/refinementparameters.c--584a7b4d8398.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.C](../../../07-mesh-geometry/files/6e/snappylayerdriver.c--6e5dc56e8a5d.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
