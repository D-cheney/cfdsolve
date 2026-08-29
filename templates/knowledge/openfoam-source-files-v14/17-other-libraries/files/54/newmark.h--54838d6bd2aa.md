---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-54838d6bd2aa"
title: "OpenFOAM 14 源码解析：Newmark.H"
summary: "该文件实现 `Newmark` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/Newmark/Newmark.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：Newmark.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/Newmark/Newmark.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：130 行
- 文件标识：`54838d6bd2aa`

## 2. 功能说明

该文件实现 `Newmark` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Newmark 2nd-order time-integrator for 6DoF solid-body motion. Reference: \verbatim Newmark, N. M. (1959). A method of computation for structural dynamics. Journal of the Engineering Mechanics Division, 85(3), 67-94. \endverbatim Example specification in dynamicMeshDict: \verbatim solver { type Newmark; gamma 0.5; // Velocity integration coefficient beta 0.25; // Position integration coefficient } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Newmark` | 73 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`sixDoFSolver.H`](../../../17-other-libraries/files/1c/sixdofsolver.h--1ccd89703dec.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
