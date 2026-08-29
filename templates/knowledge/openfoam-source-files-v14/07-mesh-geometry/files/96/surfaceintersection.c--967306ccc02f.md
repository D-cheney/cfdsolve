---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-967306ccc02f"
title: "OpenFOAM 14 源码解析：surfaceIntersection.C"
summary: "该文件实现 `excludeEdgeHit`、`storeIntersection`、`classifyHit`、`doCutEdges` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/triSurface/booleanOps/surfaceIntersection/surfaceIntersection.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：surfaceIntersection.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/triSurface/booleanOps/surfaceIntersection/surfaceIntersection.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1190 行
- 文件标识：`967306ccc02f`

## 2. 功能说明

该文件实现 `excludeEdgeHit`、`storeIntersection`、`classifyHit`、`doCutEdges` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::surfaceIntersection::excludeEdgeHit` | 57 |
| `Foam::surfaceIntersection::storeIntersection` | 200 |
| `Foam::surfaceIntersection::classifyHit` | 279 |
| `Foam::surfaceIntersection::doCutEdges` | 563 |
| `Foam::surfaceIntersection::cutPoints` | 1137 |
| `Foam::surfaceIntersection::cutEdges` | 1142 |
| `Foam::surfaceIntersection::facePairToVertex` | 1148 |
| `Foam::surfaceIntersection::facePairToEdge` | 1154 |
| `Foam::surfaceIntersection::edgeCuts` | 1160 |
| `Foam::surfaceIntersection::surf1EdgeCuts` | 1176 |
| `Foam::surfaceIntersection::surf2EdgeCuts` | 1182 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`surfaceIntersection.H`](../../../07-mesh-geometry/files/53/surfaceintersection.h--532b3cd68080.md)
- [`triSurfaceSearch.H`](../../../07-mesh-geometry/files/3d/trisurfacesearch.h--3de7b601fda8.md)
- [`labelPairLookup.H`](../../../07-mesh-geometry/files/d2/labelpairlookup.h--d2ee142a517a.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`triSurface.H`](../../../07-mesh-geometry/files/64/trisurface.h--64b575996c2b.md)
- [`pointIndexHit.H`](../../../04-core-runtime/files/71/pointindexhit.h--711d8d27684c.md)
- [`mergePoints.H`](../../../04-core-runtime/files/88/mergepoints.h--88d4b8c4025e.md)
- [`plane.H`](../../../04-core-runtime/files/e2/plane.h--e24914af3352.md)
- [`edgeIntersections.H`](../../../07-mesh-geometry/files/82/edgeintersections.h--82a2ef190be3.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
