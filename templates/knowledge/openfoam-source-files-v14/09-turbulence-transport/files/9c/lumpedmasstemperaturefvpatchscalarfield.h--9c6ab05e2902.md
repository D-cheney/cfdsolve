---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9c6ab05e2902"
title: "OpenFOAM 14 源码解析：lumpedMassTemperatureFvPatchScalarField.H"
summary: "该文件声明或实现 `lumpedMassTemperatureFvPatchScalarField`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/lumpedMassTemperature/lumpedMassTemperatureFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：lumpedMassTemperatureFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/lumpedMassTemperature/lumpedMassTemperatureFvPatchScalarField.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：225 行
- 文件标识：`9c6ab05e2902`

## 2. 功能说明

该文件声明或实现 `lumpedMassTemperatureFvPatchScalarField`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：This boundary condition is applied to a patch which bounds a solid body, wholly or partially. It represents the body as a lumped mass, i.e. by a single temperature \c T which is fixed across the patch. The body has a volume \c V which is either specified by the user, or is calculated when the patch describes a closed volume (including in 2D meshes). Starting from an initial, specified \c T, the change in temperature is calculated over time according to an applied power source \c Q and the heat transferred across the boundary \&#36;Q_{b}\&#36; (positive into the lumped mass): \f[ dT/dt = frac{Q + Q_{b}}{\rho C_{v} V} \f] where \vartable Q | specified power source [W] Q_{b} | total calculated heat transferred across the boundary [W] \rho | density [kg/m^3] C_{v} | specific heat capacity [J/(kg K)] V | volume of the lumped mass [m^3} \endtable Usage \table Property | Description | Req'd? | Defaul

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `lumpedMassTemperatureFvPatchScalarField` | 99 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fixedValueFvPatchFields.H`](../../../05-finite-volume/files/ff/fixedvaluefvpatchfields.h--ff21ae834f83.md)
- [`UniformDimensionedField.H`](../../../05-finite-volume/files/b1/uniformdimensionedfield.h--b19d8b85e336.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/lumpedMassTemperature/lumpedMassTemperatureFvPatchScalarField.C](../../../09-turbulence-transport/files/71/lumpedmasstemperaturefvpatchscalarfield.c--71a85b4348cb.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
