---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f471b6837913"
title: "OpenFOAM 14 源码解析：runTimeSelectionTables.H"
summary: "该文件实现 `runTimeSelectionTables` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/db/runTimeSelection/construction/runTimeSelectionTables.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：runTimeSelectionTables.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/db/runTimeSelection/construction/runTimeSelectionTables.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：355 行
- 文件标识：`f471b6837913`

## 2. 功能说明

该文件实现 `runTimeSelectionTables` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Macros to ease declaration of run-time selection tables. declareRunTimeSelectionTable is used to create a run-time selection table for a base-class which holds constructor pointers on the table. declareRunTimeNewSelectionTable is used to create a run-time selection table for a derived-class which holds "New" pointers on the table.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `add` | 72 |
| `addRemovable` | 105 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **步骤 1**：宏展开构造函数指针类型和以 `word` 为键的哈希表类型。
2. **步骤 2**：首次注册时构造静态选择表。
3. **步骤 3**：每个派生类通过静态辅助对象把构造函数插入表中。
4. **步骤 4**：`New` 工厂按字典类型名查表并创建派生对象。
5. **步骤 5**：可移除注册项在动态库卸载时撤销，避免悬空函数指针。

## 6. 数学与离散关系

- 映射关系可写成 $\text{typeName}\mapsto\text{constructor pointer}$。

## 7. 直接依赖

- [`token.H`](../../../04-core-runtime/files/0e/token.h--0ef74d375219.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`HashTable.H`](../../../04-core-runtime/files/cb/hashtable.h--cbcdb4c4948d.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/laminarFlameSpeed/laminarFlameSpeed/laminarFlameSpeed.H](../../../17-other-libraries/files/af/laminarflamespeed.h--afbb12993f8d.md)
- [applications/legacy/combustion/PDRFoam/PDRModels/dragModels/PDRDragModel/PDRDragModel.H](../../../17-other-libraries/files/8f/pdrdragmodel.h--8fe618ecfdae.md)
- [applications/legacy/combustion/PDRFoam/XiModels/XiEqModels/XiEqModel/XiEqModel.H](../../../17-other-libraries/files/4b/xieqmodel.h--4b591175636a.md)
- [applications/legacy/combustion/PDRFoam/XiModels/XiGModels/XiGModel/XiGModel.H](../../../17-other-libraries/files/d2/xigmodel.h--d2c02914863d.md)
- [applications/legacy/combustion/PDRFoam/XiModels/XiModel/XiModel.H](../../../17-other-libraries/files/82/ximodel.h--8275b911fce7.md)
- [applications/modules/incompressibleDriftFlux/mixtureViscosityModels/mixtureViscosityModel/mixtureViscosityModel.H](../../../02-solver-modules/files/30/mixtureviscositymodel.h--301e0a43814e.md)
- [applications/modules/incompressibleDriftFlux/packingDispersionModels/packingDispersionModel/packingDispersionModel.H](../../../02-solver-modules/files/36/packingdispersionmodel.h--3629563df7a5.md)
- [applications/modules/incompressibleDriftFlux/relativeVelocityModels/relativeVelocityModel/relativeVelocityModel.H](../../../02-solver-modules/files/f2/relativevelocitymodel.h--f25260bd9a2c.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/departureDiameterModels/departureDiameterModel/departureDiameterModel.H](../../../02-solver-modules/files/62/departurediametermodel.h--62ed4aa3816d.md)
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
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/BlendedInterfacialModel/blendingMethods/blendingMethod/blendingMethod.H](../../../02-solver-modules/files/a7/blendingmethod.h--a71d03986846.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/diffusiveMassTransferModels/diffusiveMassTransferModel/diffusiveMassTransferModel.H](../../../02-solver-modules/files/25/diffusivemasstransfermodel.h--254c242f4479.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/dragModel/dragModel.H](../../../02-solver-modules/files/24/dragmodel.h--243543c89a62.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/heatTransferModel/heatTransferModel.H](../../../02-solver-modules/files/3f/heattransfermodel.h--3f9ca3962c93.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/interfaceCompositionModel/interfaceCompositionModel.H](../../../02-solver-modules/files/47/interfacecompositionmodel.h--47f452528aa2.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/liftModel/liftModel.H](../../../02-solver-modules/files/27/liftmodel.h--277b3d1d6b7e.md)

## 9. 运行时机制

`declareRunTimeSelectionTable`、`declareRunTimeNewSelectionTable`、`defineRunTimeSelectionTableConstructor`、`defineRunTimeSelectionTableDestructor`、`defineRunTimeSelectionTablePtr`、`defineRunTimeSelectionTable`、`defineTemplateRunTimeSelectionTable`、`defineTemplatedRunTimeSelectionTableConstructor`、`defineTemplatedRunTimeSelectionTableDestructor`、`defineTemplatedRunTimeSelectionTablePtr`、`defineTemplatedRunTimeSelectionTable`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
