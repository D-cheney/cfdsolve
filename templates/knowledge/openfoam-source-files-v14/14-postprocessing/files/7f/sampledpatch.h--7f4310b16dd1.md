---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7f4310b16dd1"
title: "OpenFOAM 14 源码解析：sampledPatch.H"
summary: "该文件声明或实现 `patch`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/sampling/sampledSurface/sampledPatch/sampledPatch.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：sampledPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/sampling/sampledSurface/sampledPatch/sampledPatch.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：254 行
- 文件标识：`7f4310b16dd1`

## 2. 功能说明

该文件声明或实现 `patch`，属于“功能对象与采样”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：A sampledSurface on patches. Non-triangulated by default. Example: \verbatim { type patch; patches (walls); triangulate no; interpolate yes; } \endverbatim Usage \table Property | Description | Required | Default value patches | the names of patches on which to sample | yes | triangulate | triangulate the output | no | no interpolate | interpolate values to the surface points | no | no \endtable

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `patch` | 75 |

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

- [`sampledSurface.H`](../../../14-postprocessing/files/3c/sampledsurface.h--3c2c8f3000d1.md)
- [`MeshedSurface.H`](../../../07-mesh-geometry/files/91/meshedsurface.h--9182d0964600.md)
- [`sampledPatchTemplates.C`](../../../14-postprocessing/files/ad/sampledpatchtemplates.c--ad3f7c21c530.md)

## 8. 直接上层引用

- [src/sampling/sampledSurface/sampledPatch/sampledPatch.C](../../../14-postprocessing/files/2a/sampledpatch.c--2a746a71b6eb.md)
- [src/sampling/sampledSurface/sampledPatch/sampledPatchTemplates.C](../../../14-postprocessing/files/ad/sampledpatchtemplates.c--ad3f7c21c530.md)
- [src/sampling/sampledSurface/sampledPatchInternalField/sampledPatchInternalField.H](../../../14-postprocessing/files/29/sampledpatchinternalfield.h--295a7b7c8616.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
