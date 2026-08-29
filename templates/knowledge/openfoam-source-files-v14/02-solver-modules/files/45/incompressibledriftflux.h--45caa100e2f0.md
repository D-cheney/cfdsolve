---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-45caa100e2f0"
title: "OpenFOAM 14 源码解析：incompressibleDriftFlux.H"
summary: "该文件声明或实现 `incompressibleDriftFlux`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/incompressibleDriftFlux/incompressibleDriftFlux.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：incompressibleDriftFlux.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/incompressibleDriftFlux/incompressibleDriftFlux.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：254 行
- 文件标识：`45caa100e2f0`

## 2. 功能说明

该文件声明或实现 `incompressibleDriftFlux`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Solver module for 2 incompressible fluids using the mixture approach with the drift-flux approximation for relative motion of the phases, with optional mesh motion and mesh topology changes including adaptive re-meshing. The momentum and other fluid properties are of the "mixture" and a single momentum equation is solved with mixture transport modelling in which a single laminar, RAS or LES model is selected to model the momentum stress. Uses the flexible PIMPLE (PISO-SIMPLE) solution for time-resolved and pseudo-transient and steady simulations. Optional fvModels and fvConstraints are provided to enhance the simulation in many ways including adding various sources, Lagrangian particles, surface film etc. and constraining or limiting the solution.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `incompressibleDriftFlux` | 80 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`twoPhaseSolver.H`](../../../02-solver-modules/files/c0/twophasesolver.h--c09e9817b144.md)
- [`incompressibleDriftFluxMixture.H`](../../../02-solver-modules/files/86/incompressibledriftfluxmixture.h--867ebebeeb68.md)
- [`relativeVelocityModel.H`](../../../02-solver-modules/files/f2/relativevelocitymodel.h--f25260bd9a2c.md)
- [`packingDispersionModel.H`](../../../02-solver-modules/files/36/packingdispersionmodel.h--3629563df7a5.md)
- [`momentumTransportModel.H`](../../../09-turbulence-transport/files/36/momentumtransportmodel.h--36c367269e58.md)
- [`compressibleMomentumTransportModels.H`](../../../09-turbulence-transport/files/07/compressiblemomentumtransportmodels.h--0745b4a591f5.md)

## 8. 直接上层引用

- [applications/modules/incompressibleDriftFlux/alphaSuSp.C](../../../02-solver-modules/files/a2/alphasusp.c--a297ad260107.md)
- [applications/modules/incompressibleDriftFlux/incompressibleDriftFlux.C](../../../02-solver-modules/files/af/incompressibledriftflux.c--af989babb79b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
