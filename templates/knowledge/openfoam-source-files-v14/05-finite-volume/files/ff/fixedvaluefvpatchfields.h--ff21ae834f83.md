---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ff21ae834f83"
title: "OpenFOAM 14 源码解析：fixedValueFvPatchFields.H"
summary: "该文件为“有限体积离散”提供 `fixedValueFvPatchFields` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/basic/fixedValue/fixedValueFvPatchFields.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fixedValueFvPatchFields.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/basic/fixedValue/fixedValueFvPatchFields.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：55 行
- 文件标识：`ff21ae834f83`

## 2. 功能说明

该文件为“有限体积离散”提供 `fixedValueFvPatchFields` 相关接口、模板实例或支撑定义。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fixedValueFvPatchField.H`](../../../05-finite-volume/files/58/fixedvaluefvpatchfield.h--589fa1c7e03a.md)
- [`fieldTypes.H`](../../../04-core-runtime/files/92/fieldtypes.h--927f2e391791.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/derivedFvPatchFields/activeBaffleVelocity/activeBaffleVelocityFvPatchVectorField.H](../../../17-other-libraries/files/65/activebafflevelocityfvpatchvectorfield.h--65ed56d4cf7e.md)
- [applications/legacy/combustion/PDRFoam/derivedFvPatchFields/activePressureForceBaffleVelocity/activePressureForceBaffleVelocityFvPatchVectorField.H](../../../17-other-libraries/files/0a/activepressureforcebafflevelocityfvpatchvectorfield.h--0abf2f6684c8.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/derivedFvPatchFields/fixedUnburntEnthalpy/fixedUnburntEnthalpyFvPatchScalarField.H](../../../17-other-libraries/files/44/fixedunburntenthalpyfvpatchscalarfield.h--44ec6ffaf488.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/PsiuMulticomponentThermo.C](../../../17-other-libraries/files/b6/psiumulticomponentthermo.c--b626a4374bbd.md)
- [applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointOutletPressure/adjointOutletPressureFvPatchScalarField.H](../../../17-other-libraries/files/1b/adjointoutletpressurefvpatchscalarfield.h--1bbc72b4dbf7.md)
- [applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointOutletVelocity/adjointOutletVelocityFvPatchVectorField.H](../../../17-other-libraries/files/08/adjointoutletvelocityfvpatchvectorfield.h--085e72bb4c9d.md)
- [applications/modules/incompressibleDriftFlux/relativeVelocityModels/relativeVelocityModel/relativeVelocityModel.C](../../../02-solver-modules/files/54/relativevelocitymodel.c--548098125ba3.md)
- [applications/modules/isothermalFilm/derivedFvPatchFields/alphaOne/alphaOneFvPatchScalarField.H](../../../02-solver-modules/files/e0/alphaonefvpatchscalarfield.h--e04a2651542f.md)
- [applications/modules/multiphaseEuler/fvModels/wallPhaseChange/alphatPhaseChangeWallFunctionFvPatchScalarField.H](../../../02-solver-modules/files/48/alphatphasechangewallfunctionfvpatchscalarfield.h--48ba8ebff702.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/MovingPhaseModel/MovingPhaseModel.C](../../../02-solver-modules/files/d3/movingphasemodel.c--d30d64f5c936.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvPatchFields/distributionGroupFraction/distributionGroupFractionFvPatchScalarField.H](../../../02-solver-modules/files/a8/distributiongroupfractionfvpatchscalarfield.h--a8e93a40b07d.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvPatchFields/singleGroupFraction/singleGroupFractionFvPatchScalarField.H](../../../02-solver-modules/files/d1/singlegroupfractionfvpatchscalarfield.h--d1c6adf617ff.md)
- [applications/modules/shockFluid/derivedFvPatchFields/rho/fixedRhoFvPatchScalarField.H](../../../02-solver-modules/files/4c/fixedrhofvpatchscalarfield.h--4cfafa40a720.md)
- [applications/solvers/potentialFoam/potentialFoam.C](../../../01-solver-entry/files/3c/potentialfoam.c--3cd35945b82e.md)
- [applications/utilities/preProcessing/viewFactorsGen/viewFactorsGen.C](../../../03-utilities/files/3f/viewfactorsgen.c--3fe0599b649e.md)
- [etc/codeTemplates/dynamicCode/codedFixedValueFvPatchFieldTemplate.H](../../../15-build-config/files/31/codedfixedvaluefvpatchfieldtemplate.h--31736463a0cc.md)
- [src/finiteVolume/cfdTools/general/correctPhi/CorrectPhi.C](../../../05-finite-volume/files/13/correctphi.c--131ea778a3a4.md)
- [src/finiteVolume/cfdTools/general/MRF/derivedFvPatchFields/MRFnoSlip/MRFnoSlipFvPatchVectorField.H](../../../05-finite-volume/files/f8/mrfnoslipfvpatchvectorfield.h--f829ce54159f.md)
- [src/finiteVolume/cfdTools/general/MRF/derivedFvPatchFields/MRFslip/MRFslipFvPatchVectorField.H](../../../05-finite-volume/files/fa/mrfslipfvpatchvectorfield.h--fa81a61f51d8.md)
- [src/finiteVolume/fields/fvPatchFields/basic/fixedValue/fixedValueFvPatchFields.C](../../../05-finite-volume/files/16/fixedvaluefvpatchfields.c--16a0d5fed0ea.md)
- [src/finiteVolume/fields/fvPatchFields/derived/codedFixedValue/codedFixedValueFvPatchField.H](../../../05-finite-volume/files/81/codedfixedvaluefvpatchfield.h--8128a1f53df9.md)
- [src/finiteVolume/fields/fvPatchFields/derived/dynamicPressure/dynamicPressureFvPatchScalarField.H](../../../05-finite-volume/files/8e/dynamicpressurefvpatchscalarfield.h--8e347f690372.md)
- [src/finiteVolume/fields/fvPatchFields/derived/fixedMean/fixedMeanFvPatchField.H](../../../05-finite-volume/files/d0/fixedmeanfvpatchfield.h--d0971f4373cf.md)
- [src/finiteVolume/fields/fvPatchFields/derived/fixedPressureCompressibleDensity/fixedPressureCompressibleDensityFvPatchScalarField.H](../../../05-finite-volume/files/c8/fixedpressurecompressibledensityfvpatchscalarfield.h--c81c46eabea4.md)
- [src/finiteVolume/fields/fvPatchFields/derived/fixedProfile/fixedProfileFvPatchField.H](../../../05-finite-volume/files/c2/fixedprofilefvpatchfield.h--c2b31df5456e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
