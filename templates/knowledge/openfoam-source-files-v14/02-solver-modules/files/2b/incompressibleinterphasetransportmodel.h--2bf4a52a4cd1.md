---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2bf4a52a4cd1"
title: "OpenFOAM 14 源码解析：incompressibleInterPhaseTransportModel.H"
summary: "该文件声明或实现 `incompressibleInterPhaseTransportModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/incompressibleVoF/incompressibleInterPhaseTransportModel/incompressibleInterPhaseTransportModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：incompressibleInterPhaseTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/incompressibleVoF/incompressibleInterPhaseTransportModel/incompressibleInterPhaseTransportModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：146 行
- 文件标识：`2bf4a52a4cd1`

## 2. 功能说明

该文件声明或实现 `incompressibleInterPhaseTransportModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Transport model selection class for the interFoam family of solvers. By default the standard mixture transport modelling approach is used in which a single momentum stress model (laminar, non-Newtonian, LES or RAS) is constructed for the mixture. However if the \c simulationType in constant/momentumTransport is set to \c twoPhaseTransport the alternative Euler-Euler two-phase transport modelling approach is used in which separate stress models (laminar, non-Newtonian, LES or RAS) are instantiated for each of the two phases allowing for different modeling for the phases.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `incompressibleInterPhaseTransportModel` | 64 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`incompressibleTwoPhaseVoFMixture.H`](../../../02-solver-modules/files/85/incompressibletwophasevofmixture.h--857f4536c4a4.md)
- [`incompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/d6/incompressiblemomentumtransportmodel.h--d66b1dda583c.md)
- [`phaseIncompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/71/phaseincompressiblemomentumtransportmodel.h--711c3bc93613.md)

## 8. 直接上层引用

- [applications/modules/incompressibleVoF/incompressibleInterPhaseTransportModel/incompressibleInterPhaseTransportModel.C](../../../02-solver-modules/files/df/incompressibleinterphasetransportmodel.c--df5a324d3b92.md)
- [applications/modules/incompressibleVoF/incompressibleVoF.H](../../../02-solver-modules/files/71/incompressiblevof.h--714ca03662a3.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
