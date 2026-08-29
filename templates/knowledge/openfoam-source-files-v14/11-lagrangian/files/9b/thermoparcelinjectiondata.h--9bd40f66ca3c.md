---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9bd40f66ca3c"
title: "OpenFOAM 14 源码解析：thermoParcelInjectionData.H"
summary: "该文件声明或实现 `thermoParcelInjectionData`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Thermodynamic/InjectionModel/ThermoLookupTableInjection/thermoParcelInjectionData.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：thermoParcelInjectionData.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Thermodynamic/InjectionModel/ThermoLookupTableInjection/thermoParcelInjectionData.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：156 行
- 文件标识：`9bd40f66ca3c`

## 2. 功能说明

该文件声明或实现 `thermoParcelInjectionData`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Container class to provide injection data for thermodynamic parcels

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `thermoParcelInjectionData` | 52 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`momentumParcelInjectionData.H`](../../../11-lagrangian/files/4d/momentumparcelinjectiondata.h--4d7619fe387c.md)
- [`thermoParcelInjectionDataI.H`](../../../11-lagrangian/files/55/thermoparcelinjectiondatai.h--55b99bda6e9d.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/submodels/Reacting/InjectionModel/ReactingLookupTableInjection/reactingParcelInjectionData.H](../../../11-lagrangian/files/d1/reactingparcelinjectiondata.h--d1421a9e6bde.md)
- [src/lagrangian/parcel/submodels/Thermodynamic/InjectionModel/ThermoLookupTableInjection/thermoParcelInjectionData.C](../../../11-lagrangian/files/3c/thermoparcelinjectiondata.c--3ccc9dacb529.md)
- [src/lagrangian/parcel/submodels/Thermodynamic/InjectionModel/ThermoLookupTableInjection/thermoParcelInjectionDataI.H](../../../11-lagrangian/files/55/thermoparcelinjectiondatai.h--55b99bda6e9d.md)
- [src/lagrangian/parcel/submodels/Thermodynamic/InjectionModel/ThermoLookupTableInjection/thermoParcelInjectionDataIO.C](../../../11-lagrangian/files/b3/thermoparcelinjectiondataio.c--b30da75b5b2b.md)
- [src/lagrangian/parcel/submodels/Thermodynamic/InjectionModel/ThermoLookupTableInjection/thermoParcelInjectionDataIOList.H](../../../11-lagrangian/files/f8/thermoparcelinjectiondataiolist.h--f853e394489b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
