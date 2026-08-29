---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8bef64c5385d"
title: "OpenFOAM 14 源码解析：rigidBodyDisplacement_pointMeshMover.H"
summary: "该文件声明或实现 `rigidBodyDisplacement`、`bodyMesh`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyMotion_pointMeshMovers/rigidBodyDisplacement/rigidBodyDisplacement_pointMeshMover.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodyDisplacement_pointMeshMover.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyMotion_pointMeshMovers/rigidBodyDisplacement/rigidBodyDisplacement_pointMeshMover.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：189 行
- 文件标识：`8bef64c5385d`

## 2. 功能说明

该文件声明或实现 `rigidBodyDisplacement`、`bodyMesh`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Rigid-body mesh motion solver for fvMesh.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rigidBodyDisplacement` | 58 |
| `bodyMesh` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`displacement_pointMeshMover.H`](../../../07-mesh-geometry/files/11/displacement_pointmeshmover.h--119a32bda64c.md)
- [`rigidBodyMotion.H`](../../../17-other-libraries/files/6d/rigidbodymotion.h--6d74bab326e0.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/rigidBodyMotion_pointMeshMovers/rigidBodyDisplacement/rigidBodyDisplacement_pointMeshMover.C](../../../17-other-libraries/files/5f/rigidbodydisplacement_pointmeshmover.c--5fcd03ca44f8.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
