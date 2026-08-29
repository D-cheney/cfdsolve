---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4a00be15d767"
title: "OpenFOAM 14 源码解析：externalTemperatureFvPatchScalarField.H"
summary: "该文件声明或实现 `externalTemperatureFvPatchScalarField`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalTemperature/externalTemperatureFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：externalTemperatureFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalTemperature/externalTemperatureFvPatchScalarField.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：286 行
- 文件标识：`4a00be15d767`

## 2. 功能说明

该文件声明或实现 `externalTemperatureFvPatchScalarField`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：This boundary condition applies a heat flux condition to temperature on an external wall. Heat flux can be specified in the following ways: - Fixed power: requires \c Q - Fixed heat flux: requires \c q - Fixed heat transfer coefficient: requires \c h and \c Ta where: \vartable Q | Power Function1 of time [W] q | Heat flux Function1 of time [W/m^2] h | Heat transfer coefficient DimensionedFieldFunction [W/m^2/K] Ta | Ambient temperature Function1 of time [K] \endvartable Only one of \c Q or \c q may be specified, if \c h and \c Ta are also specified the corresponding heat-flux is added. The patch thermal conductivity \c kappa is obtained from the region thermophysicalTransportModel so that this boundary condition can be applied directly to either fluid or solid regions. Usage \table Property | Description | Required | Default value Q | Power [W] | no | q | Heat flux [W/m^2] | no | h | Hea

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `externalTemperatureFvPatchScalarField` | 106 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`mixedFvPatchFields.H`](../../../05-finite-volume/files/fd/mixedfvpatchfields.h--fde273d73f26.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`FunctionalDimensionedFieldFwd.H`](../../../05-finite-volume/files/6a/functionaldimensionedfieldfwd.h--6a95e78a006b.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/thermophysicalTransportModels/derivedFvPatchFields/multiphaseExternalTemperature/multiphaseExternalTemperatureFvPatchScalarField.H](../../../02-solver-modules/files/6b/multiphaseexternaltemperaturefvpatchscalarfield.h--6be8cfe5ea63.md)
- [src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalTemperature/externalTemperatureFvPatchScalarField.C](../../../09-turbulence-transport/files/0c/externaltemperaturefvpatchscalarfield.c--0c64da0c2f71.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
