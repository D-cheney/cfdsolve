---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ef44f5c80e0b"
title: "OpenFOAM 14 源码解析：pisoControl.H"
summary: "该文件声明或实现 `pisoControl`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/solutionControl/pisoControl/pisoControl.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pisoControl.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/solutionControl/pisoControl/pisoControl.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：150 行
- 文件标识：`ef44f5c80e0b`

## 2. 功能说明

该文件声明或实现 `pisoControl`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Piso control class. Provides time-loop and piso-loop control methods. No convergence checking is done.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pisoControl` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **非正交校正**：在外层解不变的条件下重复修正非正交拉普拉斯贡献，并在末次更新守恒通量。
2. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fluidSolutionControl.H`](../../../05-finite-volume/files/10/fluidsolutioncontrol.h--10c43e1104e3.md)
- [`pisoControlI.H`](../../../05-finite-volume/files/d1/pisocontroli.h--d1a9e948e310.md)

## 8. 直接上层引用

- [applications/legacy/electromagnetics/mhdFoam/mhdFoam.C](../../../17-other-libraries/files/9c/mhdfoam.c--9cb4b58689a2.md)
- [applications/legacy/incompressible/icoFoam/icoFoam.C](../../../17-other-libraries/files/ab/icofoam.c--ab0010b9a47e.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleNoLoopControl/pimpleNoLoopControl.H](../../../05-finite-volume/files/21/pimplenoloopcontrol.h--211d4bd02bbb.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pisoControl/pisoControl.C](../../../05-finite-volume/files/10/pisocontrol.c--10813cc646f4.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
