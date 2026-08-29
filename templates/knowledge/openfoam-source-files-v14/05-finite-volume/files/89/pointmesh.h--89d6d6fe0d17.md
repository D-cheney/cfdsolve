---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-89d6d6fe0d17"
title: "OpenFOAM 14 源码解析：pointMesh.H"
summary: "该文件声明或实现 `pointMesh`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/pointMesh/pointMesh.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pointMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/pointMesh/pointMesh.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：251 行
- 文件标识：`89d6d6fe0d17`

## 2. 功能说明

该文件声明或实现 `pointMesh`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Mesh representing a set of points created from polyMesh.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pointMesh` | 55 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `size` | 144 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`DemandDrivenMeshObject.H`](../../../04-core-runtime/files/0c/demanddrivenmeshobject.h--0c78b4372cd3.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`pointBoundaryMesh.H`](../../../05-finite-volume/files/79/pointboundarymesh.h--79f0380c6c88.md)
- [`pointFieldsFwd.H`](../../../05-finite-volume/files/55/pointfieldsfwd.h--55dc00cdab43.md)
- [`SlicedDimensionedField.H`](../../../05-finite-volume/files/93/sliceddimensionedfield.h--93f3d27b510e.md)
- [`pointMeshTemplates.C`](../../../05-finite-volume/files/eb/pointmeshtemplates.c--eb0d31608d45.md)

## 8. 直接上层引用

- [applications/test/PointEdgeWave/Test-PointEdgeWave.C](../../../17-other-libraries/files/74/test-pointedgewave.c--74af733b923f.md)
- [applications/utilities/postProcessing/dataConversion/foamToTecplot360/foamToTecplot360.C](../../../03-utilities/files/2d/foamtotecplot360.c--2d6babc61d79.md)
- [applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK.C](../../../03-utilities/files/c7/foamtovtk.c--c7553829b250.md)
- [applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK/patchWriter.H](../../../03-utilities/files/e0/patchwriter.h--e0a9c008940a.md)
- [applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK/surfaceMeshWriter.H](../../../03-utilities/files/d1/surfacemeshwriter.h--d12e3212afd1.md)
- [applications/utilities/postProcessing/graphics/PVReaders/vtkPVFoam/vtkPVFoamUpdateInfo.C](../../../03-utilities/files/e1/vtkpvfoamupdateinfo.c--e1f6ef38aefa.md)
- [applications/utilities/preProcessing/mapFieldsPar/mapGeometricFields.C](../../../03-utilities/files/3f/mapgeometricfields.c--3f22111ae743.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/makeDimensionedPointFieldFunctions.C](../../../05-finite-volume/files/07/makedimensionedpointfieldfunctions.c--076e7be2abe6.md)
- [src/finiteVolume/fields/GeometricFields/pointFields/pointFields.H](../../../05-finite-volume/files/ab/pointfields.h--ab4bc596bad4.md)
- [src/finiteVolume/fields/pointPatchFields/pointPatchField/pointPatchField.C](../../../05-finite-volume/files/22/pointpatchfield.c--2234aaa5500d.md)
- [src/finiteVolume/fvMesh/fvMesh.C](../../../05-finite-volume/files/5f/fvmesh.c--5fa1db101175.md)
- [src/finiteVolume/interpolation/interpolatePointToCell/interpolatePointToCell.H](../../../05-finite-volume/files/7d/interpolatepointtocell.h--7dfa23b58dad.md)
- [src/finiteVolume/interpolation/volPointInterpolation/pointConstraints.C](../../../05-finite-volume/files/20/pointconstraints.c--20082c9a9e51.md)
- [src/finiteVolume/pointMesh/pointBoundaryMesh/pointBoundaryMesh.C](../../../05-finite-volume/files/dc/pointboundarymesh.c--dc4e14d1f38a.md)
- [src/finiteVolume/pointMesh/pointDist/pointDist.C](../../../05-finite-volume/files/59/pointdist.c--5986b2d70dc4.md)
- [src/finiteVolume/pointMesh/pointMesh.C](../../../05-finite-volume/files/47/pointmesh.c--472ce4343416.md)
- [src/finiteVolume/pointMesh/pointMeshMapper/MapPointField.H](../../../05-finite-volume/files/69/mappointfield.h--69dd684e652a.md)
- [src/finiteVolume/pointMesh/pointMeshMapper/pointMapper.C](../../../05-finite-volume/files/40/pointmapper.c--40944d9a79e7.md)
- [src/finiteVolume/pointMesh/pointMeshTemplates.C](../../../05-finite-volume/files/eb/pointmeshtemplates.c--eb0d31608d45.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/cyclic/cyclicPointPatch.C](../../../05-finite-volume/files/3b/cyclicpointpatch.c--3b5470d405fb.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/processor/processorPointPatch.C](../../../05-finite-volume/files/44/processorpointpatch.c--44c20a6e75e2.md)
- [src/finiteVolume/pointMesh/pointPatches/facePointPatch/facePointPatch.C](../../../05-finite-volume/files/e6/facepointpatch.c--e62b7fd4ff99.md)
- [src/finiteVolume/pointMesh/pointPatches/pointPatch/pointPatch.C](../../../05-finite-volume/files/1a/pointpatch.c--1a142158df6e.md)
- [src/lagrangian/parcel/submodels/MPPIC/AveragingMethods/AveragingMethod/AveragingMethod.C](../../../11-lagrangian/files/e1/averagingmethod.c--e118def98ff4.md)
- [src/lagrangian/parcel/submodels/MPPIC/AveragingMethods/Basic/Basic.H](../../../11-lagrangian/files/b1/basic.h--b106d69ba8df.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
