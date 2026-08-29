---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6f9989e582e1"
title: "OpenFOAM 14 源码解析：timeActivatedFileUpdate.H"
summary: "该文件声明或实现 `Time`、`timeActivatedFileUpdate`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/utilities/timeActivatedFileUpdate/timeActivatedFileUpdate.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：timeActivatedFileUpdate.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/utilities/timeActivatedFileUpdate/timeActivatedFileUpdate.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：162 行
- 文件标识：`6f9989e582e1`

## 2. 功能说明

该文件声明或实现 `Time`、`timeActivatedFileUpdate`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Performs a file copy/replacement once a specified time has been reached. Usage Example usage to update the fvSolution dictionary at 0.1, 0.2 and 0.3s during the run: \verbatim fileUpdate1 { type timeActivatedFileUpdate; libs ("libutilityFunctionObjects.so"); writeControl timeStep; writeInterval 1; fileToUpdate "\&#36;FOAM_CASE/system/fvSolution"; fileVsTime ( (-1 "\&#36;FOAM_CASE/system/fvSolution.0") (0.10 "\&#36;FOAM_CASE/system/fvSolution.10") (0.20 "\&#36;FOAM_CASE/system/fvSolution.20") (0.35 "\&#36;FOAM_CASE/system/fvSolution.35") ); } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Time` | 76 |
| `timeActivatedFileUpdate` | 84 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`functionObject.H`](../../../04-core-runtime/files/6f/functionobject.h--6f77b47a79fa.md)
- [`Tuple2.H`](../../../04-core-runtime/files/ab/tuple2.h--ab8ee5c9d4ce.md)

## 8. 直接上层引用

- [src/functionObjects/utilities/timeActivatedFileUpdate/timeActivatedFileUpdate.C](../../../14-postprocessing/files/1d/timeactivatedfileupdate.c--1d3c000c7d8d.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
