---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0f42b9e8e4c0"
title: "OpenFOAM 14 源码解析：ConeInjection.H"
summary: "该文件声明或实现 `ConeInjection`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Momentum/InjectionModel/ConeInjection/ConeInjection.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ConeInjection.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Momentum/InjectionModel/ConeInjection/ConeInjection.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：358 行
- 文件标识：`0f42b9e8e4c0`

## 2. 功能说明

该文件声明或实现 `ConeInjection`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：This injector injects particles in a number of cones. The user specifies a position and a direction to inject at, and two angles to inject between. Optionally, this injector can introduce particles over a disc, instead of at a point, in which case inner and outer diameters of the disc are also specified. The velocity is specified either as constant, or it is calculated from an injection pressure, or it is calculated from the injector mass flow rate and a discharge coefficient; i.e.: Constant velocity: \f[ U = U_{constant} \f] Pressure driven velocity: \f[ U = \sqrt{2(p_{injection} - p)/\rho} \f] Flow rate and discharge: \f[ U = \dot{m}/(\rho A C_{discharge}) \f] Usage \table Property | Description | Required | Default position | The injection position | yes | direction | The injection direction | yes | thetaInner | The inner cone angle | yes | thetaOuter | The outer cone angle | yes | in

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ConeInjection` | 164 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`InjectionModel.H`](../../../11-lagrangian/files/c6/injectionmodel.h--c6899b53d2f1.md)
- [`distribution.H`](../../../04-core-runtime/files/a7/distribution.h--a74f26d87987.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`ConeInjection.C`](../../../11-lagrangian/files/9f/coneinjection.c--9f11566deba8.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/SprayCloud/SprayCloud.C](../../../11-lagrangian/files/c9/spraycloud.c--c9df0c30d626.md)
- [src/lagrangian/parcel/parcels/include/makeParcelInjectionModels.H](../../../11-lagrangian/files/1c/makeparcelinjectionmodels.h--1c170813295c.md)
- [src/lagrangian/parcel/parcels/include/makeReactingMultiphaseParcelInjectionModels.H](../../../11-lagrangian/files/f2/makereactingmultiphaseparcelinjectionmodels.h--f2ccdb9fb94f.md)
- [src/lagrangian/parcel/parcels/include/makeReactingParcelInjectionModels.H](../../../11-lagrangian/files/12/makereactingparcelinjectionmodels.h--12821710cd09.md)
- [src/lagrangian/parcel/parcels/include/makeSprayParcelInjectionModels.H](../../../11-lagrangian/files/76/makesprayparcelinjectionmodels.h--7607f967d96f.md)
- [src/lagrangian/parcel/parcels/include/makeThermoParcelInjectionModels.H](../../../11-lagrangian/files/49/makethermoparcelinjectionmodels.h--491e1f222577.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/ConeInjection/ConeInjection.C](../../../11-lagrangian/files/9f/coneinjection.c--9f11566deba8.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
