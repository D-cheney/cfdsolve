---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f44b5d1f19d2"
title: "OpenFOAM 14 源码解析：iC3H8OI.H"
summary: "该文件实现 `rho`、`alphav`、`pv`、`hl` 等过程，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/thermophysicalProperties/liquidProperties/iC3H8O/iC3H8OI.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：iC3H8OI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/thermophysicalProperties/liquidProperties/iC3H8O/iC3H8OI.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：135 行
- 文件标识：`f44b5d1f19d2`

## 2. 功能说明

该文件实现 `rho`、`alphav`、`pv`、`hl` 等过程，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::iC3H8O::rho` | 31 |
| `Foam::iC3H8O::alphav` | 36 |
| `Foam::iC3H8O::pv` | 42 |
| `Foam::iC3H8O::hl` | 48 |
| `Foam::iC3H8O::Cp` | 54 |
| `Foam::iC3H8O::hs` | 60 |
| `Foam::iC3H8O::hf` | 66 |
| `Foam::iC3H8O::ha` | 72 |
| `Foam::iC3H8O::Cpg` | 78 |
| `Foam::iC3H8O::B` | 84 |
| `Foam::iC3H8O::mu` | 90 |
| `Foam::iC3H8O::mug` | 96 |
| `Foam::iC3H8O::kappa` | 102 |
| `Foam::iC3H8O::kappag` | 108 |
| `Foam::iC3H8O::sigma` | 114 |
| `Foam::iC3H8O::D` | 120 |

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- 未检测到直接 `#include`；脚本/清单或自包含实现可能通过环境和命令产生依赖。

## 8. 直接上层引用

- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/iC3H8O/iC3H8O.H](../../../08-thermophysical/files/9e/ic3h8o.h--9e8c23545af0.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
