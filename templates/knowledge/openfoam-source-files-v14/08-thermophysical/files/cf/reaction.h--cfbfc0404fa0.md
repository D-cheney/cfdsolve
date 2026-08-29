---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cfbfc0404fa0"
title: "OpenFOAM 14 源码解析：Reaction.H"
summary: "该文件声明或实现 `Reaction`、`objectRegistry`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/reaction/Reactions/Reaction/Reaction.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：Reaction.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/reaction/Reactions/Reaction/Reaction.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：406 行
- 文件标识：`cfbfc0404fa0`

## 2. 功能说明

该文件声明或实现 `Reaction`、`objectRegistry`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Simple extension of ThermoType to handle reaction kinetics in addition to the equilibrium thermodynamics already handled.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Reaction` | 60 |
| `objectRegistry` | 66 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`reaction.H`](../../../08-thermophysical/files/95/reaction.h--959fe5a22284.md)
- [`HashPtrTable.H`](../../../04-core-runtime/files/4a/hashptrtable.h--4ab8e1bdb8c9.md)
- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`simpleMatrix.H`](../../../06-linear-algebra/files/1b/simplematrix.h--1bf776f446b9.md)
- [`Tuple2.H`](../../../04-core-runtime/files/ab/tuple2.h--ab8ee5c9d4ce.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`ReactionI.H`](../../../08-thermophysical/files/c8/reactioni.h--c8260608d254.md)
- [`Reaction.C`](../../../08-thermophysical/files/f7/reaction.c--f75feabaa787.md)

## 8. 直接上层引用

- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/ReactionProxy.H](../../../03-utilities/files/6b/reactionproxy.h--6b27e44f253a.md)
- [src/thermophysicalModels/chemistryModel/reaction/makeReaction.H](../../../08-thermophysical/files/03/makereaction.h--03c695f2e1e0.md)
- [src/thermophysicalModels/specie/reaction/reactionRate/MichaelisMenten/MichaelisMentenReactionRate.H](../../../08-thermophysical/files/06/michaelismentenreactionrate.h--06d09f390072.md)
- [src/thermophysicalModels/specie/reaction/Reactions/IrreversibleReaction/IrreversibleReaction.H](../../../08-thermophysical/files/4a/irreversiblereaction.h--4a76edfa0a73.md)
- [src/thermophysicalModels/specie/reaction/Reactions/NonEquilibriumReversibleReaction/NonEquilibriumReversibleReaction.H](../../../08-thermophysical/files/95/nonequilibriumreversiblereaction.h--95f9c0d4d6fe.md)
- [src/thermophysicalModels/specie/reaction/Reactions/Reaction/Reaction.C](../../../08-thermophysical/files/f7/reaction.c--f75feabaa787.md)
- [src/thermophysicalModels/specie/reaction/Reactions/Reaction/ReactionI.H](../../../08-thermophysical/files/c8/reactioni.h--c8260608d254.md)
- [src/thermophysicalModels/specie/reaction/Reactions/ReactionList/ReactionList.H](../../../08-thermophysical/files/2c/reactionlist.h--2c2eae5c37bf.md)
- [src/thermophysicalModels/specie/reaction/Reactions/ReversibleReaction/ReversibleReaction.H](../../../08-thermophysical/files/8b/reversiblereaction.h--8be603e5bf97.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
