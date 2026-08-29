---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-25a19a99150b"
title: "OpenFOAM 14 源码解析：UInhomogeneousMixture.H"
summary: "该文件声明或实现 `UInhomogeneousMixture`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/XiFluid/uRhoMulticomponentThermo/mixtures/uInhomogeneousMixture/UInhomogeneousMixture.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：UInhomogeneousMixture.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/XiFluid/uRhoMulticomponentThermo/mixtures/uInhomogeneousMixture/UInhomogeneousMixture.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：176 行
- 文件标识：`25a19a99150b`

## 2. 功能说明

该文件声明或实现 `UInhomogeneousMixture`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Templated unburnt gas combustion mixture for inhomogeneous lean, stoichiometric or rich conditions in which the fuel mass-fraction \c fu defines the composition.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `UInhomogeneousMixture` | 60 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`uInhomogeneousMixture.H`](../../../02-solver-modules/files/30/uinhomogeneousmixture.h--30a53fc6d425.md)
- [`UInhomogeneousMixture.C`](../../../02-solver-modules/files/c6/uinhomogeneousmixture.c--c6722314a970.md)

## 8. 直接上层引用

- [applications/modules/XiFluid/uRhoMulticomponentThermo/mixtures/uInhomogeneousMixture/UInhomogeneousMixture.C](../../../02-solver-modules/files/c6/uinhomogeneousmixture.c--c6722314a970.md)
- [applications/modules/XiFluid/uRhoMulticomponentThermo/uRhoMulticomponentThermos.C](../../../02-solver-modules/files/c8/urhomulticomponentthermos.c--c833a41cf1e0.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
