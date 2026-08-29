---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cf0e29c1fdfe"
title: "OpenFOAM 14 源码解析：reactionModel.H"
summary: "该文件声明或实现 `reactionModel`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/reactionModels/reactionModel/reactionModel.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：reactionModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/reactionModels/reactionModel/reactionModel.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：201 行
- 文件标识：`cf0e29c1fdfe`

## 2. 功能说明

该文件声明或实现 `reactionModel`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base class for reaction models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `reactionModel` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`compressibleMomentumTransportModels.H`](../../../09-turbulence-transport/files/07/compressiblemomentumtransportmodels.h--0745b4a591f5.md)
- [`fluidMulticomponentThermo.H`](../../../08-thermophysical/files/1f/fluidmulticomponentthermo.h--1f2b100c90da.md)
- [`reactionModelI.H`](../../../08-thermophysical/files/cb/reactionmodeli.h--cb43e0080067.md)

## 8. 直接上层引用

- [applications/modules/multicomponentFluid/multicomponentFluid.H](../../../02-solver-modules/files/79/multicomponentfluid.h--79b9c566088d.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/ReactingPhaseModel/ReactingPhaseModel.C](../../../02-solver-modules/files/f6/reactingphasemodel.c--f6a78c5924ac.md)
- [applications/modules/XiFluid/XiFluid.H](../../../02-solver-modules/files/70/xifluid.h--7017d0f54590.md)
- [src/reactionModels/EDC/EDC.H](../../../08-thermophysical/files/22/edc.h--229f6fc51051.md)
- [src/reactionModels/FSD/reactionRateFlameAreaModels/reactionRateFlameArea/reactionRateFlameArea.H](../../../08-thermophysical/files/4b/reactionrateflamearea.h--4b82f39d908b.md)
- [src/reactionModels/functionObjects/adjustTimeStepToReaction/adjustTimeStepToReaction.C](../../../08-thermophysical/files/bc/adjusttimesteptoreaction.c--bcc15d4aae6f.md)
- [src/reactionModels/functionObjects/Qdot/Qdot.C](../../../08-thermophysical/files/5a/qdot.c--5a4e47d30a34.md)
- [src/reactionModels/laminar/laminar.H](../../../08-thermophysical/files/fd/laminar.h--fd3cfba91e2c.md)
- [src/reactionModels/noReaction/noReaction.H](../../../08-thermophysical/files/f0/noreaction.h--f0b578d80769.md)
- [src/reactionModels/radiationModels/absorptionEmissionModels/greyMeanReaction/greyMeanReaction.C](../../../08-thermophysical/files/cd/greymeanreaction.c--cd625971a7db.md)
- [src/reactionModels/radiationModels/absorptionEmissionModels/wideBandReaction/wideBandReaction.C](../../../08-thermophysical/files/1b/widebandreaction.c--1b19ef5833c1.md)
- [src/reactionModels/reactionModel/reactionModel.C](../../../08-thermophysical/files/53/reactionmodel.c--536db62b4ca4.md)
- [src/reactionModels/reactionModel/reactionModelNew.C](../../../08-thermophysical/files/fa/reactionmodelnew.c--fae9fbf71296.md)
- [src/reactionModels/singleStepReaction/singleStepReaction.H](../../../08-thermophysical/files/a2/singlestepreaction.h--a2f6ceb60544.md)
- [src/reactionModels/zoneReaction/zoneReaction.H](../../../08-thermophysical/files/f1/zonereaction.h--f1500f104722.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
