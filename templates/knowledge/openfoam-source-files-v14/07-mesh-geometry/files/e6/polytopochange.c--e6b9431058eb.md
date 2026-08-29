---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e6b9431058eb"
title: "OpenFOAM 14 源码解析：polyTopoChange.C"
summary: "该文件实现 `renumberReverseMap`、`renumber`、`renumberCompact`、`countMap` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyTopoChange/polyTopoChange.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：polyTopoChange.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyTopoChange/polyTopoChange.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：2412 行
- 文件标识：`e6b9431058eb`

## 2. 功能说明

该文件实现 `renumberReverseMap`、`renumber`、`renumberCompact`、`countMap` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::polyTopoChange::renumberReverseMap` | 50 |
| `Foam::polyTopoChange::renumber` | 72 |
| `Foam::polyTopoChange::renumberCompact` | 94 |
| `Foam::polyTopoChange::countMap` | 115 |
| `Foam::polyTopoChange::getSetIndices` | 180 |
| `Foam::polyTopoChange::writeMeshStats` | 197 |
| `Foam::polyTopoChange::getMergeSets` | 218 |
| `Foam::polyTopoChange::hasValidPoints` | 299 |
| `Foam::polyTopoChange::facePoints` | 312 |
| `Foam::polyTopoChange::checkFace` | 328 |
| `Foam::polyTopoChange::makeCells` | 456 |
| `Foam::polyTopoChange::makeCellCells` | 526 |
| `Foam::polyTopoChange::getCellOrder` | 569 |
| `Foam::polyTopoChange::getFaceOrder` | 687 |
| `Foam::polyTopoChange::reorderCompactFaces` | 838 |
| `Foam::polyTopoChange::compact` | 867 |
| `Foam::polyTopoChange::selectFaces` | 1208 |
| `Foam::polyTopoChange::calcPatchPointMap` | 1256 |
| `Foam::polyTopoChange::reorderCoupledFaces` | 1303 |
| `Foam::polyTopoChange::compactAndReorder` | 1420 |
| `Foam::polyTopoChange::polyTopoChange` | 1544 |
| `Foam::polyTopoChange::clear` | 1674 |
| `Foam::polyTopoChange::setCapacity` | 1695 |
| `Foam::polyTopoChange::addPoint` | 1719 |
| `Foam::polyTopoChange::modifyPoint` | 1741 |
| `Foam::polyTopoChange::removePoint` | 1776 |
| `Foam::polyTopoChange::addFace` | 1824 |
| `Foam::polyTopoChange::modifyFace` | 1868 |
| `Foam::polyTopoChange::removeFace` | 1893 |
| `Foam::polyTopoChange::addCell` | 1932 |
| `Foam::polyTopoChange::removeCell` | 1942 |
| `Foam::polyTopoChange::changeMesh` | 1972 |
| `Foam::polyTopoChange::makeMesh` | 2163 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`SortableList.H`](../../../04-core-runtime/files/67/sortablelist.h--6730cee0ba96.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`objectMap.H`](../../../04-core-runtime/files/e1/objectmap.h--e15614fcdabc.md)
- [`processorPolyPatch.H`](../../../04-core-runtime/files/42/processorpolypatch.h--42c8af29a130.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`CompactListList.H`](../../../04-core-runtime/files/00/compactlistlist.h--009109c57c35.md)
- [`ListOps.H`](../../../04-core-runtime/files/83/listops.h--830cf32f861c.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
