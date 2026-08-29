---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3cd35945b82e"
title: "OpenFOAM 14 源码解析：potentialFoam.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `potentialFoam` 对应的工作流。"
category: { slug: openfoam-v14-01-solver-entry, name: OpenFOAM 源码 · 求解器入口 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/solvers/potentialFoam/potentialFoam.C"
tags: [OpenFOAM14, 源码解析, 求解器入口]
---

# OpenFOAM 14 源码解析：potentialFoam.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/solvers/potentialFoam/potentialFoam.C`
- 功能分类：求解器入口
- 文件类型：C/C++ 或词法/语法源文件
- 规模：208 行
- 文件标识：`3cd35945b82e`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `potentialFoam` 对应的工作流。

中文导航角色：求解器或统一运行入口。

上游说明：Potential flow solver which solves for the velocity potential, to calculate the flux-field, from which the velocity field is obtained by reconstructing the flux. This application is particularly useful to generate starting fields for Navier-Stokes codes.

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `main` | 59 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **隐式扩散项**：使用面扩散系数和法向梯度离散拉普拉斯项。
3. **显式散度**：由面通量求控制体净通量并返回单元场。
4. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
5. **非正交校正**：在外层解不变的条件下重复修正非正交拉普拉斯贡献，并在末次更新守恒通量。
6. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
7. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。

## 6. 数学与离散关系

- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`nonOrthogonalSolutionControl.H`](../../../05-finite-volume/files/bd/nonorthogonalsolutioncontrol.h--bda837720802.md)
- [`fixedValueFvPatchFields.H`](../../../05-finite-volume/files/ff/fixedvaluefvpatchfields.h--ff21ae834f83.md)
- [`zeroGradientFvPatchFields.H`](../../../05-finite-volume/files/9a/zerogradientfvpatchfields.h--9a96ee93ac86.md)
- [`findRefCell.H`](../../../05-finite-volume/files/a8/findrefcell.h--a87d0d6cc087.md)
- [`MRFZones.H`](../../../05-finite-volume/files/30/mrfzones.h--3097cedc6ca7.md)
- [`adjustPhi.H`](../../../05-finite-volume/files/3e/adjustphi.h--3e2ba0e700bb.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`fvcReconstruct.H`](../../../05-finite-volume/files/bc/fvcreconstruct.h--bcc553314882.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
- [`setRootCaseFunctionObjects.H`](../../../04-core-runtime/files/52/setrootcasefunctionobjects.h--520b5021b3be.md)
- [`createTime.H`](../../../04-core-runtime/files/ff/createtime.h--ff253fee129e.md)
- [`createMesh.H`](../../../04-core-runtime/files/fe/createmesh.h--fe0a757e3b8e.md)
- `createFields.H`

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先找 main()、参数解析、时间循环和模块创建。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
