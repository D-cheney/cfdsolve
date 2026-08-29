---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-49aa1bf0e485"
title: "OpenFOAM 14 源码解析：rigidBodyModel.H"
summary: "该文件声明或实现 `rigidBodyModel`、`rigidBodyModelState`、`restraint`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/rigidBodyModel.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodyModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/rigidBodyModel.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：399 行
- 文件标识：`49aa1bf0e485`

## 2. 功能说明

该文件声明或实现 `rigidBodyModel`、`rigidBodyModelState`、`restraint`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Basic rigid-body model representing a system of rigid-bodies connected by 1-6 DoF joints. This class holds various body and joint state fields needed by the kinematics and forward-dynamics algorithms presented in reference: \verbatim Featherstone, R. (2008). Rigid body dynamics algorithms. Springer. Chapter 4. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rigidBodyModel` | 71 |
| `rigidBodyModelState` | 74 |
| `restraint` | 76 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`rigidBody.H`](../../../17-other-libraries/files/92/rigidbody.h--926f7cda0c41.md)
- [`subBody.H`](../../../17-other-libraries/files/3e/subbody.h--3eee99ad3c40.md)
- [`joint.H`](../../../17-other-libraries/files/17/joint.h--17e39b4a73be.md)
- [`compositeJoint.H`](../../../17-other-libraries/files/d6/compositejoint.h--d66168d878a3.md)
- [`PtrList.H`](../../../04-core-runtime/files/5e/ptrlist.h--5eff5a178d1a.md)
- [`HashTable.H`](../../../04-core-runtime/files/cb/hashtable.h--cbcdb4c4948d.md)
- [`rigidBodyModelI.H`](../../../17-other-libraries/files/8e/rigidbodymodeli.h--8e0d15ac069c.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/rigidBodyDynamics/joints/composite/compositeJoint.C](../../../17-other-libraries/files/0d/compositejoint.c--0d3f48f2283a.md)
- [src/rigidBodyMotion/rigidBodyDynamics/joints/floating/floatingJoint.C](../../../17-other-libraries/files/34/floatingjoint.c--3471a2a1d033.md)
- [src/rigidBodyMotion/rigidBodyDynamics/joints/joint/joint.C](../../../17-other-libraries/files/80/joint.c--8020d4183f4d.md)
- [src/rigidBodyMotion/rigidBodyDynamics/joints/null/nullJoint.C](../../../17-other-libraries/files/06/nulljoint.c--068cf703aefd.md)
- [src/rigidBodyMotion/rigidBodyDynamics/joints/rigid/rigid.C](../../../17-other-libraries/files/36/rigid.c--366be0911b6e.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/externalForce/externalForce.C](../../../17-other-libraries/files/21/externalforce.c--2172af4f67f9.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/linearAxialAngularSpring/linearAxialAngularSpring.C](../../../17-other-libraries/files/eb/linearaxialangularspring.c--ebd16ead0811.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/linearDamper/linearDamper.C](../../../17-other-libraries/files/12/lineardamper.c--12d9a4d7749d.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/linearSpring/linearSpring.C](../../../17-other-libraries/files/43/linearspring.c--4335caaab830.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/restraint/rigidBodyRestraint.C](../../../17-other-libraries/files/7c/rigidbodyrestraint.c--7c88bb7ad60f.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/restraint/rigidBodyRestraintI.H](../../../17-other-libraries/files/03/rigidbodyrestrainti.h--03ae6e26cbf8.md)
- [src/rigidBodyMotion/rigidBodyDynamics/restraints/sphericalAngularDamper/sphericalAngularDamper.C](../../../17-other-libraries/files/35/sphericalangulardamper.c--350a3a6d5f55.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/forwardDynamics.C](../../../17-other-libraries/files/64/forwarddynamics.c--64d5dbe679f1.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/rigidBodyModel.C](../../../17-other-libraries/files/ba/rigidbodymodel.c--ba8a7abddf7a.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModelState/rigidBodyModelState.H](../../../17-other-libraries/files/4d/rigidbodymodelstate.h--4dc507ff407d.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyMotion/rigidBodyMotion.H](../../../17-other-libraries/files/6d/rigidbodymotion.h--6d74bab326e0.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
