---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-20f5eec1bbfe"
title: "OpenFOAM 14 源码解析：quadraticEqn.H"
summary: "该文件声明或实现 `quadraticEqn`、`coefficient`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/polynomialEqns/quadraticEqn/quadraticEqn.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：quadraticEqn.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/polynomialEqns/quadraticEqn/quadraticEqn.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：121 行
- 文件标识：`20f5eec1bbfe`

## 2. 功能说明

该文件声明或实现 `quadraticEqn`、`coefficient`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Quadratic equation of the form a*x^2 + b*x + c = 0

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `quadraticEqn` | 55 |
| `coefficient` | 63 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Roots.H`](../../../04-core-runtime/files/2a/roots.h--2abde0c05e72.md)
- [`quadraticEqnI.H`](../../../04-core-runtime/files/22/quadraticeqni.h--22bc88a2f378.md)

## 8. 直接上层引用

- [src/OpenFOAM/distributions/unintegrable/unintegrable.C](../../../04-core-runtime/files/e1/unintegrable.c--e171bd4d7068.md)
- [src/OpenFOAM/primitives/polynomialEqns/cubicEqn/cubicEqn.C](../../../04-core-runtime/files/1b/cubiceqn.c--1b5d423becd1.md)
- [src/OpenFOAM/primitives/polynomialEqns/quadraticEqn/quadraticEqn.C](../../../04-core-runtime/files/36/quadraticeqn.c--368837542c53.md)
- [src/OpenFOAM/primitives/Tensor2D/tensor2D/tensor2D.C](../../../04-core-runtime/files/86/tensor2d.c--86a9a45abb01.md)
- [src/tracking/tracking.C](../../../17-other-libraries/files/8a/tracking.c--8ac2f76555f4.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
