---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1ccd89703dec"
title: "OpenFOAM 14 源码解析：sixDoFSolver.H"
summary: "该文件声明或实现 `sixDoFSolver`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/sixDoFSolver/sixDoFSolver.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：sixDoFSolver.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/sixDoFSolver/sixDoFSolver.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：196 行
- 文件标识：`1ccd89703dec`

## 2. 功能说明

该文件声明或实现 `sixDoFSolver`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：SourceFiles sixDoFSolver.C sixDoFSolverNew.C

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `sixDoFSolver` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`sixDoFRigidBodyMotion.H`](../../../17-other-libraries/files/ee/sixdofrigidbodymotion.h--eecceb0b721b.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`sixDoFSolverI.H`](../../../17-other-libraries/files/c7/sixdofsolveri.h--c7e32e210dc1.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion.C](../../../17-other-libraries/files/c4/sixdofrigidbodymotion.c--c46c2b19446f.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/CrankNicolson/CrankNicolson.H](../../../17-other-libraries/files/cb/cranknicolson.h--cb4325c99c4c.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/Newmark/Newmark.H](../../../17-other-libraries/files/54/newmark.h--54838d6bd2aa.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/sixDoFSolver/sixDoFSolver.C](../../../17-other-libraries/files/cb/sixdofsolver.c--cb419fdbf7f2.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/sixDoFSolver/sixDoFSolverNew.C](../../../17-other-libraries/files/5a/sixdofsolvernew.c--5a381bf3d5e5.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/symplectic/symplectic.H](../../../17-other-libraries/files/ff/symplectic.h--ffb5ff6e6953.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
