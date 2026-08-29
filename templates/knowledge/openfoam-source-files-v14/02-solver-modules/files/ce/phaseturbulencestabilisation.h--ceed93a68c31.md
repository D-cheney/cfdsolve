---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ceed93a68c31"
title: "OpenFOAM 14 源码解析：phaseTurbulenceStabilisation.H"
summary: "该文件声明或实现 `phaseTurbulenceStabilisation`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/fvModels/phaseTurbulenceStabilisation/phaseTurbulenceStabilisation.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：phaseTurbulenceStabilisation.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/fvModels/phaseTurbulenceStabilisation/phaseTurbulenceStabilisation.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：208 行
- 文件标识：`ceed93a68c31`

## 2. 功能说明

该文件声明或实现 `phaseTurbulenceStabilisation`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Phase turbulence stabilisation In the limit of a phase-fraction->0 the turbulence properties cannot be obtained from the phase turbulence model, coupling to the other phase/phases is required. The phaseTurbulenceStabilisation fvModel stabilises the phase turbulence properties by adding transfer terms from the corresponding properties of the other phases when the phase-fraction is less than the specified \c alphaInversion. This implementation is a generalisation of the approach used in the Foam::RASModels::LaheyKEpsilon and Foam::RASModels::continuousGasKEpsilon models to handle phase-inversion and free-surface flow and can be used with any combination of RAS turbulence models. To stabilise the solution of the phase turbulence equations \c alphaInversion can be set to a small value e.g. 1e-2, but unless the phase turbulence model is specifically designed to handle phase-inversion and both

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `phaseTurbulenceStabilisation` | 95 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)
- [`phaseModel.H`](../../../02-solver-modules/files/6a/phasemodel.h--6a4c6bcda31f.md)
- [`phaseCompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/cc/phasecompressiblemomentumtransportmodel.h--cc1b40028f94.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/phaseTurbulenceStabilisation/phaseTurbulenceStabilisation.C](../../../02-solver-modules/files/da/phaseturbulencestabilisation.c--da6a9a59b674.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
