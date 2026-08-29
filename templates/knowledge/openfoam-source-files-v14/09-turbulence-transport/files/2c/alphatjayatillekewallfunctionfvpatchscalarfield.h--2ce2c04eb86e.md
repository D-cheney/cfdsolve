---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2ce2c04eb86e"
title: "OpenFOAM 14 源码解析：alphatJayatillekeWallFunctionFvPatchScalarField.H"
summary: "该文件声明或实现 `fluidThermophysicalTransportModel`、`alphatJayatillekeWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatJayatillekeWallFunction/alphatJayatillekeWallFunctionFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：alphatJayatillekeWallFunctionFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatJayatillekeWallFunction/alphatJayatillekeWallFunctionFvPatchScalarField.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：215 行
- 文件标识：`2ce2c04eb86e`

## 2. 功能说明

该文件声明或实现 `fluidThermophysicalTransportModel`、`alphatJayatillekeWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：This boundary condition provides a thermal wall function for turbulent thermal diffusivity (usually\c alphat) based on the Jayatilleke model. Usage \table Property | Description | Required | Default value Prt | turbulent Prandtl number | no | 0.85 \endtable Example of the boundary condition specification: \verbatim <patchName> { type alphatJayatillekeWallFunction; Prt 0.85; value uniform 0; } \endverbatim Note that other model constants (i.e., Cmu, kappa and E) are obtained from the corresponding turbulent viscosity boundary condition.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fluidThermophysicalTransportModel` | 74 |
| `alphatJayatillekeWallFunctionFvPatchScalarField` | 83 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fixedValueFvPatchFields.H`](../../../05-finite-volume/files/ff/fixedvaluefvpatchfields.h--ff21ae834f83.md)
- [`nutWallFunctionFvPatchScalarField.H`](../../../09-turbulence-transport/files/6c/nutwallfunctionfvpatchscalarfield.h--6c93d9fd221f.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.C](../../../02-solver-modules/files/cf/wallboiling.c--cf724a332c73.md)
- [applications/modules/multiphaseEuler/fvModels/wallCondensation/wallCondensation.C](../../../02-solver-modules/files/8a/wallcondensation.c--8ac7e61c3c3a.md)
- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatJayatillekeWallFunction/alphatJayatillekeWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/06/alphatjayatillekewallfunctionfvpatchscalarfield.c--06bfcfba5630.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
