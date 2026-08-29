---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e6b65072b647"
title: "OpenFOAM 14 源码解析：functionalRigidBody_pointMeshMover.H"
summary: "该文件声明或实现 `functionalRigidBody`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/pointMeshMovers/rigidBody/functionalRigidBody/functionalRigidBody_pointMeshMover.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：functionalRigidBody_pointMeshMover.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/pointMeshMovers/rigidBody/functionalRigidBody/functionalRigidBody_pointMeshMover.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：223 行
- 文件标识：`e6b65072b647`

## 2. 功能说明

该文件声明或实现 `functionalRigidBody`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Multiple rigid body mesh motion in which movement is specified as a solidBodyMotionFunction for each body and optionally for the exterior of the region. Applies distance weighted SLERP interpolation between the septernions returned by each of the body movement functions. The mesh patches for each body must be specified and optionally pointZones that move with each body. The motion of the mesh around each body may be constrained by the optional \c innerDistance and \c outerDistance, the mesh within the \c innerDistance moves with the body without distortion and the mesh beyond the \c outerDistance does not move with body but may move by the proximity of other bodies or by the optionally specified exterior motion. Example of the motion of a single body in a stationary region: \verbatim mover { type pointMeshMover; libs ("libpointMeshMovers.so"); pointMeshMover { type functionalRigidBody; e

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `functionalRigidBody` | 168 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`multiRigidBody_pointMeshMover.H`](../../../07-mesh-geometry/files/ab/multirigidbody_pointmeshmover.h--ab424b4125a0.md)
- [`solidBodyMotionFunction.H`](../../../07-mesh-geometry/files/92/solidbodymotionfunction.h--92b84fdc021f.md)

## 8. 直接上层引用

- [src/pointMeshMovers/rigidBody/functionalRigidBody/functionalRigidBody_pointMeshMover.C](../../../07-mesh-geometry/files/e2/functionalrigidbody_pointmeshmover.c--e23cbb9b5eb0.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
