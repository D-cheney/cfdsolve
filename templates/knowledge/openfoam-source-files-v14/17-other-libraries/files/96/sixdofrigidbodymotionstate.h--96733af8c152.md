---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-96733af8c152"
title: "OpenFOAM 14 源码解析：sixDoFRigidBodyMotionState.H"
summary: "该文件声明或实现 `Istream`、`Ostream`、`sixDoFRigidBodyMotionState`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotionState.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：sixDoFRigidBodyMotionState.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotionState.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：184 行
- 文件标识：`96733af8c152`

## 2. 功能说明

该文件声明或实现 `Istream`、`Ostream`、`sixDoFRigidBodyMotionState`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Holds the motion state of sixDoF object. Wrapped up together to allow rapid scatter to other processors. The processors must all maintain exactly the same state data to avoid any drift or inconsistency.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Istream` | 60 |
| `Ostream` | 61 |
| `sixDoFRigidBodyMotionState` | 64 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`vector.H`](../../../04-core-runtime/files/64/vector.h--64124691b98b.md)
- [`point.H`](../../../04-core-runtime/files/60/point.h--60b73f2bc052.md)
- [`diagTensor.H`](../../../04-core-runtime/files/7d/diagtensor.h--7dd6b915587a.md)
- [`tensor.H`](../../../04-core-runtime/files/1f/tensor.h--1f6288fde17f.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`sixDoFRigidBodyMotionStateI.H`](../../../17-other-libraries/files/84/sixdofrigidbodymotionstatei.h--849a206b1498.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion.H](../../../17-other-libraries/files/ee/sixdofrigidbodymotion.h--eecceb0b721b.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotionState.C](../../../17-other-libraries/files/06/sixdofrigidbodymotionstate.c--063c0268ea28.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotionStateIO.C](../../../17-other-libraries/files/16/sixdofrigidbodymotionstateio.c--168ebd7e920c.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
