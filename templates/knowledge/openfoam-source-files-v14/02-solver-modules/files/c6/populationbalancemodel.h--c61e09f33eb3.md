---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c61e09f33eb3"
title: "OpenFOAM 14 源码解析：populationBalanceModel.H"
summary: "该文件实现 `populationBalanceModel` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：populationBalanceModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：707 行
- 文件标识：`c61e09f33eb3`

## 2. 功能说明

该文件实现 `populationBalanceModel` 相关对象的读取、写出或流序列化。

中文导航角色：模块化求解器实现。

上游说明：Model for tracking the evolution of a dispersed phase size distribution due to coalescence (synonymous with coagulation, aggregation, agglomeration) and breakup events as well as density or phase changes. Provides an approximate solution of the population balance equation by means of a class method. The underlying theory is described in the article of Lehnigk et al. (2021). The size distribution, expressed through a volume-based number density function, is discretised using the fixot pivot technique of Kumar and Ramkrishna (1996). Thereby, the population balance equation is transformed into a series of transport equations for the particle (bubble, droplet) number concentrations in separate size classes that are coupled through their source terms. The discretisation is based on representative particle volumes, which are provided by the user through the corresponding sphere equivalent diam

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `distribution` | 236 |
| `phaseCompressibleMomentumTransportModel` | 238 |
| `shapeModel` | 242 |
| `coalescenceModel` | 243 |
| `breakupModel` | 244 |
| `daughterSizeDistribution` | 248 |
| `binary` | 249 |
| `populationBalanceModel` | 256 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
2. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`daughterSizeDistributionModel.H`](../../../02-solver-modules/files/e5/daughtersizedistributionmodel.h--e5609eb848cd.md)
- [`populationBalance.H`](../../../02-solver-modules/files/3a/populationbalance.h--3aa9f65ead29.md)
- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`HashPtrTable.H`](../../../04-core-runtime/files/4a/hashptrtable.h--4ab8e1bdb8c9.md)
- [`populationBalanceModelI.H`](../../../02-solver-modules/files/9f/populationbalancemodeli.h--9f3f03b71eeb.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/functionObjects/populationBalanceMoments/populationBalanceMoments.H](../../../02-solver-modules/files/eb/populationbalancemoments.h--eb8560a1ec3f.md)
- [applications/modules/multiphaseEuler/functionObjects/populationBalanceSetSizeDistribution/populationBalanceSetSizeDistribution.H](../../../02-solver-modules/files/16/populationbalancesetsizedistribution.h--16fe10289c24.md)
- [applications/modules/multiphaseEuler/functionObjects/populationBalanceSizeDistribution/populationBalanceSizeDistribution.C](../../../02-solver-modules/files/6c/populationbalancesizedistribution.c--6c9ba4365b5b.md)
- [applications/modules/multiphaseEuler/functionObjects/populationBalanceSizeDistribution/populationBalanceSizeDistribution.H](../../../02-solver-modules/files/dc/populationbalancesizedistribution.h--dcc7840adb45.md)
- [applications/modules/multiphaseEuler/fvModels/derivedFvFieldSources/nucleationGroupFraction/nucleationGroupFractionFvScalarFieldSource.C](../../../02-solver-modules/files/c8/nucleationgroupfractionfvscalarfieldsource.c--c854b6cb8c31.md)
- [applications/modules/multiphaseEuler/fvModels/derivedFvFieldSources/nucleationGroupSurfaceAreaVolumeRatio/nucleationGroupSurfaceAreaVolumeRatioFvScalarFieldSource.C](../../../02-solver-modules/files/7a/nucleationgroupsurfaceareavolumeratiofvscalarfieldsource.c--7a7d9666a552.md)
- [applications/modules/multiphaseEuler/fvModels/KochFriedlanderSintering/KochFriedlanderSintering.H](../../../02-solver-modules/files/bf/kochfriedlandersintering.h--bf48b1df5668.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/breakupModel/breakupModel.H](../../../02-solver-modules/files/57/breakupmodel.h--573665078572.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/Liao/LiaoBase.H](../../../02-solver-modules/files/50/liaobase.h--501372e1c0e8.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/coalescenceModel/coalescenceModel.H](../../../02-solver-modules/files/68/coalescencemodel.h--6815becd5c16.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFields/groupProperty/groupPropertyFvScalarField.C](../../../02-solver-modules/files/57/grouppropertyfvscalarfield.c--57a2a136a7dc.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/distributionGroupFraction/distributionGroupFractionFvScalarFieldSource.C](../../../02-solver-modules/files/8b/distributiongroupfractionfvscalarfieldsource.c--8b42212e4c09.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/growthGroupFraction/growthGroupFractionFvScalarFieldSource.C](../../../02-solver-modules/files/6c/growthgroupfractionfvscalarfieldsource.c--6c54f1f49ac3.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/growthSecondaryProperty/growthSecondaryPropertyFvScalarFieldSource.C](../../../02-solver-modules/files/33/growthsecondarypropertyfvscalarfieldsource.c--33430f23577c.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/uniformFixedValueGroupSurfaceAreaVolumeRatio/uniformFixedValueGroupSurfaceAreaVolumeRatioFvScalarFieldSource.C](../../../02-solver-modules/files/4c/uniformfixedvaluegroupsurfaceareavolumeratiofvscalarfieldsource.c--4c430d9dbc67.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvPatchFields/distributionGroupFraction/distributionGroupFractionFvPatchScalarField.C](../../../02-solver-modules/files/6b/distributiongroupfractionfvpatchscalarfield.c--6b7d80ecf079.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvPatchFields/singleGroupFraction/singleGroupFractionFvPatchScalarField.C](../../../02-solver-modules/files/f5/singlegroupfractionfvpatchscalarfield.c--f5b99df99af8.md)
- [applications/modules/multiphaseEuler/populationBalance/diameterModels/populationBalance/populationBalance.C](../../../02-solver-modules/files/5c/populationbalance.c--5c813a7fcc48.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.C](../../../02-solver-modules/files/06/populationbalancemodel.c--0601b272c982.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModelI.H](../../../02-solver-modules/files/9f/populationbalancemodeli.h--9f3f03b71eeb.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceSystem/populationBalanceSystem.H](../../../02-solver-modules/files/80/populationbalancesystem.h--803942ff018c.md)
- [applications/modules/multiphaseEuler/populationBalance/SecondaryPropertyModel/SecondaryPropertyModel.H](../../../02-solver-modules/files/a1/secondarypropertymodel.h--a1e6da6f4eae.md)
- [applications/modules/multiphaseEuler/populationBalance/shapeModels/fractal/fractal.C](../../../02-solver-modules/files/50/fractal.c--50e8820b6c8f.md)
- [applications/modules/multiphaseEuler/populationBalance/shapeModels/shapeModel/shapeModel.C](../../../02-solver-modules/files/01/shapemodel.c--01050e4dd85b.md)
- [applications/modules/multiphaseEuler/populationBalance/shapeModels/spherical/spherical.C](../../../02-solver-modules/files/98/spherical.c--98c899aaaab1.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
