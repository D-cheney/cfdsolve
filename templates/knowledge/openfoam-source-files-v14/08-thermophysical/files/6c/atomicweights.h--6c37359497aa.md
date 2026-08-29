---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6c37359497aa"
title: "OpenFOAM 14 源码解析：atomicWeights.H"
summary: "该文件声明或实现 `atomicWeightTable`、`atomicWeight`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/atomicWeights/atomicWeights.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：atomicWeights.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/atomicWeights/atomicWeights.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：99 行
- 文件标识：`6c37359497aa`

## 2. 功能说明

该文件声明或实现 `atomicWeightTable`、`atomicWeight`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：A table of atomic weights for all the elements

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `atomicWeightTable` | 55 |
| `atomicWeight` | 66 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`scalar.H`](../../../04-core-runtime/files/cb/scalar.h--cb9b81900254.md)
- [`HashTable.H`](../../../04-core-runtime/files/cb/hashtable.h--cbcdb4c4948d.md)

## 8. 直接上层引用

- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.C](../../../03-utilities/files/c7/chemkinreader.c--c7b9b121920d.md)
- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.H](../../../03-utilities/files/a6/chemkinreader.h--a64993417c06.md)
- [src/thermophysicalModels/specie/atomicWeights/atomicWeights.C](../../../08-thermophysical/files/7e/atomicweights.c--7ecb48e8d3d3.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
