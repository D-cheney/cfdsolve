---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-47f452528aa2"
title: "OpenFOAM 14 源码解析：interfaceCompositionModel.H"
summary: "该文件声明或实现 `interfaceCompositionModel`、`sidedInterfaceCompositionModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/interfaceCompositionModel/interfaceCompositionModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：interfaceCompositionModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/interfaceCompositionModel/interfaceCompositionModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：244 行
- 文件标识：`47f452528aa2`

## 2. 功能说明

该文件声明或实现 `interfaceCompositionModel`、`sidedInterfaceCompositionModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Generic base class for interface composition models. These models describe the composition in phase 1 of the supplied pair at the interface with phase 2.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `interfaceCompositionModel` | 62 |
| `sidedInterfaceCompositionModel` | 201 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`hashedWordList.H`](../../../04-core-runtime/files/1f/hashedwordlist.h--1f1f3bb79433.md)
- [`rhoFluidMulticomponentThermo.H`](../../../08-thermophysical/files/48/rhofluidmulticomponentthermo.h--48a46ee83818.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`sidedPhaseInterface.H`](../../../02-solver-modules/files/e7/sidedphaseinterface.h--e7d6c8d8ff52.md)
- [`SidedInterfacialModel.H`](../../../02-solver-modules/files/23/sidedinterfacialmodel.h--23fdd8f588d4.md)
- [`interfaceCompositionModelI.H`](../../../02-solver-modules/files/a4/interfacecompositionmodeli.h--a4d10ee15b48.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/massDiffusionLimitedPhaseChange/massDiffusionLimitedPhaseChange.H](../../../02-solver-modules/files/3f/massdiffusionlimitedphasechange.h--3f20eb5ad92f.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/Henry/Henry.H](../../../02-solver-modules/files/d7/henry.h--d7eae5bfd482.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/interfaceCompositionModel/interfaceCompositionModel.C](../../../02-solver-modules/files/cb/interfacecompositionmodel.c--cb27647d5858.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/interfaceCompositionModel/interfaceCompositionModelI.H](../../../02-solver-modules/files/a4/interfacecompositionmodeli.h--a4d10ee15b48.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/interfaceCompositionModel/interfaceCompositionModelNew.C](../../../02-solver-modules/files/71/interfacecompositionmodelnew.c--71640b3588e1.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/nonRandomTwoLiquid/nonRandomTwoLiquid.H](../../../02-solver-modules/files/a8/nonrandomtwoliquid.h--a8c72d25ea0e.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/Raoult/Raoult.H](../../../02-solver-modules/files/bf/raoult.h--bfc9cc741ff1.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/saturated/saturated.H](../../../02-solver-modules/files/84/saturated.h--84c3b438d4fa.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
