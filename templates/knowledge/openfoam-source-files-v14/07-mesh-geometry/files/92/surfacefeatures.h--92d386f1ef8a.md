---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-92d386f1ef8a"
title: "OpenFOAM 14 源码解析：surfaceFeatures.H"
summary: "该文件声明或实现 `triSurface`、`surfaceFeatures`、`labelScalar`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/triSurface/surfaceFeatures/surfaceFeatures.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：surfaceFeatures.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/triSurface/surfaceFeatures/surfaceFeatures.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：477 行
- 文件标识：`92d386f1ef8a`

## 2. 功能说明

该文件声明或实现 `triSurface`、`surfaceFeatures`、`labelScalar`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Holds feature edges/points of surface. Feature edges are stored in one list and sorted: 0 .. externalStart_-1 : region edges externalStart_ .. internalStart_-1 : external edges internalStart_ .. size-1 : internal edges NOTE: angle is included angle, not feature angle. The included angle is the smallest angle between two planes. For coplanar faces it is 180 degrees, for straight angles it is 90 degrees. To pick up straight edges only use included angle of 91 degrees.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `triSurface` | 69 |
| `surfaceFeatures` | 74 |
| `labelScalar` | 91 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`pointIndexHit.H`](../../../04-core-runtime/files/71/pointindexhit.h--711d8d27684c.md)
- [`edgeList.H`](../../../04-core-runtime/files/04/edgelist.h--04a5bb284762.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`boundBox.H`](../../../04-core-runtime/files/e0/boundbox.h--e05c5ab0a2fb.md)
- [`plane.H`](../../../04-core-runtime/files/e2/plane.h--e24914af3352.md)

## 8. 直接上层引用

- [applications/utilities/surface/surfaceAutoPatch/surfaceAutoPatch.C](../../../03-utilities/files/81/surfaceautopatch.c--8167cd862bd4.md)
- [applications/utilities/surface/surfaceFeatures/surfaceFeatures.C](../../../03-utilities/files/1e/surfacefeatures.c--1e1f466782bf.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMesh.C](../../../07-mesh-geometry/files/5e/extendededgemesh.c--5e6139c4b98d.md)
- [src/meshTools/triSurface/surfaceFeatures/surfaceFeatures.C](../../../07-mesh-geometry/files/40/surfacefeatures.c--409c4c20d58e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
