---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2f42df569299"
title: "OpenFOAM 14 源码解析：JanevReactionRateI.H"
summary: "该文件实现 `JanevReactionRate`、`preEvaluate`、`postEvaluate`、`operator` 等过程，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/reaction/reactionRate/JanevReactionRate/JanevReactionRateI.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：JanevReactionRateI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/reaction/reactionRate/JanevReactionRate/JanevReactionRateI.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：198 行
- 文件标识：`2f42df569299`

## 2. 功能说明

该文件实现 `JanevReactionRate`、`preEvaluate`、`postEvaluate`、`operator` 等过程，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::JanevReactionRate::JanevReactionRate` | 36 |
| `Foam::JanevReactionRate::preEvaluate` | 73 |
| `Foam::JanevReactionRate::postEvaluate` | 76 |
| `Foam::JanevReactionRate::operator` | 80 |
| `Foam::JanevReactionRate::ddT` | 115 |
| `Foam::JanevReactionRate::hasDdc` | 157 |
| `Foam::JanevReactionRate::ddc` | 163 |
| `Foam::JanevReactionRate::write` | 176 |

## 5. 算法与控制流程

1. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
2. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`JanevReactionRate.H`](../../../08-thermophysical/files/8b/janevreactionrate.h--8bad6be65fbb.md)
- [`physicoChemicalConstants.H`](../../../04-core-runtime/files/b6/physicochemicalconstants.h--b630740da18d.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/reaction/reactionRate/JanevReactionRate/JanevReactionRate.H](../../../08-thermophysical/files/8b/janevreactionrate.h--8bad6be65fbb.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
