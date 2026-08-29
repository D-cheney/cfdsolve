---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fe56c90c4032"
title: "OpenFOAM 14 源码解析：generateInterfacialModels.H"
summary: "该文件实现 `generateInterfacialModels` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/interfacialModels/generateInterfacialModels.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：generateInterfacialModels.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/interfacialModels/generateInterfacialModels.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：441 行
- 文件标识：`fe56c90c4032`

## 2. 功能说明

该文件实现 `generateInterfacialModels` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：Functions for generating tables of interfacial models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ModelPhaseInterfaceTypes` | 131 |
| `PhaseInterfaceInfo` | 192 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `modelName` | 56 |
| `isModelPhaseInterfaceType` | 186 |
| `operator` | 200 |
| `checkInterfacialModelsDict` | 231 |
| `generateInterfacialModels` | 290 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`TypeSet.H`](../../../04-core-runtime/files/77/typeset.h--772540336ffc.md)
- [`dispersedPhaseInterface.H`](../../../02-solver-modules/files/02/dispersedphaseinterface.h--0229764537e0.md)
- [`segregatedPhaseInterface.H`](../../../02-solver-modules/files/f8/segregatedphaseinterface.h--f890ab5e1eb2.md)
- [`displacedPhaseInterface.H`](../../../02-solver-modules/files/8e/displacedphaseinterface.h--8ea812f2e880.md)
- [`sidedPhaseInterface.H`](../../../02-solver-modules/files/e7/sidedphaseinterface.h--e7d6c8d8ff52.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/BlendedInterfacialModel/BlendedInterfacialModel.C](../../../02-solver-modules/files/88/blendedinterfacialmodel.c--88a21b8b92ea.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/generateBlendedInterfacialModels.H](../../../02-solver-modules/files/e0/generateblendedinterfacialmodels.h--e0a360db1f7d.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/SidedInterfacialModel/SidedInterfacialModel.C](../../../02-solver-modules/files/49/sidedinterfacialmodel.c--49a370d8d218.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.C](../../../02-solver-modules/files/1c/phasesystem.c--1cb251073247.md)
- [applications/modules/multiphaseEuler/phaseSystem/surfaceTensionCoefficientModels/surfaceTensionCoefficientModel/surfaceTensionCoefficientModelNew.C](../../../02-solver-modules/files/b7/surfacetensioncoefficientmodelnew.c--b747a91c234d.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
