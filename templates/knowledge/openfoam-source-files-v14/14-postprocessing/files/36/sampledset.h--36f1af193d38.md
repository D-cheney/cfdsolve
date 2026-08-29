---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-36f1af193d38"
title: "OpenFOAM 14 源码解析：sampledSet.H"
summary: "该文件实现 `sampledSet` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/sampling/sampledSet/sampledSet/sampledSet.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：sampledSet.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/sampling/sampledSet/sampledSet/sampledSet.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：251 行
- 文件标识：`36f1af193d38`

## 2. 功能说明

该文件实现 `sampledSet` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Holds list of sampling points which is filled at construction time. Various implementations of this base class to e.g. get sampling points at uniform distance along a line (lineUniformSet) or directly specified (pointsSet) Each 'sampledSet' has a name and a specifier of how the axis should be write (x/y/z component or all 3 components)

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 61 |
| `polyTopoChangeMap` | 62 |
| `polyMeshMap` | 63 |
| `polyDistributionMap` | 64 |
| `sampledSet` | 69 |
| `iNew` | 132 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`coordSet.H`](../../../14-postprocessing/files/a1/coordset.h--a12e878aefa3.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`sampledSetI.H`](../../../14-postprocessing/files/4b/sampledseti.h--4b62bf0bceda.md)

## 8. 直接上层引用

- [src/functionObjects/field/streamlines/streamlines.C](../../../14-postprocessing/files/c4/streamlines.c--c407278a704a.md)
- [src/sampling/sampledSet/arcUniform/arcUniform.C](../../../14-postprocessing/files/49/arcuniform.c--494dacfcfd5e.md)
- [src/sampling/sampledSet/arcUniform/arcUniform.H](../../../14-postprocessing/files/a2/arcuniform.h--a26bff0598d7.md)
- [src/sampling/sampledSet/boundaryPoints/boundaryPoints.H](../../../14-postprocessing/files/81/boundarypoints.h--814e3e3edde4.md)
- [src/sampling/sampledSet/boundaryRandom/boundaryRandom.C](../../../14-postprocessing/files/f2/boundaryrandom.c--f2bf115a26eb.md)
- [src/sampling/sampledSet/boundaryRandom/boundaryRandom.H](../../../14-postprocessing/files/31/boundaryrandom.h--31ea452e3f2c.md)
- [src/sampling/sampledSet/boxUniform/boxUniform.H](../../../14-postprocessing/files/2b/boxuniform.h--2b910bb1492e.md)
- [src/sampling/sampledSet/cellSet/cellSetSampledSet.H](../../../14-postprocessing/files/32/cellsetsampledset.h--326027e20788.md)
- [src/sampling/sampledSet/circleRandom/circleRandom.H](../../../14-postprocessing/files/93/circlerandom.h--936139795947.md)
- [src/sampling/sampledSet/faceSet/faceSetSampledSet.H](../../../14-postprocessing/files/35/facesetsampledset.h--3577c7c5a315.md)
- [src/sampling/sampledSet/lineFace/lineFace.H](../../../14-postprocessing/files/e7/lineface.h--e786ef6ccef7.md)
- [src/sampling/sampledSet/lineUniform/lineUniform.H](../../../14-postprocessing/files/d9/lineuniform.h--d9e5920e180e.md)
- [src/sampling/sampledSet/points/points.H](../../../14-postprocessing/files/0d/points.h--0d750c2f5085.md)
- [src/sampling/sampledSet/sampledSet/sampledSet.C](../../../14-postprocessing/files/4d/sampledset.c--4de511041b6f.md)
- [src/sampling/sampledSet/sampledSet/sampledSetI.H](../../../14-postprocessing/files/4b/sampledseti.h--4b62bf0bceda.md)
- [src/sampling/sampledSet/sampledSets/sampledSets.H](../../../14-postprocessing/files/50/sampledsets.h--5076692174e1.md)
- [src/sampling/sampledSet/sphereRandom/sphereRandom.H](../../../14-postprocessing/files/c3/sphererandom.h--c336fb469d63.md)
- [src/sampling/sampledSet/triSurface/triSurfaceSampledSet.H](../../../14-postprocessing/files/36/trisurfacesampledset.h--3660ae016854.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
