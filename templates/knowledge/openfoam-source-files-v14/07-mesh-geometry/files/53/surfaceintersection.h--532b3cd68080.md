---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-532b3cd68080"
title: "OpenFOAM 14 源码解析：surfaceIntersection.H"
summary: "该文件声明或实现 `triSurfaceSearch`、`triSurface`、`edgeIntersections`、`surfaceIntersection`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/triSurface/booleanOps/surfaceIntersection/surfaceIntersection.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：surfaceIntersection.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/triSurface/booleanOps/surfaceIntersection/surfaceIntersection.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：310 行
- 文件标识：`532b3cd68080`

## 2. 功能说明

该文件声明或实现 `triSurfaceSearch`、`triSurface`、`edgeIntersections`、`surfaceIntersection`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Basic surface-surface intersection description. Constructed from two surfaces it creates a description of the intersection. The intersection information consists of the intersection line(s) with new points, new edges between points (note that these edges and points are on both surfaces) and various addressing from original surface faces/edges to intersection and vice versa. Gets either precalculated intersection information or calculates it itself. Algorithm works by intersecting all edges of one surface with the other surface and storing a reference from both faces (one on surface1, one on surface 2) to the vertex. If the reference re-occurs we have the second hit of both faces and an edge is created between the retrieved vertex and the new one. Note: when doing intersecting itself uses intersection::planarTol() as a fraction of current edge length to determine if intersection is a poin

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `triSurfaceSearch` | 79 |
| `triSurface` | 80 |
| `edgeIntersections` | 81 |
| `surfaceIntersection` | 86 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`DynamicList.H`](../../../04-core-runtime/files/d0/dynamiclist.h--d0fb805f1b2f.md)
- [`point.H`](../../../04-core-runtime/files/60/point.h--60b73f2bc052.md)
- [`edge.H`](../../../04-core-runtime/files/48/edge.h--4833667a5506.md)
- [`labelPairLookup.H`](../../../07-mesh-geometry/files/d2/labelpairlookup.h--d2ee142a517a.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`edgeList.H`](../../../04-core-runtime/files/04/edgelist.h--04a5bb284762.md)
- [`pointIndexHit.H`](../../../04-core-runtime/files/71/pointindexhit.h--711d8d27684c.md)
- [`surfaceIntersectionTemplates.C`](../../../07-mesh-geometry/files/df/surfaceintersectiontemplates.c--df8fa1c56987.md)

## 8. 直接上层引用

- [src/meshTools/triSurface/booleanOps/booleanSurface/booleanSurface.H](../../../07-mesh-geometry/files/55/booleansurface.h--55297f811b8b.md)
- [src/meshTools/triSurface/booleanOps/intersectedSurface/edgeSurface.C](../../../07-mesh-geometry/files/bc/edgesurface.c--bc34af9b4c20.md)
- [src/meshTools/triSurface/booleanOps/intersectedSurface/intersectedSurface.C](../../../07-mesh-geometry/files/a9/intersectedsurface.c--a9320cdda864.md)
- [src/meshTools/triSurface/booleanOps/surfaceIntersection/surfaceIntersection.C](../../../07-mesh-geometry/files/96/surfaceintersection.c--967306ccc02f.md)
- [src/meshTools/triSurface/booleanOps/surfaceIntersection/surfaceIntersectionFuncs.C](../../../07-mesh-geometry/files/7a/surfaceintersectionfuncs.c--7a2d1305f53b.md)
- [src/meshTools/triSurface/booleanOps/surfaceIntersection/surfaceIntersectionTemplates.C](../../../07-mesh-geometry/files/df/surfaceintersectiontemplates.c--df8fa1c56987.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
