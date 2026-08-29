---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7a4d443fff8c"
title: "OpenFOAM 14 源码解析：contiguous.H"
summary: "该文件声明或实现 `FixedList`、`Pair`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/contiguous/contiguous.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：contiguous.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/contiguous/contiguous.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：165 行
- 文件标识：`7a4d443fff8c`

## 2. 功能说明

该文件声明或实现 `FixedList`、`Pair`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Template function to specify if the data of a type are contiguous. The default function specifies that data are not contiguous. This is specialised for the types (eg, primitives) with contiguous data.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `FixedList` | 54 |
| `Pair` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`int.H`](../../../04-core-runtime/files/7f/int.h--7faa8d80979e.md)

## 8. 直接上层引用

- [src/lagrangian/DSMC/parcels/Templates/DSMCParcel/DSMCParcel.H](../../../11-lagrangian/files/cd/dsmcparcel.h--cdb027cd49d6.md)
- [src/lagrangian/parcel/parcels/derived/collidingParcel/collidingParcel.H](../../../11-lagrangian/files/5b/collidingparcel.h--5b733297ad1f.md)
- [src/lagrangian/parcel/parcels/derived/momentumParcel/momentumParcel.H](../../../11-lagrangian/files/42/momentumparcel.h--427bb830c056.md)
- [src/lagrangian/parcel/parcels/derived/mppicParcel/mppicParcel.H](../../../11-lagrangian/files/f6/mppicparcel.h--f615983b5fb2.md)
- [src/lagrangian/parcel/parcels/derived/reactingMultiphaseParcel/reactingMultiphaseParcel.H](../../../11-lagrangian/files/4f/reactingmultiphaseparcel.h--4f549d9d5a14.md)
- [src/lagrangian/parcel/parcels/derived/reactingParcel/reactingParcel.H](../../../11-lagrangian/files/83/reactingparcel.h--83dd882929c3.md)
- [src/lagrangian/parcel/parcels/derived/sprayParcel/sprayParcel.H](../../../11-lagrangian/files/12/sprayparcel.h--121225d57766.md)
- [src/lagrangian/parcel/parcels/derived/thermoParcel/thermoParcel.H](../../../11-lagrangian/files/05/thermoparcel.h--0531da494c89.md)
- [src/lagrangian/solidParticle/solidParticle.H](../../../11-lagrangian/files/71/solidparticle.h--71113501b878.md)
- [src/meshTools/layerInfo/pointEdgeLayerInfo.H](../../../07-mesh-geometry/files/b9/pointedgelayerinfo.h--b9f4efc8ce6b.md)
- [src/OpenFOAM/containers/Lists/FixedList/FixedListI.H](../../../04-core-runtime/files/be/fixedlisti.h--beac7e660add.md)
- [src/OpenFOAM/containers/Lists/FixedList/FixedListIO.C](../../../04-core-runtime/files/ab/fixedlistio.c--abe8cb0d1b39.md)
- [src/OpenFOAM/containers/Lists/List/List.C](../../../04-core-runtime/files/6b/list.c--6bd8091308b0.md)
- [src/OpenFOAM/containers/Lists/List/ListIO.C](../../../04-core-runtime/files/ab/listio.c--ab7a37730fc9.md)
- [src/OpenFOAM/containers/Lists/UIndirectList/UIndirectListIO.C](../../../04-core-runtime/files/05/uindirectlistio.c--055bc9dfc519.md)
- [src/OpenFOAM/containers/Lists/UList/UList.C](../../../04-core-runtime/files/8f/ulist.c--8fc6c6d1a816.md)
- [src/OpenFOAM/containers/Lists/UList/UListIO.C](../../../04-core-runtime/files/9b/ulistio.c--9b943a8de7bd.md)
- [src/OpenFOAM/db/IOstreams/Pstreams/combineGatherScatter.C](../../../04-core-runtime/files/97/combinegatherscatter.c--97e35840714a.md)
- [src/OpenFOAM/db/IOstreams/Pstreams/exchange.C](../../../04-core-runtime/files/4d/exchange.c--4dd6f2ec12b3.md)
- [src/OpenFOAM/db/IOstreams/Pstreams/gatherScatter.C](../../../04-core-runtime/files/b0/gatherscatter.c--b082e1633a27.md)
- [src/OpenFOAM/db/IOstreams/Pstreams/gatherScatterList.C](../../../04-core-runtime/files/9b/gatherscatterlist.c--9b49a1e6ee8f.md)
- [src/OpenFOAM/fields/Field/Field.C](../../../04-core-runtime/files/b4/field.c--b4085ce53075.md)
- [src/OpenFOAM/matrices/Matrix/MatrixIO.C](../../../06-linear-algebra/files/61/matrixio.c--61a6f9551db7.md)
- [src/OpenFOAM/meshes/polyMesh/syncTools/syncToolsTemplates.C](../../../04-core-runtime/files/6f/synctoolstemplates.c--6f01fe0e5367.md)
- [src/OpenFOAM/primitives/Barycentric/barycentric/barycentric.H](../../../04-core-runtime/files/73/barycentric.h--73a3eee32d92.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
