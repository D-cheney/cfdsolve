---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3d7dd5e70d12"
title: "OpenFOAM 14 源码解析：foamRun.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `foamRun` 对应的工作流。"
category: { slug: openfoam-v14-01-solver-entry, name: OpenFOAM 源码 · 求解器入口 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/solvers/foamRun/foamRun.C"
tags: [OpenFOAM14, 源码解析, 求解器入口]
---

# OpenFOAM 14 源码解析：foamRun.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/solvers/foamRun/foamRun.C`
- 功能分类：求解器入口
- 文件类型：C/C++ 或词法/语法源文件
- 规模：221 行
- 文件标识：`3d7dd5e70d12`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `foamRun` 对应的工作流。

中文导航角色：求解器或统一运行入口。

上游说明：Loads and executes an OpenFOAM solver module either specified by the optional \c solver entry in the \c controlDict or as a command-line argument. Uses the flexible PIMPLE (PISO-SIMPLE) solution for time-resolved and pseudo-transient and steady simulations. Usage \b foamRun [OPTION] - \par -solver <name> Solver name - \par -libs '(\"lib1.so\" ... \"libN.so\")' Specify the additional libraries loaded Example usage: - To run a \c rhoPimpleFoam case by specifying the solver on the command line: \verbatim foamRun -solver fluid \endverbatim - To update and run a \c rhoPimpleFoam case add the following entry to the controlDict: \verbatim solver fluid; \endverbatim then execute \c foamRun

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `main` | 74 |

## 5. 算法与控制流程

1. **步骤 1**：注册并读取 `-solver` 选项，确定运行时求解器模块名称。
2. **步骤 2**：创建 `Time` 与网格对象，装载求解器动态库。
3. **步骤 3**：调用 `solver::New` 从运行时选择表构造具体模块。
4. **步骤 4**：进入时间/稳态外循环和 PIMPLE 外校正循环。
5. **步骤 5**：依次执行 `preSolve`、网格更新、动量/热物理预测、压力校正、模型修正和 `postSolve`。
6. **步骤 6**：依据 `controlDict` 写出场与功能对象结果。

## 6. 数学与离散关系

- 统一入口不直接离散方程；数值方程由所选 solver 模块的预测/校正钩子提供。

## 7. 直接依赖

- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`solver.H`](../../../05-finite-volume/files/0e/solver.h--0e19ba72056e.md)
- [`pimpleSingleRegionControl.H`](../../../05-finite-volume/files/41/pimplesingleregioncontrol.h--41b257cda08f.md)
- `setDeltaT.H`
- [`setRootCase.H`](../../../04-core-runtime/files/95/setrootcase.h--95a4d6ea30cd.md)
- [`createTime.H`](../../../04-core-runtime/files/ff/createtime.h--ff253fee129e.md)
- [`createMesh.H`](../../../04-core-runtime/files/fe/createmesh.h--fe0a757e3b8e.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先找 main()、参数解析、时间循环和模块创建。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
