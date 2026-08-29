---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b6c6b0f3586c"
title: "OpenFOAM 14 源码解析：patchCutLayerAverage.H"
summary: "该文件声明或实现 `polyPatch`、`patchCutLayerAverage`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/patchCutLayerAverage/patchCutLayerAverage.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：patchCutLayerAverage.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/patchCutLayerAverage/patchCutLayerAverage.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：221 行
- 文件标识：`b6c6b0f3586c`

## 2. 功能说明

该文件声明或实现 `polyPatch`、`patchCutLayerAverage`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：This function object writes graphs of patch face values, area-averaged in planes perpendicular to a given direction or in contours of a given distance field. It adaptively grades the distribution of graph points to match the resolution of the mesh. Example of function object specification: \verbatim patchCutLayerAverage1 { type patchCutLayerAverage; libs ("libfieldFunctionObjects.so"); writeControl writeTime; writeInterval 1; patch lowerWall; direction (1 0 0); nPoints 100; interpolate no; fields (p U); axis x; setFormat raw; } \endverbatim Usage \table Property | Description | Required | Default value type | type name: patchCutLayerAverage | yes | patch | Name of the patch | yes | direction | Axis along which to plot | if distance not specified | distance | Distance field along which to plot \\ | if direction not specified | nPoints | Number of points in the plot | yes | interpolate | D

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyPatch` | 92 |
| `patchCutLayerAverage` | 101 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`cutPlot.H`](../../../14-postprocessing/files/9e/cutplot.h--9ef09e8cdc3e.md)
- [`setWriter.H`](../../../14-postprocessing/files/3e/setwriter.h--3e6489c3a3dd.md)

## 8. 直接上层引用

- [src/functionObjects/field/patchCutLayerAverage/patchCutLayerAverage.C](../../../14-postprocessing/files/51/patchcutlayeraverage.c--51c8d1291fe7.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
