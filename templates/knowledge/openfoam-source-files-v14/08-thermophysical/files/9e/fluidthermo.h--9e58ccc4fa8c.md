---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9e58ccc4fa8c"
title: "OpenFOAM 14 源码解析：fluidThermo.H"
summary: "该文件声明或实现 `fluidThermo`、`implementation`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/fluidThermo/fluidThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：fluidThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/fluidThermo/fluidThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：219 行
- 文件标识：`9e58ccc4fa8c`

## 2. 功能说明

该文件声明或实现 `fluidThermo`、`implementation`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Base-class for fluid thermodynamic properties.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fluidThermo` | 58 |
| `implementation` | 69 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`basicThermo.H`](../../../08-thermophysical/files/f6/basicthermo.h--f61d8b7b6dd2.md)
- [`viscosity.H`](../../../08-thermophysical/files/61/viscosity.h--6109322fab0a.md)

## 8. 直接上层引用

- [applications/legacy/compressible/rhoPorousSimpleFoam/rhoPorousSimpleFoam.C](../../../17-other-libraries/files/b7/rhoporoussimplefoam.c--b77cea8351a3.md)
- [applications/modules/compressibleVoF/fvModels/VoFClouds/VoFClouds.H](../../../02-solver-modules/files/c0/vofclouds.h--c06b108f7d04.md)
- [applications/modules/film/filmThermophysicalTransportModels/filmThermophysicalTransportModel.H](../../../02-solver-modules/files/9b/filmthermophysicaltransportmodel.h--9b50c2697813.md)
- [applications/modules/isothermalFluid/isothermalFluid.H](../../../02-solver-modules/files/4d/isothermalfluid.h--4db48b548d4f.md)
- [src/functionObjects/field/MachNo/MachNo.C](../../../14-postprocessing/files/23/machno.c--234a7943e57b.md)
- [src/functionObjects/field/totalEnthalpy/totalEnthalpy.C](../../../14-postprocessing/files/07/totalenthalpy.c--0754cff86313.md)
- [src/functionObjects/forces/forcesBase/forcesBase.C](../../../14-postprocessing/files/a2/forcesbase.c--a21561ee004f.md)
- [src/Lagrangian/cloud/clouds/coupledToFluid/coupledToFluid.C](../../../11-lagrangian/files/fa/coupledtofluid.c--fa14cdc0efd2.md)
- [src/Lagrangian/cloud/clouds/coupledToThermalFluid/coupledToThermalFluid.C](../../../11-lagrangian/files/a8/coupledtothermalfluid.c--a8cc2ea3197f.md)
- [src/lagrangian/parcel/clouds/Templates/CollidingCloud/CollidingCloud.H](../../../11-lagrangian/files/d8/collidingcloud.h--d888c12f19d5.md)
- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.H](../../../11-lagrangian/files/ff/momentumcloud.h--ffe06b1f4abd.md)
- [src/lagrangian/parcel/clouds/Templates/MPPICCloud/MPPICCloud.H](../../../11-lagrangian/files/3c/mppiccloud.h--3c734e223b2e.md)
- [src/lagrangian/parcel/clouds/Templates/ReactingCloud/ReactingCloud.H](../../../11-lagrangian/files/53/reactingcloud.h--531be5ad1703.md)
- [src/lagrangian/parcel/clouds/Templates/ReactingMultiphaseCloud/ReactingMultiphaseCloud.H](../../../11-lagrangian/files/f6/reactingmultiphasecloud.h--f6c93b573ea6.md)
- [src/lagrangian/parcel/clouds/Templates/SprayCloud/SprayCloud.H](../../../11-lagrangian/files/29/spraycloud.h--29ba341c4c4e.md)
- [src/lagrangian/parcel/fvModels/clouds/clouds.H](../../../11-lagrangian/files/8f/clouds.h--8fb7647e2ba7.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingMultiphaseParcel/ReactingMultiphaseParcel.H](../../../11-lagrangian/files/e6/reactingmultiphaseparcel.h--e660c2608b95.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingParcel/ReactingParcel.H](../../../11-lagrangian/files/1a/reactingparcel.h--1ae22206ba1f.md)
- [src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcel.H](../../../11-lagrangian/files/20/thermoparcel.h--2067006a618a.md)
- [src/lagrangian/parcel/parcelThermo/parcelThermo.H](../../../11-lagrangian/files/b1/parcelthermo.h--b155f4a61149.md)
- [src/radiationModels/absorptionEmissionModels/greyMean/greyMean.H](../../../17-other-libraries/files/03/greymean.h--03c5580c0970.md)
- [src/radiationModels/absorptionEmissionModels/wideBand/wideBand.H](../../../17-other-libraries/files/d2/wideband.h--d2d39720b940.md)
- [src/radiationModels/fvModels/radiation/radiation.C](../../../17-other-libraries/files/c9/radiation.c--c965f28d15fa.md)
- [src/thermophysicalModels/basic/fluidThermo/fluidThermo.C](../../../08-thermophysical/files/30/fluidthermo.c--30d6a12411bc.md)
- [src/thermophysicalModels/basic/fluidThermo/hydrostaticInitialisation.C](../../../08-thermophysical/files/2c/hydrostaticinitialisation.c--2c290dad7e73.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
