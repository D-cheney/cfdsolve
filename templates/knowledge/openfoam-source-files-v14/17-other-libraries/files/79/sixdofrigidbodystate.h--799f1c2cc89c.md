---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-799f1c2cc89c"
title: "OpenFOAM 14 源码解析：sixDoFRigidBodyState.H"
summary: "该文件声明或实现 `sixDoFRigidBodyState`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/sixDoFRigidBodyState/sixDoFRigidBodyState/sixDoFRigidBodyState.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：sixDoFRigidBodyState.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/sixDoFRigidBodyState/sixDoFRigidBodyState/sixDoFRigidBodyState.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：179 行
- 文件标识：`799f1c2cc89c`

## 2. 功能说明

该文件声明或实现 `sixDoFRigidBodyState`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Writes the 6-DoF motion state. Usage \table Property | Description | Required | Default value type | type name: sixDoFRigidBodyState | yes | angleUnits | units in which angles are written \\ | no | [rad] angularVelocityUnits | units in which angular velocities are written \\ | no | [rad/s] \endtable Example of function object specification: \verbatim sixDoFRigidBodyState { type sixDoFRigidBodyState; libs ("libsixDoFRigidBodyState.so"); angleUnits [deg]; angularVelocityUnits [rpm]; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `sixDoFRigidBodyState` | 84 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`logFiles.H`](../../../04-core-runtime/files/da/logfiles.h--da24c47050f0.md)
- [`namedUnitSet.H`](../../../04-core-runtime/files/ad/namedunitset.h--ad841557424e.md)
- [`sixDoFRigidBodyMotion.H`](../../../17-other-libraries/files/ee/sixdofrigidbodymotion.h--eecceb0b721b.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/sixDoFRigidBodyState/sixDoFRigidBodyControl/sixDoFRigidBodyControl.H](../../../17-other-libraries/files/21/sixdofrigidbodycontrol.h--215f39095dcd.md)
- [src/rigidBodyMotion/sixDoFRigidBodyState/sixDoFRigidBodyState/sixDoFRigidBodyState.C](../../../17-other-libraries/files/5c/sixdofrigidbodystate.c--5c2fa5c54c97.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
