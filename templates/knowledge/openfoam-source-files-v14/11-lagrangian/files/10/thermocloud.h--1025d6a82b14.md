---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1025d6a82b14"
title: "OpenFOAM 14 源码解析：ThermoCloud.H"
summary: "该文件声明或实现 `integrationScheme`、`InjectionModel`、`HeatTransferModel`、`CompositionModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/clouds/Templates/ThermoCloud/ThermoCloud.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ThermoCloud.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/clouds/Templates/ThermoCloud/ThermoCloud.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：428 行
- 文件标识：`1025d6a82b14`

## 2. 功能说明

该文件声明或实现 `integrationScheme`、`InjectionModel`、`HeatTransferModel`、`CompositionModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated base class for thermodynamic cloud - Adds to momentum cloud - Heat transfer

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `integrationScheme` | 61 |
| `InjectionModel` | 63 |
| `HeatTransferModel` | 66 |
| `CompositionModel` | 69 |
| `ThermoCloud` | 84 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`fvMatricesFwd.H`](../../../05-finite-volume/files/c0/fvmatricesfwd.h--c0b6e3525b0b.md)
- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`parcelThermo.H`](../../../11-lagrangian/files/b1/parcelthermo.h--b155f4a61149.md)
- [`Cloud.H`](../../../11-lagrangian/files/0f/cloud.h--0fc43918cc09.md)
- [`ThermoCloudI.H`](../../../11-lagrangian/files/df/thermocloudi.h--dff396083822.md)
- [`ThermoCloud.C`](../../../11-lagrangian/files/3e/thermocloud.c--3e895abe9081.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/fvModels/filmCloudTransfer/cloudFilmTransfer/CloudFilmTransfer/CloudFilmTransfer.C](../../../02-solver-modules/files/3a/cloudfilmtransfer.c--3aa71d818e9d.md)
- [src/lagrangian/parcel/clouds/derived/reactingCloud/reactingCloud.H](../../../11-lagrangian/files/b7/reactingcloud.h--b76df5028c2b.md)
- [src/lagrangian/parcel/clouds/derived/reactingMultiphaseCloud/reactingMultiphaseCloud.H](../../../11-lagrangian/files/51/reactingmultiphasecloud.h--51b013e28311.md)
- [src/lagrangian/parcel/clouds/derived/sprayCloud/sprayCloud.H](../../../11-lagrangian/files/d3/spraycloud.h--d35676d3516d.md)
- [src/lagrangian/parcel/clouds/derived/thermoCloud/thermoCloud.H](../../../11-lagrangian/files/11/thermocloud.h--11f0b081792c.md)
- [src/lagrangian/parcel/clouds/Templates/ThermoCloud/ThermoCloud.C](../../../11-lagrangian/files/3e/thermocloud.c--3e895abe9081.md)
- [src/lagrangian/parcel/clouds/Templates/ThermoCloud/ThermoCloudName.C](../../../11-lagrangian/files/4e/thermocloudname.c--4e03c2c26ba4.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
