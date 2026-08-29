---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d0db127aeeee"
title: "OpenFOAM 14 源码解析：compressibleTwoPhases.H"
summary: "该文件声明或实现 `compressibleTwoPhases`，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/compressibleTwoPhases/compressibleTwoPhases.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：compressibleTwoPhases.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/compressibleTwoPhases/compressibleTwoPhases.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：114 行
- 文件标识：`d0db127aeeee`

## 2. 功能说明

该文件声明或实现 `compressibleTwoPhases`，属于“多相与界面”模块。

中文导航角色：两相流与界面模型。

上游说明：Interface to two rhoFluidThermo-based phases

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `compressibleTwoPhases` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`twoPhases.H`](../../../10-multiphase/files/77/twophases.h--7775edaa425b.md)
- [`rhoFluidThermo.H`](../../../08-thermophysical/files/e6/rhofluidthermo.h--e68eb3d5b8b1.md)

## 8. 直接上层引用

- [applications/modules/compressibleVoF/compressibleTwoPhaseVoFMixture/compressibleTwoPhaseVoFMixture.H](../../../02-solver-modules/files/6e/compressibletwophasevofmixture.h--6ecbddd1b745.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseInterface/phaseInterface/phaseInterface.H](../../../02-solver-modules/files/2c/phaseinterface.h--2c84bd3e0874.md)
- [src/twoPhaseModels/compressibleCavitation/cavitationModel/cavitationModel.H](../../../10-multiphase/files/f6/cavitationmodel.h--f6617192e966.md)
- [src/twoPhaseModels/compressibleTwoPhases/compressibleTwoPhases.C](../../../10-multiphase/files/85/compressibletwophases.c--8585ff405821.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
