---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4bbe3943e435"
title: "OpenFOAM 14 源码解析：adjustTimeStepToReaction.H"
summary: "该文件声明或实现 `adjustTimeStepToReaction`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/reactionModels/functionObjects/adjustTimeStepToReaction/adjustTimeStepToReaction.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：adjustTimeStepToReaction.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/reactionModels/functionObjects/adjustTimeStepToReaction/adjustTimeStepToReaction.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：179 行
- 文件标识：`4bbe3943e435`

## 2. 功能说明

该文件声明或实现 `adjustTimeStepToReaction`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Returns the minimum bulk reaction time scale This allows the solver to temporally resolve chemical changes, in order to better couple the chemistry and transport, or to improve the time-accuracy of post-processing. Note that this function only does anything if time step adjustment is enabled in the controlDict. Example of function object specification: \verbatim adjustTimeStepToReaction { type adjustTimeStepToReaction; libs ("libreactionModels.so"); maxCo 0.1; extrapolate no; } \endverbatim Usage \table Property | Description | Required | Default value type | type name: adjustTimeStepToReaction | yes | phase | name of the reacting phase | no | maxCo | maximum reaction "Courant" number | no | 1 extrapolate | try to extrapolate decreases | no | false \endtable

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `adjustTimeStepToReaction` | 84 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`regionFunctionObject.H`](../../../04-core-runtime/files/31/regionfunctionobject.h--31eeada1039e.md)
- [`timeIOdictionary.H`](../../../04-core-runtime/files/fa/timeiodictionary.h--fa839555249b.md)

## 8. 直接上层引用

- [src/reactionModels/functionObjects/adjustTimeStepToReaction/adjustTimeStepToReaction.C](../../../08-thermophysical/files/bc/adjusttimesteptoreaction.c--bcc15d4aae6f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
