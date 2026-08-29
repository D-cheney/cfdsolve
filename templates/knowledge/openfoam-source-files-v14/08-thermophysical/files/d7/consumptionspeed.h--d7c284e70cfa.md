---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d7c284e70cfa"
title: "OpenFOAM 14 源码解析：consumptionSpeed.H"
summary: "该文件声明或实现 `consumptionSpeed`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/reactionModels/FSD/reactionRateFlameAreaModels/consumptionSpeed/consumptionSpeed.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：consumptionSpeed.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/reactionModels/FSD/reactionRateFlameAreaModels/consumptionSpeed/consumptionSpeed.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：149 行
- 文件标识：`d7c284e70cfa`

## 2. 功能说明

该文件声明或实现 `consumptionSpeed`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Correlation function for laminar consumption speed obtained from flamelet solution at increasing strain rates.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `consumptionSpeed` | 56 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `omega0` | 106 |
| `eta` | 111 |
| `sigmaExt` | 116 |
| `omegaMin` | 121 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)

## 8. 直接上层引用

- [src/reactionModels/FSD/reactionRateFlameAreaModels/consumptionSpeed/consumptionSpeed.C](../../../08-thermophysical/files/c8/consumptionspeed.c--c8e5556a7198.md)
- [src/reactionModels/FSD/reactionRateFlameAreaModels/relaxation/relaxation.H](../../../08-thermophysical/files/a9/relaxation.h--a98a258db63f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
