---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-308626059d5d"
title: "OpenFOAM 14 源码解析：thermo.H"
summary: "该文件声明或实现 `thermo`、`Type`、`ThermoType`、`FType`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/thermo/thermo/thermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：thermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/thermo/thermo/thermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：361 行
- 文件标识：`308626059d5d`

## 2. 功能说明

该文件声明或实现 `thermo`、`Type`、`ThermoType`、`FType`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Basic thermodynamics type based on the use of fitting functions for cp, h, s obtained from the template argument type thermo. All other properties are derived from these primitive functions.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `thermo` | 58 |
| `Type` | 60 |
| `ThermoType` | 232 |
| `FType` | 233 |
| `dFdTType` | 234 |
| `LimitType` | 235 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`thermodynamicConstants.H`](../../../04-core-runtime/files/11/thermodynamicconstants.h--11723b82e8b7.md)
- [`thermoI.H`](../../../08-thermophysical/files/0b/thermoi.h--0b2fb55fbfc4.md)
- [`thermo.C`](../../../08-thermophysical/files/c0/thermo.c--c03e0bf66bd0.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermos.C](../../../17-other-libraries/files/cb/psiumulticomponentthermos.c--cbf50cf75a91.md)
- [applications/utilities/thermophysical/adiabaticFlameT/adiabaticFlameT.C](../../../03-utilities/files/fd/adiabaticflamet.c--fd27ae0908bd.md)
- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.H](../../../03-utilities/files/a6/chemkinreader.h--a64993417c06.md)
- [applications/utilities/thermophysical/equilibriumCO/equilibriumCO.C](../../../03-utilities/files/91/equilibriumco.c--917c36973ee4.md)
- [applications/utilities/thermophysical/equilibriumFlameT/equilibriumFlameT.C](../../../03-utilities/files/33/equilibriumflamet.c--3348ceeb96f0.md)
- [applications/utilities/thermophysical/mixtureAdiabaticFlameT/mixtureAdiabaticFlameT.C](../../../03-utilities/files/16/mixtureadiabaticflamet.c--161d90cf651a.md)
- [etc/codeTemplates/dynamicCode/bRhoMulticomponentThermoTemplate.C](../../../15-build-config/files/ea/brhomulticomponentthermotemplate.c--ea8fcffc7a70.md)
- [etc/codeTemplates/dynamicCode/chemistryModelTemplate.C](../../../15-build-config/files/77/chemistrymodeltemplate.c--77a8d58b02c2.md)
- [etc/codeTemplates/dynamicCode/fluidMulticomponentThermoTemplate.C](../../../15-build-config/files/cf/fluidmulticomponentthermotemplate.c--cf2e652730ee.md)
- [etc/codeTemplates/dynamicCode/fluidThermoTemplate.C](../../../15-build-config/files/90/fluidthermotemplate.c--904631401123.md)
- [etc/codeTemplates/dynamicCode/solidThermoTemplate.C](../../../15-build-config/files/20/solidthermotemplate.c--207098d95ee2.md)
- [etc/codeTemplates/dynamicCode/uRhoMulticomponentThermoTemplate.C](../../../15-build-config/files/3e/urhomulticomponentthermotemplate.c--3e42e0bd4844.md)
- [src/Lagrangian/LagrangianThermo/liquidLagrangianThermo/liquidLagrangianThermos.C](../../../11-lagrangian/files/c6/liquidlagrangianthermos.c--c6cbc85822b0.md)
- [src/thermophysicalModels/basic/liquidThermo/liquidThermos.C](../../../08-thermophysical/files/a6/liquidthermos.c--a6488a6b8966.md)
- [src/thermophysicalModels/solidThermo/solidSpecie/include/forSolids.H](../../../08-thermophysical/files/37/forsolids.h--3771cbfe67d8.md)
- [src/thermophysicalModels/specie/include/forGases.H](../../../08-thermophysical/files/1a/forgases.h--1ae68ddb3b03.md)
- [src/thermophysicalModels/specie/include/forLiquids.H](../../../08-thermophysical/files/a6/forliquids.h--a60e3659531c.md)
- [src/thermophysicalModels/specie/include/forTabulated.H](../../../08-thermophysical/files/34/fortabulated.h--34b9ccd302b4.md)
- [src/thermophysicalModels/specie/thermo/thermo/thermo.C](../../../08-thermophysical/files/c0/thermo.c--c03e0bf66bd0.md)
- [src/thermophysicalModels/specie/thermo/thermo/thermoI.H](../../../08-thermophysical/files/0b/thermoi.h--0b2fb55fbfc4.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
