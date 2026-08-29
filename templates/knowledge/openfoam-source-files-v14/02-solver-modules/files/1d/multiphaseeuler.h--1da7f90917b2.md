---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1da7f90917b2"
title: "OpenFOAM 14 源码解析：multiphaseEuler.H"
summary: "该文件声明或实现 `multiphaseEuler`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/multiphaseEuler.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：multiphaseEuler.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/multiphaseEuler.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：314 行
- 文件标识：`1da7f90917b2`

## 2. 功能说明

该文件声明或实现 `multiphaseEuler`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Solver module for a system of any number of compressible fluid phases with a common pressure, but otherwise separate properties. The type of phase model is run time selectable and can optionally represent multiple species and in-phase reactions. The phase system is also run time selectable and can optionally represent different types of momentum, heat and mass transfer. Uses the flexible PIMPLE (PISO-SIMPLE) solution for time-resolved and pseudo-transient and steady simulations. Optional fvModels and fvConstraints are provided to enhance the simulation in many ways including adding various sources, Lagrangian particles, surface film etc. and constraining or limiting the solution.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `multiphaseEuler` | 78 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`basicFluidSolver.H`](../../../02-solver-modules/files/f8/basicfluidsolver.h--f8f825032c0c.md)
- [`momentumTransferSystem.H`](../../../02-solver-modules/files/27/momentumtransfersystem.h--2734c12df7e8.md)
- [`heatTransferSystem.H`](../../../02-solver-modules/files/b8/heattransfersystem.h--b8051f740e43.md)
- [`populationBalanceSystem.H`](../../../02-solver-modules/files/80/populationbalancesystem.h--803942ff018c.md)
- [`phaseCompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/cc/phasecompressiblemomentumtransportmodel.h--cc1b40028f94.md)
- [`buoyancy.H`](../../../05-finite-volume/files/b9/buoyancy.h--b90419eb5877.md)
- [`pressureReference.H`](../../../05-finite-volume/files/8a/pressurereference.h--8adb6fe34768.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/cellPressureCorrector.C](../../../02-solver-modules/files/a4/cellpressurecorrector.c--a47979c370a6.md)
- [applications/modules/multiphaseEuler/compressibilityEqns.C](../../../02-solver-modules/files/09/compressibilityeqns.c--09b1dcb8a98a.md)
- [applications/modules/multiphaseEuler/facePressureCorrector.C](../../../02-solver-modules/files/07/facepressurecorrector.c--07a6a3b2eb59.md)
- [applications/modules/multiphaseEuler/fvModels/heatTransferLimitedPhaseChange/heatTransferLimitedPhaseChange.C](../../../02-solver-modules/files/51/heattransferlimitedphasechange.c--515537fb7203.md)
- [applications/modules/multiphaseEuler/fvModels/homogeneousNucleation/homogeneousNucleation.C](../../../02-solver-modules/files/72/homogeneousnucleation.c--72b61d5d988f.md)
- [applications/modules/multiphaseEuler/fvModels/massDiffusionLimitedPhaseChange/massDiffusionLimitedPhaseChange.C](../../../02-solver-modules/files/a6/massdiffusionlimitedphasechange.c--a6f485c4891e.md)
- [applications/modules/multiphaseEuler/fvModels/multiphaseEulerCavitation/multiphaseEulerCavitation.C](../../../02-solver-modules/files/74/multiphaseeulercavitation.c--74cf06cd6440.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.C](../../../02-solver-modules/files/23/phasesurfaceboiling.c--2323be6dc4a8.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceCondensation/phaseSurfaceCondensation.C](../../../02-solver-modules/files/94/phasesurfacecondensation.c--94f55988374d.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.C](../../../02-solver-modules/files/cf/wallboiling.c--cf724a332c73.md)
- [applications/modules/multiphaseEuler/fvModels/wallCondensation/wallCondensation.C](../../../02-solver-modules/files/8a/wallcondensation.c--8ac7e61c3c3a.md)
- [applications/modules/multiphaseEuler/momentumPredictor.C](../../../02-solver-modules/files/26/momentumpredictor.c--26d924a46947.md)
- [applications/modules/multiphaseEuler/moveMesh.C](../../../02-solver-modules/files/fe/movemesh.c--feefb02c21b4.md)
- [applications/modules/multiphaseEuler/multiphaseEuler.C](../../../02-solver-modules/files/15/multiphaseeuler.c--1540429042b5.md)
- [applications/modules/multiphaseEuler/pressureCorrector.C](../../../02-solver-modules/files/d6/pressurecorrector.c--d6e8309323d8.md)
- [applications/modules/multiphaseEuler/setRDeltaT.C](../../../02-solver-modules/files/74/setrdeltat.c--7449d867c777.md)
- [applications/modules/multiphaseEuler/thermophysicalPredictor.C](../../../02-solver-modules/files/a1/thermophysicalpredictor.c--a1a10969d759.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
