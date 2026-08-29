---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-670ddf4b76d3"
title: "OpenFOAM 14 源码解析：dispersedLiftModel.H"
summary: "该文件声明或实现 `dispersedLiftModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/dispersedLiftModel/dispersedLiftModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：dispersedLiftModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/dispersedLiftModel/dispersedLiftModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：114 行
- 文件标识：`670ddf4b76d3`

## 2. 功能说明

该文件声明或实现 `dispersedLiftModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model for lift between two phases where one phase can be considered dispersed in the other and the lift therefore characterised by a lift coefficient

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `dispersedLiftModel` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`liftModel.H`](../../../02-solver-modules/files/27/liftmodel.h--277b3d1d6b7e.md)
- [`dispersedPhaseInterface.H`](../../../02-solver-modules/files/02/dispersedphaseinterface.h--0229764537e0.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/constantLiftCoefficient/constantLiftCoefficient.H](../../../02-solver-modules/files/00/constantliftcoefficient.h--001933d34f79.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/dispersedLiftModel/dispersedLiftModel.C](../../../02-solver-modules/files/12/dispersedliftmodel.c--12202a3a77c3.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/LegendreMagnaudet/LegendreMagnaudet.H](../../../02-solver-modules/files/ea/legendremagnaudet.h--eac2877df846.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/Moraga/Moraga.H](../../../02-solver-modules/files/0c/moraga.h--0cc31291eab3.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/SaffmanMei/SaffmanMei.H](../../../02-solver-modules/files/53/saffmanmei.h--53bbb2bfa72b.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/TomiyamaLift/TomiyamaLift.H](../../../02-solver-modules/files/f9/tomiyamalift.h--f9f440e221a7.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/liftModels/wallDampedLift/wallDampedLift.H](../../../02-solver-modules/files/5d/walldampedlift.h--5d5b0f9e9142.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
