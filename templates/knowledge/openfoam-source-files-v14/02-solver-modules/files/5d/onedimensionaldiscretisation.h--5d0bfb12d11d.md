---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5d0bfb12d11d"
title: "OpenFOAM 14 源码解析：oneDimensionalDiscretisation.H"
summary: "该文件声明或实现 `oneDimensionalDiscretisation`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/oneDimensionalDiscretisations/oneDimensionalDiscretisation/oneDimensionalDiscretisation.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：oneDimensionalDiscretisation.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/oneDimensionalDiscretisations/oneDimensionalDiscretisation/oneDimensionalDiscretisation.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：145 行
- 文件标识：`5d0bfb12d11d`

## 2. 功能说明

该文件声明或实现 `oneDimensionalDiscretisation`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Base class for ways in which to generate coordinates in one-dimensional space. Used to space the representative spherical diameters of the groups in a population balance model.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `oneDimensionalDiscretisation` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`dimensionedScalar.H`](../../../04-core-runtime/files/94/dimensionedscalar.h--94226c94054a.md)
- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`oneDimensionalDiscretisationI.H`](../../../02-solver-modules/files/e2/onedimensionaldiscretisationi.h--e25964a4d121.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/populationBalance/oneDimensionalDiscretisations/exponential/exponential_oneDimensionalDiscretisation.H](../../../02-solver-modules/files/20/exponential_onedimensionaldiscretisation.h--20b75be2de98.md)
- [applications/modules/multiphaseEuler/populationBalance/oneDimensionalDiscretisations/manual/manual_oneDimensionalDiscretisation.H](../../../02-solver-modules/files/96/manual_onedimensionaldiscretisation.h--96cd3e9b20e3.md)
- [applications/modules/multiphaseEuler/populationBalance/oneDimensionalDiscretisations/oneDimensionalDiscretisation/oneDimensionalDiscretisation.C](../../../02-solver-modules/files/31/onedimensionaldiscretisation.c--318f377ebf7d.md)
- [applications/modules/multiphaseEuler/populationBalance/oneDimensionalDiscretisations/oneDimensionalDiscretisation/oneDimensionalDiscretisationI.H](../../../02-solver-modules/files/e2/onedimensionaldiscretisationi.h--e25964a4d121.md)
- [applications/modules/multiphaseEuler/populationBalance/oneDimensionalDiscretisations/uniform/uniform_oneDimensionalDiscretisation.H](../../../02-solver-modules/files/2c/uniform_onedimensionaldiscretisation.h--2ca18c3681b4.md)
- [applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.C](../../../02-solver-modules/files/06/populationbalancemodel.c--0601b272c982.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
