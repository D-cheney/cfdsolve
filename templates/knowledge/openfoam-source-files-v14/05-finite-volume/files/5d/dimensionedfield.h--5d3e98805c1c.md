---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5d3e98805c1c"
title: "OpenFOAM 14 源码解析：DimensionedField.H"
summary: "该文件实现 `DimensionedField` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/DimensionedFields/DimensionedField/DimensionedField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：DimensionedField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/DimensionedFields/DimensionedField/DimensionedField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：576 行
- 文件标识：`5d3e98805c1c`

## 2. 功能说明

该文件实现 `DimensionedField` 相关对象的读取、写出或流序列化。

中文导航角色：有限体积离散核心。

上游说明：Field with dimensions and associated with geometry type GeoMesh which is used to size the field and a reference to it is maintained.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DimensionedField` | 59 |
| `PrimitiveField` | 62 |
| `PrimitiveField2` | 137 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`DimensionedFieldFwd.H`](../../../05-finite-volume/files/d3/dimensionedfieldfwd.h--d38a16413c58.md)
- [`regIOobject.H`](../../../04-core-runtime/files/7f/regioobject.h--7f9eca9df0dd.md)
- [`Field.H`](../../../04-core-runtime/files/51/field.h--519067424cd8.md)
- [`OldTimeField.H`](../../../05-finite-volume/files/df/oldtimefield.h--df6e4c946723.md)
- [`dimensionedType.H`](../../../04-core-runtime/files/fd/dimensionedtype.h--fd91b2318780.md)
- [`DimensionedFieldI.H`](../../../05-finite-volume/files/25/dimensionedfieldi.h--2576be5e9418.md)
- [`DimensionedFieldFunctions.H`](../../../05-finite-volume/files/2d/dimensionedfieldfunctions.h--2d7988476771.md)
- [`DimensionedField.C`](../../../05-finite-volume/files/06/dimensionedfield.c--06294b131bdd.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/populationBalance/derivedFvFields/groupProperty/groupPropertyFvScalarField.H](../../../02-solver-modules/files/9d/grouppropertyfvscalarfield.h--9d4871a690c3.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerTurbulentEpsilon/AtmosphericBoundaryLayerTurbulentEpsilon_DimensionedFieldFunction.C](../../../17-other-libraries/files/98/atmosphericboundarylayerturbulentepsilon_dimensionedfieldfunction.c--982906259050.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerTurbulentKineticEnergy/AtmosphericBoundaryLayerTurbulentKineticEnergy_DimensionedFieldFunction.C](../../../17-other-libraries/files/5f/atmosphericboundarylayerturbulentkineticenergy_dimensionedfieldfunction.--5fbf427aa580.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerVelocity/AtmosphericBoundaryLayerVelocity_DimensionedFieldFunction.C](../../../17-other-libraries/files/99/atmosphericboundarylayervelocity_dimensionedfieldfunction.c--9945c4e6f5e6.md)
- [src/finiteVolume/cfdTools/general/fvSource/fvSpecificSource.H](../../../05-finite-volume/files/d7/fvspecificsource.h--d75fc3d76aba.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedField/DimensionedField.C](../../../05-finite-volume/files/06/dimensionedfield.c--06294b131bdd.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedField/DimensionedFieldI.H](../../../05-finite-volume/files/25/dimensionedfieldi.h--2576be5e9418.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedField/DimensionedFieldIO.C](../../../05-finite-volume/files/f0/dimensionedfieldio.c--f0608382845d.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedField/DimensionedFieldReuseFunctions.H](../../../05-finite-volume/files/89/dimensionedfieldreusefunctions.h--89a7c5dde6f8.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/Coded/Coded_DimensionedFieldFunction.C](../../../05-finite-volume/files/64/coded_dimensionedfieldfunction.c--64f0d2932e88.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DimensionedFieldFunction/DimensionedFieldFunction.C](../../../05-finite-volume/files/48/dimensionedfieldfunction.c--48a93b6a4346.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DistanceFunction/DistanceFunction_DimensionedFieldFunction.C](../../../05-finite-volume/files/d4/distancefunction_dimensionedfieldfunction.c--d43ec09c9a92.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/FunctionalDimensionedField/FunctionalDimensionedField.H](../../../05-finite-volume/files/10/functionaldimensionedfield.h--10c38e4d5d18.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/TimeFunction/TimeFunction_DimensionedFieldFunction.C](../../../05-finite-volume/files/ed/timefunction_dimensionedfieldfunction.c--ed5271314a56.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/Zonal/Zonal_DimensionedFieldFunction.C](../../../05-finite-volume/files/68/zonal_dimensionedfieldfunction.c--68d5b24be46a.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedScalarField/DimensionedScalarField.H](../../../05-finite-volume/files/2f/dimensionedscalarfield.h--2f558f109d8e.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedSphericalTensorField/DimensionedSphericalTensorField.H](../../../05-finite-volume/files/48/dimensionedsphericaltensorfield.h--482313be4e2d.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedSymmTensorField/DimensionedSymmTensorField.H](../../../05-finite-volume/files/fd/dimensionedsymmtensorfield.h--fdc287f638fd.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedVectorField/DimensionedVectorField.H](../../../05-finite-volume/files/08/dimensionedvectorfield.h--08b8590236d3.md)
- [src/finiteVolume/fields/DimensionedFields/SlicedDimensionedField/SlicedDimensionedField.H](../../../05-finite-volume/files/93/sliceddimensionedfield.h--93f3d27b510e.md)
- [src/finiteVolume/fields/fvFieldSources/derived/NaN/NaNFvFieldSource.C](../../../05-finite-volume/files/c4/nanfvfieldsource.c--c46c3eb76aeb.md)
- [src/finiteVolume/fields/fvFieldSources/derived/uniformFixedValue/uniformFixedValueFvFieldSource.C](../../../05-finite-volume/files/2c/uniformfixedvaluefvfieldsource.c--2c9a772cd67d.md)
- [src/finiteVolume/fields/fvFieldSources/derived/uniformInletOutlet/uniformInletOutletFvFieldSource.C](../../../05-finite-volume/files/eb/uniforminletoutletfvfieldsource.c--eb50c1659016.md)
- [src/finiteVolume/fields/fvFieldSources/fvFieldSource/fvFieldSource.H](../../../05-finite-volume/files/a9/fvfieldsource.h--a90e2f2dce8d.md)
- [src/finiteVolume/fields/fvPatchFields/DimensionedFvPatchFieldFunctions/Zonal/Zonal_DimensionedFvPatchFieldFunction.C](../../../05-finite-volume/files/85/zonal_dimensionedfvpatchfieldfunction.c--851c19c82c04.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
