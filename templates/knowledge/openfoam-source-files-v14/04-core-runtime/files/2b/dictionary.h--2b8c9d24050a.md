---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2b8c9d24050a"
title: "OpenFOAM 14 源码解析：dictionary.H"
summary: "该文件声明或实现 `dictionary`、`primitiveEntry`、`regExp`、`SHA1Digest`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/db/dictionary/dictionary.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：dictionary.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/db/dictionary/dictionary.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1083 行
- 文件标识：`2b8c9d24050a`

## 2. 功能说明

该文件声明或实现 `dictionary`、`primitiveEntry`、`regExp`、`SHA1Digest`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：A list of keywords followed by any number of values (e.g. words and numbers) or sub-dictionaries The keywords can represent patterns which are matched using Posix regular expressions. The general order for searching is as follows: - exact match - pattern match (in reverse order) - optional recursion into the enclosing (parent) dictionaries The dictionary class is the base class for IOdictionary. It also serves as a bootstrap dictionary for the objectRegistry data dictionaries since, unlike the IOdictionary class, it does not use an objectRegistry itself to work.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `dictionary` | 75 |
| `primitiveEntry` | 76 |
| `regExp` | 77 |
| `SHA1Digest` | 78 |
| `dictionaryName` | 86 |
| `includedDictionary` | 252 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `isNull` | 361 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`className.H`](../../../04-core-runtime/files/50/classname.h--5030be164aba.md)
- [`entry.H`](../../../04-core-runtime/files/4a/entry.h--4afffd31fd6f.md)
- [`IDLList.H`](../../../04-core-runtime/files/38/idllist.h--38575faace5d.md)
- [`DLList.H`](../../../04-core-runtime/files/16/dllist.h--1675b69bc821.md)
- [`ITstream.H`](../../../04-core-runtime/files/79/itstream.h--7922cfb771c3.md)
- [`Pair.H`](../../../04-core-runtime/files/38/pair.h--38986855df5f.md)
- [`fieldTypes.H`](../../../04-core-runtime/files/92/fieldtypes.h--927f2e391791.md)
- [`Tuple3.H`](../../../04-core-runtime/files/42/tuple3.h--4208deb5e035.md)
- `tuple`
- [`dictionaryTemplates.C`](../../../04-core-runtime/files/bd/dictionarytemplates.c--bd9957c02439.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/ignition/ignitionSite.H](../../../17-other-libraries/files/1b/ignitionsite.h--1b4277c73160.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/departureFrequencyModels/departureFrequencyModel/departureFrequencyModel.H](../../../02-solver-modules/files/c9/departurefrequencymodel.h--c90dfbd63ecf.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/nucleationSiteModels/nucleationSiteModel/nucleationSiteModel.H](../../../02-solver-modules/files/b9/nucleationsitemodel.h--b9a4e3acd390.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/partitioningModel/partitioningModel.H](../../../02-solver-modules/files/a6/partitioningmodel.h--a6ff0895b6bd.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/conductivityModel/conductivityModel/conductivityModel.H](../../../02-solver-modules/files/c3/conductivitymodel.h--c32b022cb714.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/frictionalStressModel/frictionalStressModel/frictionalStressModel.H](../../../02-solver-modules/files/c0/frictionalstressmodel.h--c0108992b2e4.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/granularPressureModel/granularPressureModel/granularPressureModel.H](../../../02-solver-modules/files/e2/granularpressuremodel.h--e27a801f0542.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/radialModel/radialModel/radialModel.H](../../../02-solver-modules/files/ce/radialmodel.h--ce3901752d45.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/viscosityModel/viscosityModel/kineticTheoryViscosityModel.H](../../../02-solver-modules/files/ca/kinetictheoryviscositymodel.h--ca67544ffe9c.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/diameterModel/diameterModel.H](../../../02-solver-modules/files/05/diametermodel.h--05dead0a1c2d.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/aspectRatioModels/aspectRatioModel/aspectRatioModel.H](../../../02-solver-modules/files/2d/aspectratiomodel.h--2ddf90085682.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/diffusiveMassTransferModels/diffusiveMassTransferModel/diffusiveMassTransferModel.H](../../../02-solver-modules/files/25/diffusivemasstransfermodel.h--254c242f4479.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/dragModel/dragModel.H](../../../02-solver-modules/files/24/dragmodel.h--243543c89a62.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/heatTransferModel/heatTransferModel.H](../../../02-solver-modules/files/3f/heattransfermodel.h--3f9ca3962c93.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/interfaceCompositionModel/interfaceCompositionModel.H](../../../02-solver-modules/files/47/interfacecompositionmodel.h--47f452528aa2.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/liftModel/liftModel.H](../../../02-solver-modules/files/27/liftmodel.h--277b3d1d6b7e.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/swarmCorrections/swarmCorrection/swarmCorrection.H](../../../02-solver-modules/files/54/swarmcorrection.h--54796bf5db4d.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/turbulentDispersionModels/turbulentDispersionModel/turbulentDispersionModel.H](../../../02-solver-modules/files/65/turbulentdispersionmodel.h--655ee94cca1d.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/virtualMassModels/virtualMassModel/virtualMassModel.H](../../../02-solver-modules/files/09/virtualmassmodel.h--09fe7de2598a.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/wallDampingModels/wallDampingModel/wallDampingModel.H](../../../02-solver-modules/files/69/walldampingmodel.h--69a5cd2d3965.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/wallLubricationModels/wallLubricationModel/wallLubricationModel.H](../../../02-solver-modules/files/35/walllubricationmodel.h--35025372820b.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModel/phaseModel.H](../../../02-solver-modules/files/6a/phasemodel.h--6a4c6bcda31f.md)
- [applications/modules/multiphaseEuler/phaseSystem/surfaceTensionCoefficientModels/surfaceTensionCoefficientModel/surfaceTensionCoefficientModel.H](../../../02-solver-modules/files/d7/surfacetensioncoefficientmodel.h--d7c5fabc4dd9.md)
- [applications/modules/multiphaseEuler/populationBalance/daughterSizeDistributionModels/daughterSizeDistributionModel/daughterSizeDistributionModel.H](../../../02-solver-modules/files/e5/daughtersizedistributionmodel.h--e5609eb848cd.md)
- [applications/modules/XiFluid/bRhoMulticomponentThermo/mixtures/bInhomogeneousMixture/bInhomogeneousMixture.C](../../../02-solver-modules/files/50/binhomogeneousmixture.c--50771628b74b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
