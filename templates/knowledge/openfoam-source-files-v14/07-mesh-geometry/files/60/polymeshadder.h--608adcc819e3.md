---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-608adcc819e3"
title: "OpenFOAM 14 源码解析：polyMeshAdder.H"
summary: "该文件声明或实现 `IOobject`、`polyTopoChange`、`polyMeshAdder`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyMeshAdder/polyMeshAdder.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：polyMeshAdder.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyMeshAdder/polyMeshAdder.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：252 行
- 文件标识：`608adcc819e3`

## 2. 功能说明

该文件声明或实现 `IOobject`、`polyTopoChange`、`polyMeshAdder`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Adds two meshes without using any polyMesh morphing. Gets faces to couple as faceCoupleInfo which is list of faces on both meshes. Returns map from last mesh addition.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `IOobject` | 59 |
| `polyTopoChange` | 60 |
| `polyMeshAdder` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`mapAddedPolyMesh.H`](../../../04-core-runtime/files/d5/mapaddedpolymesh.h--d59e480f86b3.md)
- [`faceCoupleInfo.H`](../../../07-mesh-geometry/files/df/facecoupleinfo.h--df292cd099f2.md)
- [`SortableList.H`](../../../04-core-runtime/files/67/sortablelist.h--6730cee0ba96.md)

## 8. 直接上层引用

- [src/polyTopoChange/fvMeshAdder/fvMeshAdder.H](../../../07-mesh-geometry/files/00/fvmeshadder.h--007bafa20297.md)
- [src/polyTopoChange/polyMeshAdder/polyMeshAdder.C](../../../07-mesh-geometry/files/21/polymeshadder.c--21174970bfb6.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
