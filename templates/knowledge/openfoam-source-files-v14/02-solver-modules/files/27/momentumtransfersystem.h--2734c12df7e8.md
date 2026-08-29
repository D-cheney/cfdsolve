---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2734c12df7e8"
title: "OpenFOAM 14 源码解析：momentumTransferSystem.H"
summary: "该文件声明或实现 `blendedDragModel`、`blendedVirtualMassModel`、`blendedLiftModel`、`blendedWallLubricationModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/momentumTransferSystem/momentumTransferSystem.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：momentumTransferSystem.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/momentumTransferSystem/momentumTransferSystem.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：251 行
- 文件标识：`2734c12df7e8`

## 2. 功能说明

该文件声明或实现 `blendedDragModel`、`blendedVirtualMassModel`、`blendedLiftModel`、`blendedWallLubricationModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Class which provides interfacial momentum transfer between a number of phases. Drag, virtual mass, lift, wall lubrication and turbulent dispersion are all modelled. Access is provided to a various forces and coefficients needed by the solver.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `blendedDragModel` | 56 |
| `blendedVirtualMassModel` | 57 |
| `blendedLiftModel` | 58 |
| `blendedWallLubricationModel` | 59 |
| `blendedTurbulentDispersionModel` | 60 |
| `momentumTransferSystem` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`HashPtrTable.H`](../../../04-core-runtime/files/4a/hashptrtable.h--4ab8e1bdb8c9.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/multiphaseEuler.H](../../../02-solver-modules/files/1d/multiphaseeuler.h--1da7f90917b2.md)
- [applications/modules/multiphaseEuler/phaseSystem/momentumTransferSystem/momentumTransferSystem.C](../../../02-solver-modules/files/eb/momentumtransfersystem.c--eb3047533344.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystemSolve.C](../../../02-solver-modules/files/98/phasesystemsolve.c--98397a99cdb9.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
