---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-bda837720802"
title: "OpenFOAM 14 源码解析：nonOrthogonalSolutionControl.H"
summary: "该文件声明或实现 `nonOrthogonalSolutionControl`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/solutionControl/solutionControl/nonOrthogonalSolutionControl/nonOrthogonalSolutionControl.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：nonOrthogonalSolutionControl.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/solutionControl/solutionControl/nonOrthogonalSolutionControl/nonOrthogonalSolutionControl.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：139 行
- 文件标识：`bda837720802`

## 2. 功能说明

该文件声明或实现 `nonOrthogonalSolutionControl`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Non-orthogonal solution control class. Provides non-orthogonal-loop control methods.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `nonOrthogonalSolutionControl` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **非正交校正**：在外层解不变的条件下重复修正非正交拉普拉斯贡献，并在末次更新守恒通量。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`singleRegionSolutionControl.H`](../../../05-finite-volume/files/cf/singleregionsolutioncontrol.h--cf8381e04815.md)
- [`nonOrthogonalSolutionControlI.H`](../../../05-finite-volume/files/dc/nonorthogonalsolutioncontroli.h--dc6fa648ae8c.md)

## 8. 直接上层引用

- [applications/solvers/potentialFoam/potentialFoam.C](../../../01-solver-entry/files/3c/potentialfoam.c--3cd35945b82e.md)
- [src/finiteVolume/cfdTools/general/correctPhi/CorrectPhi.C](../../../05-finite-volume/files/13/correctphi.c--131ea778a3a4.md)
- [src/finiteVolume/cfdTools/general/solutionControl/solutionControl/fluidSolutionControl/fluidSolutionControl.H](../../../05-finite-volume/files/10/fluidsolutioncontrol.h--10c43e1104e3.md)
- [src/finiteVolume/cfdTools/general/solutionControl/solutionControl/nonOrthogonalSolutionControl/nonOrthogonalSolutionControl.C](../../../05-finite-volume/files/15/nonorthogonalsolutioncontrol.c--153c4efafd78.md)
- [src/functionObjects/solvers/phaseScalarTransport/phaseScalarTransport.C](../../../14-postprocessing/files/d0/phasescalartransport.c--d03f165e0e1c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
