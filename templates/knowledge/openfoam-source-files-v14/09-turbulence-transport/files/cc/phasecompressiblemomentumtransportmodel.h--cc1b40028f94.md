---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cc1b40028f94"
title: "OpenFOAM 14 源码解析：phaseCompressibleMomentumTransportModel.H"
summary: "该文件声明或实现 `phaseCompressibleMomentumTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：phaseCompressibleMomentumTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：184 行
- 文件标识：`cc1b40028f94`

## 2. 功能说明

该文件声明或实现 `phaseCompressibleMomentumTransportModel`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Templated abstract base class for multiphase compressible momentum transport models.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `phaseCompressibleMomentumTransportModel` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`compressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/eb/compressiblemomentumtransportmodel.h--eb183e43a318.md)
- [`phaseCompressibleMomentumTransportModelTemplates.C`](../../../09-turbulence-transport/files/3c/phasecompressiblemomentumtransportmodeltemplates.c--3c952269c560.md)

## 8. 直接上层引用

- [applications/modules/compressibleVoF/compressibleInterPhaseTransportModel/compressibleInterPhaseTransportModel.H](../../../02-solver-modules/files/3b/compressibleinterphasetransportmodel.h--3b3a19178384.md)
- [applications/modules/multiphaseEuler/fvModels/interfaceTurbulenceDamping/interfaceTurbulenceDamping.H](../../../02-solver-modules/files/40/interfaceturbulencedamping.h--40298659dc48.md)
- [applications/modules/multiphaseEuler/fvModels/phaseTurbulenceStabilisation/phaseTurbulenceStabilisation.H](../../../02-solver-modules/files/ce/phaseturbulencestabilisation.h--ceed93a68c31.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/kineticTheoryModel/kineticTheoryModel.H](../../../02-solver-modules/files/ac/kinetictheorymodel.h--accedfde16f8.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/phasePressureModel/phasePressureModel.H](../../../02-solver-modules/files/a4/phasepressuremodel.h--a4af1831149f.md)
- [applications/modules/multiphaseEuler/multiphaseEuler.H](../../../02-solver-modules/files/1d/multiphaseeuler.h--1da7f90917b2.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/IATEsource/IATEsource.C](../../../02-solver-modules/files/0c/iatesource.c--0ceea8c508d8.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/turbulentDispersionModels/dispersedTurbulentDispersionModel/dispersedTurbulentDispersionModel.H](../../../02-solver-modules/files/84/dispersedturbulentdispersionmodel.h--8420f2b23dc4.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/MovingPhaseModel/MovingPhaseModel.H](../../../02-solver-modules/files/de/movingphasemodel.h--de4ce986f741.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/ThermophysicalTransportPhaseModel/ThermophysicalTransportPhaseModel.H](../../../02-solver-modules/files/4f/thermophysicaltransportphasemodel.h--4fa50dae5b8e.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/Kusters/Kusters.C](../../../02-solver-modules/files/78/kusters.c--783bfd4c5319.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/Laakkonen/Laakkonen.C](../../../02-solver-modules/files/b2/laakkonen.c--b2fe40c42b72.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/LehrMilliesMewes/LehrMilliesMewes.C](../../../02-solver-modules/files/5b/lehrmilliesmewes.c--5b9ca16ad14b.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/Liao/Liao.C](../../../02-solver-modules/files/cc/liao.c--cc556dd630e3.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/Liao/LiaoBase.C](../../../02-solver-modules/files/01/liaobase.c--013d369aca6d.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/LuoSvendsen/LuoSvendsen.C](../../../02-solver-modules/files/6e/luosvendsen.c--6ec375850dbe.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/AdachiStuartFokkink/AdachiStuartFokkink.C](../../../02-solver-modules/files/5d/adachistuartfokkink.c--5d69b07b0bb2.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/CoulaloglouTavlarides/CoulaloglouTavlarides.C](../../../02-solver-modules/files/1e/coulalogloutavlarides.c--1e427082bc86.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/LehrMilliesMewesCoalescence/LehrMilliesMewesCoalescence.C](../../../02-solver-modules/files/cc/lehrmilliesmewescoalescence.c--ccd8460b8454.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/LiaoCoalescence/LiaoCoalescence.C](../../../02-solver-modules/files/2c/liaocoalescence.c--2cb266443fc7.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/Luo/Luo.C](../../../02-solver-modules/files/37/luo.c--37360aa1818f.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/PrinceBlanch/PrinceBlanch.C](../../../02-solver-modules/files/a0/princeblanch.c--a0700a93d70e.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/turbulentShear/turbulentShear.C](../../../02-solver-modules/files/5e/turbulentshear.c--5e501ef0675c.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.C](../../../02-solver-modules/files/06/populationbalancemodel.c--0601b272c982.md)
- [applications/modules/multiphaseEuler/thermophysicalTransportModels/derivedFvPatchFields/multiphaseCoupledTemperature/multiphaseCoupledTemperatureFvPatchScalarField.C](../../../02-solver-modules/files/13/multiphasecoupledtemperaturefvpatchscalarfield.c--136bdcc61a0e.md)

## 9. 运行时机制

`declareRunTimeNewSelectionTable`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
