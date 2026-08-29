---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-aa4194f1910a"
title: "OpenFOAM 14 源码解析：multiRigidBody_pointMeshMover.C"
summary: "该文件实现 `multiRigidBody_pointMeshMover` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/pointMeshMovers/rigidBody/multiRigidBody/multiRigidBody_pointMeshMover.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：multiRigidBody_pointMeshMover.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/pointMeshMovers/rigidBody/multiRigidBody/multiRigidBody_pointMeshMover.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：475 行
- 文件标识：`aa4194f1910a`

## 2. 功能说明

该文件实现 `multiRigidBody_pointMeshMover` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::pointMeshMovers::multiRigidBody::weights` | 50 |
| `Foam::pointMeshMovers::multiRigidBody::bodyMesh::calcWeights` | 84 |
| `Foam::pointMeshMovers::multiRigidBody::bodyMesh::bodyMesh` | 150 |
| `Foam::pointMeshMovers::multiRigidBody::multiRigidBody` | 177 |
| `Foam::pointMeshMovers::multiRigidBody::bodyMesh::weight` | 272 |
| `Foam::pointMeshMovers::multiRigidBody::newPoints` | 299 |
| `Foam::pointMeshMovers::multiRigidBody::topoChange` | 335 |
| `Foam::pointMeshMovers::multiRigidBody::mapMesh` | 440 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
7. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
8. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`multiRigidBody_pointMeshMover.H`](../../../07-mesh-geometry/files/ab/multirigidbody_pointmeshmover.h--ab424b4125a0.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`pointDist.H`](../../../05-finite-volume/files/c1/pointdist.h--c1739ed5f81e.md)
- [`pointConstraints.H`](../../../05-finite-volume/files/c4/pointconstraints.h--c48f3fa91e5b.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
