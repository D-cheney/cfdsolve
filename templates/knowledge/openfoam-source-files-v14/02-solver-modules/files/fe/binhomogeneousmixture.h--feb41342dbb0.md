---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-feb41342dbb0"
title: "OpenFOAM 14 源码解析：bInhomogeneousMixture.H"
summary: "该文件声明或实现 `bInhomogeneousMixture`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/XiFluid/bRhoMulticomponentThermo/mixtures/bInhomogeneousMixture/bInhomogeneousMixture.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：bInhomogeneousMixture.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/XiFluid/bRhoMulticomponentThermo/mixtures/bInhomogeneousMixture/bInhomogeneousMixture.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：147 行
- 文件标识：`feb41342dbb0`

## 2. 功能说明

该文件声明或实现 `bInhomogeneousMixture`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Burnt gas combustion mixture for inhomogeneous lean, stoichiometric or rich conditions in which the unburnt fuel mass-fraction \c ft (mixture fraction) defines the composition.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `bInhomogeneousMixture` | 60 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`bMixture.H`](../../../02-solver-modules/files/41/bmixture.h--41d36c6e05b2.md)
- [`speciesTable.H`](../../../08-thermophysical/files/57/speciestable.h--570bf8e7a949.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)

## 8. 直接上层引用

- [applications/modules/XiFluid/bRhoMulticomponentThermo/mixtures/bInhomogeneousMixture/bInhomogeneousMixture.C](../../../02-solver-modules/files/50/binhomogeneousmixture.c--50771628b74b.md)
- [applications/modules/XiFluid/bRhoMulticomponentThermo/mixtures/bInhomogeneousMixture/BInhomogeneousMixture.H](../../../02-solver-modules/files/08/binhomogeneousmixture.h--08c5b586206a.md)
- [applications/modules/XiFluid/ubMixtureMaps/uInhomogeneousbInhomogeneous/uInhomogeneousbInhomogeneous.C](../../../02-solver-modules/files/34/uinhomogeneousbinhomogeneous.c--34fa0d70b68c.md)
- [applications/modules/XiFluid/ubMixtureMaps/uInhomogeneousEGRbInhomogeneous/uInhomogeneousEGRbInhomogeneous.C](../../../02-solver-modules/files/88/uinhomogeneousegrbinhomogeneous.c--8858e3eaafae.md)
- [applications/modules/XiFluid/ubMixtureMaps/uMulticomponentbInhomogeneous/uMulticomponentbInhomogeneous.C](../../../02-solver-modules/files/93/umulticomponentbinhomogeneous.c--93c3fd417c2a.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
