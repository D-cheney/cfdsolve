---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a8ece904d126"
title: "OpenFOAM 14 源码解析：edgeVertex.H"
summary: "该文件声明或实现 `refineCell`、`edgeVertex`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/meshCut/edgeVertex/edgeVertex.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：edgeVertex.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/meshCut/edgeVertex/edgeVertex.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：242 行
- 文件标识：`a8ece904d126`

## 2. 功能说明

该文件声明或实现 `refineCell`、`edgeVertex`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Combines edge or vertex in single label. Used to specify cuts across cell circumference.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `refineCell` | 53 |
| `edgeVertex` | 58 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `isEdge` | 122 |
| `getEdge` | 138 |
| `getVertex` | 154 |
| `vertToEVert` | 170 |
| `edgeToEVert` | 186 |
| `cutPairToEdge` | 210 |

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`label.H`](../../../04-core-runtime/files/a8/label.h--a882f8e92b47.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)

## 8. 直接上层引用

- [applications/utilities/mesh/advanced/splitCells/splitCells.C](../../../03-utilities/files/2f/splitcells.c--2f7c73e3ee10.md)
- [src/polyTopoChange/meshCut/cellCuts/cellCuts.H](../../../07-mesh-geometry/files/2a/cellcuts.h--2a70eaf45a9b.md)
- [src/polyTopoChange/meshCut/cellLooper/cellLooper.H](../../../07-mesh-geometry/files/d2/celllooper.h--d22d96b6518c.md)
- [src/polyTopoChange/meshCut/edgeVertex/edgeVertex.C](../../../07-mesh-geometry/files/00/edgevertex.c--004c84a08c3d.md)
- [src/polyTopoChange/meshCut/meshModifiers/meshCutter/meshCutter.H](../../../07-mesh-geometry/files/4b/meshcutter.h--4be046e8ab20.md)
- [src/polyTopoChange/meshCut/meshModifiers/refinementIterator/refinementIterator.H](../../../07-mesh-geometry/files/74/refinementiterator.h--74ab350cbc07.md)
- [src/polyTopoChange/meshCut/meshModifiers/undoableMeshCutter/undoableMeshCutter.H](../../../07-mesh-geometry/files/39/undoablemeshcutter.h--3996310f29f9.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
