---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6815becd5c16"
title: "OpenFOAM 14 源码解析：coalescenceModel.H"
summary: "该文件声明或实现 `coalescenceModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/coalescenceModels/coalescenceModel/coalescenceModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：coalescenceModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/coalescenceModels/coalescenceModel/coalescenceModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：140 行
- 文件标识：`6815becd5c16`

## 2. 功能说明

该文件声明或实现 `coalescenceModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Base class for coalescence models.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `coalescenceModel` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`populationBalanceModel.H`](../../../02-solver-modules/files/c6/populationbalancemodel.h--c61e09f33eb3.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/AdachiStuartFokkink/AdachiStuartFokkink.H](../../../02-solver-modules/files/e1/adachistuartfokkink.h--e1cf9e395e08.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/ballisticCollisions/ballisticCollisions.H](../../../02-solver-modules/files/a4/ballisticcollisions.h--a48cfd1abfe4.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/BrownianCollisions/BrownianCollisions.H](../../../02-solver-modules/files/7e/browniancollisions.h--7e4397e5df20.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/coalescenceModel/coalescenceModel.C](../../../02-solver-modules/files/90/coalescencemodel.c--90ca355a0865.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/constantCoalescence/constantCoalescence.H](../../../02-solver-modules/files/76/constantcoalescence.h--7631cf6827fc.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/CoulaloglouTavlarides/CoulaloglouTavlarides.H](../../../02-solver-modules/files/c6/coulalogloutavlarides.h--c6695a4193db.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/DahnekeInterpolation/DahnekeInterpolation.H](../../../02-solver-modules/files/73/dahnekeinterpolation.h--73ef803bf704.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/hydrodynamic/hydrodynamic.H](../../../02-solver-modules/files/04/hydrodynamic.h--04c5fcff485b.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/LehrMilliesMewesCoalescence/LehrMilliesMewesCoalescence.H](../../../02-solver-modules/files/dc/lehrmilliesmewescoalescence.h--dca900c569f3.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/LiaoCoalescence/LiaoCoalescence.H](../../../02-solver-modules/files/a6/liaocoalescence.h--a63fd076e6a0.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/Luo/Luo.H](../../../02-solver-modules/files/18/luo.h--184f1b682736.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/noCoalescence/noCoalescence.H](../../../02-solver-modules/files/35/nocoalescence.h--355cba7fe1ec.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/PrinceBlanch/PrinceBlanch.H](../../../02-solver-modules/files/13/princeblanch.h--138530a0a774.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/turbulentShear/turbulentShear.H](../../../02-solver-modules/files/f7/turbulentshear.h--f73ae68b53fc.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.C](../../../02-solver-modules/files/06/populationbalancemodel.c--0601b272c982.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
