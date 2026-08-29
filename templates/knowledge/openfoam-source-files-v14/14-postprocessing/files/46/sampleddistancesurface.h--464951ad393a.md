---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-464951ad393a"
title: "OpenFOAM 14 源码解析：sampledDistanceSurface.H"
summary: "该文件声明或实现 `distanceSurface`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/sampling/sampledSurface/sampledDistanceSurface/sampledDistanceSurface.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：sampledDistanceSurface.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/sampling/sampledSurface/sampledDistanceSurface/sampledDistanceSurface.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：146 行
- 文件标识：`464951ad393a`

## 2. 功能说明

该文件声明或实现 `distanceSurface`，属于“功能对象与采样”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：A sampledSurface defined by a distance to a surface. Example: \verbatim { type distanceSurface; surfaceType searchableBox; min (-1 -1 -1); max (1 1 1); distance 0.1; signed yes; interpolate yes; } \endverbatim Usage \table Property | Description | Required | Default value surfaceType | The type of surface to sample from | yes | distance | The distance from which to sample the surface | yes | signed | Sample only on one side of the surface? | yes | interpolate | Interpolate values to the surface points? | no | no cellZone | Zone containing cells to include | no | all \endtable

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `distanceSurface` | 83 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`sampledIsoSurfaceSurface.H`](../../../14-postprocessing/files/ac/sampledisosurfacesurface.h--acb7a8fa7256.md)
- [`searchableSurface.H`](../../../07-mesh-geometry/files/96/searchablesurface.h--962677dd67ca.md)

## 8. 直接上层引用

- [src/sampling/sampledSurface/sampledDistanceSurface/sampledDistanceSurface.C](../../../14-postprocessing/files/26/sampleddistancesurface.c--2607101fe1d0.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
