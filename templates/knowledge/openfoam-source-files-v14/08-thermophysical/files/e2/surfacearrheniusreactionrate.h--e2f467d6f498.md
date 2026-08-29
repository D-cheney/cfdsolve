---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e2f467d6f498"
title: "OpenFOAM 14 源码解析：surfaceArrheniusReactionRate.H"
summary: "该文件声明或实现 `surfaceArrheniusReactionRate`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/reaction/reactionRate/surfaceArrheniusReactionRate/surfaceArrheniusReactionRate.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：surfaceArrheniusReactionRate.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/reaction/reactionRate/surfaceArrheniusReactionRate/surfaceArrheniusReactionRate.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：157 行
- 文件标识：`e2f467d6f498`

## 2. 功能说明

该文件声明或实现 `surfaceArrheniusReactionRate`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：A modified Arrhenius reaction rate given by: k = (A * T^beta * exp(-Ta/T))*a Where a is the surface area per unit volume, the name of which is specified by the user.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `surfaceArrheniusReactionRate` | 60 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`ArrheniusReactionRate.H`](../../../08-thermophysical/files/af/arrheniusreactionrate.h--af3b8e43af33.md)
- [`speciesTable.H`](../../../08-thermophysical/files/57/speciestable.h--570bf8e7a949.md)
- [`objectRegistry.H`](../../../04-core-runtime/files/c4/objectregistry.h--c41bbba65898.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`surfaceArrheniusReactionRateI.H`](../../../08-thermophysical/files/5a/surfacearrheniusreactionratei.h--5ad1a52fb365.md)

## 8. 直接上层引用

- [etc/codeTemplates/dynamicCode/chemistryModelTemplate.C](../../../15-build-config/files/77/chemistrymodeltemplate.c--77a8d58b02c2.md)
- [src/thermophysicalModels/chemistryModel/reaction/makeReactions.C](../../../08-thermophysical/files/25/makereactions.c--2556ac8b6027.md)
- [src/thermophysicalModels/specie/reaction/reactionRate/surfaceArrheniusReactionRate/surfaceArrheniusReactionRateI.H](../../../08-thermophysical/files/5a/surfacearrheniusreactionratei.h--5ad1a52fb365.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
