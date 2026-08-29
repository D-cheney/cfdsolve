---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9f1029834ce3"
title: "OpenFOAM 14 源码解析：intersectedSurface.H"
summary: "该文件声明或实现 `surfaceIntersection`、`edgeSurface`、`intersectedSurface`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/triSurface/booleanOps/intersectedSurface/intersectedSurface.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：intersectedSurface.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/triSurface/booleanOps/intersectedSurface/intersectedSurface.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：307 行
- 文件标识：`9f1029834ce3`

## 2. 功能说明

该文件声明或实现 `surfaceIntersection`、`edgeSurface`、`intersectedSurface`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Given triSurface and intersection creates the intersected (properly triangulated) surface. (note: intersection is the list of points and edges 'shared' by two surfaces) Algorithm: - from the intersection get the points created on the edges of the surface - split the edges of the surface - construct a new edgeList with (in this order) the edges from the intersection ('cuts', i.e. the edges shared with the other surface) and the (split) edges from the original triangles (from 0 .. nSurfaceEdges) - construct face-edge addressing for above edges - for each face do a right-handed walk to reconstruct faces (splitFace) - retriangulate resulting faces The resulting surface will have the points from the surface first in the point list (0 .. nSurfacePoints-1) Note: problematic are the cut-edges which are completely inside a face. These will not be visited by a edge-point-edge walk. These are handl

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `surfaceIntersection` | 80 |
| `edgeSurface` | 81 |
| `intersectedSurface` | 86 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `nSurfacePoints` | 286 |
| `isSurfacePoint` | 292 |

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`triSurface.H`](../../../07-mesh-geometry/files/64/trisurface.h--64b575996c2b.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)

## 8. 直接上层引用

- [src/meshTools/triSurface/booleanOps/booleanSurface/booleanSurface.C](../../../07-mesh-geometry/files/e9/booleansurface.c--e9446fb52f84.md)
- [src/meshTools/triSurface/booleanOps/intersectedSurface/intersectedSurface.C](../../../07-mesh-geometry/files/a9/intersectedsurface.c--a9320cdda864.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
