---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a3d66196dccd"
title: "OpenFOAM 14 源码解析：ParSortableList.H"
summary: "该文件声明或实现 `ParSortableList`、`taggedValue`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/containers/Lists/SortableList/ParSortableList.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：ParSortableList.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/containers/Lists/SortableList/ParSortableList.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：220 行
- 文件标识：`a3d66196dccd`

## 2. 功能说明

该文件声明或实现 `ParSortableList`、`taggedValue`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Implementation of PSRS parallel sorting routine. From "On the Versatility of Parallel Sorting by Regular Sampling" Xiaobo Li et. all. Construct from list of things to sort (uses SortableList, 'thing' should implement >, ==). Will contain sorted data and in - indices() the original indices - procs() the original processor id. Can also be constructed from size, filled at ease and then sort()'ed.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ParSortableList` | 74 |
| `taggedValue` | 93 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `index` | 125 |
| `procIndex` | 135 |

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`ParSortableList.C`](../../../04-core-runtime/files/48/parsortablelist.c--4814d34b3746.md)

## 8. 直接上层引用

- [src/OpenFOAM/containers/Lists/SortableList/ParSortableList.C](../../../04-core-runtime/files/48/parsortablelist.c--4814d34b3746.md)
- [src/OpenFOAM/containers/Lists/SortableList/ParSortableListName.C](../../../04-core-runtime/files/8b/parsortablelistname.c--8b3fe3b1e61b.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
