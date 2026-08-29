---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-211d4bd02bbb"
title: "OpenFOAM 14 源码解析：pimpleNoLoopControl.H"
summary: "该文件声明或实现 `pimpleLoop`、`pimpleNoLoopControl`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleNoLoopControl/pimpleNoLoopControl.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pimpleNoLoopControl.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleNoLoopControl/pimpleNoLoopControl.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：189 行
- 文件标识：`211d4bd02bbb`

## 2. 功能说明

该文件声明或实现 `pimpleLoop`、`pimpleNoLoopControl`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Pimple no-loop control class. Implements various option flags, but leaves loop controls to the derivation or owner. Can be derived into a "full" pimple control or can be owned by a multi-region pimple class.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pimpleLoop` | 58 |
| `pimpleNoLoopControl` | 64 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **非正交校正**：在外层解不变的条件下重复修正非正交拉普拉斯贡献，并在末次更新守恒通量。
2. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`pisoControl.H`](../../../05-finite-volume/files/ef/pisocontrol.h--ef44f5c80e0b.md)
- [`singleRegionConvergenceControl.H`](../../../05-finite-volume/files/71/singleregionconvergencecontrol.h--71e84a85db1d.md)
- [`singleRegionCorrectorConvergenceControl.H`](../../../05-finite-volume/files/40/singleregioncorrectorconvergencecontrol.h--40d0a13a2767.md)
- [`pimpleNoLoopControlI.H`](../../../05-finite-volume/files/9a/pimplenoloopcontroli.h--9acd95d46103.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/phaseSystem/momentumTransferSystem/momentumTransferSystem.C](../../../02-solver-modules/files/eb/momentumtransfersystem.c--eb3047533344.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.H](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleMultiRegionControl/pimpleMultiRegionControl.H](../../../05-finite-volume/files/78/pimplemultiregioncontrol.h--784001142878.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleNoLoopControl/pimpleNoLoopControl.C](../../../05-finite-volume/files/3a/pimplenoloopcontrol.c--3a5fac754e3a.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleSingleRegionControl/pimpleSingleRegionControl.H](../../../05-finite-volume/files/41/pimplesingleregioncontrol.h--41b257cda08f.md)
- [src/finiteVolume/solver/solver.H](../../../05-finite-volume/files/0e/solver.h--0e19ba72056e.md)
- [src/fvModels/propellerDisk/propellerDiskTemplates.C](../../../12-boundaries-sources/files/56/propellerdisktemplates.c--567c53c5fe23.md)
- [src/Lagrangian/cloud/fvModel/cloud_fvModel.C](../../../11-lagrangian/files/26/cloud_fvmodel.c--26b72f2f5a0f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
