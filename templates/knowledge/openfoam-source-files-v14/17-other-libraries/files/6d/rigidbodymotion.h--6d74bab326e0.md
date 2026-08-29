---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6d74bab326e0"
title: "OpenFOAM 14 源码解析：rigidBodyMotion.H"
summary: "该文件声明或实现 `rigidBodySolver`、`rigidBodyMotion`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyDynamics/rigidBodyMotion/rigidBodyMotion.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodyMotion.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyDynamics/rigidBodyMotion/rigidBodyMotion.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：222 行
- 文件标识：`6d74bab326e0`

## 2. 功能说明

该文件声明或实现 `rigidBodySolver`、`rigidBodyMotion`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Six degree of freedom motion for a rigid body. Angular momentum stored in body fixed reference frame. Reference orientation of the body (where Q = I) must align with the cartesian axes such that the Inertia tensor is in principle component form. Can add restraints (e.g. a spring) and constraints (e.g. motion may only be on a plane). The time-integrator for the motion is run-time selectable with options for symplectic (explicit), Crank-Nicolson and Newmark schemes.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rigidBodySolver` | 68 |
| `rigidBodyMotion` | 73 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`rigidBodyModel.H`](../../../17-other-libraries/files/49/rigidbodymodel.h--49aa1bf0e485.md)
- [`rigidBodyModelState.H`](../../../17-other-libraries/files/4d/rigidbodymodelstate.h--4dc507ff407d.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)
- [`rigidBodyMotionI.H`](../../../17-other-libraries/files/93/rigidbodymotioni.h--93be5a54c8b7.md)

## 8. 直接上层引用

- [applications/test/rigidBodyDynamics/Test-rigidBodyDynamics.C](../../../17-other-libraries/files/0a/test-rigidbodydynamics.c--0a0a5cfa553d.md)
- [src/fvModels/rigidBodyPropellerDisk/rigidBodyPropellerDisk.H](../../../12-boundaries-sources/files/64/rigidbodypropellerdisk.h--641bb4589ff2.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyMotion/rigidBodyMotion.C](../../../17-other-libraries/files/75/rigidbodymotion.c--756bb5cd68a7.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyMotion/rigidBodyMotionIO.C](../../../17-other-libraries/files/16/rigidbodymotionio.c--16a177abb317.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/rigidBodySolver/rigidBodySolver.H](../../../17-other-libraries/files/2d/rigidbodysolver.h--2da5fe927842.md)
- [src/rigidBodyMotion/rigidBodyForces/rigidBodyForces/rigidBodyForces.C](../../../17-other-libraries/files/a3/rigidbodyforces.c--a3a42e806a12.md)
- [src/rigidBodyMotion/rigidBodyForces/rigidBodySectionalForcesBase/rigidBodySectionalForcesBase.C](../../../17-other-libraries/files/30/rigidbodysectionalforcesbase.c--306c54be62ab.md)
- [src/rigidBodyMotion/rigidBodyForces/rigidBodySectionalForcesBase/rigidBodySectionalForcesBase.H](../../../17-other-libraries/files/c6/rigidbodysectionalforcesbase.h--c60508adaf10.md)
- [src/rigidBodyMotion/rigidBodyMotion_pointMeshMovers/rigidBodyDisplacement/rigidBodyDisplacement_pointMeshMover.H](../../../17-other-libraries/files/8b/rigidbodydisplacement_pointmeshmover.h--8bef64c5385d.md)
- [src/rigidBodyMotion/rigidBodyMotion_pointMeshMovers/rigidBodyMotion/rigidBodyMotion_pointMeshMover.H](../../../17-other-libraries/files/1d/rigidbodymotion_pointmeshmover.h--1d8626d5083d.md)
- [src/rigidBodyMotion/rigidBodyState/rigidBodyPoints/rigidBodyPoints.H](../../../17-other-libraries/files/81/rigidbodypoints.h--8123a153218f.md)
- [src/rigidBodyMotion/rigidBodyState/rigidBodyState/rigidBodyState.H](../../../17-other-libraries/files/7c/rigidbodystate.h--7ce7afc85b66.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
