---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a1c77b1647ce"
title: "OpenFOAM 14 源码解析：shockFluid.H"
summary: "该文件声明或实现 `shockFluid`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/shockFluid/shockFluid.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：shockFluid.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/shockFluid/shockFluid.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：302 行
- 文件标识：`a1c77b1647ce`

## 2. 功能说明

该文件声明或实现 `shockFluid`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Solver module for density-based solution of compressible flow Based on central-upwind schemes of Kurganov and Tadmor with support for mesh-motion and topology change. Reference: \verbatim Greenshields, C. J., Weller, H. G., Gasparini, L., & Reese, J. M. (2010). Implementation of semi‐discrete, non‐staggered central schemes in a colocated, polyhedral, finite volume framework, for high‐speed viscous flows. International journal for numerical methods in fluids, 63(1), 1-21. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `shockFluid` | 76 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
2. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`basicFluidSolver.H`](../../../02-solver-modules/files/f8/basicfluidsolver.h--f8f825032c0c.md)
- [`psiThermo.H`](../../../08-thermophysical/files/e9/psithermo.h--e9e39b22d2d2.md)
- [`compressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/eb/compressiblemomentumtransportmodel.h--eb183e43a318.md)
- [`fluidThermoThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/a3/fluidthermothermophysicaltransportmodel.h--a324c10ffaa1.md)

## 8. 直接上层引用

- [applications/modules/shockFluid/correctDensity.C](../../../02-solver-modules/files/c0/correctdensity.c--c077c74bf008.md)
- [applications/modules/shockFluid/fluxPredictor.C](../../../02-solver-modules/files/60/fluxpredictor.c--6000744cab2f.md)
- [applications/modules/shockFluid/momentumPredictor.C](../../../02-solver-modules/files/83/momentumpredictor.c--836e734f2f2e.md)
- [applications/modules/shockFluid/moveMesh.C](../../../02-solver-modules/files/56/movemesh.c--56ab7475bbd2.md)
- [applications/modules/shockFluid/pressureCorrector.C](../../../02-solver-modules/files/e3/pressurecorrector.c--e35292ab1925.md)
- [applications/modules/shockFluid/setRDeltaT.C](../../../02-solver-modules/files/53/setrdeltat.c--5308b3e03236.md)
- [applications/modules/shockFluid/shockFluid.C](../../../02-solver-modules/files/c8/shockfluid.c--c84ae7f028de.md)
- [applications/modules/shockFluid/thermophysicalPredictor.C](../../../02-solver-modules/files/0c/thermophysicalpredictor.c--0c896edceeb8.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
