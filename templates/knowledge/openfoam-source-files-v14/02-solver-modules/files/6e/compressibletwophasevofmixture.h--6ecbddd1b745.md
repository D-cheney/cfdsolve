---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6ecbddd1b745"
title: "OpenFOAM 14 源码解析：compressibleTwoPhaseVoFMixture.H"
summary: "该文件声明或实现 `compressibleTwoPhaseVoFMixture`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/compressibleVoF/compressibleTwoPhaseVoFMixture/compressibleTwoPhaseVoFMixture.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：compressibleTwoPhaseVoFMixture.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/compressibleVoF/compressibleTwoPhaseVoFMixture/compressibleTwoPhaseVoFMixture.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：218 行
- 文件标识：`6ecbddd1b745`

## 2. 功能说明

该文件声明或实现 `compressibleTwoPhaseVoFMixture`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Class to represent a mixture of two rhoFluidThermo-based phases

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `compressibleTwoPhaseVoFMixture` | 56 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `totalInternalEnergy` | 108 |
| `incompressible` | 168 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`twoPhaseVoFMixture.H`](../../../02-solver-modules/files/bc/twophasevofmixture.h--bcf4d2b92b32.md)
- [`compressibleTwoPhases.H`](../../../10-multiphase/files/d0/compressibletwophases.h--d0db127aeeee.md)
- [`rhoFluidThermo.H`](../../../08-thermophysical/files/e6/rhofluidthermo.h--e68eb3d5b8b1.md)

## 8. 直接上层引用

- [applications/modules/compressibleVoF/compressibleInterPhaseTransportModel/compressibleInterPhaseTransportModel.H](../../../02-solver-modules/files/3b/compressibleinterphasetransportmodel.h--3b3a19178384.md)
- [applications/modules/compressibleVoF/compressibleTwoPhaseVoFMixture/compressibleTwoPhaseVoFMixture.C](../../../02-solver-modules/files/96/compressibletwophasevofmixture.c--96221ff352cc.md)
- [applications/modules/compressibleVoF/compressibleVoF.H](../../../02-solver-modules/files/01/compressiblevof.h--01d5efebd3cf.md)
- [applications/modules/compressibleVoF/fvModels/VoFCavitation/VoFCavitation.C](../../../02-solver-modules/files/26/vofcavitation.c--2638d1c1f1ec.md)
- [applications/modules/compressibleVoF/fvModels/VoFClouds/VoFClouds.C](../../../02-solver-modules/files/f5/vofclouds.c--f5a53cd09c30.md)
- [applications/modules/compressibleVoF/fvModels/VoFSolidificationMelting/VoFSolidificationMelting.C](../../../02-solver-modules/files/c7/vofsolidificationmelting.c--c7a6854523bf.md)
- [applications/modules/compressibleVoF/fvModels/VoFTurbulenceDamping/VoFTurbulenceDamping.C](../../../02-solver-modules/files/14/vofturbulencedamping.c--1406202a103c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
