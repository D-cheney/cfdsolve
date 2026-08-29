---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9824b84e7663"
title: "OpenFOAM 14 源码解析：Repeat.H"
summary: "该文件声明或实现 `Repeat`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/functions/Function1/Repeat/Repeat.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：Repeat.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/functions/Function1/Repeat/Repeat.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：177 行
- 文件标识：`9824b84e7663`

## 2. 功能说明

该文件声明或实现 `Repeat`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Function1 which repeats a given 'value' function with a given period or frequency, and with an optional shift along the x-axis Usage Example: \verbatim <name> { type repeat; period 360 [CAD]; //frequency 0.00277778 [CAD^-1]; // <-- alternative to specifying // the period start 10 [CAD]; // <-- optional shift value { type table; file "constant/timeVsFlowRate.foam"; units ([ms] [m^3/s]); } } \endverbatim Where: \vartable Symbol | Description | Data type | Default period | Period of repetition | scalar | frequency | Frequency of repetition | scalar | start | Start x coordinate | scalar | 0 value | Function to repeat | Function1<Type> | \endvartable

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Repeat` | 89 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`RepeatI.H`](../../../04-core-runtime/files/a1/repeati.h--a143f9e9f9b6.md)
- [`Repeat.C`](../../../04-core-runtime/files/5f/repeat.c--5ff4965ba76b.md)

## 8. 直接上层引用

- [src/OpenFOAM/primitives/functions/Function1/makeFunction1s.H](../../../04-core-runtime/files/b9/makefunction1s.h--b9f238101669.md)
- [src/OpenFOAM/primitives/functions/Function1/Repeat/Repeat.C](../../../04-core-runtime/files/5f/repeat.c--5ff4965ba76b.md)
- [src/OpenFOAM/primitives/functions/Function1/Repeat/RepeatI.H](../../../04-core-runtime/files/a1/repeati.h--a143f9e9f9b6.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
