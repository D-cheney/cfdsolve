---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-51346e4002a6"
title: "OpenFOAM 14 源码解析：dispersedDragModel.H"
summary: "该文件声明或实现 `swarmCorrection`、`dispersedDragModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/dispersedDragModel/dispersedDragModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：dispersedDragModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/dispersedDragModel/dispersedDragModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：127 行
- 文件标识：`51346e4002a6`

## 2. 功能说明

该文件声明或实现 `swarmCorrection`、`dispersedDragModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model for drag between two phases where one phase can be considered dispersed in the other and the drag therefore characterised by a drag coefficient

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `swarmCorrection` | 53 |
| `dispersedDragModel` | 62 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`dragModel.H`](../../../02-solver-modules/files/24/dragmodel.h--243543c89a62.md)
- [`dispersedPhaseInterface.H`](../../../02-solver-modules/files/02/dispersedphaseinterface.h--0229764537e0.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/aerosolDrag/aerosolDrag.H](../../../02-solver-modules/files/9e/aerosoldrag.h--9ed49a0fde68.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/Beetstra/Beetstra.H](../../../02-solver-modules/files/3f/beetstra.h--3fdcc2d73b1b.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/dispersedDragModel/dispersedDragModel.C](../../../02-solver-modules/files/f1/disperseddragmodel.c--f149ed37c673.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/Ergun/Ergun.H](../../../02-solver-modules/files/18/ergun.h--18f1d4bcba63.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/Gibilaro/Gibilaro.H](../../../02-solver-modules/files/4c/gibilaro.h--4c05258fddd5.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/GidaspowErgunWenYu/GidaspowErgunWenYu.H](../../../02-solver-modules/files/6f/gidaspowergunwenyu.h--6fca0f88e15a.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/GidaspowSchillerNaumann/GidaspowSchillerNaumann.H](../../../02-solver-modules/files/c0/gidaspowschillernaumann.h--c040ebed4a57.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/IshiiZuber/IshiiZuber.H](../../../02-solver-modules/files/34/ishiizuber.h--3401b0ac66a2.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/Lain/Lain.H](../../../02-solver-modules/files/1c/lain.h--1c69a88a39c4.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/SchillerNaumann/SchillerNaumann.H](../../../02-solver-modules/files/eb/schillernaumann.h--eb885ca3c33b.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/SyamlalOBrien/SyamlalOBrien.H](../../../02-solver-modules/files/ad/syamlalobrien.h--ad8387c6137e.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/Tenneti/Tenneti.H](../../../02-solver-modules/files/e7/tenneti.h--e701f8f54e85.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/timeScaleFilteredDrag/timeScaleFilteredDrag.H](../../../02-solver-modules/files/da/timescalefiltereddrag.h--dabad36f09cd.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/TomiyamaAnalytic/TomiyamaAnalytic.H](../../../02-solver-modules/files/10/tomiyamaanalytic.h--104552ae144c.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/TomiyamaCorrelated/TomiyamaCorrelated.H](../../../02-solver-modules/files/0c/tomiyamacorrelated.h--0c4091c15c3b.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/TomiyamaKataokaZunSakaguchi/TomiyamaKataokaZunSakaguchi.H](../../../02-solver-modules/files/01/tomiyamakataokazunsakaguchi.h--0101b2a4927f.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/dragModels/WenYu/WenYu.H](../../../02-solver-modules/files/25/wenyu.h--2598cddfbcd9.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/turbulentDispersionModels/Burns/Burns.C](../../../02-solver-modules/files/57/burns.c--5766aa59d93c.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/turbulentDispersionModels/Gosman/Gosman.C](../../../02-solver-modules/files/9d/gosman.c--9d057a17aaaa.md)
- [src/MomentumTransportModels/phaseCompressible/RAS/LaheyKEpsilon/LaheyKEpsilon.C](../../../09-turbulence-transport/files/b1/laheykepsilon.c--b1586909e032.md)
- [src/MomentumTransportModels/phaseCompressible/RAS/mixtureKEpsilon/mixtureKEpsilon.C](../../../09-turbulence-transport/files/2f/mixturekepsilon.c--2f0d318ea27c.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
