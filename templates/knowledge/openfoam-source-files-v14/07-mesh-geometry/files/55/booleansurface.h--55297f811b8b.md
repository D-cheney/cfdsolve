---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-55297f811b8b"
title: "OpenFOAM 14 源码解析：booleanSurface.H"
summary: "该文件声明或实现 `triSurfaceSearch`、`intersectedSurface`、`booleanSurface`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/triSurface/booleanOps/booleanSurface/booleanSurface.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：booleanSurface.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/triSurface/booleanOps/booleanSurface/booleanSurface.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：255 行
- 文件标识：`55297f811b8b`

## 2. 功能说明

该文件声明或实现 `triSurfaceSearch`、`intersectedSurface`、`booleanSurface`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Surface-surface intersection. Given two surfaces construct combined surface. Called 'boolean' since the volume of resulting surface will encompass the volumes of the original surface according to some boolean operation: - all which is in surface1 AND in surface2 (intersection) - all which is in surface1 AND NOT in surface2 (surface1 minus surface2) - all which is in surface1 OR in surface2 (union) Algorithm: -# find edge-surface intersection. Class 'surfaceIntersection'. -# combine intersection with both surfaces. Class 'intersectedSurface'. -# subset surfaces up to intersection. The 'side' of the surface to include is based on the faces that can be reached from a user-supplied face index. -# merge surfaces. Only the points on the intersection are shared.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `triSurfaceSearch` | 68 |
| `intersectedSurface` | 69 |
| `booleanSurface` | 74 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `from1` | 217 |
| `surf1Face` | 222 |
| `surf2Face` | 233 |

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`triSurface.H`](../../../07-mesh-geometry/files/64/trisurface.h--64b575996c2b.md)
- [`surfaceIntersection.H`](../../../07-mesh-geometry/files/53/surfaceintersection.h--532b3cd68080.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)

## 8. 直接上层引用

- [applications/utilities/surface/surfaceBooleanFeatures/surfaceBooleanFeatures.C](../../../03-utilities/files/b1/surfacebooleanfeatures.c--b1f47d4b53a6.md)
- [src/meshTools/triSurface/booleanOps/booleanSurface/booleanSurface.C](../../../07-mesh-geometry/files/e9/booleansurface.c--e9446fb52f84.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
