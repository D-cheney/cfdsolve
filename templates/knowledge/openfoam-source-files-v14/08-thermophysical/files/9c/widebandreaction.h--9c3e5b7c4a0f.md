---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9c3e5b7c4a0f"
title: "OpenFOAM 14 源码解析：wideBandReaction.H"
summary: "该文件声明或实现 `wideBandReaction`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/reactionModels/radiationModels/absorptionEmissionModels/wideBandReaction/wideBandReaction.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：wideBandReaction.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/reactionModels/radiationModels/absorptionEmissionModels/wideBandReaction/wideBandReaction.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：107 行
- 文件标识：`9c3e5b7c4a0f`

## 2. 功能说明

该文件声明或实现 `wideBandReaction`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：wideBandReaction radiation absorption and emission coefficients for continuous phase. Exactly as wideBand, but with additional effects of the reaction heat release rate included.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `wideBandReaction` | 63 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`wideBand.H`](../../../17-other-libraries/files/d2/wideband.h--d2d39720b940.md)

## 8. 直接上层引用

- [src/reactionModels/radiationModels/absorptionEmissionModels/wideBandReaction/wideBandReaction.C](../../../08-thermophysical/files/1b/widebandreaction.c--1b19ef5833c1.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
