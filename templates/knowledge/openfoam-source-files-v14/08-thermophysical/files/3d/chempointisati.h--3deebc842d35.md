---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3deebc842d35"
title: "OpenFOAM 14 源码解析：chemPointISATI.H"
summary: "该文件实现 `table`、`nGrowth`、`completeSpaceSize`、`phi` 等过程，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/chemPointISAT/chemPointISATI.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：chemPointISATI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/chemPointISAT/chemPointISATI.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：219 行
- 文件标识：`3deebc842d35`

## 2. 功能说明

该文件实现 `table`、`nGrowth`、`completeSpaceSize`、`phi` 等过程，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::chemPointISAT::table` | 31 |
| `Foam::chemPointISAT::nGrowth` | 37 |
| `Foam::chemPointISAT::completeSpaceSize` | 43 |
| `Foam::chemPointISAT::phi` | 55 |
| `Foam::chemPointISAT::Rphi` | 61 |
| `Foam::chemPointISAT::scaleFactor` | 67 |
| `Foam::chemPointISAT::tolerance` | 73 |
| `Foam::chemPointISAT::changeTolerance` | 79 |
| `Foam::chemPointISAT::node` | 85 |
| `Foam::chemPointISAT::A` | 91 |
| `Foam::chemPointISAT::LT` | 103 |
| `Foam::chemPointISAT::nActive` | 115 |
| `Foam::chemPointISAT::completeToSimplifiedIndex` | 121 |
| `Foam::chemPointISAT::simplifiedToCompleteIndex` | 128 |
| `Foam::chemPointISAT::increaseNumRetrieve` | 135 |
| `Foam::chemPointISAT::resetNumRetrieve` | 141 |
| `Foam::chemPointISAT::increaseNLifeTime` | 147 |
| `Foam::chemPointISAT::timeTag` | 181 |
| `Foam::chemPointISAT::lastTimeUsed` | 187 |
| `Foam::chemPointISAT::toRemove` | 193 |
| `Foam::chemPointISAT::maxNumNewDim` | 199 |
| `Foam::chemPointISAT::numRetrieve` | 205 |
| `Foam::chemPointISAT::nLifeTime` | 211 |

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- 未检测到直接 `#include`；脚本/清单或自包含实现可能通过环境和命令产生依赖。

## 8. 直接上层引用

- [src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/chemPointISAT/chemPointISAT.H](../../../08-thermophysical/files/38/chempointisat.h--387a8d6999d3.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
