---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-70be88971442"
title: "OpenFOAM 14 源码解析：correctorConvergenceControl.H"
summary: "该文件声明或实现 `correctorConvergenceControl`、`corrResidualData`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/solutionControl/convergenceControl/correctorConvergenceControl/correctorConvergenceControl.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：correctorConvergenceControl.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/solutionControl/convergenceControl/correctorConvergenceControl/correctorConvergenceControl.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：162 行
- 文件标识：`70be88971442`

## 2. 功能说明

该文件声明或实现 `correctorConvergenceControl`、`corrResidualData`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Corrector convergence control class. Provides methods to check the convergence of an inner iteration loop (e.g., pimple) against both absolute and relative residual tolerances.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `correctorConvergenceControl` | 58 |
| `corrResidualData` | 64 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`solutionControl.H`](../../../04-core-runtime/files/41/solutioncontrol.h--4108393f3814.md)
- [`correctorConvergenceControlTemplates.C`](../../../05-finite-volume/files/83/correctorconvergencecontroltemplates.c--8302f1238374.md)

## 8. 直接上层引用

- [src/finiteVolume/cfdTools/general/solutionControl/convergenceControl/correctorConvergenceControl/correctorConvergenceControl.C](../../../05-finite-volume/files/18/correctorconvergencecontrol.c--1856ee84b52b.md)
- [src/finiteVolume/cfdTools/general/solutionControl/convergenceControl/singleRegionCorrectorConvergenceControl/singleRegionCorrectorConvergenceControl.H](../../../05-finite-volume/files/40/singleregioncorrectorconvergencecontrol.h--40d0a13a2767.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleLoop/pimpleLoop.H](../../../05-finite-volume/files/67/pimpleloop.h--67b83fc7a8a9.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleMultiRegionControl/pimpleMultiRegionControl.H](../../../05-finite-volume/files/78/pimplemultiregioncontrol.h--784001142878.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
