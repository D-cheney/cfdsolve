---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-530f7ef6c50a"
title: "OpenFOAM 14 源码解析：reactionI.H"
summary: "该文件实现 `name`、`lhs`、`rhs`、`species` 等过程，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/reaction/reaction/reactionI.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：reactionI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/reaction/reaction/reactionI.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：69 行
- 文件标识：`530f7ef6c50a`

## 2. 功能说明

该文件实现 `name`、`lhs`、`rhs`、`species` 等过程，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::reaction::name` | 35 |
| `Foam::reaction::lhs` | 40 |
| `Foam::reaction::rhs` | 46 |
| `Foam::reaction::species` | 52 |

## 5. 算法与控制流程

1. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`reaction.H`](../../../08-thermophysical/files/95/reaction.h--959fe5a22284.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/reaction/reaction/reaction.H](../../../08-thermophysical/files/95/reaction.h--959fe5a22284.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
