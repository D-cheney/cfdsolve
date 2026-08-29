---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8123a153218f"
title: "OpenFOAM 14 源码解析：rigidBodyPoints.H"
summary: "该文件声明或实现 `rigidBodyPoints`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyState/rigidBodyPoints/rigidBodyPoints.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodyPoints.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyState/rigidBodyPoints/rigidBodyPoints.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：191 行
- 文件标识：`8123a153218f`

## 2. 功能说明

该文件声明或实现 `rigidBodyPoints`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Writes the position, linear and angular velocities and accelerations of a list of points on a body specified in the body local coordinate system. Usage \table Property | Description | Required | Default value type | type name: rigidBodyPoints | yes | angularVelocityUnits | units in which angular velocities are \\ written | no | [rad/s] angularAccelerationUnits | units in which angular accelerations are \\ written | no | [rad/s^2] body | name of the body | yes | points | list of points on the body | yes | \endtable Example of function object specification: \verbatim rigidBodyPoints { type rigidBodyPoints; libs ("librigidBodyState.so"); angularVelocityUnits [rpm]; angularAccelerationUnits [rad/s^2]; body floatingObject; points ( point1 (0 0 0) point2 (0.1 0.1 0.25) ); } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rigidBodyPoints` | 96 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`logFiles.H`](../../../04-core-runtime/files/da/logfiles.h--da24c47050f0.md)
- [`namedUnitSet.H`](../../../04-core-runtime/files/ad/namedunitset.h--ad841557424e.md)
- [`rigidBodyMotion.H`](../../../17-other-libraries/files/6d/rigidbodymotion.h--6d74bab326e0.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/rigidBodyState/rigidBodyPoints/rigidBodyPoints.C](../../../17-other-libraries/files/ae/rigidbodypoints.c--ae39b55a5df1.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
