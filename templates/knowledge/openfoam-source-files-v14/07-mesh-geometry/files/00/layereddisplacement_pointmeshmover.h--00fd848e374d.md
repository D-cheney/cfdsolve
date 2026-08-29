---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-00fd848e374d"
title: "OpenFOAM 14 源码解析：layeredDisplacement_pointMeshMover.H"
summary: "该文件声明或实现 `layeredDisplacement`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/pointMeshMovers/displacement/layered/layeredDisplacement_pointMeshMover.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：layeredDisplacement_pointMeshMover.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/pointMeshMovers/displacement/layered/layeredDisplacement_pointMeshMover.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：149 行
- 文件标识：`00fd848e374d`

## 2. 功能说明

该文件声明或实现 `layeredDisplacement`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Interpolating motion solver for extruded/layered meshes Uses a topological walk from points along edges to points from one patch to the opposite, accumulating distance and propagating displacement and then again in the return direction and uses the distances from each point to the two opposite patches to linearly interpolate the displacements of these two patches to the each point. This motion solver is very simple to configure, only the two opposite patches between which the mesh is layered need be specified as a pair of patch names following the \c oppositePatches keyword, e.g. \verbatim mover { type pointMeshMover; libs ("libfvMotionSolvers.so"); pointMeshMover displacementLayered; oppositePatches (top bottom); } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `layeredDisplacement` | 79 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`displacement_pointMeshMover.H`](../../../07-mesh-geometry/files/11/displacement_pointmeshmover.h--119a32bda64c.md)

## 8. 直接上层引用

- [src/pointMeshMovers/displacement/layered/layeredDisplacement_pointMeshMover.C](../../../07-mesh-geometry/files/74/layereddisplacement_pointmeshmover.c--74f87faaf3a8.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
