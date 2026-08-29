---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c1467d4dbada"
title: "OpenFOAM 14 源码解析：triSurfaceTools.C"
summary: "该文件实现 `calcRefineStatus`、`greenRefine`、`doRefine`、`faceCosAngle` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/triSurface/triSurfaceTools/triSurfaceTools.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：triSurfaceTools.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/triSurface/triSurfaceTools/triSurfaceTools.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：3008 行
- 文件标识：`c1467d4dbada`

## 2. 功能说明

该文件实现 `calcRefineStatus`、`greenRefine`、`doRefine`、`faceCosAngle` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::triSurfaceTools::calcRefineStatus` | 59 |
| `Foam::triSurfaceTools::greenRefine` | 96 |
| `Foam::triSurfaceTools::doRefine` | 165 |
| `Foam::triSurfaceTools::faceCosAngle` | 312 |
| `Foam::triSurfaceTools::protectNeighbours` | 338 |
| `Foam::triSurfaceTools::getCollapsedFaces` | 379 |
| `Foam::triSurfaceTools::vertexUsesFace` | 432 |
| `Foam::triSurfaceTools::getMergedEdges` | 455 |
| `Foam::triSurfaceTools::edgeCosAngle` | 537 |
| `Foam::triSurfaceTools::collapseMinCosAngle` | 631 |
| `Foam::triSurfaceTools::collapseCreatesFold` | 687 |
| `Foam::triSurfaceTools::cutEdge` | 846 |
| `Foam::triSurfaceTools::snapToEnd` | 1039 |
| `Foam::triSurfaceTools::visitFaces` | 1169 |
| `Foam::triSurfaceTools::writeOBJ` | 1256 |
| `Foam::triSurfaceTools::getVertexTriangles` | 1305 |
| `Foam::triSurfaceTools::getVertexVertices` | 1348 |
| `Foam::triSurfaceTools::otherFace` | 1433 |
| `Foam::triSurfaceTools::otherEdges` | 1461 |
| `Foam::triSurfaceTools::otherVertices` | 1490 |
| `Foam::triSurfaceTools::oppositeEdge` | 1525 |
| `Foam::triSurfaceTools::oppositeVertex` | 1555 |
| `Foam::triSurfaceTools::getEdge` | 1584 |
| `Foam::triSurfaceTools::getTriangle` | 1608 |
| `Foam::triSurfaceTools::collapseEdges` | 1655 |
| `Foam::triSurfaceTools::redGreenRefine` | 1869 |
| `Foam::triSurfaceTools::minEdge` | 1981 |
| `Foam::triSurfaceTools::maxEdge` | 2011 |
| `Foam::triSurfaceTools::mergePoints` | 2041 |
| `Foam::triSurfaceTools::surfaceNormal` | 2100 |
| `Foam::triSurfaceTools::edgeSide` | 2142 |
| `Foam::triSurfaceTools::surfaceSide` | 2181 |
| `Foam::triSurfaceTools::triangulate` | 2335 |
| `Foam::triSurfaceTools::triangulateFaceCentre` | 2512 |
| `Foam::triSurfaceTools::delaunay2D` | 2612 |
| `Foam::triSurfaceTools::calcInterpolationWeights` | 2677 |
| `Foam::triSurfaceTools::classify` | 2843 |
| `Foam::triSurfaceTools::trackToEdge` | 2885 |
| `Foam::triSurfaceTools::track` | 2963 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`triSurfaceTools.H`](../../../07-mesh-geometry/files/6a/trisurfacetools.h--6ab25699e4cd.md)
- [`triSurface.H`](../../../07-mesh-geometry/files/64/trisurface.h--64b575996c2b.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`mergePoints.H`](../../../04-core-runtime/files/88/mergepoints.h--88d4b8c4025e.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`plane.H`](../../../04-core-runtime/files/e2/plane.h--e24914af3352.md)
- [`geompack.H`](../../../07-mesh-geometry/files/19/geompack.h--19b8d47830e2.md)
- [`polygonTriangulate.H`](../../../04-core-runtime/files/01/polygontriangulate.h--018fe609d8e0.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
