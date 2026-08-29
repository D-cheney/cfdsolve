---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c5527c6e5083"
title: "OpenFOAM 14 源码解析：Scale.H"
summary: "该文件声明或实现 `Scale`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/functions/Function1/Scale/Scale.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：Scale.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/functions/Function1/Scale/Scale.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：240 行
- 文件标识：`c5527c6e5083`

## 2. 功能说明

该文件声明或实现 `Scale`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Function1 which scales a given 'value' function by a 'scale' scalar function and scales the 'x' argument of the 'value' and 'scale' functions by the optional 'xScale' scalar function. This is particularly useful to ramp a time-varying value by one of the monotonic ramp functions. Usage For a vector: \verbatim <name> { type scale; scale { type linearRamp; start 0; duration 10; } value { type sine; frequency 10; amplitude 1; scale (1 0.1 0); level (10 1 0); } } \endverbatim Simplified usage to scale by a constant factor, e.g. 2: \verbatim <name> { type scale; scale 2; value { type sine; frequency 10; amplitude 1; scale (1 0.1 0); level (10 1 0); } } \endverbatim Including the optional 'xScale' function: \verbatim <name> { type scale; xScale 0.5; scale 2; value { type sine; frequency 10; amplitude 1; scale (1 0.1 0); level (10 1 0); } } \endverbatim Where: \table Property | Description | Re

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Scale` | 141 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`ScaleI.H`](../../../04-core-runtime/files/b2/scalei.h--b2d92d27f379.md)
- [`Scale.C`](../../../04-core-runtime/files/a0/scale.c--a0834b7e9daa.md)

## 8. 直接上层引用

- [src/fvModels/general/heatSource/heatSource.C](../../../12-boundaries-sources/files/b1/heatsource.c--b15e8d8e7b25.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/InjectionModel/InjectionModel.C](../../../11-lagrangian/files/69/injectionmodel.c--6991ed406727.md)
- [src/OpenFOAM/primitives/functions/Function1/makeFunction1s.H](../../../04-core-runtime/files/b9/makefunction1s.h--b9f238101669.md)
- [src/OpenFOAM/primitives/functions/Function1/Scale/Scale.C](../../../04-core-runtime/files/a0/scale.c--a0834b7e9daa.md)
- [src/OpenFOAM/primitives/functions/Function1/Scale/ScaleI.H](../../../04-core-runtime/files/b2/scalei.h--b2d92d27f379.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
