---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fde273d73f26"
title: "OpenFOAM 14 源码解析：mixedFvPatchFields.H"
summary: "该文件为“有限体积离散”提供 `mixedFvPatchFields` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/basic/mixed/mixedFvPatchFields.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：mixedFvPatchFields.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/basic/mixed/mixedFvPatchFields.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：55 行
- 文件标识：`fde273d73f26`

## 2. 功能说明

该文件为“有限体积离散”提供 `mixedFvPatchFields` 相关接口、模板实例或支撑定义。

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

- [`mixedFvPatchField.H`](../../../05-finite-volume/files/33/mixedfvpatchfield.h--33ef2f4d04bd.md)
- [`fieldTypes.H`](../../../04-core-runtime/files/92/fieldtypes.h--927f2e391791.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/derivedFvPatchFields/mixedUnburntEnthalpy/mixedUnburntEnthalpyFvPatchScalarField.H](../../../17-other-libraries/files/37/mixedunburntenthalpyfvpatchscalarfield.h--374e294ca1ce.md)
- [applications/modules/isothermalFilm/derivedFvPatchFields/filmSurfaceVelocity/filmSurfaceVelocityFvPatchVectorField.H](../../../02-solver-modules/files/95/filmsurfacevelocityfvpatchvectorfield.h--95c0cb9bea71.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/derivedFvPatchFields/JohnsonJacksonParticleTheta/JohnsonJacksonParticleThetaFvPatchScalarField.H](../../../02-solver-modules/files/47/johnsonjacksonparticlethetafvpatchscalarfield.h--47bdab733525.md)
- [applications/modules/shockFluid/derivedFvPatchFields/T/smoluchowskiJumpTFvPatchScalarField.H](../../../02-solver-modules/files/13/smoluchowskijumptfvpatchscalarfield.h--13572ba82ef0.md)
- [etc/codeTemplates/dynamicCode/codedMixedFvPatchFieldTemplate.H](../../../15-build-config/files/e3/codedmixedfvpatchfieldtemplate.h--e306ec8477c3.md)
- [src/finiteVolume/fields/fvPatchFields/basic/mixed/mixedFvPatchFields.C](../../../05-finite-volume/files/12/mixedfvpatchfields.c--129bb9014a46.md)
- [src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.H](../../../05-finite-volume/files/f8/advectivefvpatchfield.h--f80b3f89bc06.md)
- [src/finiteVolume/fields/fvPatchFields/derived/codedMixed/codedMixedFvPatchField.H](../../../05-finite-volume/files/9c/codedmixedfvpatchfield.h--9c7aeccf61c1.md)
- [src/finiteVolume/fields/fvPatchFields/derived/externalCoupledMixed/externalCoupledMixedFvPatchField.H](../../../05-finite-volume/files/3f/externalcoupledmixedfvpatchfield.h--3ff7ee67e8e7.md)
- [src/finiteVolume/fields/fvPatchFields/derived/freestreamPressure/freestreamPressureFvPatchScalarField.H](../../../05-finite-volume/files/0b/freestreampressurefvpatchscalarfield.h--0bdc218859f4.md)
- [src/finiteVolume/fields/fvPatchFields/derived/freestreamVelocity/freestreamVelocityFvPatchVectorField.H](../../../05-finite-volume/files/70/freestreamvelocityfvpatchvectorfield.h--703994b9c322.md)
- [src/finiteVolume/fields/fvPatchFields/derived/outletPhaseMeanVelocity/outletPhaseMeanVelocityFvPatchVectorField.H](../../../05-finite-volume/files/8b/outletphasemeanvelocityfvpatchvectorfield.h--8b155637f57e.md)
- [src/finiteVolume/fields/fvPatchFields/derived/phaseHydrostaticPressure/phaseHydrostaticPressureFvPatchScalarField.H](../../../05-finite-volume/files/a9/phasehydrostaticpressurefvpatchscalarfield.h--a9fc9e297783.md)
- [src/finiteVolume/fields/fvPatchFields/derived/pressureDirectedInletOutletVelocity/pressureDirectedInletOutletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/8b/pressuredirectedinletoutletvelocityfvpatchvectorfield.h--8bd7a3a63a4c.md)
- [src/finiteVolume/fields/fvPatchFields/derived/pressureNormalInletOutletVelocity/pressureNormalInletOutletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/4e/pressurenormalinletoutletvelocityfvpatchvectorfield.h--4e6cba8d593e.md)
- [src/finiteVolume/fields/fvPatchFields/derived/supersonicFreestream/supersonicFreestreamFvPatchVectorField.H](../../../05-finite-volume/files/79/supersonicfreestreamfvpatchvectorfield.h--794e6b427b23.md)
- [src/finiteVolume/fields/fvPatchFields/derived/transonicEntrainmentPressure/transonicEntrainmentPressureFvPatchScalarField.H](../../../05-finite-volume/files/24/transonicentrainmentpressurefvpatchscalarfield.h--2426a62faff5.md)
- [src/finiteVolume/fields/fvPatchFields/derived/variableHeightFlowRate/variableHeightFlowRateFvPatchField.H](../../../05-finite-volume/files/6a/variableheightflowratefvpatchfield.h--6a3d08f6d32a.md)
- [src/radiationModels/derivedFvPatchFields/greyDiffusiveRadiation/greyDiffusiveRadiationMixedFvPatchScalarField.H](../../../17-other-libraries/files/6a/greydiffusiveradiationmixedfvpatchscalarfield.h--6aab39f3f588.md)
- [src/radiationModels/derivedFvPatchFields/MarshakRadiation/MarshakRadiationFvPatchScalarField.H](../../../17-other-libraries/files/a3/marshakradiationfvpatchscalarfield.h--a30515b4fc22.md)
- [src/radiationModels/derivedFvPatchFields/MarshakRadiationFixedTemperature/MarshakRadiationFixedTemperatureFvPatchScalarField.H](../../../17-other-libraries/files/67/marshakradiationfixedtemperaturefvpatchscalarfield.h--67be8b188f0e.md)
- [src/radiationModels/derivedFvPatchFields/wideBandDiffusiveRadiation/wideBandDiffusiveRadiationMixedFvPatchScalarField.H](../../../17-other-libraries/files/c9/widebanddiffusiveradiationmixedfvpatchscalarfield.h--c9d7eb42e642.md)
- [src/specieTransfer/derivedFvPatchFields/specieTransferMassFraction/specieTransferMassFractionFvPatchScalarField.H](../../../08-thermophysical/files/ca/specietransfermassfractionfvpatchscalarfield.h--ca7a4a654123.md)
- [src/thermophysicalModels/basic/derivedFvPatchFields/mixedEnergy/mixedEnergyFvPatchScalarField.H](../../../08-thermophysical/files/44/mixedenergyfvpatchscalarfield.h--4491179b07b1.md)
- [src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/coupledTemperature/coupledTemperatureFvPatchScalarField.H](../../../09-turbulence-transport/files/e3/coupledtemperaturefvpatchscalarfield.h--e39dd1ecb280.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
