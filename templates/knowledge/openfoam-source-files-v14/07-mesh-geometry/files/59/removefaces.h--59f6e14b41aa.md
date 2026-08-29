---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-59f6e14b41aa"
title: "OpenFOAM 14 源码解析：removeFaces.H"
summary: "该文件声明或实现 `polyMesh`、`polyTopoChange`、`face`、`polyTopoChangeMap`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyTopoChange/removeFaces.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：removeFaces.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyTopoChange/removeFaces.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：224 行
- 文件标识：`59f6e14b41aa`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyTopoChange`、`face`、`polyTopoChangeMap`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Given list of faces to remove insert all the topology changes. Contains helper function to get consistent set of faces to remove. Not very well tested in parallel.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 59 |
| `polyTopoChange` | 60 |
| `face` | 61 |
| `polyTopoChangeMap` | 62 |
| `polyDistributionMap` | 63 |
| `removeFaces` | 68 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `topoChange` | 201 |
| `distribute` | 205 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Pstream.H`](../../../04-core-runtime/files/2f/pstream.h--2f930fcee072.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`indirectPrimitivePatch.H`](../../../04-core-runtime/files/ab/indirectprimitivepatch.h--ab8f04d3f0d8.md)

## 8. 直接上层引用

- [applications/test/fieldMapping/Test-fieldMapping.C](../../../17-other-libraries/files/4a/test-fieldmapping.c--4af4581d46e7.md)
- [applications/utilities/mesh/advanced/removeFaces/removeFaces.C](../../../03-utilities/files/8a/removefaces.c--8a43f8b2c182.md)
- [src/polyTopoChange/meshCut/meshModifiers/undoableMeshCutter/undoableMeshCutter.H](../../../07-mesh-geometry/files/39/undoablemeshcutter.h--3996310f29f9.md)
- [src/polyTopoChange/polyTopoChange/hexRef8/hexRef8.H](../../../07-mesh-geometry/files/2a/hexref8.h--2aa96b1f7395.md)
- [src/polyTopoChange/polyTopoChange/removeFaces.C](../../../07-mesh-geometry/files/d0/removefaces.c--d02bc7a574e0.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
