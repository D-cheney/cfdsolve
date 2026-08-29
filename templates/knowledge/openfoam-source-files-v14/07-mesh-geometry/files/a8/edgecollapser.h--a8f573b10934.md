---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a8f573b10934"
title: "OpenFOAM 14 源码解析：edgeCollapser.H"
summary: "该文件声明或实现 `polyMesh`、`PackedBoolList`、`polyTopoChange`、`globalIndex`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyTopoChange/edgeCollapser.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：edgeCollapser.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyTopoChange/edgeCollapser.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：366 行
- 文件标识：`a8f573b10934`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`PackedBoolList`、`polyTopoChange`、`globalIndex`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Does polyTopoChanges to remove edges. Can remove faces due to edge collapse but can not remove cells due to face removal! Also removes unused points.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 62 |
| `PackedBoolList` | 63 |
| `polyTopoChange` | 64 |
| `globalIndex` | 65 |
| `face` | 66 |
| `edge` | 67 |
| `edgeCollapser` | 72 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`pointEdgeCollapse.H`](../../../07-mesh-geometry/files/fe/pointedgecollapse.h--fe356acaa054.md)
- [`DynamicList.H`](../../../04-core-runtime/files/d0/dynamiclist.h--d0fb805f1b2f.md)
- [`Field.H`](../../../04-core-runtime/files/51/field.h--519067424cd8.md)
- [`pointFieldFwd.H`](../../../04-core-runtime/files/5e/pointfieldfwd.h--5e56ec349bce.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)

## 8. 直接上层引用

- [applications/utilities/mesh/generation/extrude2DMesh/extrude2DMesh.C](../../../03-utilities/files/46/extrude2dmesh.c--46db24f754eb.md)
- [applications/utilities/mesh/generation/extrudeMesh/extrudeMesh.C](../../../03-utilities/files/c8/extrudemesh.c--c85ecbc45ccd.md)
- [src/polyTopoChange/polyMeshFilter/polyMeshFilter.C](../../../07-mesh-geometry/files/24/polymeshfilter.c--2463bb1c6022.md)
- [src/polyTopoChange/polyTopoChange/edgeCollapser.C](../../../07-mesh-geometry/files/69/edgecollapser.c--6956911e33d3.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
