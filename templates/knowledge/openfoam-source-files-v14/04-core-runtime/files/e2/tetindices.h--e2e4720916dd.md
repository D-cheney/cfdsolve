---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e2e4720916dd"
title: "OpenFOAM 14 源码解析：tetIndices.H"
summary: "该文件声明或实现 `tetIndices`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyMeshTetDecomposition/tetIndices.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：tetIndices.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyMeshTetDecomposition/tetIndices.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：195 行
- 文件标识：`e2e4720916dd`

## 2. 功能说明

该文件声明或实现 `tetIndices`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Storage and named access for the indices of a tet which is part of the decomposition of a cell. Tets are designated by - cell (of course) - face on cell - three points on face (faceBasePt, facePtA, facePtB) When constructing from a mesh and index in the face (tetPtI): - faceBasePt is the mesh.tetBasePtIs() base point - facePtA is tetPtI away from faceBasePt - facePtB is next one after/before facePtA e.g.: +---+ |2 /| | / | |/ 1| <- tetPt (so 1 for first triangle, 2 for second) +---+ ^ faceBasePt

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `tetIndices` | 77 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`label.H`](../../../04-core-runtime/files/a8/label.h--a882f8e92b47.md)
- [`tetPointRef.H`](../../../04-core-runtime/files/07/tetpointref.h--0775a6ebfe8f.md)
- [`triPointRef.H`](../../../04-core-runtime/files/b0/tripointref.h--b095b5632b50.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`triFace.H`](../../../04-core-runtime/files/6a/triface.h--6a1e567bfca7.md)
- [`face.H`](../../../04-core-runtime/files/bc/face.h--bc0ffa4a6982.md)
- [`tetIndicesI.H`](../../../04-core-runtime/files/10/tetindicesi.h--105654fc5667.md)

## 8. 直接上层引用

- [src/finiteVolume/cfdTools/general/levelSet/levelSet.C](../../../05-finite-volume/files/5d/levelset.c--5dbd7beb1d0e.md)
- [src/finiteVolume/cfdTools/general/levelSet/levelSetTemplates.C](../../../05-finite-volume/files/ab/levelsettemplates.c--abb4f90808f4.md)
- [src/finiteVolume/interpolation/interpolation/interpolation/interpolation.H](../../../05-finite-volume/files/81/interpolation.h--8143f5455db1.md)
- [src/Lagrangian/cloud/LagrangianModels/patchInjection/patchInjection.C](../../../11-lagrangian/files/05/patchinjection.c--05780d465db9.md)
- [src/Lagrangian/cloud/LagrangianModels/volumeInjection/volumeInjection.C](../../../11-lagrangian/files/0f/volumeinjection.c--0f89648a7923.md)
- [src/lagrangian/DSMC/submodels/InflowBoundaryModel/FreeStream/FreeStream.C](../../../11-lagrangian/files/5f/freestream.c--5f6953fc141d.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianAccumulationSchemes/cellPoint/cellPointLagrangianAccumulatorTemplates.C](../../../11-lagrangian/files/e1/cellpointlagrangianaccumulatortemplates.c--e17f8d7f5ef2.md)
- [src/Lagrangian/Lagrangian/LagrangianAverage/cellPoint/cellPoint_LagrangianAverage.C](../../../11-lagrangian/files/cc/cellpoint_lagrangianaverage.c--cce15a5e0603.md)
- [src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/PatchInteractionModel/PatchInteractionModel.H](../../../11-lagrangian/files/39/patchinteractionmodel.h--3999daf63838.md)
- [src/lagrangian/parcel/submodels/MPPIC/AveragingMethods/AveragingMethod/AveragingMethod.H](../../../11-lagrangian/files/26/averagingmethod.h--26e9862a39c6.md)
- [src/lagrangian/parcel/submodels/MPPIC/AveragingMethods/Basic/Basic.H](../../../11-lagrangian/files/b1/basic.h--b106d69ba8df.md)
- [src/lagrangian/parcel/submodels/MPPIC/AveragingMethods/Dual/Dual.H](../../../11-lagrangian/files/2e/dual.h--2e444d4cc4f2.md)
- [src/OpenFOAM/meshes/polyMesh/polyMeshTetDecomposition/polyMeshTetDecomposition.H](../../../04-core-runtime/files/35/polymeshtetdecomposition.h--3533db67d602.md)
- [src/OpenFOAM/meshes/polyMesh/polyMeshTetDecomposition/tetIndices.C](../../../04-core-runtime/files/91/tetindices.c--91d603a6cad4.md)
- [src/OpenFOAM/meshes/polyMesh/polyMeshTetDecomposition/tetIndicesI.H](../../../04-core-runtime/files/10/tetindicesi.h--105654fc5667.md)
- [src/sampling/sampledSet/boundaryRandom/boundaryRandom.C](../../../14-postprocessing/files/f2/boundaryrandom.c--f2bf115a26eb.md)
- [src/tracking/trackingI.H](../../../17-other-libraries/files/eb/trackingi.h--eb12896e9d24.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
