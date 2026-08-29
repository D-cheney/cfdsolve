---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3ce82737dc41"
title: "OpenFOAM 14 源码解析：fvMesh.H"
summary: "该文件声明或实现 `fvMeshLduAddressing`、`fvMeshStitcher`、`fvMeshTopoChanger`、`fvMeshDistributor`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/fvMesh.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/fvMesh.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：770 行
- 文件标识：`3ce82737dc41`

## 2. 功能说明

该文件声明或实现 `fvMeshLduAddressing`、`fvMeshStitcher`、`fvMeshTopoChanger`、`fvMeshDistributor`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Mesh data needed to do the Finite Volume discretisation. NOTE ON USAGE: fvMesh contains all the topological and geometric information related to the mesh. It is also responsible for keeping the data up-to-date. This is done by deleting the cell volume, face area, cell/face centre, addressing and other derived information as required and recalculating it as necessary. The fvMesh therefore reserves the right to delete the derived information upon every topological (mesh refinement/morphing) or geometric change (mesh motion). It is therefore unsafe to keep local references to the derived data outside of the time loop.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMeshLduAddressing` | 77 |
| `fvMeshStitcher` | 79 |
| `fvMeshTopoChanger` | 80 |
| `fvMeshDistributor` | 81 |
| `fvMeshMover` | 82 |
| `fvMesh` | 83 |
| `polyDistributionMap` | 84 |
| `UCompactListList` | 85 |
| `list` | 91 |
| `GeoField` | 249 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `size` | 475 |
| `topoChanged` | 625 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`surfaceMesh.H`](../../../05-finite-volume/files/13/surfacemesh.h--130b4e27ae72.md)
- [`lduMesh.H`](../../../04-core-runtime/files/68/ldumesh.h--68b7fe5a0955.md)
- [`primitiveMesh.H`](../../../04-core-runtime/files/18/primitivemesh.h--18af96254eb4.md)
- [`fvBoundaryMesh.H`](../../../05-finite-volume/files/36/fvboundarymesh.h--365c80b588f3.md)
- [`surfaceInterpolation.H`](../../../05-finite-volume/files/ff/surfaceinterpolation.h--ffc848211fd7.md)
- [`fvSchemes.H`](../../../05-finite-volume/files/70/fvschemes.h--70913b9c0154.md)
- [`fvSolution.H`](../../../05-finite-volume/files/11/fvsolution.h--1103a3cc88ff.md)
- [`DimensionedField.H`](../../../05-finite-volume/files/5d/dimensionedfield.h--5d3e98805c1c.md)
- [`SlicedDimensionedField.H`](../../../05-finite-volume/files/93/sliceddimensionedfield.h--93f3d27b510e.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`surfaceFieldsFwd.H`](../../../05-finite-volume/files/e4/surfacefieldsfwd.h--e4d506ea371b.md)
- [`pointFieldsFwd.H`](../../../05-finite-volume/files/55/pointfieldsfwd.h--55dc00cdab43.md)
- [`slicedVolFieldsFwd.H`](../../../05-finite-volume/files/09/slicedvolfieldsfwd.h--09d89705b9d6.md)
- [`slicedSurfaceFieldsFwd.H`](../../../05-finite-volume/files/e3/slicedsurfacefieldsfwd.h--e3054bde8f7b.md)
- [`className.H`](../../../04-core-runtime/files/50/classname.h--5030be164aba.md)
- [`surfaceMeshI.H`](../../../05-finite-volume/files/ac/surfacemeshi.h--acee8728823d.md)
- [`fvMeshTemplates.C`](../../../05-finite-volume/files/55/fvmeshtemplates.c--555e3258bff0.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/ignition/ignition.C](../../../17-other-libraries/files/f7/ignition.c--f798469fb517.md)
- [applications/legacy/electromagnetics/electrostaticFoam/electrostaticFoam.C](../../../17-other-libraries/files/3c/electrostaticfoam.c--3cb4b1ff424a.md)
- [applications/modules/compressibleVoF/fvModels/VoFSolidificationMelting/VoFSolidificationMelting.H](../../../02-solver-modules/files/c1/vofsolidificationmelting.h--c192c92cd8c4.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/wallDependentModel/wallDependentModel.H](../../../02-solver-modules/files/ce/walldependentmodel.h--cedbecffabee.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFields/groupProperty/groupPropertyFvScalarField.H](../../../02-solver-modules/files/9d/grouppropertyfvscalarfield.h--9d4871a690c3.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/kernelShape/kernelShape.H](../../../02-solver-modules/files/12/kernelshape.h--12e9d69f4adf.md)
- [applications/test/extendedStencil/Test-ExtendedStencil.C](../../../17-other-libraries/files/2e/test-extendedstencil.c--2e56f48f3c1d.md)
- [applications/test/extendedStencil/Test-ExtendedStencil2.C](../../../17-other-libraries/files/ac/test-extendedstencil2.c--ac65887ba595.md)
- [applications/test/fieldMapping/Test-fieldMapping.C](../../../17-other-libraries/files/4a/test-fieldmapping.c--4af4581d46e7.md)
- [applications/test/findCell-octree/Test-findCell-octree.C](../../../17-other-libraries/files/15/test-findcell-octree.c--15af0899b985.md)
- [applications/test/findSphereFeatureEdges-octree/Test-findSphereFeatureEdges-octree.C](../../../17-other-libraries/files/b5/test-findspherefeatureedges-octree.c--b58ed669110c.md)
- [applications/test/fvMeshStitcher/Test-fvMeshStitcher.C](../../../17-other-libraries/files/00/test-fvmeshstitcher.c--002ce6400a1e.md)
- [applications/test/mappedPatch/Test-mappedPatch.C](../../../17-other-libraries/files/d0/test-mappedpatch.c--d0f3d30a88d2.md)
- [applications/test/mesh/Test-mesh.C](../../../17-other-libraries/files/ae/test-mesh.c--ae44d1e4a84b.md)
- [applications/test/passiveParticle/Test-passiveParticle.C](../../../17-other-libraries/files/5a/test-passiveparticle.c--5a3b5bee01b4.md)
- [applications/test/PatchEdgeFaceWave/Test-PatchEdgeFaceWave.C](../../../17-other-libraries/files/45/test-patchedgefacewave.c--4583e7e89147.md)
- [applications/test/PatchTools/Test-PatchTools.C](../../../17-other-libraries/files/af/test-patchtools.c--af9a7ccf8164.md)
- [applications/test/pointField/Test-PointField.C](../../../17-other-libraries/files/24/test-pointfield.c--24712fa9f8da.md)
- [applications/test/router/Test-processorRouter.C](../../../17-other-libraries/files/0e/test-processorrouter.c--0e75e1f897d3.md)
- [applications/test/wallDist/Test-wallDist.C](../../../17-other-libraries/files/b6/test-walldist.c--b66a68804754.md)
- [applications/utilities/mesh/advanced/collapseEdges/collapseEdges.C](../../../03-utilities/files/48/collapseedges.c--485ee63a7a94.md)
- [applications/utilities/mesh/advanced/refinementLevel/refinementLevel.C](../../../03-utilities/files/35/refinementlevel.c--35272bfd7625.md)
- [applications/utilities/mesh/conversion/foamMeshToFluent/fluentFvMesh.H](../../../03-utilities/files/e1/fluentfvmesh.h--e1a61f512802.md)
- [applications/utilities/mesh/conversion/Optional/ccm26ToFoam/ccm26ToFoam.C](../../../03-utilities/files/cd/ccm26tofoam.c--cdfcce35ed8b.md)
- [applications/utilities/mesh/generation/extrudeMesh/extrudeMesh.C](../../../03-utilities/files/c8/extrudemesh.c--c85ecbc45ccd.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
