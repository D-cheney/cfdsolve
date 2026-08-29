---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-82a2ef190be3"
title: "OpenFOAM 14 源码解析：edgeIntersections.H"
summary: "该文件声明或实现 `triSurface`、`triSurfaceSearch`、`randomGenerator`、`edge`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/triSurface/booleanOps/surfaceIntersection/edgeIntersections.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：edgeIntersections.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/triSurface/booleanOps/surfaceIntersection/edgeIntersections.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：228 行
- 文件标识：`82a2ef190be3`

## 2. 功能说明

该文件声明或实现 `triSurface`、`triSurfaceSearch`、`randomGenerator`、`edge`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Holder of intersections of edges of a surface with another surface. Optionally shuffles around points on surface to resolve any 'conflicts' (edge hitting triangle edge, edge hitting point etc.).

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `triSurface` | 58 |
| `triSurfaceSearch` | 59 |
| `randomGenerator` | 60 |
| `edge` | 61 |
| `edgeIntersections` | 66 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`pointIndexHit.H`](../../../04-core-runtime/files/71/pointindexhit.h--711d8d27684c.md)
- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)

## 8. 直接上层引用

- [applications/utilities/surface/surfaceBooleanFeatures/surfaceBooleanFeatures.C](../../../03-utilities/files/b1/surfacebooleanfeatures.c--b1f47d4b53a6.md)
- [src/meshTools/triSurface/booleanOps/surfaceIntersection/edgeIntersections.C](../../../07-mesh-geometry/files/3f/edgeintersections.c--3f68c996b844.md)
- [src/meshTools/triSurface/booleanOps/surfaceIntersection/surfaceIntersection.C](../../../07-mesh-geometry/files/96/surfaceintersection.c--967306ccc02f.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
