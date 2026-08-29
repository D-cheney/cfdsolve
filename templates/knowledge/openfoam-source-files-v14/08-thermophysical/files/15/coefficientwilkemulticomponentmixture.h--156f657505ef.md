---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-156f657505ef"
title: "OpenFOAM 14 源码解析：coefficientWilkeMulticomponentMixture.H"
summary: "该文件声明或实现 `coefficientWilkeMulticomponentMixture`、`transportMixtureType`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/multicomponentThermo/mixtures/coefficientWilkeMulticomponentMixture/coefficientWilkeMulticomponentMixture.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：coefficientWilkeMulticomponentMixture.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/multicomponentThermo/mixtures/coefficientWilkeMulticomponentMixture/coefficientWilkeMulticomponentMixture.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：203 行
- 文件标识：`156f657505ef`

## 2. 功能说明

该文件声明或实现 `coefficientWilkeMulticomponentMixture`、`transportMixtureType`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Thermophysical properties mixing class which applies mass-fraction weighted mixing to the thermodynamic coefficients and Wilke's equation to transport properties. Reference: \verbatim Wilke, C. R. (1950). A viscosity equation for gas mixtures. The journal of chemical physics, 18(4), 517-519. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `coefficientWilkeMulticomponentMixture` | 65 |
| `transportMixtureType` | 79 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`multicomponentMixture.H`](../../../08-thermophysical/files/d3/multicomponentmixture.h--d351c1c5c9d1.md)
- [`FieldListSlice.H`](../../../08-thermophysical/files/24/fieldlistslice.h--24d64925b760.md)
- [`scalarMatrices.H`](../../../06-linear-algebra/files/64/scalarmatrices.h--64cd68897b02.md)
- [`coefficientWilkeMulticomponentMixture.C`](../../../08-thermophysical/files/43/coefficientwilkemulticomponentmixture.c--436931df290c.md)

## 8. 直接上层引用

- [src/Lagrangian/LagrangianThermo/fluidMulticomponentLagrangianThermo/fluidMulticomponentLagrangianThermos.C](../../../11-lagrangian/files/1b/fluidmulticomponentlagrangianthermos.c--1bff6f38d81e.md)
- [src/thermophysicalModels/multicomponentThermo/mixtures/coefficientWilkeMulticomponentMixture/coefficientWilkeMulticomponentMixture.C](../../../08-thermophysical/files/43/coefficientwilkemulticomponentmixture.c--436931df290c.md)
- [src/thermophysicalModels/multicomponentThermo/psiMulticomponentThermo/psiMulticomponentThermos.C](../../../08-thermophysical/files/b3/psimulticomponentthermos.c--b3f1e0675fc7.md)
- [src/thermophysicalModels/multicomponentThermo/rhoFluidMulticomponentThermo/rhoFluidMulticomponentThermos.C](../../../08-thermophysical/files/37/rhofluidmulticomponentthermos.c--37829f385a55.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
