---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c645cd2545f4"
title: "OpenFOAM 14 源码解析：fvPatch.H"
summary: "该文件声明或实现 `fvMesh`、`fvBoundaryMesh`、`surfaceMesh`、`faceZone`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/fvPatches/fvPatch/fvPatch.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/fvPatches/fvPatch/fvPatch.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：309 行
- 文件标识：`c645cd2545f4`

## 2. 功能说明

该文件声明或实现 `fvMesh`、`fvBoundaryMesh`、`surfaceMesh`、`faceZone`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：A finiteVolume patch using a polyPatch and a fvBoundaryMesh

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 54 |
| `fvBoundaryMesh` | 56 |
| `surfaceMesh` | 57 |
| `faceZone` | 58 |
| `fvPatch` | 63 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `index` | 172 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`polyPatch.H`](../../../04-core-runtime/files/51/polypatch.h--5133084941b0.md)
- [`fvPatchFieldsFwd.H`](../../../05-finite-volume/files/a3/fvpatchfieldsfwd.h--a34a4b180edc.md)
- [`GeometricFieldFwd.H`](../../../05-finite-volume/files/fa/geometricfieldfwd.h--fa80c4c7587c.md)
- [`SlicedDimensionedField.H`](../../../05-finite-volume/files/93/sliceddimensionedfield.h--93f3d27b510e.md)
- [`fvPatchTemplates.C`](../../../05-finite-volume/files/c5/fvpatchtemplates.c--c55dd087ac5c.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/patches/filmFvPatch/filmFvPatch.H](../../../02-solver-modules/files/12/filmfvpatch.h--1287595f3ed2.md)
- [applications/modules/solidDisplacement/derivedFvPatchFields/displacementGapHeatTransferCoefficient/displacementGapHeatTransferCoefficient_DimensionedFieldFunction.H](../../../02-solver-modules/files/61/displacementgapheattransfercoefficient_dimensionedfieldfunction.h--61dd7ef84dea.md)
- [src/finiteVolume/fields/fvPatchFields/DimensionedFvPatchFields/DimensionedFvPatchFields.H](../../../05-finite-volume/files/28/dimensionedfvpatchfields.h--284a8a0cc3f1.md)
- [src/finiteVolume/fields/fvPatchFields/fvPatchField/fvPatchField.H](../../../05-finite-volume/files/3b/fvpatchfield.h--3b2a4d55daa2.md)
- [src/finiteVolume/fields/fvPatchFields/UDimensionedFvPatchFields/UDimensionedFvPatchFields.H](../../../05-finite-volume/files/22/udimensionedfvpatchfields.h--22c348a42f7a.md)
- [src/finiteVolume/fields/fvsPatchFields/fvsPatchField/fvsPatchField.H](../../../05-finite-volume/files/d9/fvspatchfield.h--d9989a63dc8c.md)
- [src/finiteVolume/fvMesh/fvMeshMapper/fvPatchMapper.C](../../../05-finite-volume/files/2d/fvpatchmapper.c--2dfad9c60790.md)
- [src/finiteVolume/fvMesh/fvMeshMapper/fvPatchMapper.H](../../../05-finite-volume/files/ad/fvpatchmapper.h--adfe861298ee.md)
- [src/finiteVolume/fvMesh/fvPatches/basic/coupled/coupledFvPatch.H](../../../05-finite-volume/files/18/coupledfvpatch.h--18dc9d47d05f.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/empty/emptyFvPatch.H](../../../05-finite-volume/files/13/emptyfvpatch.h--13715b500d97.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/internal/internalFvPatch.H](../../../05-finite-volume/files/02/internalfvpatch.h--0240ae9f33c3.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/nonConformal/nonConformalFvPatch.H](../../../05-finite-volume/files/b8/nonconformalfvpatch.h--b81c339b46e8.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/nonConformalError/nonConformalErrorFvPatch.H](../../../05-finite-volume/files/ac/nonconformalerrorfvpatch.h--acf3463979fd.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/symmetry/symmetryFvPatch.H](../../../05-finite-volume/files/99/symmetryfvpatch.h--99f4b62d7b36.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/symmetryPlane/symmetryPlaneFvPatch.H](../../../05-finite-volume/files/17/symmetryplanefvpatch.h--17877ca2e8ff.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/wedge/wedgeFvPatch.H](../../../05-finite-volume/files/2c/wedgefvpatch.h--2c6baa534871.md)
- [src/finiteVolume/fvMesh/fvPatches/derived/mapped/mappedFvPatch.H](../../../05-finite-volume/files/e4/mappedfvpatch.h--e4c9fb16f540.md)
- [src/finiteVolume/fvMesh/fvPatches/derived/mapped/mappedFvPatchBaseBase.H](../../../05-finite-volume/files/48/mappedfvpatchbasebase.h--488fa85927cc.md)
- [src/finiteVolume/fvMesh/fvPatches/derived/mapped/mappedInternalFvPatch.H](../../../05-finite-volume/files/42/mappedinternalfvpatch.h--42bac62ee55a.md)
- [src/finiteVolume/fvMesh/fvPatches/derived/wall/wallFvPatch.H](../../../05-finite-volume/files/91/wallfvpatch.h--91e9c7f67f00.md)
- [src/finiteVolume/fvMesh/fvPatches/fvPatch/fvPatch.C](../../../05-finite-volume/files/91/fvpatch.c--91e295936ae5.md)
- [src/finiteVolume/fvMesh/fvPatches/fvPatch/fvPatchList.H](../../../05-finite-volume/files/33/fvpatchlist.h--3374217c6f3d.md)
- [src/finiteVolume/fvMesh/fvPatches/fvPatch/fvPatchNew.C](../../../05-finite-volume/files/a1/fvpatchnew.c--a1b6c122f1bd.md)
- [src/finiteVolume/fvMesh/fvPatches/fvPatch/fvPatchTemplates.C](../../../05-finite-volume/files/c5/fvpatchtemplates.c--c55dd087ac5c.md)
- [src/generic/genericFvPatches/genericFvPatch/genericFvPatch.H](../../../17-other-libraries/files/e7/genericfvpatch.h--e79bb0b44762.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
