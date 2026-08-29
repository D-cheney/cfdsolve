---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2da5fe927842"
title: "OpenFOAM 14 源码解析：rigidBodySolver.H"
summary: "该文件声明或实现 `rigidBodySolver`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/rigidBodySolver/rigidBodySolver.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodySolver.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/rigidBodySolver/rigidBodySolver.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：171 行
- 文件标识：`2da5fe927842`

## 2. 功能说明

该文件声明或实现 `rigidBodySolver`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：SourceFiles rigidBodySolver.C rigidBodySolverNew.C

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rigidBodySolver` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`rigidBodyMotion.H`](../../../17-other-libraries/files/6d/rigidbodymotion.h--6d74bab326e0.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`rigidBodySolverI.H`](../../../17-other-libraries/files/33/rigidbodysolveri.h--33150e1a9a9c.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyMotion/rigidBodyMotion.C](../../../17-other-libraries/files/75/rigidbodymotion.c--756bb5cd68a7.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/CrankNicolson/CrankNicolson.H](../../../17-other-libraries/files/08/cranknicolson.h--0880ef4098bd.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/Newmark/Newmark.H](../../../17-other-libraries/files/28/newmark.h--28b265a1b728.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/rigidBodySolver/rigidBodySolver.C](../../../17-other-libraries/files/4c/rigidbodysolver.c--4c7765546b98.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/rigidBodySolver/rigidBodySolverNew.C](../../../17-other-libraries/files/2e/rigidbodysolvernew.c--2e42f6061b06.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/symplectic/symplectic.H](../../../17-other-libraries/files/1a/symplectic.h--1abc86eeb9b6.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
