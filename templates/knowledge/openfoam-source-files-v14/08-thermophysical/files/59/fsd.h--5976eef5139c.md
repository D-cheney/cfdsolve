---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5976eef5139c"
title: "OpenFOAM 14 源码解析：FSD.H"
summary: "该文件声明或实现 `FSD`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/reactionModels/FSD/FSD.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：FSD.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/reactionModels/FSD/FSD.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：178 行
- 文件标识：`5976eef5139c`

## 2. 功能说明

该文件声明或实现 `FSD`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Flame Surface Density (FDS) reaction model. The fuel source term is given by mgft*pc*omegaFuelBar. where: mgft: filtered flame area. pc: probability of the reaction progress. omegaFuelBar: filtered consumption speed per unit of flame area. pc is considered from the IFC solution. omegaFuelBar is calculated solving a relaxation equation which tends to omegaEq. This omegaEq is obtained from the flamelet solution for different strain rates and fit using a exponential distribution. The spatial distribution of the consumption speed (omega) is obtained also from a strained flamelet solution and it is assumed to have a gaussian distribution. If the grid resolution is not enough to resolve the flame, the consumption speed distribution is linearly thickened conserving the overall heat release. If the turbulent fluctuation of the mixture fraction at the sub-grid level is large (>1e-04) then a beta 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `FSD` | 84 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`singleStepReaction.H`](../../../08-thermophysical/files/a2/singlestepreaction.h--a2f6ceb60544.md)
- [`reactionRateFlameArea.H`](../../../08-thermophysical/files/4b/reactionrateflamearea.h--4b82f39d908b.md)

## 8. 直接上层引用

- [src/reactionModels/FSD/FSD.C](../../../08-thermophysical/files/df/fsd.c--df1a7d6c5ce3.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
