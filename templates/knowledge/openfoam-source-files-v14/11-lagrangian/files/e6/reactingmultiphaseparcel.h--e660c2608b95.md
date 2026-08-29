---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e660c2608b95"
title: "OpenFOAM 14 源码解析：ReactingMultiphaseParcel.H"
summary: "该文件声明或实现 `ReactingMultiphaseParcel`、`constantProperties`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/parcels/Templates/ReactingMultiphaseParcel/ReactingMultiphaseParcel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ReactingMultiphaseParcel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/parcels/Templates/ReactingMultiphaseParcel/ReactingMultiphaseParcel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：454 行
- 文件标识：`e660c2608b95`

## 2. 功能说明

该文件声明或实现 `ReactingMultiphaseParcel`、`constantProperties`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Multiphase variant of the reacting parcel class with one/two-way coupling with the continuous phase.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ReactingMultiphaseParcel` | 55 |
| `constantProperties` | 92 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- `particle.H`
- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)
- [`demandDrivenEntry.H`](../../../11-lagrangian/files/7e/demanddrivenentry.h--7e8f3f672f41.md)
- [`ReactingMultiphaseParcelI.H`](../../../11-lagrangian/files/bd/reactingmultiphaseparceli.h--bd347dc1fda2.md)
- [`ReactingMultiphaseParcel.C`](../../../11-lagrangian/files/65/reactingmultiphaseparcel.c--65879af47a1f.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/derived/reactingMultiphaseParcel/reactingMultiphaseParcel.H](../../../11-lagrangian/files/4f/reactingmultiphaseparcel.h--4f549d9d5a14.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingMultiphaseParcel/ReactingMultiphaseParcel.C](../../../11-lagrangian/files/65/reactingmultiphaseparcel.c--65879af47a1f.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingMultiphaseParcel/ReactingMultiphaseParcelI.H](../../../11-lagrangian/files/bd/reactingmultiphaseparceli.h--bd347dc1fda2.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingMultiphaseParcel/ReactingMultiphaseParcelIO.C](../../../11-lagrangian/files/5b/reactingmultiphaseparcelio.c--5bb2e6a06188.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingMultiphaseParcel/ReactingMultiphaseParcelName.C](../../../11-lagrangian/files/8e/reactingmultiphaseparcelname.c--8eb8be51b595.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
