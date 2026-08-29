---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-aad5a99ecf68"
title: "OpenFOAM 14 源码解析：fvPatchFields.H"
summary: "该文件为“有限体积离散”提供 `fvPatchFields` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/fvPatchField/fvPatchFields.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvPatchFields.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/fvPatchField/fvPatchFields.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：42 行
- 文件标识：`aad5a99ecf68`

## 2. 功能说明

该文件为“有限体积离散”提供 `fvPatchFields` 相关接口、模板实例或支撑定义。

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

- [`fvPatchField.H`](../../../05-finite-volume/files/3b/fvpatchfield.h--3b2a4d55daa2.md)
- [`fvPatchFieldsFwd.H`](../../../05-finite-volume/files/a3/fvpatchfieldsfwd.h--a34a4b180edc.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/derivedFvPatchFields/activeBaffleVelocity/activeBaffleVelocityFvPatchVectorField.H](../../../17-other-libraries/files/65/activebafflevelocityfvpatchvectorfield.h--65ed56d4cf7e.md)
- [applications/legacy/combustion/PDRFoam/derivedFvPatchFields/activePressureForceBaffleVelocity/activePressureForceBaffleVelocityFvPatchVectorField.H](../../../17-other-libraries/files/0a/activepressureforcebafflevelocityfvpatchvectorfield.h--0abf2f6684c8.md)
- [src/atmosphericModels/derivedFvPatchFields/atmosphericBoundaryLayerTurbulentEpsilon/atmosphericBoundaryLayerTurbulentEpsilonFvPatchScalarField.H](../../../17-other-libraries/files/25/atmosphericboundarylayerturbulentepsilonfvpatchscalarfield.h--259372fb9be5.md)
- [src/atmosphericModels/derivedFvPatchFields/atmosphericBoundaryLayerTurbulentKineticEnergy/atmosphericBoundaryLayerTurbulentKineticEnergyFvPatchScalarField.H](../../../17-other-libraries/files/63/atmosphericboundarylayerturbulentkineticenergyfvpatchscalarfield.h--633cc791293d.md)
- [src/atmosphericModels/derivedFvPatchFields/atmosphericBoundaryLayerVelocity/atmosphericBoundaryLayerVelocityFvPatchVectorField.H](../../../17-other-libraries/files/5a/atmosphericboundarylayervelocityfvpatchvectorfield.h--5a8535f79510.md)
- [src/finiteVolume/cfdTools/general/MRF/derivedFvPatchFields/MRFPatchField/MRFPatchField.H](../../../05-finite-volume/files/9e/mrfpatchfield.h--9e8714f81310.md)
- [src/finiteVolume/fields/fvPatchFields/basic/calculated/calculatedFvPatchFields.C](../../../05-finite-volume/files/aa/calculatedfvpatchfields.c--aa7111e76507.md)
- [src/finiteVolume/fields/fvPatchFields/basic/transform/transformFvPatchFields.C](../../../05-finite-volume/files/e8/transformfvpatchfields.c--e8909562a385.md)
- [src/finiteVolume/fields/fvPatchFields/derived/fixedFluxPressure/fixedFluxPressureFvPatchScalarField.H](../../../05-finite-volume/files/bd/fixedfluxpressurefvpatchscalarfield.h--bd2293d33648.md)
- [src/finiteVolume/fields/fvPatchFields/derived/fixedNormalInletOutletVelocity/fixedNormalInletOutletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/16/fixednormalinletoutletvelocityfvpatchvectorfield.h--16b13748dcb2.md)
- [src/finiteVolume/fields/fvPatchFields/derived/fluxCorrectedVelocity/fluxCorrectedVelocityFvPatchVectorField.H](../../../05-finite-volume/files/12/fluxcorrectedvelocityfvpatchvectorfield.h--129c23994b89.md)
- [src/finiteVolume/fields/fvPatchFields/derived/freestreamPressure/freestreamPressureFvPatchScalarField.H](../../../05-finite-volume/files/0b/freestreampressurefvpatchscalarfield.h--0bdc218859f4.md)
- [src/finiteVolume/fields/fvPatchFields/derived/pressureDirectedInletOutletVelocity/pressureDirectedInletOutletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/8b/pressuredirectedinletoutletvelocityfvpatchvectorfield.h--8bd7a3a63a4c.md)
- [src/finiteVolume/fields/fvPatchFields/derived/pressureDirectedInletVelocity/pressureDirectedInletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/e9/pressuredirectedinletvelocityfvpatchvectorfield.h--e9c55a0aeaee.md)
- [src/finiteVolume/fields/fvPatchFields/derived/pressureInletVelocity/pressureInletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/87/pressureinletvelocityfvpatchvectorfield.h--87efaf344aa8.md)
- [src/finiteVolume/fields/fvPatchFields/derived/pressureNormalInletOutletVelocity/pressureNormalInletOutletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/4e/pressurenormalinletoutletvelocityfvpatchvectorfield.h--4e6cba8d593e.md)
- [src/finiteVolume/fields/fvPatchFields/derived/rotatingPressureInletOutletVelocity/rotatingPressureInletOutletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/07/rotatingpressureinletoutletvelocityfvpatchvectorfield.h--07e0b877cf46.md)
- [src/finiteVolume/fields/fvPatchFields/derived/supersonicFreestream/supersonicFreestreamFvPatchVectorField.H](../../../05-finite-volume/files/79/supersonicfreestreamfvpatchvectorfield.h--794e6b427b23.md)
- [src/finiteVolume/fields/fvPatchFields/derived/surfaceNormalFixedValue/surfaceNormalFixedValueFvPatchVectorField.H](../../../05-finite-volume/files/80/surfacenormalfixedvaluefvpatchvectorfield.h--80dfed5d00f9.md)
- [src/finiteVolume/fields/fvPatchFields/derived/transonicEntrainmentPressure/transonicEntrainmentPressureFvPatchScalarField.H](../../../05-finite-volume/files/24/transonicentrainmentpressurefvpatchscalarfield.h--2426a62faff5.md)
- [src/finiteVolume/fields/fvPatchFields/fvPatchField/fvPatchFields.C](../../../05-finite-volume/files/37/fvpatchfields.c--3758b0fcc619.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/fixedShearStress/fixedShearStressFvPatchVectorField.H](../../../09-turbulence-transport/files/88/fixedshearstressfvpatchvectorfield.h--8856a2e41d8e.md)
- [src/parallel/parallel/fieldReconstructors/fvFieldReconstructor/fvFieldReconstructorTemplates.C](../../../13-parallel/files/ff/fvfieldreconstructortemplates.c--ff6cef0531e6.md)
- [src/twoPhaseModels/interfaceProperties/contactAngleModels/contactAngleModel/contactAngleModel.H](../../../10-multiphase/files/91/contactanglemodel.h--9107890df127.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
