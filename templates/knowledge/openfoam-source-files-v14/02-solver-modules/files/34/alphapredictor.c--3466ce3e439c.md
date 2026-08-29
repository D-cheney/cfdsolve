---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3466ce3e439c"
title: "OpenFOAM 14 源码解析：alphaPredictor.C"
summary: "该文件实现 `alphaPredictor` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/twoPhaseSolver/alphaPredictor.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：alphaPredictor.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/twoPhaseSolver/alphaPredictor.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：392 行
- 文件标识：`3466ce3e439c`

## 2. 功能说明

该文件实现 `alphaPredictor` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::solvers::twoPhaseSolver::alphaPhi` | 40 |
| `Foam::solvers::twoPhaseSolver::alphaSolve` | 54 |
| `Foam::solvers::twoPhaseSolver::alphaPredictor` | 338 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **显式散度**：由面通量求控制体净通量并返回单元场。
3. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`twoPhaseSolver.H`](../../../02-solver-modules/files/c0/twophasesolver.h--c09e9817b144.md)
- [`subCycle.H`](../../../05-finite-volume/files/a3/subcycle.h--a3e7337023d3.md)
- [`CMULES.H`](../../../05-finite-volume/files/e0/cmules.h--e02aced9d4a4.md)
- [`CrankNicolsonDdtScheme.H`](../../../05-finite-volume/files/a7/cranknicolsonddtscheme.h--a7153d5e8cf9.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`fvmSup.H`](../../../05-finite-volume/files/6c/fvmsup.h--6ce628800519.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
