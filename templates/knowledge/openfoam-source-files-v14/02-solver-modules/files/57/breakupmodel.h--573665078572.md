---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-573665078572"
title: "OpenFOAM 14 源码解析：breakupModel.H"
summary: "该文件声明或实现 `breakupModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/breakupModels/breakupModel/breakupModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：breakupModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/breakupModels/breakupModel/breakupModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：138 行
- 文件标识：`573665078572`

## 2. 功能说明

该文件声明或实现 `breakupModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Base class for breakup models which provide a total breakup rate and a separate daughter size distribution function.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `breakupModel` | 61 |

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
- [`daughterSizeDistributionModel.H`](../../../02-solver-modules/files/e5/daughtersizedistributionmodel.h--e5609eb848cd.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/populationBalance/breakupModels/binary/binary.H](../../../02-solver-modules/files/b2/binary.h--b25a75ba21a2.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/breakupModel/breakupModel.C](../../../02-solver-modules/files/49/breakupmodel.c--498dc9b17356.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/daughterSizeDistribution/daughterSizeDistribution.H](../../../02-solver-modules/files/7b/daughtersizedistribution.h--7b934cb401e4.md)
- [applications/modules/multiphaseEuler/populationBalance/breakupModels/noBreakup/noBreakup.H](../../../02-solver-modules/files/4b/nobreakup.h--4bce771b957a.md)
- [applications/modules/multiphaseEuler/populationBalance/daughterSizeDistributionModels/daughterSizeDistributionModel/daughterSizeDistributionModel.C](../../../02-solver-modules/files/91/daughtersizedistributionmodel.c--91e7b731900c.md)
- [applications/modules/multiphaseEuler/populationBalance/daughterSizeDistributionModels/LaakkonenDaughterSizeDistribution/LaakkonenDaughterSizeDistribution.C](../../../02-solver-modules/files/29/laakkonendaughtersizedistribution.c--298bb686af32.md)
- [applications/modules/multiphaseEuler/populationBalance/daughterSizeDistributionModels/uniformBinary/uniformBinary.C](../../../02-solver-modules/files/35/uniformbinary.c--355ff2f250f2.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
