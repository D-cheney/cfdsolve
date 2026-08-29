---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b630740da18d"
title: "OpenFOAM 14 源码解析：physicoChemicalConstants.H"
summary: "该文件为“核心运行时”提供 `physicoChemicalConstants` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/global/constants/physicoChemical/physicoChemicalConstants.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：physicoChemicalConstants.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/global/constants/physicoChemical/physicoChemicalConstants.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：91 行
- 文件标识：`b630740da18d`

## 2. 功能说明

该文件为“核心运行时”提供 `physicoChemicalConstants` 相关接口、模板实例或支撑定义。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Physico-chemical constants

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dimensionedScalar.H`](../../../04-core-runtime/files/94/dimensionedscalar.h--94226c94054a.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/homogeneousNucleation/homogeneousCondensation.C](../../../02-solver-modules/files/9e/homogeneouscondensation.c--9e02b745c52d.md)
- [applications/modules/multiphaseEuler/fvModels/homogeneousNucleation/homogeneousLiquidPhaseSeparation.C](../../../02-solver-modules/files/fe/homogeneousliquidphaseseparation.c--feae1f87982e.md)
- [applications/solvers/chemFoam/chemFoam.C](../../../01-solver-entry/files/41/chemfoam.c--41240cc5ed59.md)
- [src/lagrangian/parcel/clouds/Templates/ThermoCloud/ThermoCloudI.H](../../../11-lagrangian/files/df/thermocloudi.h--dff396083822.md)
- [src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcel.C](../../../11-lagrangian/files/43/thermoparcel.c--43b478f4d6af.md)
- [src/OpenFOAM/global/constants/constants.H](../../../04-core-runtime/files/2d/constants.h--2d9792376d91.md)
- [src/OpenFOAM/global/constants/fundamental/fundamentalConstants.C](../../../04-core-runtime/files/77/fundamentalconstants.c--77cf5bf9a25c.md)
- [src/OpenFOAM/global/constants/physicoChemical/physicoChemicalConstants.C](../../../04-core-runtime/files/46/physicochemicalconstants.c--4697b230aac4.md)
- [src/OpenFOAM/global/constants/thermodynamic/thermodynamicConstants.C](../../../04-core-runtime/files/27/thermodynamicconstants.c--279b4871642e.md)
- [src/radiationModels/derivedFvPatchFields/MarshakRadiation/MarshakRadiationFvPatchScalarField.C](../../../17-other-libraries/files/96/marshakradiationfvpatchscalarfield.c--963371327661.md)
- [src/radiationModels/derivedFvPatchFields/MarshakRadiationFixedTemperature/MarshakRadiationFixedTemperatureFvPatchScalarField.C](../../../17-other-libraries/files/9a/marshakradiationfixedtemperaturefvpatchscalarfield.c--9a037350bea0.md)
- [src/radiationModels/radiationModels/fvDOM/blackBodyEmission/blackBodyEmission.C](../../../17-other-libraries/files/ee/blackbodyemission.c--eee7f21d42aa.md)
- [src/radiationModels/radiationModels/noRadiation/noRadiation.C](../../../17-other-libraries/files/60/noradiation.c--60546173d2d2.md)
- [src/radiationModels/radiationModels/opaqueSolid/opaqueSolid.C](../../../17-other-libraries/files/27/opaquesolid.c--27c9f949f11c.md)
- [src/thermophysicalModels/specie/reaction/reactionRate/ArrheniusReactionRate/ArrheniusReactionRateI.H](../../../08-thermophysical/files/bc/arrheniusreactionratei.h--bc863c600bc7.md)
- [src/thermophysicalModels/specie/reaction/reactionRate/JanevReactionRate/JanevReactionRateI.H](../../../08-thermophysical/files/2f/janevreactionratei.h--2f42df569299.md)
- [src/thermophysicalModels/specie/reaction/reactionRate/LandauTellerReactionRate/LandauTellerReactionRateI.H](../../../08-thermophysical/files/e2/landautellerreactionratei.h--e20cab9f1c97.md)
- [src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalTemperature/externalTemperatureFvPatchScalarField.C](../../../09-turbulence-transport/files/0c/externaltemperaturefvpatchscalarfield.c--0c64da0c2f71.md)
- [src/twoPhaseModels/compressibleCavitation/Saito/Saito.C](../../../10-multiphase/files/6c/saito.c--6c6d3252ede3.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
