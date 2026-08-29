---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-23b4330818d5"
title: "OpenFOAM 14 源码解析：specie.H"
summary: "该文件声明或实现 `specie`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/specie/specie.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：specie.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/specie/specie.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：177 行
- 文件标识：`23b4330818d5`

## 2. 功能说明

该文件声明或实现 `specie`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Base class of the thermophysical property types.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `specie` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`word.H`](../../../04-core-runtime/files/76/word.h--763cd4c0a88d.md)
- [`scalar.H`](../../../04-core-runtime/files/cb/scalar.h--cb9b81900254.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`thermodynamicConstants.H`](../../../04-core-runtime/files/11/thermodynamicconstants.h--11723b82e8b7.md)
- [`specieI.H`](../../../08-thermophysical/files/89/speciei.h--890eec77debb.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermos.C](../../../17-other-libraries/files/cb/psiumulticomponentthermos.c--cbf50cf75a91.md)
- [applications/test/thermoMixture/Test-thermoMixture.C](../../../17-other-libraries/files/59/test-thermomixture.c--59423d9d86d3.md)
- [applications/utilities/thermophysical/adiabaticFlameT/adiabaticFlameT.C](../../../03-utilities/files/fd/adiabaticflamet.c--fd27ae0908bd.md)
- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.H](../../../03-utilities/files/a6/chemkinreader.h--a64993417c06.md)
- [applications/utilities/thermophysical/equilibriumCO/equilibriumCO.C](../../../03-utilities/files/91/equilibriumco.c--917c36973ee4.md)
- [applications/utilities/thermophysical/equilibriumFlameT/equilibriumFlameT.C](../../../03-utilities/files/33/equilibriumflamet.c--3348ceeb96f0.md)
- [applications/utilities/thermophysical/mixtureAdiabaticFlameT/mixtureAdiabaticFlameT.C](../../../03-utilities/files/16/mixtureadiabaticflamet.c--161d90cf651a.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingParcel/ReactingParcel.C](../../../11-lagrangian/files/a1/reactingparcel.c--a1492ad16d78.md)
- [src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/LiquidEvaporation/LiquidEvaporation.C](../../../11-lagrangian/files/2b/liquidevaporation.c--2b164a02c49e.md)
- [src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/LiquidEvaporationBoil/LiquidEvaporationBoil.C](../../../11-lagrangian/files/6f/liquidevaporationboil.c--6f623a9cccdc.md)
- [src/thermophysicalModels/solidThermo/solidSpecie/include/forSolids.H](../../../08-thermophysical/files/37/forsolids.h--3771cbfe67d8.md)
- [src/thermophysicalModels/solidThermo/solidSpecie/transport/polynomial/polynomialSolidTransportI.H](../../../08-thermophysical/files/b5/polynomialsolidtransporti.h--b5a52a889be7.md)
- [src/thermophysicalModels/specie/include/forGases.H](../../../08-thermophysical/files/1a/forgases.h--1ae68ddb3b03.md)
- [src/thermophysicalModels/specie/include/forLiquids.H](../../../08-thermophysical/files/a6/forliquids.h--a60e3659531c.md)
- [src/thermophysicalModels/specie/include/forTabulated.H](../../../08-thermophysical/files/34/fortabulated.h--34b9ccd302b4.md)
- [src/thermophysicalModels/specie/specie/specie.C](../../../08-thermophysical/files/d9/specie.c--d9546caf379c.md)
- [src/thermophysicalModels/specie/specie/specieI.H](../../../08-thermophysical/files/89/speciei.h--890eec77debb.md)
- [src/thermophysicalModels/specie/thermo/ePower/ePowerThermoI.H](../../../08-thermophysical/files/ee/epowerthermoi.h--ee970c6f932b.md)
- [src/thermophysicalModels/specie/thermo/hPower/hPowerThermoI.H](../../../08-thermophysical/files/55/hpowerthermoi.h--5551335b2489.md)
- [src/thermophysicalModels/specie/thermo/janaf/janafThermoI.H](../../../08-thermophysical/files/70/janafthermoi.h--703986f2b860.md)
- [src/thermophysicalModels/specie/thermophysicalFunctions/integratedNonUniformTable1/integratedNonUniformTable1.C](../../../08-thermophysical/files/bc/integratednonuniformtable1.c--bc165245d4c6.md)
- [src/thermophysicalModels/specie/transport/Andrade/AndradeTransportI.H](../../../08-thermophysical/files/02/andradetransporti.h--02b34c4a9c33.md)
- [src/thermophysicalModels/specie/transport/icoTabulated/icoTabulatedTransportI.H](../../../08-thermophysical/files/f0/icotabulatedtransporti.h--f0eddb984686.md)
- [src/thermophysicalModels/specie/transport/logPolynomial/logPolynomialTransportI.H](../../../08-thermophysical/files/ac/logpolynomialtransporti.h--ac828fa03732.md)
- [src/thermophysicalModels/specie/transport/polynomial/polynomialTransportI.H](../../../08-thermophysical/files/1b/polynomialtransporti.h--1bc9d494ef35.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
