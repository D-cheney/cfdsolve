---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-29a1eeb202f2"
title: "OpenFOAM 14 源码解析：propellerDiskForce.C"
summary: "该文件实现 `propellerDiskForce` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/rigidBodyPropellerDisk/propellerDiskForce/propellerDiskForce.C"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：propellerDiskForce.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/rigidBodyPropellerDisk/propellerDiskForce/propellerDiskForce.C`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：167 行
- 文件标识：`29a1eeb202f2`

## 2. 功能说明

该文件实现 `propellerDiskForce` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积物理源项。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::RBD::restraints::propellerDiskForce::restrain` | 81 |
| `Foam::RBD::restraints::propellerDiskForce::read` | 145 |
| `Foam::RBD::restraints::propellerDiskForce::write` | 156 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`propellerDiskForce.H`](../../../12-boundaries-sources/files/42/propellerdiskforce.h--42afab7ef1e3.md)
- [`rigidBodyMotion_pointMeshMover.H`](../../../17-other-libraries/files/1d/rigidbodymotion_pointmeshmover.h--1d8626d5083d.md)
- [`fvModels.H`](../../../05-finite-volume/files/60/fvmodels.h--6040b512bd89.md)
- [`rigidBodyPropellerDisk.H`](../../../12-boundaries-sources/files/64/rigidbodypropellerdisk.h--641bb4589ff2.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
