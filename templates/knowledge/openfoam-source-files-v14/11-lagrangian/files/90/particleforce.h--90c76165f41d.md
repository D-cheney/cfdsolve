---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-90c76165f41d"
title: "OpenFOAM 14 源码解析：ParticleForce.H"
summary: "该文件声明或实现 `ParticleForce`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Momentum/ParticleForces/ParticleForce/ParticleForce.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ParticleForce.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Momentum/ParticleForces/ParticleForce/ParticleForce.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：245 行
- 文件标识：`90c76165f41d`

## 2. 功能说明

该文件声明或实现 `ParticleForce`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Abstract base class for particle forces

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ParticleForce` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`forceSuSp.H`](../../../11-lagrangian/files/90/forcesusp.h--90f6ed02b8b2.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`ParticleForceI.H`](../../../11-lagrangian/files/b2/particleforcei.h--b2774e196bba.md)
- [`ParticleForce.C`](../../../11-lagrangian/files/a4/particleforce.c--a468445b4bc5.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/submodels/ForceTypes/ParticleForceList/ParticleForceList.H](../../../11-lagrangian/files/a6/particleforcelist.h--a6f5f5d97934.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Drag/DenseDrag/DenseDragForce.H](../../../11-lagrangian/files/32/densedragforce.h--3296abdce222.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Drag/DistortedSphereDrag/DistortedSphereDragForce.H](../../../11-lagrangian/files/49/distortedspheredragforce.h--49698a9a330c.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Drag/NonSphereDrag/NonSphereDragForce.H](../../../11-lagrangian/files/88/nonspheredragforce.h--88f09973e6b1.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Drag/SchillerNaumannDrag/SchillerNaumannDragForce.H](../../../11-lagrangian/files/11/schillernaumanndragforce.h--1183550d0db9.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Drag/SphereDrag/SphereDragForce.H](../../../11-lagrangian/files/20/spheredragforce.h--204bd85d5512.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Gravity/GravityForce.H](../../../11-lagrangian/files/2a/gravityforce.h--2a6faaf57e34.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Lift/LiftForce/LiftForce.H](../../../11-lagrangian/files/2a/liftforce.h--2a4885269b60.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/NonInertialFrame/NonInertialFrameForce.H](../../../11-lagrangian/files/26/noninertialframeforce.h--26222d6e36d0.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Paramagnetic/ParamagneticForce.H](../../../11-lagrangian/files/50/paramagneticforce.h--505c2e6196e4.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/ParticleForce/ParticleForce.C](../../../11-lagrangian/files/a4/particleforce.c--a468445b4bc5.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/ParticleForce/ParticleForceNew.C](../../../11-lagrangian/files/07/particleforcenew.c--07ce82b393df.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/PressureGradient/PressureGradientForce.H](../../../11-lagrangian/files/34/pressuregradientforce.h--344de14828aa.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Scaled/ScaledForce.H](../../../11-lagrangian/files/db/scaledforce.h--db77d638f60b.md)
- [src/lagrangian/parcel/submodels/Thermodynamic/ParticleForces/BrownianMotion/BrownianMotionForce.H](../../../11-lagrangian/files/50/brownianmotionforce.h--50da399f72dc.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
