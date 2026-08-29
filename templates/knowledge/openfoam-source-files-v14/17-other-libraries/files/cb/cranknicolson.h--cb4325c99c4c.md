---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cb4325c99c4c"
title: "OpenFOAM 14 源码解析：CrankNicolson.H"
summary: "该文件实现 `CrankNicolson` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/CrankNicolson/CrankNicolson.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：CrankNicolson.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/CrankNicolson/CrankNicolson.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：132 行
- 文件标识：`cb4325c99c4c`

## 2. 功能说明

该文件实现 `CrankNicolson` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Crank-Nicolson 2nd-order time-integrator for 6DoF solid-body motion. The off-centering coefficients for acceleration (velocity integration) and velocity (position/orientation integration) may be specified but default values of 0.5 for each are used if they are not specified. With the default off-centering this scheme is equivalent to the Newmark scheme with default coefficients. Example specification in dynamicMeshDict: \verbatim solver { type CrankNicolson; aoc 0.5; // Acceleration off-centering coefficient voc 0.5; // Velocity off-centering coefficient } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `CrankNicolson` | 75 |

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
