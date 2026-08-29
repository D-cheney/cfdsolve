---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4998d5ed595f"
title: "OpenFOAM 14 源码解析：addPatchCellLayer.H"
summary: "该文件声明或实现 `polyMesh`、`polyTopoChange`、`polyTopoChangeMap`、`primitiveMesh`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyTopoChange/addPatchCellLayer.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：addPatchCellLayer.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyTopoChange/addPatchCellLayer.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：413 行
- 文件标识：`4998d5ed595f`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyTopoChange`、`polyTopoChangeMap`、`primitiveMesh`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Adds layers of cells to outside of polyPatch. Can optionally create stand-alone extruded mesh (addToMesh=false). Call setRefinement with offset vector for every patch point and number of layers per patch face and number of layers per patch point. - offset vector should be zero for any non-manifold point and synchronised on coupled points before calling this. - offset vector of zero will not add any points. - gets supplied the number of extruded layers both per face and per point. Usually the point nlayers is the max of surrounding face nlayers. point nlayers: - 0 : no extrusion. Any surrounding face being extruded becomes 'prism' - >0 : should be max of surrounding face nlayers. - differing face nlayers: 'termination' : (e.g. from 2 to 4 layers) match at original patch face side. E.g. 2 boundary faces on patches a,b. 2 layers for a, 3 for b. \verbatim Was: a b <- patch of boundary face +

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 122 |
| `polyTopoChange` | 123 |
| `polyTopoChangeMap` | 124 |
| `primitiveMesh` | 125 |
| `globalIndex` | 126 |
| `addPatchCellLayer` | 131 |
| `uniqueEqOp` | 137 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `operator` | 140 |
| `setRefinement` | 359 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)
- [`indirectPrimitivePatch.H`](../../../04-core-runtime/files/ab/indirectprimitivepatch.h--ab8f04d3f0d8.md)

## 8. 直接上层引用

- [applications/utilities/mesh/generation/extrudeMesh/extrudeMesh.C](../../../03-utilities/files/c8/extrudemesh.c--c85ecbc45ccd.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.C](../../../07-mesh-geometry/files/6e/snappylayerdriver.c--6e5dc56e8a5d.md)
- [src/polyTopoChange/polyTopoChange/addPatchCellLayer.C](../../../07-mesh-geometry/files/b3/addpatchcelllayer.c--b3c40100715a.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
