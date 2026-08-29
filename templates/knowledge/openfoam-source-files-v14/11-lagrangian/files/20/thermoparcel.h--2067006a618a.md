---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2067006a618a"
title: "OpenFOAM 14 源码解析：ThermoParcel.H"
summary: "该文件声明或实现 `ThermoParcel`、`constantProperties`、`trackingData`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ThermoParcel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：463 行
- 文件标识：`2067006a618a`

## 2. 功能说明

该文件声明或实现 `ThermoParcel`、`constantProperties`、`trackingData`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Thermodynamic parcel class with one/two-way coupling with the continuous phase

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ThermoParcel` | 56 |
| `constantProperties` | 94 |
| `trackingData` | 162 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- `particle.H`
- [`interpolation.H`](../../../05-finite-volume/files/81/interpolation.h--8143f5455db1.md)
- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)
- [`demandDrivenEntry.H`](../../../11-lagrangian/files/7e/demanddrivenentry.h--7e8f3f672f41.md)
- [`ThermoParcelI.H`](../../../11-lagrangian/files/0a/thermoparceli.h--0a021fa4451d.md)
- [`ThermoParcelTrackingDataI.H`](../../../11-lagrangian/files/96/thermoparceltrackingdatai.h--96a50be32120.md)
- [`ThermoParcel.C`](../../../11-lagrangian/files/43/thermoparcel.c--43b478f4d6af.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/derived/reactingMultiphaseParcel/reactingMultiphaseParcel.H](../../../11-lagrangian/files/4f/reactingmultiphaseparcel.h--4f549d9d5a14.md)
- [src/lagrangian/parcel/parcels/derived/reactingParcel/reactingParcel.H](../../../11-lagrangian/files/83/reactingparcel.h--83dd882929c3.md)
- [src/lagrangian/parcel/parcels/derived/sprayParcel/sprayParcel.H](../../../11-lagrangian/files/12/sprayparcel.h--121225d57766.md)
- [src/lagrangian/parcel/parcels/derived/thermoParcel/thermoParcel.H](../../../11-lagrangian/files/05/thermoparcel.h--0531da494c89.md)
- [src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcel.C](../../../11-lagrangian/files/43/thermoparcel.c--43b478f4d6af.md)
- [src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcelI.H](../../../11-lagrangian/files/0a/thermoparceli.h--0a021fa4451d.md)
- [src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcelIO.C](../../../11-lagrangian/files/24/thermoparcelio.c--24a8c6224dc6.md)
- [src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcelName.C](../../../11-lagrangian/files/37/thermoparcelname.c--3760c58ea1d5.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
