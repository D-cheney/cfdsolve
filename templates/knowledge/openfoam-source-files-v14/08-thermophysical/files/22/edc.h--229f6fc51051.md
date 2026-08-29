---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-229f6fc51051"
title: "OpenFOAM 14 源码解析：EDC.H"
summary: "该文件声明或实现 `EDC`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/reactionModels/EDC/EDC.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：EDC.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/reactionModels/EDC/EDC.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：238 行
- 文件标识：`229f6fc51051`

## 2. 功能说明

该文件声明或实现 `EDC`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Eddy Dissipation Concept (EDC) turbulent reaction model. This model considers that the reaction occurs in the regions of the flow where the dissipation of turbulence kinetic energy takes place (fine structures). The mass fraction of the fine structures and the mean residence time are provided by an energy cascade model. There are many versions and developments of the EDC model, 4 of which are currently supported in this implementation: v1981, v1996, v2005 and v2016. The model variant is selected using the optional \c version entry in the \c EDC dictionary \verbatim EDC { version v2016; } \endverbatim The default version is \c v2005 if the \c version entry is not specified. Model versions and references: \verbatim Version v2005: Cgamma = 2.1377 Ctau = 0.4083 kappa = gammaL^exp1 / (1 - gammaL^exp2), where exp1 = 2, and exp2 = 2. Magnussen, B. F. (2005, June). The Eddy Dissipation Concept -

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `EDC` | 138 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`reactionModel.H`](../../../08-thermophysical/files/cf/reactionmodel.h--cf0e29c1fdfe.md)
- [`chemistryModel.H`](../../../08-thermophysical/files/0a/chemistrymodel.h--0a981c57d469.md)
- [`NamedEnum.H`](../../../04-core-runtime/files/34/namedenum.h--3437c5255062.md)

## 8. 直接上层引用

- [src/reactionModels/EDC/EDC.C](../../../08-thermophysical/files/1c/edc.c--1c8838ef681e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
