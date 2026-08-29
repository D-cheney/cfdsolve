---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6e35e8b8c424"
title: "OpenFOAM 14 源码解析：integratedNonUniformTable1.H"
summary: "该文件声明或实现 `integratedNonUniformTable`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/thermophysicalFunctions/integratedNonUniformTable1/integratedNonUniformTable1.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：integratedNonUniformTable1.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/thermophysicalFunctions/integratedNonUniformTable1/integratedNonUniformTable1.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：130 行
- 文件标识：`6e35e8b8c424`

## 2. 功能说明

该文件声明或实现 `integratedNonUniformTable`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Non-uniform tabulated property function that linearly interpolates between the values. To speed-up the search of the non-uniform table a uniform jump-table is created on construction which is used for fast indirect addressing into the table. Usage \table Property | Description values | List of value pairs \endtable Example for the density of water between 280 and 350K \verbatim rho { type integratedNonUniformTable; values ( (280 999.87) (300 995.1) (350 973.7) ); } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `integratedNonUniformTable` | 79 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`NonUniformTable1.H`](../../../04-core-runtime/files/c1/nonuniformtable1.h--c1e450df1c20.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/thermo/eIcoTabulated/eIcoTabulatedThermo.H](../../../08-thermophysical/files/58/eicotabulatedthermo.h--58208cfcd8b6.md)
- [src/thermophysicalModels/specie/thermo/hIcoTabulated/hIcoTabulatedThermo.H](../../../08-thermophysical/files/31/hicotabulatedthermo.h--31379811e4e9.md)
- [src/thermophysicalModels/specie/thermophysicalFunctions/integratedNonUniformTable1/integratedNonUniformTable1.C](../../../08-thermophysical/files/bc/integratednonuniformtable1.c--bc165245d4c6.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
