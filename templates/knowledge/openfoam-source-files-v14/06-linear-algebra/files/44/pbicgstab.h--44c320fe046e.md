---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-44c320fe046e"
title: "OpenFOAM 14 源码解析：PBiCGStab.H"
summary: "该文件声明或实现 `PBiCGStab`，属于“矩阵与线性求解”模块。"
category: { slug: openfoam-v14-06-linear-algebra, name: OpenFOAM 源码 · 矩阵与线性求解 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/matrices/lduMatrix/solvers/PBiCGStab/PBiCGStab.H"
tags: [OpenFOAM14, 源码解析, 矩阵与线性求解]
---

# OpenFOAM 14 源码解析：PBiCGStab.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/matrices/lduMatrix/solvers/PBiCGStab/PBiCGStab.H`
- 功能分类：矩阵与线性求解
- 文件类型：C/C++ 或词法/语法源文件
- 规模：130 行
- 文件标识：`44c320fe046e`

## 2. 功能说明

该文件声明或实现 `PBiCGStab`，属于“矩阵与线性求解”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Preconditioned bi-conjugate gradient stabilised solver for asymmetric lduMatrices using a run-time selectable preconditioner. References: \verbatim Van der Vorst, H. A. (1992). Bi-CGSTAB: A fast and smoothly converging variant of Bi-CG for the solution of nonsymmetric linear systems. SIAM Journal on scientific and Statistical Computing, 13(2), 631-644. Barrett, R., Berry, M. W., Chan, T. F., Demmel, J., Donato, J., Dongarra, J., Eijkhout, V., Pozo, R., Romine, C. & Van der Vorst, H. (1994). Templates for the solution of linear systems: building blocks for iterative methods (Vol. 43). Siam. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PBiCGStab` | 70 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`lduMatrix.H`](../../../06-linear-algebra/files/44/ldumatrix.h--4447a7923382.md)

## 8. 直接上层引用

- [src/OpenFOAM/matrices/lduMatrix/solvers/GAMG/GAMGSolver.C](../../../06-linear-algebra/files/ab/gamgsolver.c--abd2dfd5c07d.md)
- [src/OpenFOAM/matrices/lduMatrix/solvers/PBiCGStab/PBiCGStab.C](../../../06-linear-algebra/files/58/pbicgstab.c--58d2b582e1df.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
