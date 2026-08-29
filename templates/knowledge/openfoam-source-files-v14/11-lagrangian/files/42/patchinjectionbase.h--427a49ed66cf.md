---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-427a49ed66cf"
title: "OpenFOAM 14 源码解析：patchInjectionBase.H"
summary: "该文件声明或实现 `polyMesh`、`fvMesh`、`randomGenerator`、`patchInjectionBase`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchInjection/patchInjectionBase.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：patchInjectionBase.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchInjection/patchInjectionBase.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：134 行
- 文件标识：`427a49ed66cf`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`fvMesh`、`randomGenerator`、`patchInjectionBase`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base class for patch-based injection models. Class handles injecting at a random point adjacent to the patch faces to provide a more stochastic view of the injection process. Patch faces are triangulated, and area fractions accumulated. The fractional areas are then applied to determine across which face a parcel is to be injected.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 63 |
| `fvMesh` | 64 |
| `randomGenerator` | 65 |
| `patchInjectionBase` | 70 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`word.H`](../../../04-core-runtime/files/76/word.h--763cd4c0a88d.md)
- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`scalarList.H`](../../../04-core-runtime/files/b0/scalarlist.h--b0b5e67cb3ba.md)
- [`vectorList.H`](../../../04-core-runtime/files/a2/vectorlist.h--a2e89cf35709.md)
- [`faceList.H`](../../../04-core-runtime/files/bc/facelist.h--bc39a0876345.md)
- [`triFaceList.H`](../../../04-core-runtime/files/95/trifacelist.h--9512359cc92e.md)
- [`barycentric.H`](../../../04-core-runtime/files/73/barycentric.h--73a3eee32d92.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchFlowRateInjection/PatchFlowRateInjection.H](../../../11-lagrangian/files/69/patchflowrateinjection.h--69bb58fc469d.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchInjection/PatchInjection.H](../../../11-lagrangian/files/e3/patchinjection.h--e30a81f894ad.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchInjection/patchInjectionBase.C](../../../11-lagrangian/files/00/patchinjectionbase.c--006cb51018d7.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
