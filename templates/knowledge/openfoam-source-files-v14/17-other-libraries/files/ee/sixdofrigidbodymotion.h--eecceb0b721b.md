---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-eecceb0b721b"
title: "OpenFOAM 14 源码解析：sixDoFRigidBodyMotion.H"
summary: "该文件声明或实现 `sixDoFSolver`、`sixDoFRigidBodyMotion`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：sixDoFRigidBodyMotion.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：353 行
- 文件标识：`eecceb0b721b`

## 2. 功能说明

该文件声明或实现 `sixDoFSolver`、`sixDoFRigidBodyMotion`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Six degree of freedom motion for a rigid body. Angular momentum stored in body fixed reference frame. Reference orientation of the body (where Q = I) must align with the cartesian axes such that the Inertia tensor is in principle component form. Can add restraints (e.g. a spring) and constraints (e.g. motion may only be on a plane). The time-integrator for the motion is run-time selectable with options for symplectic (explicit), Crank-Nicolson and Newmark schemes.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `sixDoFSolver` | 68 |
| `sixDoFRigidBodyMotion` | 73 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`sixDoFRigidBodyMotionState.H`](../../../17-other-libraries/files/96/sixdofrigidbodymotionstate.h--96733af8c152.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`sixDoFRigidBodyMotionRestraint.H`](../../../17-other-libraries/files/93/sixdofrigidbodymotionrestraint.h--939aaeda751c.md)
- [`sixDoFRigidBodyMotionConstraint.H`](../../../17-other-libraries/files/c1/sixdofrigidbodymotionconstraint.h--c138e8f2741c.md)
- [`Tuple2.H`](../../../04-core-runtime/files/ab/tuple2.h--ab8ee5c9d4ce.md)
- [`septernion.H`](../../../04-core-runtime/files/0f/septernion.h--0f0f9f4cf947.md)
- [`sixDoFRigidBodyMotionI.H`](../../../17-other-libraries/files/06/sixdofrigidbodymotioni.h--06a7a85df3d3.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/constraints/axis/sixDoFRigidBodyMotionAxisConstraint.C](../../../17-other-libraries/files/19/sixdofrigidbodymotionaxisconstraint.c--19ac6c5a2d71.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/constraints/line/sixDoFRigidBodyMotionLineConstraint.C](../../../17-other-libraries/files/4a/sixdofrigidbodymotionlineconstraint.c--4a4efc4d3a80.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/constraints/orientation/sixDoFRigidBodyMotionOrientationConstraint.C](../../../17-other-libraries/files/81/sixdofrigidbodymotionorientationconstraint.c--81da09f02140.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/constraints/plane/sixDoFRigidBodyMotionPlaneConstraint.C](../../../17-other-libraries/files/5a/sixdofrigidbodymotionplaneconstraint.c--5a41f772fa15.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/constraints/point/sixDoFRigidBodyMotionPointConstraint.C](../../../17-other-libraries/files/63/sixdofrigidbodymotionpointconstraint.c--63ff89479b3c.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/restraints/axialAngularSpring/axialAngularSpring.C](../../../17-other-libraries/files/42/axialangularspring.c--42dae2828e7b.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/restraints/linearAxialAngularSpring/linearAxialAngularSpring.C](../../../17-other-libraries/files/58/linearaxialangularspring.c--581df80a0005.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/restraints/linearDamper/linearDamper.C](../../../17-other-libraries/files/b1/lineardamper.c--b10fc5379681.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/restraints/linearSpring/linearSpring.C](../../../17-other-libraries/files/55/linearspring.c--559aded185f5.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/restraints/sphericalAngularDamper/sphericalAngularDamper.C](../../../17-other-libraries/files/a8/sphericalangulardamper.c--a81fe11600e4.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/restraints/sphericalAngularSpring/sphericalAngularSpring.C](../../../17-other-libraries/files/7e/sphericalangularspring.c--7e23a92a7b7e.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion.C](../../../17-other-libraries/files/c4/sixdofrigidbodymotion.c--c46c2b19446f.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotion/sixDoFRigidBodyMotionIO.C](../../../17-other-libraries/files/85/sixdofrigidbodymotionio.c--856cd45f2072.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion/sixDoFSolvers/sixDoFSolver/sixDoFSolver.H](../../../17-other-libraries/files/1c/sixdofsolver.h--1ccd89703dec.md)
- [src/rigidBodyMotion/sixDoFRigidBodyMotion_pointMeshMovers/sixDoFRigidBodyMotion_pointMeshMover.H](../../../17-other-libraries/files/59/sixdofrigidbodymotion_pointmeshmover.h--5905d6bd5850.md)
- [src/rigidBodyMotion/sixDoFRigidBodyState/sixDoFRigidBodyState/sixDoFRigidBodyState.C](../../../17-other-libraries/files/5c/sixdofrigidbodystate.c--5c2fa5c54c97.md)
- [src/rigidBodyMotion/sixDoFRigidBodyState/sixDoFRigidBodyState/sixDoFRigidBodyState.H](../../../17-other-libraries/files/79/sixdofrigidbodystate.h--799f1c2cc89c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
