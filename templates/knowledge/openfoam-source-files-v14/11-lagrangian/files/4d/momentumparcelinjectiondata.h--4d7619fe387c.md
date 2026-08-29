---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4d7619fe387c"
title: "OpenFOAM 14 源码解析：momentumParcelInjectionData.H"
summary: "该文件声明或实现 `momentumParcelInjectionData`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Momentum/InjectionModel/MomentumLookupTableInjection/momentumParcelInjectionData.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：momentumParcelInjectionData.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Momentum/InjectionModel/MomentumLookupTableInjection/momentumParcelInjectionData.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：208 行
- 文件标识：`4d7619fe387c`

## 2. 功能说明

该文件声明或实现 `momentumParcelInjectionData`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Container class to provide injection data for momentum parcels

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `momentumParcelInjectionData` | 54 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`vector.H`](../../../04-core-runtime/files/64/vector.h--64124691b98b.md)
- [`point.H`](../../../04-core-runtime/files/60/point.h--60b73f2bc052.md)
- [`momentumParcelInjectionDataI.H`](../../../11-lagrangian/files/7c/momentumparcelinjectiondatai.h--7cd9fd90203d.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/MomentumLookupTableInjection/momentumParcelInjectionData.C](../../../11-lagrangian/files/fe/momentumparcelinjectiondata.c--fe0eb2e7c2b2.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/MomentumLookupTableInjection/momentumParcelInjectionDataI.H](../../../11-lagrangian/files/7c/momentumparcelinjectiondatai.h--7cd9fd90203d.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/MomentumLookupTableInjection/momentumParcelInjectionDataIO.C](../../../11-lagrangian/files/78/momentumparcelinjectiondataio.c--78cc295e6913.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/MomentumLookupTableInjection/momentumParcelInjectionDataIOList.H](../../../11-lagrangian/files/f4/momentumparcelinjectiondataiolist.h--f454ec3d009d.md)
- [src/lagrangian/parcel/submodels/Thermodynamic/InjectionModel/ThermoLookupTableInjection/thermoParcelInjectionData.H](../../../11-lagrangian/files/9b/thermoparcelinjectiondata.h--9bd40f66ca3c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
