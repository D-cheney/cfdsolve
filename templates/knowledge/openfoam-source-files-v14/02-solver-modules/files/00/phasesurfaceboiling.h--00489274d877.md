---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-00489274d877"
title: "OpenFOAM 14 源码解析：phaseSurfaceBoiling.H"
summary: "该文件声明或实现 `multiphaseEuler`、`saturationTemperatureModel`、`partitioningModel`、`nucleationSiteModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：phaseSurfaceBoiling.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：311 行
- 文件标识：`00489274d877`

## 2. 功能说明

该文件声明或实现 `multiphaseEuler`、`saturationTemperatureModel`、`partitioningModel`、`nucleationSiteModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model for nucleate wall boiling on the surface of a third (solid) phase. This model functions very similarly to the wall boiling model (see that model for references). The same sub-models are used, with exactly the same specification syntax. The only difference is that the third phase must be additionally specified, and that a two-resistance heat transfer model must be in operation between the liquid phase and the third phase. Usage Example usage: \verbatim phaseSurfaceBoiling { type phaseSurfaceBoiling; libs ("libmultiphaseEulerFvModels.so"); phase solid; // Note: Order is important. This model is one-way. It turns liquid // into vapour. The phases should be specified in this order. phases (water steam); energySemiImplicit no; saturationTemperature { type constant; value 372.76; } partitioningModel { type Lavieville; alphaCrit 0.2; } nucleationSiteModel { type LemmertChawla; } departure

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `multiphaseEuler` | 111 |
| `saturationTemperatureModel` | 113 |
| `partitioningModel` | 118 |
| `nucleationSiteModel` | 119 |
| `departureDiameterModel` | 120 |
| `departureFrequencyModel` | 121 |
| `phaseSurfaceBoiling` | 130 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`phaseChange.H`](../../../12-boundaries-sources/files/4e/phasechange.h--4efaab490ad4.md)
- [`nucleation.H`](../../../02-solver-modules/files/8d/nucleation.h--8dd79411f109.md)
- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`phaseSurfaceBoiling.H`](../../../02-solver-modules/files/00/phasesurfaceboiling.h--00489274d877.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.C](../../../02-solver-modules/files/23/phasesurfaceboiling.c--2323be6dc4a8.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.H](../../../02-solver-modules/files/00/phasesurfaceboiling.h--00489274d877.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoilingI.H](../../../02-solver-modules/files/ab/phasesurfaceboilingi.h--ab151a394cd8.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
