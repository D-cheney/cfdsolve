---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b0b9e5baee61"
title: "OpenFOAM 14 源码解析：C4H10OI.H"
summary: "该文件实现 `rho`、`alphav`、`pv`、`hl` 等过程，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/thermophysicalProperties/liquidProperties/C4H10O/C4H10OI.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：C4H10OI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/thermophysicalProperties/liquidProperties/C4H10O/C4H10OI.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：134 行
- 文件标识：`b0b9e5baee61`

## 2. 功能说明

该文件实现 `rho`、`alphav`、`pv`、`hl` 等过程，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::C4H10O::rho` | 31 |
| `Foam::C4H10O::alphav` | 36 |
| `Foam::C4H10O::pv` | 42 |
| `Foam::C4H10O::hl` | 48 |
| `Foam::C4H10O::Cp` | 54 |
| `Foam::C4H10O::hs` | 60 |
| `Foam::C4H10O::hf` | 66 |
| `Foam::C4H10O::ha` | 72 |
| `Foam::C4H10O::Cpg` | 78 |
| `Foam::C4H10O::B` | 84 |
| `Foam::C4H10O::mu` | 90 |
| `Foam::C4H10O::mug` | 96 |
| `Foam::C4H10O::kappa` | 102 |
| `Foam::C4H10O::kappag` | 108 |
| `Foam::C4H10O::sigma` | 114 |
| `Foam::C4H10O::D` | 120 |

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- 未检测到直接 `#include`；脚本/清单或自包含实现可能通过环境和命令产生依赖。

## 8. 直接上层引用

- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C4H10O/C4H10O.H](../../../08-thermophysical/files/87/c4h10o.h--872268e5d0dc.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
