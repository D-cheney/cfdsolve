---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d1866c69fa0d"
title: "OpenFOAM 14 源码解析：incompressibleFluid.H"
summary: "该文件声明或实现 `incompressibleFluid`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/incompressibleFluid/incompressibleFluid.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：incompressibleFluid.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/incompressibleFluid/incompressibleFluid.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：238 行
- 文件标识：`d1866c69fa0d`

## 2. 功能说明

该文件声明或实现 `incompressibleFluid`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Solver module for steady or transient turbulent flow of incompressible isothermal fluids with optional mesh motion and change. Uses the flexible PIMPLE (PISO-SIMPLE) solution for time-resolved and pseudo-transient and steady simulations. Optional fvModels and fvConstraints are provided to enhance the simulation in many ways including adding various sources, constraining or limiting the solution. Reference: \verbatim Greenshields, C. J., & Weller, H. G. (2022). Notes on Computational Fluid Dynamics: General Principles. CFD Direct Ltd.: Reading, UK. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `incompressibleFluid` | 79 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`basicFluidSolver.H`](../../../02-solver-modules/files/f8/basicfluidsolver.h--f8f825032c0c.md)
- [`viscosityModel.H`](../../../08-thermophysical/files/71/viscositymodel.h--71ddc0685b08.md)
- [`incompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/d6/incompressiblemomentumtransportmodel.h--d66b1dda583c.md)
- [`pressureReference.H`](../../../05-finite-volume/files/8a/pressurereference.h--8adb6fe34768.md)
- [`MRFZones.H`](../../../05-finite-volume/files/30/mrfzones.h--3097cedc6ca7.md)

## 8. 直接上层引用

- [applications/modules/incompressibleFluid/correctPressure.C](../../../02-solver-modules/files/ae/correctpressure.c--ae7b387bbaad.md)
- [applications/modules/incompressibleFluid/incompressibleFluid.C](../../../02-solver-modules/files/f6/incompressiblefluid.c--f69e01ebae16.md)
- [applications/modules/incompressibleFluid/momentumPredictor.C](../../../02-solver-modules/files/b5/momentumpredictor.c--b598e15fafc6.md)
- [applications/modules/incompressibleFluid/moveMesh.C](../../../02-solver-modules/files/04/movemesh.c--04015e51de31.md)
- [applications/modules/incompressibleFluid/setRDeltaT.C](../../../02-solver-modules/files/2d/setrdeltat.c--2d2842840e1f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
