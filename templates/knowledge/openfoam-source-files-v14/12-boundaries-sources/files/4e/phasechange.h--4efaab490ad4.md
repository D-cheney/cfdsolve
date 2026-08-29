---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4efaab490ad4"
title: "OpenFOAM 14 源码解析：phaseChange.H"
summary: "该文件声明或实现 `basicThermo`、`fluidThermo`、`multicomponentThermo`、`fluidMulticomponentThermo`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/phaseChange/phaseChange.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：phaseChange.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/phaseChange/phaseChange.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：270 行
- 文件标识：`4efaab490ad4`

## 2. 功能说明

该文件声明或实现 `basicThermo`、`fluidThermo`、`multicomponentThermo`、`fluidMulticomponentThermo`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Base class for phase change models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `basicThermo` | 52 |
| `fluidThermo` | 54 |
| `multicomponentThermo` | 55 |
| `fluidMulticomponentThermo` | 56 |
| `phaseChange` | 64 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`hashedWordList.H`](../../../04-core-runtime/files/1f/hashedwordlist.h--1f1f3bb79433.md)
- [`massTransfer.H`](../../../12-boundaries-sources/files/39/masstransfer.h--3903d493cb3d.md)
- [`ThermoRefPair.H`](../../../12-boundaries-sources/files/ca/thermorefpair.h--caad4696c21a.md)
- [`phaseChangeI.H`](../../../12-boundaries-sources/files/7e/phasechangei.h--7ecfbdb0928c.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/heatTransferLimitedPhaseChange/heatTransferLimitedPhaseChange.H](../../../02-solver-modules/files/d6/heattransferlimitedphasechange.h--d682bc6211c5.md)
- [applications/modules/multiphaseEuler/fvModels/homogeneousNucleation/homogeneousNucleation.H](../../../02-solver-modules/files/cb/homogeneousnucleation.h--cb007319dceb.md)
- [applications/modules/multiphaseEuler/fvModels/massDiffusionLimitedPhaseChange/massDiffusionLimitedPhaseChange.H](../../../02-solver-modules/files/3f/massdiffusionlimitedphasechange.h--3f20eb5ad92f.md)
- [applications/modules/multiphaseEuler/fvModels/multiphaseEulerCavitation/multiphaseEulerCavitation.H](../../../02-solver-modules/files/03/multiphaseeulercavitation.h--035d96f3178b.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.H](../../../02-solver-modules/files/00/phasesurfaceboiling.h--00489274d877.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceCondensation/phaseSurfaceCondensation.H](../../../02-solver-modules/files/0e/phasesurfacecondensation.h--0e50a10dffdf.md)
- [applications/modules/multiphaseEuler/fvModels/reactionDrivenPhaseChange/reactionDrivenPhaseChange.H](../../../02-solver-modules/files/70/reactiondrivenphasechange.h--70a8c4c28f44.md)
- [applications/modules/multiphaseEuler/fvModels/wallPhaseChange/wallPhaseChange.H](../../../02-solver-modules/files/79/wallphasechange.h--79506832c065.md)
- [src/fvModels/general/phaseChange/coefficientPhaseChange.H](../../../12-boundaries-sources/files/25/coefficientphasechange.h--252c65bd76db.md)
- [src/fvModels/general/phaseChange/phaseChange.C](../../../12-boundaries-sources/files/ff/phasechange.c--ffa0c02dd65c.md)
- [src/fvModels/general/phaseChange/phaseChangeI.H](../../../12-boundaries-sources/files/7e/phasechangei.h--7ecfbdb0928c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
