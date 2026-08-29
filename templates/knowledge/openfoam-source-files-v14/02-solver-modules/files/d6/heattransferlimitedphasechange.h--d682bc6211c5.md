---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d682bc6211c5"
title: "OpenFOAM 14 源码解析：heatTransferLimitedPhaseChange.H"
summary: "该文件声明或实现 `multiphaseEuler`、`heatTransferLimitedPhaseChange`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/fvModels/heatTransferLimitedPhaseChange/heatTransferLimitedPhaseChange.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：heatTransferLimitedPhaseChange.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/fvModels/heatTransferLimitedPhaseChange/heatTransferLimitedPhaseChange.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：209 行
- 文件标识：`d682bc6211c5`

## 2. 功能说明

该文件声明或实现 `multiphaseEuler`、`heatTransferLimitedPhaseChange`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model for heat transfer rate limited phase change between two phases. The interface between the two phases is assumed to be at a saturated condition. This allows the temperature of the interface to be evaluated from a user-supplied saturation curve. This temperature then defines the heat flux being transferred to the interface from the surrounding fluid. The imbalance in the heat fluxes on either side of the interface is then divided by the latent heat of phase change in order to get the rate at which mass is being changed from one phase to the other. This model only supports pure phases. A two-resistance heat transfer model must also be in operation between the two changing phases. Usage Example usage: \verbatim phaseChange { type heatTransferLimitedPhaseChange; libs ("libmultiphaseEulerFvModels.so"); phases (steam water); energySemiImplicit yes; pressureImplicit no; saturationTemperatu

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `multiphaseEuler` | 88 |
| `heatTransferLimitedPhaseChange` | 97 |

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
- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`saturationTemperatureModel.H`](../../../08-thermophysical/files/d5/saturationtemperaturemodel.h--d5b7fc4d2db0.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/heatTransferLimitedPhaseChange/heatTransferLimitedPhaseChange.C](../../../02-solver-modules/files/51/heattransferlimitedphasechange.c--515537fb7203.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
