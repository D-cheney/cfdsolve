---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a206041c7f1d"
title: "OpenFOAM 14 源码解析：shaped.H"
summary: "该文件声明或实现 `shaped`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/clouds/shaped/shaped.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：shaped.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/clouds/shaped/shaped.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：131 行
- 文件标识：`a206041c7f1d`

## 2. 功能说明

该文件声明或实现 `shaped`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base class for clouds with particles with mass

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `shaped` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`grouped.H`](../../../11-lagrangian/files/01/grouped.h--01c45f9509db.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/clouds/massive/massive.H](../../../11-lagrangian/files/6c/massive.h--6c83956515b9.md)
- [src/Lagrangian/cloud/clouds/shaped/shaped.C](../../../11-lagrangian/files/4e/shaped.c--4e801770adbe.md)
- [src/Lagrangian/cloud/clouds/spherical/spherical.H](../../../11-lagrangian/files/c4/spherical.h--c494897a438c.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/surfaceArea/surfaceAreaLagrangianScalarFieldSource.C](../../../11-lagrangian/files/06/surfacearealagrangianscalarfieldsource.c--06821d76d7b3.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/volume/volumeLagrangianScalarFieldSource.C](../../../11-lagrangian/files/b3/volumelagrangianscalarfieldsource.c--b3b38c5d0c0e.md)
- [src/Lagrangian/cloud/LagrangianModels/constantCoefficientVirtualMass/constantCoefficientVirtualMass.C](../../../11-lagrangian/files/bd/constantcoefficientvirtualmass.c--bd2478609f23.md)
- [src/Lagrangian/cloud/LagrangianModels/constantFluxCarrierTransfer/constantFluxCarrierTransfer.C](../../../11-lagrangian/files/89/constantfluxcarriertransfer.c--89681227f93c.md)
- [src/Lagrangian/cloud/LagrangianModels/pressureGradientForce/pressureGradientForce.C](../../../11-lagrangian/files/47/pressuregradientforce.c--475f5f4f42ab.md)
- [src/Lagrangian/cloudFunctionObjects/cloudFlux/cloudVolumeFlux.C](../../../11-lagrangian/files/49/cloudvolumeflux.c--49b2e9267f8a.md)
- [src/Lagrangian/cloudFunctionObjects/cloudGravitationalPotentialEnergy/cloudGravitationalPotentialEnergy.C](../../../11-lagrangian/files/e2/cloudgravitationalpotentialenergy.c--e2575db3656c.md)
- [src/Lagrangian/cloudFunctionObjects/cloudKineticEnergy/cloudKineticEnergy.C](../../../11-lagrangian/files/cf/cloudkineticenergy.c--cff3df2e43b8.md)
- [src/Lagrangian/cloudFunctionObjects/cloudLagrangianVolumeFraction/cloudLagrangianVolumeFraction.C](../../../11-lagrangian/files/3c/cloudlagrangianvolumefraction.c--3c18af93aeb3.md)
- [src/Lagrangian/cloudFunctionObjects/cloudSurfaceArea/cloudSurfaceArea.C](../../../11-lagrangian/files/f5/cloudsurfacearea.c--f504fa07cdce.md)
- [src/Lagrangian/cloudFunctionObjects/cloudSurfaceAreaPerUnitVolume/cloudSurfaceAreaPerUnitVolume.C](../../../11-lagrangian/files/f1/cloudsurfaceareaperunitvolume.c--f1d96767ba57.md)
- [src/Lagrangian/cloudFunctionObjects/cloudVolume/cloudVolume.C](../../../11-lagrangian/files/81/cloudvolume.c--81980d8500fc.md)
- [src/Lagrangian/cloudFunctionObjects/cloudVolumeFraction/cloudVolumeFraction.C](../../../11-lagrangian/files/ba/cloudvolumefraction.c--ba47aeab84b7.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
