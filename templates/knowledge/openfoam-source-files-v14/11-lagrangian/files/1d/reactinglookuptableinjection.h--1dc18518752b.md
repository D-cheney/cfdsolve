---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1dc18518752b"
title: "OpenFOAM 14 源码解析：ReactingLookupTableInjection.H"
summary: "该文件声明或实现 `ReactingLookupTableInjection`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Reacting/InjectionModel/ReactingLookupTableInjection/ReactingLookupTableInjection.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ReactingLookupTableInjection.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Reacting/InjectionModel/ReactingLookupTableInjection/ReactingLookupTableInjection.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：205 行
- 文件标识：`1dc18518752b`

## 2. 功能说明

该文件声明或实现 `ReactingLookupTableInjection`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Particle injection sources read from look-up table. Each row corresponds to an injection site. ( (x y z) (u v w) d rho mDot T cp (Y0..YN) // injector 1 (x y z) (u v w) d rho mDot T cp (Y0..YN) // injector 2 ... (x y z) (u v w) d rho mDot T cp (Y0..YN) // injector N ); where: x, y, z = global cartesian co-ordinates [m] u, v, w = global cartesian velocity components [m/s] d = diameter [m] rho = density [kg/m^3] mDot = mass flow rate [kg/s] T = temperature [K] cp = specific heat capacity [J/kg/K] Y = list of mass fractions

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ReactingLookupTableInjection` | 73 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`InjectionModel.H`](../../../11-lagrangian/files/c6/injectionmodel.h--c6899b53d2f1.md)
- [`reactingParcelInjectionDataIOList.H`](../../../11-lagrangian/files/eb/reactingparcelinjectiondataiolist.h--eb305519da75.md)
- [`ReactingLookupTableInjection.C`](../../../11-lagrangian/files/95/reactinglookuptableinjection.c--9585bd5828f3.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/include/makeReactingParcelInjectionModels.H](../../../11-lagrangian/files/12/makereactingparcelinjectionmodels.h--12821710cd09.md)
- [src/lagrangian/parcel/submodels/Reacting/InjectionModel/ReactingLookupTableInjection/ReactingLookupTableInjection.C](../../../11-lagrangian/files/95/reactinglookuptableinjection.c--9585bd5828f3.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
