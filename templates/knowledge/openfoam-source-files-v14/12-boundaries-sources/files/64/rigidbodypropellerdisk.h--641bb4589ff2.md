---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-641bb4589ff2"
title: "OpenFOAM 14 源码解析：rigidBodyPropellerDisk.H"
summary: "该文件声明或实现 `rigidBodyPropellerDisk`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/rigidBodyPropellerDisk/rigidBodyPropellerDisk.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：rigidBodyPropellerDisk.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/rigidBodyPropellerDisk/rigidBodyPropellerDisk.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：184 行
- 文件标识：`641bb4589ff2`

## 2. 功能说明

该文件声明或实现 `rigidBodyPropellerDisk`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Disk momentum source derived from Foam::fv::propellerDisk with support for motion of the body the propeller is attached to. Usage Example usage: \verbatim diskSource { type rigidBodyPropellerDisk; libs ("librigidBodyPropellerDisk.so"); cellZone propeller; body hull; centre (0 0 0); // Centre of the propeller normal (1 0 0); // Normal direction of the propeller n 26.03; // Rotation speed [1/s] dPropeller 0.203; // Propeller diameter dHub 0.039179; // Hub diameter propellerCurve { type table; // J Kt Kq values ( (0.10 (0.3267 0.03748)) (0.15 (0.3112 0.03629)) (0.20 (0.2949 0.03500)) (0.25 (0.2777 0.03361)) (0.30 (0.2598 0.03210)) (0.35 (0.2410 0.03047)) (0.40 (0.2214 0.02871)) (0.45 (0.2010 0.02682)) (0.50 (0.1798 0.02479)) (0.55 (0.1577 0.02261)) (0.60 (0.1349 0.02027)) (0.65 (0.1112 0.01777)) (0.70 (0.0867 0.01509)) (0.75 (0.0614 0.01224)) (0.80 (0.0353 0.00921)) ); } } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rigidBodyPropellerDisk` | 110 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `bodyID` | 167 |

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`propellerDisk.H`](../../../12-boundaries-sources/files/f6/propellerdisk.h--f65b17995dae.md)
- [`rigidBodyMotion.H`](../../../17-other-libraries/files/6d/rigidbodymotion.h--6d74bab326e0.md)

## 8. 直接上层引用

- [src/fvModels/rigidBodyPropellerDisk/propellerDiskForce/propellerDiskForce.C](../../../12-boundaries-sources/files/29/propellerdiskforce.c--29a1eeb202f2.md)
- [src/fvModels/rigidBodyPropellerDisk/rigidBodyPropellerDisk.C](../../../12-boundaries-sources/files/4f/rigidbodypropellerdisk.c--4f417612291f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
