---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9b49a1e6ee8f"
title: "OpenFOAM 14 源码解析：gatherScatterList.C"
summary: "该文件实现 `gatherList`、`scatterList`、`concatenateList` 等过程，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/db/IOstreams/Pstreams/gatherScatterList.C"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：gatherScatterList.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/db/IOstreams/Pstreams/gatherScatterList.C`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：379 行
- 文件标识：`9b49a1e6ee8f`

## 2. 功能说明

该文件实现 `gatherList`、`scatterList`、`concatenateList` 等过程，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Gather data from all processors onto single processor according to some communication schedule (usually linear-to-master or tree-to-master). The gathered data will be a list with element procID the data from processor procID. Before calling every processor should insert its value into Values[UPstream::myProcNo(comm)]. Note: after gather every processor only knows its own data and that of the processors below it. Only the 'master' of the communication schedule holds a fully filled List. Use scatter to distribute the data.

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::Pstream::gatherList` | 48 |
| `Foam::Pstream::scatterList` | 210 |
| `Foam::Pstream::concatenateList` | 357 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`IPstream.H`](../../../04-core-runtime/files/64/ipstream.h--640f452b6721.md)
- [`OPstream.H`](../../../04-core-runtime/files/e6/opstream.h--e6da9210216d.md)
- [`contiguous.H`](../../../04-core-runtime/files/7a/contiguous.h--7a4d443fff8c.md)
- [`ListListOps.H`](../../../04-core-runtime/files/ea/listlistops.h--ea28b483300e.md)

## 8. 直接上层引用

- [src/OpenFOAM/db/IOstreams/Pstreams/Pstream.H](../../../04-core-runtime/files/2f/pstream.h--2f930fcee072.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
