---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-747a4d63e312"
title: "OpenFOAM 14 源码解析：DimensionedFieldFunction.H"
summary: "该文件声明或实现 `DimensionedFieldFunction`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DimensionedFieldFunction/DimensionedFieldFunction.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：DimensionedFieldFunction.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DimensionedFieldFunction/DimensionedFieldFunction.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：241 行
- 文件标识：`747a4d63e312`

## 2. 功能说明

该文件声明或实现 `DimensionedFieldFunction`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Base class for run-time selectable internal and patch field initialisation evaluation and update with dimension checking.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DimensionedFieldFunction` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`DimensionedFieldFwd.H`](../../../05-finite-volume/files/d3/dimensionedfieldfwd.h--d38a16413c58.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`DimensionedFieldFunction.C`](../../../05-finite-volume/files/48/dimensionedfieldfunction.c--48a93b6a4346.md)

## 8. 直接上层引用

- [applications/modules/solidDisplacement/derivedFvPatchFields/displacementGapHeatTransferCoefficient/displacementGapHeatTransferCoefficient_DimensionedFieldFunction.H](../../../02-solver-modules/files/61/displacementgapheattransfercoefficient_dimensionedfieldfunction.h--61dd7ef84dea.md)
- [etc/codeTemplates/dynamicCode/codedDimensionedFieldFunctionTemplate.H](../../../15-build-config/files/6c/codeddimensionedfieldfunctiontemplate.h--6c5bd915bbd3.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerTurbulentEpsilon/AtmosphericBoundaryLayerTurbulentEpsilon_DimensionedFieldFunction.H](../../../17-other-libraries/files/7e/atmosphericboundarylayerturbulentepsilon_dimensionedfieldfunction.h--7ece7090ff99.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerTurbulentKineticEnergy/AtmosphericBoundaryLayerTurbulentKineticEnergy_DimensionedFieldFunction.H](../../../17-other-libraries/files/1d/atmosphericboundarylayerturbulentkineticenergy_dimensionedfieldfunction.--1da4d0f807b4.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerVelocity/AtmosphericBoundaryLayerVelocity_DimensionedFieldFunction.H](../../../17-other-libraries/files/ee/atmosphericboundarylayervelocity_dimensionedfieldfunction.h--ee982ff48100.md)
- [src/atmosphericModels/DimensionedFieldFunctions/makeDimensionedFieldFunctions.C](../../../17-other-libraries/files/f7/makedimensionedfieldfunctions.c--f70c38b44c92.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedField/DimensionedFieldIO.C](../../../05-finite-volume/files/f0/dimensionedfieldio.c--f0608382845d.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/Coded/Coded_DimensionedFieldFunction.H](../../../05-finite-volume/files/1c/coded_dimensionedfieldfunction.h--1cb2d89b2779.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DimensionedFieldFunction/DimensionedFieldFunction.C](../../../05-finite-volume/files/48/dimensionedfieldfunction.c--48a93b6a4346.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DistanceFunction/DistanceFunction_DimensionedFieldFunction.H](../../../05-finite-volume/files/6f/distancefunction_dimensionedfieldfunction.h--6f7271bdf95b.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/FieldFunction/FieldFunction_DimensionedFieldFunction.H](../../../05-finite-volume/files/3c/fieldfunction_dimensionedfieldfunction.h--3cf6c15ca055.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/FunctionalDimensionedField/FunctionalDimensionedField.H](../../../05-finite-volume/files/10/functionaldimensionedfield.h--10c38e4d5d18.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/makeDimensionedPointFieldFunctions.C](../../../05-finite-volume/files/07/makedimensionedpointfieldfunctions.c--076e7be2abe6.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/makeDimensionedSurfaceFieldFunctions.C](../../../05-finite-volume/files/7a/makedimensionedsurfacefieldfunctions.c--7ae8a65f0206.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/makeDimensionedVolFieldFunctions.C](../../../05-finite-volume/files/80/makedimensionedvolfieldfunctions.c--809f37be6b8b.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/TimeFunction/TimeFunction_DimensionedFieldFunction.H](../../../05-finite-volume/files/a2/timefunction_dimensionedfieldfunction.h--a23791384038.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/UFunctionalDimensionedField/UFunctionalDimensionedField.H](../../../05-finite-volume/files/ee/ufunctionaldimensionedfield.h--eef8dfcc1993.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/Zonal/Zonal_DimensionedFieldFunction.H](../../../05-finite-volume/files/0d/zonal_dimensionedfieldfunction.h--0db818768fc9.md)
- [src/finiteVolume/fields/fvPatchFields/DimensionedFvPatchFieldFunctions/makeDimensionedFvPatchFieldFunctions.C](../../../05-finite-volume/files/22/makedimensionedfvpatchfieldfunctions.c--2217a4ce5519.md)
- [src/finiteVolume/fields/fvPatchFields/DimensionedFvPatchFieldFunctions/Zonal/Zonal_DimensionedFvPatchFieldFunction.H](../../../05-finite-volume/files/f5/zonal_dimensionedfvpatchfieldfunction.h--f594b2c6a864.md)
- [src/finiteVolume/fields/GeometricFields/GeometricFieldFunctions/FunctionalGeometricField/FunctionalGeometricField.H](../../../05-finite-volume/files/6f/functionalgeometricfield.h--6f504e68317c.md)
- [src/Lagrangian/Lagrangian/fields/makeLagrangianFieldFunctions.C](../../../11-lagrangian/files/b2/makelagrangianfieldfunctions.c--b28fb8dcdca5.md)
- [src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/wallLayersHeatTransferCoefficient/wallLayersHeatTransferCoefficient_DimensionedFieldFunction.H](../../../09-turbulence-transport/files/ed/walllayersheattransfercoefficient_dimensionedfieldfunction.h--edc25214a45b.md)
- [src/waves/dimensionedFieldFunctions/waveAlpha/waveAlpha_DimensionedFieldFunction.H](../../../17-other-libraries/files/f1/wavealpha_dimensionedfieldfunction.h--f1472cd51c11.md)
- [src/waves/dimensionedFieldFunctions/waveVelocity/waveVelocity_DimensionedFieldFunction.H](../../../17-other-libraries/files/9d/wavevelocity_dimensionedfieldfunction.h--9d1cce9eb207.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
