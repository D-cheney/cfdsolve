---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5133084941b0"
title: "OpenFOAM 14 源码解析：polyPatch.H"
summary: "该文件声明或实现 `polyMesh`、`polyBoundaryMesh`、`polyPatch`、`PstreamBuffers`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyPatches/polyPatch/polyPatch.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：polyPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyPatches/polyPatch/polyPatch.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：414 行
- 文件标识：`5133084941b0`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyBoundaryMesh`、`polyPatch`、`PstreamBuffers`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：A patch is a list of labels that address the faces in the global face list. The patch can calculate its own edges based on the global faces. Patch also contains all addressing between the faces.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 61 |
| `polyBoundaryMesh` | 63 |
| `polyPatch` | 64 |
| `PstreamBuffers` | 65 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `start` | 284 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`patchIdentifier.H`](../../../04-core-runtime/files/81/patchidentifier.h--8107cb193c33.md)
- [`primitivePatch.H`](../../../04-core-runtime/files/24/primitivepatch.h--243caf926767.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/patches/filmSurface/filmSurfacePolyPatch/filmSurfacePolyPatch.H](../../../02-solver-modules/files/f2/filmsurfacepolypatch.h--f21b4fbe9c3e.md)
- [applications/modules/isothermalFilm/patches/filmWall/filmWallPolyPatch/filmWallPolyPatch.H](../../../02-solver-modules/files/23/filmwallpolypatch.h--232616de5ca3.md)
- [applications/utilities/mesh/conversion/mshToFoam/mshToFoam.C](../../../03-utilities/files/80/mshtofoam.c--805ff8e06001.md)
- [applications/utilities/mesh/conversion/netgenNeutralToFoam/netgenNeutralToFoam.C](../../../03-utilities/files/79/netgenneutraltofoam.c--79c2853a13b5.md)
- [applications/utilities/mesh/conversion/sammToFoam/createPolyBoundary.C](../../../03-utilities/files/1f/createpolyboundary.c--1f6f5b93c928.md)
- [applications/utilities/mesh/conversion/star3ToFoam/createPolyBoundary.C](../../../03-utilities/files/22/createpolyboundary.c--2261980c5c5a.md)
- [applications/utilities/postProcessing/graphics/PVReaders/vtkPVFoam/vtkPVFoamTemplates.C](../../../03-utilities/files/aa/vtkpvfoamtemplates.c--aafc48011f5b.md)
- [applications/utilities/preProcessing/snappyHexMeshConfig/blockMeshCartesianConfiguration.C](../../../03-utilities/files/56/blockmeshcartesianconfiguration.c--56b946d01221.md)
- [applications/utilities/preProcessing/snappyHexMeshConfig/blockMeshConfigurationBase.C](../../../03-utilities/files/69/blockmeshconfigurationbase.c--690174a1e8cd.md)
- [applications/utilities/preProcessing/snappyHexMeshConfig/blockMeshCylindricalConfiguration.C](../../../03-utilities/files/06/blockmeshcylindricalconfiguration.c--0611353330f4.md)
- [src/conversion/mergedCyclic/mergedCyclicPolyPatch.H](../../../17-other-libraries/files/59/mergedcyclicpolypatch.h--59fd81e2ac8b.md)
- [src/conversion/meshReader/createPolyBoundary.C](../../../17-other-libraries/files/a1/createpolyboundary.c--a1ffd695e662.md)
- [src/finiteVolume/fvMesh/fvPatches/fvPatch/fvPatch.H](../../../05-finite-volume/files/c6/fvpatch.h--c645cd2545f4.md)
- [src/finiteVolume/pointMesh/pointPatches/facePointPatch/facePointPatch.H](../../../05-finite-volume/files/9c/facepointpatch.h--9ce29ce49493.md)
- [src/fvAgglomerationMethods/pairPatchAgglomeration/pairPatchAgglomeration.H](../../../17-other-libraries/files/21/pairpatchagglomeration.h--2176fb0e089d.md)
- [src/generic/genericPatches/genericPolyPatch/genericPolyPatch.H](../../../17-other-libraries/files/9c/genericpolypatch.h--9c902e4c5ada.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/LagrangianPatch/LagrangianPatch.H](../../../11-lagrangian/files/12/lagrangianpatch.h--12d6a4dc0e1a.md)
- [src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/PatchInteractionModel/PatchInteractionModel.H](../../../11-lagrangian/files/39/patchinteractionmodel.h--3999daf63838.md)
- [src/lagrangian/parcel/submodels/Momentum/SurfaceFilmModel/SurfaceFilmModel/SurfaceFilmModel.H](../../../11-lagrangian/files/72/surfacefilmmodel.h--72852c143236.md)
- [src/meshTools/mappedPatches/mappedInternalPolyPatch/mappedInternalPolyPatch.H](../../../07-mesh-geometry/files/37/mappedinternalpolypatch.h--37ae69875212.md)
- [src/meshTools/mappedPatches/mappedPolyPatch/mappedPolyPatch.H](../../../07-mesh-geometry/files/78/mappedpolypatch.h--788631340ba9.md)
- [src/meshTools/nonConformal/polyPatches/nonConformalError/nonConformalErrorPolyPatch.H](../../../07-mesh-geometry/files/94/nonconformalerrorpolypatch.h--9476547b1777.md)
- [src/meshTools/patchIntersection/polyPatchIntersection.H](../../../07-mesh-geometry/files/cf/polypatchintersection.h--cf2c1a427f88.md)
- [src/OpenFOAM/meshes/polyMesh/polyPatches/basic/coupled/coupledPolyPatch.H](../../../04-core-runtime/files/8b/coupledpolypatch.h--8b491e684549.md)
- [src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/empty/emptyPolyPatch.H](../../../04-core-runtime/files/85/emptypolypatch.h--854da5b2d880.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
