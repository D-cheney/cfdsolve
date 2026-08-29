---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-df811ff315e9"
title: "OpenFOAM 14 源码解析：extendedFeatureEdgeMesh.H"
summary: "该文件实现 `extendedFeatureEdgeMesh` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/edgeMesh/extendedEdgeMesh/extendedFeatureEdgeMesh/extendedFeatureEdgeMesh.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：extendedFeatureEdgeMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/edgeMesh/extendedEdgeMesh/extendedFeatureEdgeMesh/extendedFeatureEdgeMesh.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：168 行
- 文件标识：`df811ff315e9`

## 2. 功能说明

该文件实现 `extendedFeatureEdgeMesh` 相关对象的读取、写出或流序列化。

中文导航角色：OpenFOAM 支撑代码。

上游说明：extendedEdgeMesh + IO.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `objectRegistry` | 52 |
| `extendedFeatureEdgeMesh` | 58 |
| `typeGlobal` | 154 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`extendedEdgeMesh.H`](../../../07-mesh-geometry/files/df/extendededgemesh.h--dff6875133d3.md)
- [`regIOobject.H`](../../../04-core-runtime/files/7f/regioobject.h--7f9eca9df0dd.md)

## 8. 直接上层引用

- [applications/test/findSphereFeatureEdges-octree/Test-findSphereFeatureEdges-octree.C](../../../17-other-libraries/files/b5/test-findspherefeatureedges-octree.c--b58ed669110c.md)
- [applications/utilities/surface/surfaceBooleanFeatures/surfaceBooleanFeatures.C](../../../03-utilities/files/b1/surfacebooleanfeatures.c--b1f47d4b53a6.md)
- [applications/utilities/surface/surfaceFeatures/surfaceFeatures.C](../../../03-utilities/files/1e/surfacefeatures.c--1e1f466782bf.md)
- [src/mesh/snappyHexMesh/refinementFeatures/refinementFeatures.H](../../../07-mesh-geometry/files/1e/refinementfeatures.h--1e7cb231fd4b.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMeshFormats/extendedEdgeMeshFormat/extendedEdgeMeshFormat.C](../../../07-mesh-geometry/files/02/extendededgemeshformat.c--025cbee3b578.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedFeatureEdgeMesh/extendedFeatureEdgeMesh.C](../../../07-mesh-geometry/files/d7/extendedfeatureedgemesh.c--d7683ed01ff6.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedFeatureEdgeMesh/extendedFeatureEdgeMeshTemplates.C](../../../07-mesh-geometry/files/b7/extendedfeatureedgemeshtemplates.c--b758778414e4.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
