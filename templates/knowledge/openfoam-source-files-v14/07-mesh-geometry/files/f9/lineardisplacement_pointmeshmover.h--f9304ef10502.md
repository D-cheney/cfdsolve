---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f9304ef10502"
title: "OpenFOAM 14 源码解析：linearDisplacement_pointMeshMover.H"
summary: "该文件声明或实现 `linearDisplacement`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/pointMeshMovers/displacement/linear/linearDisplacement_pointMeshMover.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：linearDisplacement_pointMeshMover.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/pointMeshMovers/displacement/linear/linearDisplacement_pointMeshMover.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：148 行
- 文件标识：`f9304ef10502`

## 2. 功能说明

该文件声明或实现 `linearDisplacement`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Mesh motion solver simple linear expansion and contraction of a mesh region defined by a motion axis and the extents of the motion. Example: \verbatim mover pointMeshMover; libs ("libfvMotionSolvers.so"); pointMeshMover linearDisplacement; axis (0 1 0); xFixed 0.8; xMoving 0; displacement table ( (0 0) (4 0.7) ); \endverbatim This mesh is compressed between \c xFixed and \c xMoving in the direction \c axis between time 0 and 4 with a maximum displacement of 0.7. The mesh beyond \c xFixed is fixed and beyond \c xMoving moves with maximum displacement.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `linearDisplacement` | 81 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`displacementPoints0.H`](../../../07-mesh-geometry/files/f1/displacementpoints0.h--f1ba6ac8c38d.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/pointMeshMovers/displacement/linear/linearDisplacement_pointMeshMover.C](../../../07-mesh-geometry/files/c0/lineardisplacement_pointmeshmover.c--c0fda513471d.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
