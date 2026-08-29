---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3aa9f65ead29"
title: "OpenFOAM 14 源码解析：populationBalance.H"
summary: "该文件声明或实现 `populationBalanceModel`、`populationBalance`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/diameterModels/populationBalance/populationBalance.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：populationBalance.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/diameterModels/populationBalance/populationBalance.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：174 行
- 文件标识：`3aa9f65ead29`

## 2. 功能说明

该文件声明或实现 `populationBalanceModel`、`populationBalance`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：This diameter model computes the diameter from multiple size group diameters and fractions provided by an associated population balance model. This model requires the name of the population balance model to be specified, and will trigger construction of said population balance model. The number of groups associated with the phase is also specified here. The sizes/diameters themselves, as well as all models relating to evolution of the size distribution (i.e., coalescence and breakup) are specified for population balance model and not for this diameter model. Usage Excerpt from an exemplary phaseProperties dictionary: \verbatim diameterModel { type populationBalance; populationBalance bubbles; nGroups 10; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `populationBalanceModel` | 76 |
| `populationBalance` | 84 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`diameterModel.H`](../../../02-solver-modules/files/05/diametermodel.h--05dead0a1c2d.md)
- [`populationBalanceI.H`](../../../02-solver-modules/files/f5/populationbalancei.h--f506b8d687c8.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/functionObjects/populationBalanceSetSizeDistribution/populationBalanceSetSizeDistribution.C](../../../02-solver-modules/files/d0/populationbalancesetsizedistribution.c--d0df3ddfad45.md)
- [applications/modules/multiphaseEuler/populationBalance/diameterModels/populationBalance/populationBalance.C](../../../02-solver-modules/files/5c/populationbalance.c--5c813a7fcc48.md)
- [applications/modules/multiphaseEuler/populationBalance/diameterModels/populationBalance/populationBalanceI.H](../../../02-solver-modules/files/f5/populationbalancei.h--f506b8d687c8.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.C](../../../02-solver-modules/files/06/populationbalancemodel.c--0601b272c982.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.H](../../../02-solver-modules/files/c6/populationbalancemodel.h--c61e09f33eb3.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModelI.H](../../../02-solver-modules/files/9f/populationbalancemodeli.h--9f3f03b71eeb.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceSystem/populationBalanceSystem.C](../../../02-solver-modules/files/b5/populationbalancesystem.c--b5f00bb2f9bb.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
