---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6c99c529d2ad"
title: "OpenFOAM 14 源码解析：externalDisplacementMeshMover.H"
summary: "该文件声明或实现 `polyTopoChangeMap`、`externalDisplacementMeshMover`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/mesh/snappyHexMesh/externalDisplacementMeshMover/externalDisplacementMeshMover.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：externalDisplacementMeshMover.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/mesh/snappyHexMesh/externalDisplacementMeshMover/externalDisplacementMeshMover.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：194 行
- 文件标识：`6c99c529d2ad`

## 2. 功能说明

该文件声明或实现 `polyTopoChangeMap`、`externalDisplacementMeshMover`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Abstract base class for mesh movers with externally provided displacement field giving the boundary conditions. Move the mesh from the current location to a new location (so modify the mesh; v.s. pointMeshMover that only returns the new location). All mesh movers are expected to read the dictionary settings at invocation of move(), i.e. not cache any settings.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyTopoChangeMap` | 56 |
| `externalDisplacementMeshMover` | 62 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`pointFields.H`](../../../05-finite-volume/files/ab/pointfields.h--ab4bc596bad4.md)

## 8. 直接上层引用

- [src/mesh/snappyHexMesh/externalDisplacementMeshMover/externalDisplacement_pointMeshMover.H](../../../07-mesh-geometry/files/4f/externaldisplacement_pointmeshmover.h--4f275cce9161.md)
- [src/mesh/snappyHexMesh/externalDisplacementMeshMover/externalDisplacementMeshMover.C](../../../07-mesh-geometry/files/9b/externaldisplacementmeshmover.c--9bc44a190819.md)
- [src/mesh/snappyHexMesh/externalDisplacementMeshMover/medialAxisMeshMover.H](../../../07-mesh-geometry/files/7b/medialaxismeshmover.h--7b5b34e52217.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.C](../../../07-mesh-geometry/files/6e/snappylayerdriver.c--6e5dc56e8a5d.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
