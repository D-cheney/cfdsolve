---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-31f74e846eb1"
title: "OpenFOAM 14 源码解析：BrunDripping.H"
summary: "该文件声明或实现 `BrunDripping`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/isothermalFilm/fvModels/filmCloudTransfer/ejectionModels/BrunDripping/BrunDripping.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：BrunDripping.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/isothermalFilm/fvModels/filmCloudTransfer/ejectionModels/BrunDripping/BrunDripping.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：164 行
- 文件标识：`31f74e846eb1`

## 2. 功能说明

该文件声明或实现 `BrunDripping`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Brun dripping film to cloud ejection transfer model If the film thickness exceeds the critical value needed to generate one or more drops, the equivalent mass is removed from the film. The critical film thickness is calculated from the Rayleigh-Taylor stability analysis of film flow on an inclined plane by Brun et.al. Reference: \verbatim Brun, P. T., Damiano, A., Rieu, P., Balestra, G., & Gallaire, F. (2015). Rayleigh-Taylor instability under an inclined plane. Physics of Fluids (1994-present), 27(8), 084107. \endverbatim The diameter of the drops formed are obtained from the local capillary length multiplied by the \c dCoeff coefficient which defaults to 3.3. Reference: \verbatim Lefebvre, A. (1988). Atomisation and sprays (Vol. 1040, No. 2756). CRC press. \endverbatim Usage Example usage: \verbatim filmCloudTransfer { type filmCloudTransfer; ejection { model BrunDripping; deltaStable 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `BrunDripping` | 94 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`ejectionModel.H`](../../../02-solver-modules/files/4c/ejectionmodel.h--4c76a64026e5.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/fvModels/filmCloudTransfer/ejectionModels/BrunDripping/BrunDripping.C](../../../02-solver-modules/files/1c/brundripping.c--1c3b85564502.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
