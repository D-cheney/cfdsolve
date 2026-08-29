---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a74f26d87987"
title: "OpenFOAM 14 源码解析：distribution.H"
summary: "该文件声明或实现 `distribution`、`FieldDistribution`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/distributions/distribution/distribution.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：distribution.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/distributions/distribution/distribution.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：365 行
- 文件标识：`a74f26d87987`

## 2. 功能说明

该文件声明或实现 `distribution`、`FieldDistribution`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Base class for statistical distributions All distributions (except fixedValue) require a "size exponent", Q, to be specified along with their other coefficients. If a distribution's CDF(x) (cumulative distribution function) represents what proportion of the distribution takes a value below x, then Q determines what is meant by "proportion": - If Q=0, then "proportion" means the number of sampled values expected to be below x divided by the total number of sampled values. - If Q=3, then "proportion" means the expected sum of sampled values cubed for values below x divided by the total sum of values cubed. If x is a length, then this can be interpreted as a proportion of the total volume of sampled objects. - If Q=2, and x is a length, then the distribution might represent the proportion of surface area, and so on... In addition to the user-specification of Q defining what size the given d

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `distribution` | 81 |
| `FieldDistribution` | 309 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`restartableRandomGenerator.H`](../../../04-core-runtime/files/30/restartablerandomgenerator.h--304292ca6e1f.md)
- [`fieldTypes.H`](../../../04-core-runtime/files/92/fieldtypes.h--927f2e391791.md)
- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`distributionTemplates.C`](../../../04-core-runtime/files/c3/distributiontemplates.c--c35af1a475cd.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/fvModels/filmCloudTransfer/ejectionModels/dripping/dripping.H](../../../02-solver-modules/files/5c/dripping.h--5c14d4c1afe5.md)
- [applications/modules/multiphaseEuler/functionObjects/populationBalanceSetSizeDistribution/populationBalanceSetSizeDistribution.C](../../../02-solver-modules/files/d0/populationbalancesetsizedistribution.c--d0df3ddfad45.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/distributionGroupFraction/distributionGroupFractionFvScalarFieldSource.H](../../../02-solver-modules/files/dd/distributiongroupfractionfvscalarfieldsource.h--dda9a2086b0a.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvPatchFields/distributionGroupFraction/distributionGroupFractionFvPatchScalarField.H](../../../02-solver-modules/files/a8/distributiongroupfractionfvpatchscalarfield.h--a8e93a40b07d.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.C](../../../02-solver-modules/files/06/populationbalancemodel.c--0601b272c982.md)
- [applications/test/distribution/Test-distribution.C](../../../17-other-libraries/files/98/test-distribution.c--986e52e22637.md)
- [applications/utilities/postProcessing/miscellaneous/pdfPlot/pdfPlot.C](../../../03-utilities/files/70/pdfplot.c--70069f2b5503.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/distributionDiameter/distributionDiameterLagrangianScalarFieldSource.H](../../../11-lagrangian/files/b9/distributiondiameterlagrangianscalarfieldsource.h--b9080274ea0b.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianFieldSources/derived/distribution/distributionLagrangianScalarFieldSource.H](../../../11-lagrangian/files/50/distributionlagrangianscalarfieldsource.h--50672365aff4.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/CellZoneInjection/CellZoneInjection.H](../../../11-lagrangian/files/60/cellzoneinjection.h--6075235f312e.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/ConeInjection/ConeInjection.H](../../../11-lagrangian/files/0f/coneinjection.h--0f42b9e8e4c0.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/FieldActivatedInjection/FieldActivatedInjection.H](../../../11-lagrangian/files/53/fieldactivatedinjection.h--539aeebe9be6.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/ManualInjection/ManualInjection.H](../../../11-lagrangian/files/d4/manualinjection.h--d40fca951f1e.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchFlowRateInjection/PatchFlowRateInjection.C](../../../11-lagrangian/files/f1/patchflowrateinjection.c--f18fa2ef4228.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchInjection/PatchInjection.C](../../../11-lagrangian/files/dc/patchinjection.c--dc580964f621.md)
- [src/OpenFOAM/distributions/distribution/distribution.C](../../../04-core-runtime/files/38/distribution.c--3812a2af2611.md)
- [src/OpenFOAM/distributions/distribution/distributionNew.C](../../../04-core-runtime/files/75/distributionnew.c--752e19a8b4a4.md)
- [src/OpenFOAM/distributions/distribution/distributionTemplates.C](../../../04-core-runtime/files/c3/distributiontemplates.c--c35af1a475cd.md)
- [src/OpenFOAM/distributions/fixedValue/fixedValue.H](../../../04-core-runtime/files/5d/fixedvalue.h--5d89c246587e.md)
- [src/OpenFOAM/distributions/multiFixedValue/multiFixedValue.H](../../../04-core-runtime/files/b6/multifixedvalue.h--b6a379eae27f.md)
- [src/OpenFOAM/distributions/tabulatedCumulative/tabulatedCumulative.H](../../../04-core-runtime/files/ee/tabulatedcumulative.h--ee2c34078b97.md)
- [src/OpenFOAM/distributions/tabulatedDensity/tabulatedDensity.H](../../../04-core-runtime/files/49/tabulateddensity.h--490be9e68a89.md)
- [src/OpenFOAM/distributions/uniform/uniform.H](../../../04-core-runtime/files/72/uniform.h--72e3199786eb.md)
- [src/OpenFOAM/distributions/unintegrable/unintegrable.H](../../../04-core-runtime/files/51/unintegrable.h--51a9b6fbb050.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
