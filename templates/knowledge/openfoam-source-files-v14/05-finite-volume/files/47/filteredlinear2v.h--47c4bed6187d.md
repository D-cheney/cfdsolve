---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-47c4bed6187d"
title: "OpenFOAM 14 源码解析：filteredLinear2V.H"
summary: "该文件声明或实现 `filteredLinear2VLimiter`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/filteredLinear2/filteredLinear2V.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：filteredLinear2V.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/filteredLinear2/filteredLinear2V.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：163 行
- 文件标识：`47c4bed6187d`

## 2. 功能说明

该文件声明或实现 `filteredLinear2VLimiter`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Class to generate weighting factors for the filteredLinear2V interpolation scheme. The aim is to remove high-frequency modes with "staggering" characteristics from vector fields by comparing the face gradient in the direction of maximum gradient with both neighbouring cell gradients and introduce small amounts of upwind in order to damp these modes. Used in conjunction with the template class LimitedScheme.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `filteredLinear2VLimiter` | 62 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `limiter` | 109 |

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`vector.H`](../../../04-core-runtime/files/64/vector.h--64124691b98b.md)

## 8. 直接上层引用

- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/filteredLinear2/filteredLinear2.C](../../../05-finite-volume/files/c2/filteredlinear2.c--c250d784aa7a.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
