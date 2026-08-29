---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ae7b387bbaad"
title: "OpenFOAM 14 源码解析：correctPressure.C"
summary: "该文件实现 `correctPressure` 等过程，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/incompressibleFluid/correctPressure.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：correctPressure.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/incompressibleFluid/correctPressure.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：143 行
- 文件标识：`ae7b387bbaad`

## 2. 功能说明

该文件实现 `correctPressure` 等过程，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::solvers::incompressibleFluid::correctPressure` | 44 |

## 5. 算法与控制流程

1. **步骤 1**：从缓存动量矩阵取得对角倒数 `rAU=1/A_P`。
2. **步骤 2**：计算不含新压力修正的速度预测 `HbyA` 与面通量 `phiHbyA`。
3. **步骤 3**：处理 MRF、参考压力、移动网格以及 consistent 修正。
4. **步骤 4**：更新压力边界并装配压力拉普拉斯方程。
5. **步骤 5**：在非正交循环中求解压力，仅末次用方程通量修正 `phi`。
6. **步骤 6**：统计连续性误差，松弛压力并回代校正速度与边界。

## 6. 数学与离散关系

- $A_P\mathbf{U}_P=H(\mathbf{U})-\nabla p$，$\mathbf{U}=H/A-(1/A)\nabla p$。
- $\nabla\cdot[(1/A)\nabla p]=\nabla\cdot(H/A)-S_p$。

## 7. 直接依赖

- [`incompressibleFluid.H`](../../../02-solver-modules/files/d1/incompressiblefluid.h--d1866c69fa0d.md)
- [`constrainHbyA.H`](../../../05-finite-volume/files/50/constrainhbya.h--50ce200e184c.md)
- [`constrainPressure.H`](../../../05-finite-volume/files/02/constrainpressure.h--0273510552c5.md)
- [`adjustPhi.H`](../../../05-finite-volume/files/3e/adjustphi.h--3e2ba0e700bb.md)
- [`fvcMeshPhi.H`](../../../05-finite-volume/files/ea/fvcmeshphi.h--eae2819d7090.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [`fvcGrad.H`](../../../05-finite-volume/files/d3/fvcgrad.h--d32a079c3240.md)
- [`fvcSnGrad.H`](../../../05-finite-volume/files/9c/fvcsngrad.h--9cae40f16e0c.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
