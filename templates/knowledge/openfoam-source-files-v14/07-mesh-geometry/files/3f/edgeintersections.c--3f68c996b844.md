---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3f68c996b844"
title: "OpenFOAM 14 源码解析：edgeIntersections.C"
summary: "该文件实现 `checkEdges`、`intersectEdges`、`inlinePerturb`、`rotatePerturb` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/triSurface/booleanOps/surfaceIntersection/edgeIntersections.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：edgeIntersections.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/triSurface/booleanOps/surfaceIntersection/edgeIntersections.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：784 行
- 文件标识：`3f68c996b844`

## 2. 功能说明

该文件实现 `checkEdges`、`intersectEdges`、`inlinePerturb`、`rotatePerturb` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::edgeIntersections::checkEdges` | 58 |
| `Foam::edgeIntersections::intersectEdges` | 101 |
| `Foam::edgeIntersections::inlinePerturb` | 233 |
| `Foam::edgeIntersections::rotatePerturb` | 313 |
| `Foam::edgeIntersections::offsetPerturb` | 386 |
| `Foam::edgeIntersections::minEdgeLength` | 519 |
| `Foam::edgeIntersections::removeDegenerates` | 546 |
| `Foam::edgeIntersections::merge` | 703 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`edgeIntersections.H`](../../../07-mesh-geometry/files/82/edgeintersections.h--82a2ef190be3.md)
- [`triSurfaceSearch.H`](../../../07-mesh-geometry/files/3d/trisurfacesearch.h--3de7b601fda8.md)
- [`labelPairLookup.H`](../../../07-mesh-geometry/files/d2/labelpairlookup.h--d2ee142a517a.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`triSurface.H`](../../../07-mesh-geometry/files/64/trisurface.h--64b575996c2b.md)
- [`pointIndexHit.H`](../../../04-core-runtime/files/71/pointindexhit.h--711d8d27684c.md)
- [`treeDataTriSurface.H`](../../../07-mesh-geometry/files/9f/treedatatrisurface.h--9fd24fd1214d.md)
- [`indexedOctree.H`](../../../04-core-runtime/files/9d/indexedoctree.h--9dbfd26d8444.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)
- [`plane.H`](../../../04-core-runtime/files/e2/plane.h--e24914af3352.md)
- [`randomGenerator.H`](../../../04-core-runtime/files/9b/randomgenerator.h--9b6aa7dc2c72.md)
- [`units.H`](../../../04-core-runtime/files/62/units.h--623c78073185.md)
- [`treeBoundBox.H`](../../../04-core-runtime/files/21/treeboundbox.h--21ae69859ea4.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
