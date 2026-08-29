---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b797532fd408"
title: "OpenFOAM 14 源码解析：mergePatchPairs.C"
summary: "该文件实现 `findPatchIndex`、`findPatchIndices`、`patchPairs`、`removePoints` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/mergePatchPairs/mergePatchPairs.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：mergePatchPairs.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/mergePatchPairs/mergePatchPairs.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：727 行
- 文件标识：`b797532fd408`

## 2. 功能说明

该文件实现 `findPatchIndex`、`findPatchIndices`、`patchPairs`、`removePoints` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::mergePatchPairs::findPatchIndex` | 46 |
| `Foam::mergePatchPairs::findPatchIndices` | 59 |
| `Foam::mergePatchPairs::patchPairs` | 72 |
| `Foam::mergePatchPairs::removePoints` | 88 |
| `Foam::mergePatchPairs::addPoints` | 121 |
| `Foam::mergePatchPairs::removeFaces` | 152 |
| `Foam::mergePatchPairs::mapFace` | 175 |
| `Foam::mergePatchPairs::addFaces` | 188 |
| `Foam::mergePatchPairs::addEdgeAddedPoints` | 309 |
| `Foam::mergePatchPairs::updatePoints` | 340 |
| `Foam::mergePatchPairs::modifyFaces` | 356 |
| `Foam::mergePatchPairs::intersectPatchPair` | 544 |
| `Foam::mergePatchPairs::merge` | 559 |
| `Foam::mergePatchPairs::connected` | 586 |
| `Foam::mergePatchPairs::mergePatchPairs` | 710 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`mergePatchPairs.H`](../../../07-mesh-geometry/files/9c/mergepatchpairs.h--9c409db7b754.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`polyPatchIntersection.H`](../../../07-mesh-geometry/files/cf/polypatchintersection.h--cf2c1a427f88.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
