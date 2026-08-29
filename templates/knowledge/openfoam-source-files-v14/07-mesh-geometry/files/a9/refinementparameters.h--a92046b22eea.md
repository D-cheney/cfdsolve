---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a92046b22eea"
title: "OpenFOAM 14 源码解析：refinementParameters.H"
summary: "该文件声明或实现 `polyMesh`、`refinementParameters`、`cellSelectionPoints`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/mesh/snappyHexMesh/snappyHexMeshDriver/refinementParameters/refinementParameters.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：refinementParameters.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/mesh/snappyHexMesh/snappyHexMeshDriver/refinementParameters/refinementParameters.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：241 行
- 文件标识：`a92046b22eea`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`refinementParameters`、`cellSelectionPoints`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Simple container to keep together refinement specific information.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 55 |
| `refinementParameters` | 60 |
| `cellSelectionPoints` | 69 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `maxGlobalCells` | 152 |
| `maxLocalCells` | 158 |
| `minRefineCells` | 164 |
| `curvature` | 170 |
| `planarAngle` | 176 |
| `nBufferLayers` | 182 |
| `allowFreeStandingZoneFaces` | 196 |
| `useTopologicalSnapDetection` | 203 |
| `maxLoadUnbalance` | 209 |
| `handleSnapProblems` | 213 |

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`point.H`](../../../04-core-runtime/files/60/point.h--60b73f2bc052.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)

## 8. 直接上层引用

- [src/mesh/snappyHexMesh/meshRefinement/meshRefinement.H](../../../07-mesh-geometry/files/27/meshrefinement.h--27b49fc2d8ae.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/refinementParameters/refinementParameters.C](../../../07-mesh-geometry/files/58/refinementparameters.c--584a7b4d8398.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyRefineDriver.C](../../../07-mesh-geometry/files/73/snappyrefinedriver.c--7392231fe379.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
