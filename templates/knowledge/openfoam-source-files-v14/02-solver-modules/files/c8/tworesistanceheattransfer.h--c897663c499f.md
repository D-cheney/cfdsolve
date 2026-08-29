---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c897663c499f"
title: "OpenFOAM 14 源码解析：twoResistanceHeatTransfer.H"
summary: "该文件声明或实现 `twoResistanceHeatTransfer`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/twoResistanceHeatTransfer/twoResistanceHeatTransfer.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：twoResistanceHeatTransfer.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/twoResistanceHeatTransfer/twoResistanceHeatTransfer.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：247 行
- 文件标识：`c897663c499f`

## 2. 功能说明

该文件声明或实现 `twoResistanceHeatTransfer`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model for heat transfer between two phases. Two heat transfer coefficients are used to calculate the heat fluxes that result from the temperature differences between two phases and their shared interface. Usage Example usage: \verbatim heatTransfer { type twoResistanceHeatTransfer; libs ("libmultiphaseEulerFvModels.so"); blending { type linear; minPartlyContinuousAlpha.air 0; minFullyContinuousAlpha.air 1; minPartlyContinuousAlpha.water 0; minFullyContinuousAlpha.water 1; } air_dispersedIn_water_inThe_air { type spherical; residualAlpha 1e-4; } air_dispersedIn_water_inThe_water { type RanzMarshall; residualAlpha 1e-4; } water_dispersedIn_air_inThe_air { type RanzMarshall; residualAlpha 1e-4; } water_dispersedIn_air_inThe_water { type spherical; residualAlpha 1e-4; } } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `twoResistanceHeatTransfer` | 99 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`heatTransferModel.H`](../../../02-solver-modules/files/3f/heattransfermodel.h--3f9ca3962c93.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/heatTransferLimitedPhaseChange/heatTransferLimitedPhaseChange.C](../../../02-solver-modules/files/51/heattransferlimitedphasechange.c--515537fb7203.md)
- [applications/modules/multiphaseEuler/fvModels/massDiffusionLimitedPhaseChange/massDiffusionLimitedPhaseChange.C](../../../02-solver-modules/files/a6/massdiffusionlimitedphasechange.c--a6f485c4891e.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.C](../../../02-solver-modules/files/23/phasesurfaceboiling.c--2323be6dc4a8.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceCondensation/phaseSurfaceCondensation.C](../../../02-solver-modules/files/94/phasesurfacecondensation.c--94f55988374d.md)
- [applications/modules/multiphaseEuler/phaseSystem/heatTransferSystem/heatTransferSystem.C](../../../02-solver-modules/files/75/heattransfersystem.c--75cbde9d884f.md)
- [applications/modules/multiphaseEuler/phaseSystem/twoResistanceHeatTransfer/twoResistanceHeatTransfer.C](../../../02-solver-modules/files/f0/tworesistanceheattransfer.c--f0c5d227630e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
