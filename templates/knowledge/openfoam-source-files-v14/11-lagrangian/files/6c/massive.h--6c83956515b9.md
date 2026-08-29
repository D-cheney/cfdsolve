---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6c83956515b9"
title: "OpenFOAM 14 源码解析：massive.H"
summary: "该文件声明或实现 `massive`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/clouds/massive/massive.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：massive.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/clouds/massive/massive.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：101 行
- 文件标识：`6c83956515b9`

## 2. 功能说明

该文件声明或实现 `massive`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base class for clouds with particles with mass

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `massive` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`shaped.H`](../../../11-lagrangian/files/a2/shaped.h--a206041c7f1d.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/clouds/dense/dense.H](../../../11-lagrangian/files/5a/dense.h--5ae551496c96.md)
- [src/Lagrangian/cloud/clouds/massive/massive.C](../../../11-lagrangian/files/83/massive.c--830f1816a410.md)
- [src/Lagrangian/cloud/clouds/massiveCoupledToFluid/massiveCoupledToFluid.H](../../../11-lagrangian/files/d2/massivecoupledtofluid.h--d25990230d30.md)
- [src/Lagrangian/cloud/clouds/thermal/thermal.H](../../../11-lagrangian/files/9f/thermal.h--9fd3585c17a6.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/mass/massLagrangianScalarFieldSource.C](../../../11-lagrangian/files/e4/masslagrangianscalarfieldsource.c--e4d36f07ea0c.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/totalPressureVelocityMagnitude/totalPressureVelocityMagnitudeLagrangianScalarFieldSource.C](../../../11-lagrangian/files/74/totalpressurevelocitymagnitudelagrangianscalarfieldsource.c--749b0d2c6e34.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/uniformSizeNumber/uniformSizeNumberLagrangianScalarFieldSource.C](../../../11-lagrangian/files/96/uniformsizenumberlagrangianscalarfieldsource.c--96e16745a91c.md)
- [src/Lagrangian/cloud/LagrangianModels/collisionPhaseTransfer/collisionPhaseTransfer.C](../../../11-lagrangian/files/ed/collisionphasetransfer.c--edf6d33821e0.md)
- [src/Lagrangian/cloud/LagrangianModels/constantFluxCarrierTransfer/constantFluxCarrierTransfer.C](../../../11-lagrangian/files/89/constantfluxcarriertransfer.c--89681227f93c.md)
- [src/Lagrangian/cloud/LagrangianModels/gravity/gravity.C](../../../11-lagrangian/files/bf/gravity.c--bffde06abed1.md)
- [src/Lagrangian/cloudFunctionObjects/cloudBoundaryCollisionFlux/cloudBoundaryCollisionForce.C](../../../11-lagrangian/files/e9/cloudboundarycollisionforce.c--e947e3ab8159.md)
- [src/Lagrangian/cloudFunctionObjects/cloudFlux/cloudMassFlux.C](../../../11-lagrangian/files/2c/cloudmassflux.c--2ca6fa9b05eb.md)
- [src/Lagrangian/cloudFunctionObjects/cloudGravitationalPotentialEnergy/cloudGravitationalPotentialEnergy.C](../../../11-lagrangian/files/e2/cloudgravitationalpotentialenergy.c--e2575db3656c.md)
- [src/Lagrangian/cloudFunctionObjects/cloudKineticEnergy/cloudKineticEnergy.C](../../../11-lagrangian/files/cf/cloudkineticenergy.c--cff3df2e43b8.md)
- [src/Lagrangian/cloudFunctionObjects/cloudMass/cloudMass.C](../../../11-lagrangian/files/13/cloudmass.c--13a42b86186f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
