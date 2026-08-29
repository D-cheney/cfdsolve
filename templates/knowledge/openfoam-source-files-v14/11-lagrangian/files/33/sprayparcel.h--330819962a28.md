---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-330819962a28"
title: "OpenFOAM 14 源码解析：SprayParcel.H"
summary: "该文件声明或实现 `SprayParcel`、`constantProperties`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/parcels/Templates/SprayParcel/SprayParcel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：SprayParcel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/parcels/Templates/SprayParcel/SprayParcel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：458 行
- 文件标识：`330819962a28`

## 2. 功能说明

该文件声明或实现 `SprayParcel`、`constantProperties`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Reaching spray parcel, with added functionality for atomisation and breakup

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `SprayParcel` | 48 |
| `constantProperties` | 86 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- `particle.H`
- [`demandDrivenEntry.H`](../../../11-lagrangian/files/7e/demanddrivenentry.h--7e8f3f672f41.md)
- [`SprayParcelI.H`](../../../11-lagrangian/files/0b/sprayparceli.h--0b2bf92b143e.md)
- [`SprayParcel.C`](../../../11-lagrangian/files/95/sprayparcel.c--95f0d1b79720.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/derived/sprayParcel/sprayParcel.H](../../../11-lagrangian/files/12/sprayparcel.h--121225d57766.md)
- [src/lagrangian/parcel/parcels/Templates/SprayParcel/SprayParcel.C](../../../11-lagrangian/files/95/sprayparcel.c--95f0d1b79720.md)
- [src/lagrangian/parcel/parcels/Templates/SprayParcel/SprayParcelI.H](../../../11-lagrangian/files/0b/sprayparceli.h--0b2bf92b143e.md)
- [src/lagrangian/parcel/parcels/Templates/SprayParcel/SprayParcelIO.C](../../../11-lagrangian/files/85/sprayparcelio.c--85e9b5a99667.md)
- [src/lagrangian/parcel/parcels/Templates/SprayParcel/SprayParcelName.C](../../../11-lagrangian/files/91/sprayparcelname.c--9193483a7572.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
