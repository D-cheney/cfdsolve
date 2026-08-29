---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-dff6875133d3"
title: "OpenFOAM 14 源码解析：extendedEdgeMesh.H"
summary: "该文件声明或实现 `surfaceFeatures`、`objectRegistry`、`extendedEdgeMesh`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMesh.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：extendedEdgeMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMesh.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：579 行
- 文件标识：`dff6875133d3`

## 2. 功能说明

该文件声明或实现 `surfaceFeatures`、`objectRegistry`、`extendedEdgeMesh`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Description of feature edges and points. Feature points are a sorted subset at the start of the overall points list: 0 .. concaveStart_-1 : convex points (w.r.t normals) concaveStart_ .. mixedStart_-1 : concave points mixedStart_ .. nonFeatureStart_-1 : mixed internal/external points nonFeatureStart_ .. size-1 : non-feature points Feature edges are the edgeList of the edgeMesh and are sorted: 0 .. internalStart_-1 : external edges (convex w.r.t normals) internalStart_ .. flatStart_-1 : internal edges (concave) flatStart_ .. openStart_-1 : flat edges (neither concave or convex) can arise from region interfaces on flat surfaces openStart_ .. multipleStart_-1 : open edges (e.g. from baffle surfaces) multipleStart_ .. size-1 : multiply connected edges The edge direction and feature edge and feature point adjacent normals are stored.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `surfaceFeatures` | 76 |
| `objectRegistry` | 78 |
| `extendedEdgeMesh` | 81 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`edgeMesh.H`](../../../07-mesh-geometry/files/f3/edgemesh.h--f30061a456e5.md)
- [`indexedOctree.H`](../../../04-core-runtime/files/9d/indexedoctree.h--9dbfd26d8444.md)
- [`treeDataEdge.H`](../../../07-mesh-geometry/files/e6/treedataedge.h--e6b300a0bf36.md)
- [`treeDataPoint.H`](../../../07-mesh-geometry/files/44/treedatapoint.h--4431e4972759.md)
- [`PrimitivePatch.H`](../../../04-core-runtime/files/42/primitivepatch.h--42f4e9325c61.md)
- [`pointIndexHitList.H`](../../../04-core-runtime/files/35/pointindexhitlist.h--35f34fc06e9f.md)
- [`extendedEdgeMeshI.H`](../../../07-mesh-geometry/files/05/extendededgemeshi.h--053faa698db1.md)
- [`extendedEdgeMeshTemplates.C`](../../../07-mesh-geometry/files/7d/extendededgemeshtemplates.c--7d3b13bf40b0.md)

## 8. 直接上层引用

- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMesh.C](../../../07-mesh-geometry/files/5e/extendededgemesh.c--5e6139c4b98d.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMeshFormats/extendedEdgeMeshFormat/extendedEdgeMeshFormat.H](../../../07-mesh-geometry/files/1e/extendededgemeshformat.h--1e4877566f32.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMeshFormats/extendedEdgeMeshFormat/extendedEdgeMeshFormatRunTime.C](../../../07-mesh-geometry/files/42/extendededgemeshformatruntime.c--42442f02b4b4.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMeshNew.C](../../../07-mesh-geometry/files/e5/extendededgemeshnew.c--e53255913d02.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMeshTemplates.C](../../../07-mesh-geometry/files/7d/extendededgemeshtemplates.c--7d3b13bf40b0.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedFeatureEdgeMesh/extendedFeatureEdgeMesh.H](../../../07-mesh-geometry/files/df/extendedfeatureedgemesh.h--df811ff315e9.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
