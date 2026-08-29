---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9525db6c41c7"
title: "OpenFOAM 14 源码解析：omegaWallFunctionFvPatchScalarField.H"
summary: "该文件声明或实现 `momentumTransportModel`、`omegaWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/omegaWallFunctions/omegaWallFunction/omegaWallFunctionFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：omegaWallFunctionFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/omegaWallFunctions/omegaWallFunction/omegaWallFunctionFvPatchScalarField.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：221 行
- 文件标识：`9525db6c41c7`

## 2. 功能说明

该文件声明或实现 `momentumTransportModel`、`omegaWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：This boundary condition provides a wall constraint on turbulnce specific dissipation, omega for both low and high Reynolds number turbulence models. The near-wall omega may be either blended between the viscous region and logarithmic region values or switched between these values based on the laminar-to-turbulent y+ value derived from kappa and E specified in the corresponding nutWallFunction. Recent tests have shown that the standard switching method provides more accurate results for 10 < y+ < 30 when used with high Reynolds number wall-functions and both methods provide accurate results when used with continuous wall-functions. Based on this the standard switching method is used by default. Usage \table Property | Description | Required | Default value beta1 | Model coefficient | no | 0.075 blended | Blending switch | no | false \endtable Example of the boundary condition specificatio

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `momentumTransportModel` | 79 |
| `omegaWallFunctionFvPatchScalarField` | 85 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`wallCellWallFunctionFvPatchScalarField.H`](../../../09-turbulence-transport/files/6e/wallcellwallfunctionfvpatchscalarfield.h--6e3b5b2f33b2.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/omegaWallFunctions/omegaWallFunction/omegaWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/8f/omegawallfunctionfvpatchscalarfield.c--8f6bcae3bbe1.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
