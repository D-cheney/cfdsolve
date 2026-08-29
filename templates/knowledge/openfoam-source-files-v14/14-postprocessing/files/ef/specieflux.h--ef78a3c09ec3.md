---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ef78a3c09ec3"
title: "OpenFOAM 14 源码解析：specieFlux.H"
summary: "该文件声明或实现 `fluidThermophysicalTransportModel`、`specieFluxBase`、`specieFlux`、`specieAdvectiveFlux`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/specieFlux/specieFlux.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：specieFlux.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/specieFlux/specieFlux.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：279 行
- 文件标识：`ef78a3c09ec3`

## 2. 功能说明

该文件声明或实现 `fluidThermophysicalTransportModel`、`specieFluxBase`、`specieFlux`、`specieAdvectiveFlux`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：These functions calculate the specie-flux and write it as a surfaceScalarField called 'specie<Type>Flux(<specieName>)'. There are three such functions; specieAdvectiveFlux and specieDiffusiveFlux return the advective and diffusive parts of the flux, respectively, and specieFlux returns the total combined flux. Example of function object specification: \verbatim specieFlux { type specieFlux; // specieAdvectiveFlux, specieDiffusiveFlux libs ("libfieldFunctionObjects.so"); field NH3; } \endverbatim Or, using the standard configuration: \verbatim #includeFunc specieFlux(NH3) \endverbatim Usage \table Property | Description | Required | Default value type | Type name: specieFlux, \\ specieAdvectiveFlux, or \\ specieDiffusiveFlux | yes | field | Name of the specie/mass \\ fraction field | yes | schemesField | Name of the field from \\ which schemes are taken | no | Yi phase | Name of the phase

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fluidThermophysicalTransportModel` | 85 |
| `specieFluxBase` | 94 |
| `specieFlux` | 159 |
| `specieAdvectiveFlux` | 197 |
| `specieDiffusiveFlux` | 235 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fieldExpression.H`](../../../14-postprocessing/files/c1/fieldexpression.h--c150d7cc74ee.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`surfaceFieldsFwd.H`](../../../05-finite-volume/files/e4/surfacefieldsfwd.h--e4d506ea371b.md)

## 8. 直接上层引用

- [src/functionObjects/field/specieFlux/specieFlux.C](../../../14-postprocessing/files/9a/specieflux.c--9a4bfd35e978.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
