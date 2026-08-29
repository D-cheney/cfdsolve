---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-16be4d51bd37"
title: "OpenFOAM 14 源码解析：AntoineExtended.H"
summary: "该文件声明或实现 `AntoineExtended`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/saturationModels/AntoineExtended/AntoineExtended.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：AntoineExtended.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/saturationModels/AntoineExtended/AntoineExtended.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：148 行
- 文件标识：`16be4d51bd37`

## 2. 功能说明

该文件声明或实现 `AntoineExtended`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Extended Antoine equation for the vapour pressure. \f[ \log (p) = A + \frac{B}{C + T} + D \log (T) + E T^F \f] Coefficients \&#36;A\&#36;, \&#36;B\&#36;, \&#36;C\&#36;, \&#36;D\&#36;, \&#36;E\&#36; and \&#36;F\&#36; are to be supplied and should be suitable for natural logarithms and temperatures in Kelvin.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `AntoineExtended` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`saturationModels.H`](../../../08-thermophysical/files/d0/saturationmodels.h--d01667ee4148.md)
- [`saturationPressureModel.H`](../../../08-thermophysical/files/ba/saturationpressuremodel.h--ba8b62ac1e46.md)

## 8. 直接上层引用

- [src/thermophysicalModels/saturationModels/AntoineExtended/AntoineExtended.C](../../../08-thermophysical/files/23/antoineextended.c--23f9c98b608d.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
