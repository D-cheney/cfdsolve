---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-833ae4439eea"
title: "OpenFOAM 14 源码解析：rigidBodyRestraint.H"
summary: "该文件声明或实现 `rigidBodyModel`、`rigidBodyModelState`、`restraint`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyDynamics/restraints/restraint/rigidBodyRestraint.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodyRestraint.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyDynamics/restraints/restraint/rigidBodyRestraint.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：200 行
- 文件标识：`833ae4439eea`

## 2. 功能说明

该文件声明或实现 `rigidBodyModel`、`rigidBodyModelState`、`restraint`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Namespace for rigid-body dynamics restraints

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rigidBodyModel` | 66 |
| `rigidBodyModelState` | 67 |
| `restraint` | 72 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `bodyIndex` | 161 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`spatialVector.H`](../../../04-core-runtime/files/75/spatialvector.h--75345f519d47.md)
- [`point.H`](../../../04-core-runtime/files/60/point.h--60b73f2bc052.md)
- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`rigidBodyRestraintI.H`](../../../17-other-libraries/files/03/rigidbodyrestrainti.h--03ae6e26cbf8.md)

## 8. 直接上层引用

- [src/fvModels/rigidBodyPropellerDisk/propellerDiskForce/propellerDiskForce.H](../../../12-boundaries-sources/files/42/propellerdiskforce.h--42afab7ef1e3.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/externalForce/externalForce.H](../../../17-other-libraries/files/4c/externalforce.h--4cbe371e5484.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/linearAxialAngularSpring/linearAxialAngularSpring.H](../../../17-other-libraries/files/b4/linearaxialangularspring.h--b453f0f3dff5.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/linearDamper/linearDamper.H](../../../17-other-libraries/files/3c/lineardamper.h--3c071a6b12d3.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/linearSpring/linearSpring.H](../../../17-other-libraries/files/a2/linearspring.h--a20445eb6ced.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/restraint/rigidBodyRestraint.C](../../../17-other-libraries/files/7c/rigidbodyrestraint.c--7c88bb7ad60f.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/restraint/rigidBodyRestraintNew.C](../../../17-other-libraries/files/e0/rigidbodyrestraintnew.c--e034d3a63ed4.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/sphericalAngularDamper/sphericalAngularDamper.H](../../../17-other-libraries/files/e5/sphericalangulardamper.h--e593fa5acba5.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/forwardDynamics.C](../../../17-other-libraries/files/64/forwarddynamics.c--64d5dbe679f1.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/rigidBodyModel.C](../../../17-other-libraries/files/ba/rigidbodymodel.c--ba8a7abddf7a.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
