---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-df5f80e7bde4"
title: "OpenFOAM 14 源码解析：sphericalCoupled.H"
summary: "该文件声明或实现 `sphericalCoupled`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/clouds/sphericalCoupled/sphericalCoupled.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：sphericalCoupled.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/clouds/sphericalCoupled/sphericalCoupled.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：99 行
- 文件标识：`df5f80e7bde4`

## 2. 功能说明

该文件声明或实现 `sphericalCoupled`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base class for clouds of spherical particles which are coupled to a carrier

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `sphericalCoupled` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- `spherical.H`
- [`coupled.H`](../../../11-lagrangian/files/4a/coupled.h--4a4351f96828.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/clouds/dynamicParcel/dynamicParcel.H](../../../11-lagrangian/files/86/dynamicparcel.h--8612ac07a1b1.md)
- [src/Lagrangian/cloud/clouds/dynamicParticle/dynamicParticle.H](../../../11-lagrangian/files/5d/dynamicparticle.h--5dbfd48088e2.md)
- [src/Lagrangian/cloud/clouds/kinematicParcel/kinematicParcel.H](../../../11-lagrangian/files/54/kinematicparcel.h--5458eac8b30d.md)
- [src/Lagrangian/cloud/clouds/kinematicParticle/kinematicParticle.H](../../../11-lagrangian/files/c0/kinematicparticle.h--c008f1b89f08.md)
- [src/Lagrangian/cloud/clouds/multicomponentParcel/multicomponentParcel.H](../../../11-lagrangian/files/ad/multicomponentparcel.h--adc1485603a8.md)
- [src/Lagrangian/cloud/clouds/multicomponentParticle/multicomponentParticle.H](../../../11-lagrangian/files/b2/multicomponentparticle.h--b2e6d7df71d6.md)
- [src/Lagrangian/cloud/clouds/parcel/parcel.H](../../../11-lagrangian/files/1f/parcel.h--1fa2d1b63b22.md)
- [src/Lagrangian/cloud/clouds/particle/particle.H](../../../11-lagrangian/files/76/particle.h--76e082a4b2fb.md)
- [src/Lagrangian/cloud/clouds/sphericalCoupled/sphericalCoupled.C](../../../11-lagrangian/files/05/sphericalcoupled.c--05bc8e744cce.md)
- [src/Lagrangian/cloud/LagrangianModels/GidaspowErgunWenYuDrag/GidaspowErgunWenYuDrag.C](../../../11-lagrangian/files/90/gidaspowergunwenyudrag.c--90a7c57a8709.md)
- [src/Lagrangian/cloud/LagrangianModels/RanzMarshallHeatTransfer/RanzMarshallHeatTransfer.C](../../../11-lagrangian/files/ed/ranzmarshallheattransfer.c--edb4dd23f15a.md)
- [src/Lagrangian/cloud/LagrangianModels/SaffmanMeiLift/SaffmanMeiLift.C](../../../11-lagrangian/files/0f/saffmanmeilift.c--0f660d80787d.md)
- [src/Lagrangian/cloud/LagrangianModels/SchillerNaumannDrag/SchillerNaumannDrag.C](../../../11-lagrangian/files/3a/schillernaumanndrag.c--3a1689764b1a.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
