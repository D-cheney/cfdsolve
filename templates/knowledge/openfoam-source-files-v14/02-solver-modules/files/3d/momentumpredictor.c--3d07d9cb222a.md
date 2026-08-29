---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3d07d9cb222a"
title: "OpenFOAM 14 源码解析：momentumPredictor.C"
summary: "该文件实现 `momentumPredictor` 等过程，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/VoFSolver/momentumPredictor.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：momentumPredictor.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/VoFSolver/momentumPredictor.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：78 行
- 文件标识：`3d07d9cb222a`

## 2. 功能说明

该文件实现 `momentumPredictor` 等过程，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::solvers::VoFSolver::momentumPredictor` | 38 |

## 5. 算法与控制流程

1. **隐式时间项**：把时间导数装配到矩阵对角与源项，参与线性方程求解。
2. **隐式对流项**：按面通量和选定格式把对流贡献装配到有限体积矩阵。
3. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
4. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`VoFSolver.H`](../../../02-solver-modules/files/76/vofsolver.h--766e82b270c1.md)
- [`fvmDiv.H`](../../../05-finite-volume/files/32/fvmdiv.h--32306f8dc3a6.md)
- [`fvcSnGrad.H`](../../../05-finite-volume/files/9c/fvcsngrad.h--9cae40f16e0c.md)
- [`fvcReconstruct.H`](../../../05-finite-volume/files/bc/fvcreconstruct.h--bcc553314882.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
