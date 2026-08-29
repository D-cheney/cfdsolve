---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-def71a40be75"
title: "OpenFOAM 14 源码解析：ChemicallyActivatedReactionRate.H"
summary: "该文件声明或实现 `ChemicallyActivatedReactionRate`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/reaction/reactionRate/ChemicallyActivatedReactionRate/ChemicallyActivatedReactionRate.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：ChemicallyActivatedReactionRate.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/reaction/reactionRate/ChemicallyActivatedReactionRate/ChemicallyActivatedReactionRate.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：176 行
- 文件标识：`def71a40be75`

## 2. 功能说明

该文件声明或实现 `ChemicallyActivatedReactionRate`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：General class for handling chemically-activated bimolecular reactions.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ChemicallyActivatedReactionRate` | 52 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`thirdBodyEfficiencies.H`](../../../08-thermophysical/files/17/thirdbodyefficiencies.h--170daa4ae5c8.md)
- [`ChemicallyActivatedReactionRateI.H`](../../../08-thermophysical/files/ce/chemicallyactivatedreactionratei.h--ce8acefc7166.md)

## 8. 直接上层引用

- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.C](../../../03-utilities/files/c7/chemkinreader.c--c7b9b121920d.md)
- [etc/codeTemplates/dynamicCode/chemistryModelTemplate.C](../../../15-build-config/files/77/chemistrymodeltemplate.c--77a8d58b02c2.md)
- [src/thermophysicalModels/chemistryModel/reaction/makeReactions.C](../../../08-thermophysical/files/25/makereactions.c--2556ac8b6027.md)
- [src/thermophysicalModels/specie/reaction/reactionRate/ChemicallyActivatedReactionRate/ChemicallyActivatedReactionRateI.H](../../../08-thermophysical/files/ce/chemicallyactivatedreactionratei.h--ce8acefc7166.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
