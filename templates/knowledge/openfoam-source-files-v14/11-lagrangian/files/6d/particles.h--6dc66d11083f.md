---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6dc66d11083f"
title: "OpenFOAM 14 源码解析：particles.H"
summary: "该文件声明或实现 `viscosityModel`、`particles`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/functionObjects/particles/particles.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：particles.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/functionObjects/particles/particles.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：185 行
- 文件标识：`6dc66d11083f`

## 2. 功能说明

该文件声明或实现 `viscosityModel`、`particles`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：This functionObject tracks a particle cloud in the specified velocity field of an incompressible flow (laminar, RANS or LES). It may be used in conjunction with any transient single-phase incompressible flow solvers or solver modules such as incompressibleFluid and tracks the particles or parcels without affecting the flow-field. The cloud requires the density of the fluid which is looked-up from constant/phaseProperties dictionary and the acceleration due to gravity which is read from the constant/g file if present or defaults to zero. The cloud properties are read from the constant/\<cloudName\>Properties dictionary in the usual manner. Example of function object specification: \verbatim particles { libs ("liblagrangianFunctionObjects.so"); type particles; } \endverbatim Usage \table Property | Description | Required | Default value type | Type name: particles | yes | U | Name of the v

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `viscosityModel` | 85 |
| `particles` | 94 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`parcelCloud.H`](../../../11-lagrangian/files/62/parcelcloud.h--62b7502a5814.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`uniformDimensionedFields.H`](../../../05-finite-volume/files/4e/uniformdimensionedfields.h--4e5431e912f3.md)

## 8. 直接上层引用

- [src/lagrangian/functionObjects/particles/particles.C](../../../11-lagrangian/files/b3/particles.c--b38da31aca0f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
