---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c82cc54341ad"
title: "OpenFOAM 14 源码解析：alphatWallFunctionFvPatchScalarField.H"
summary: "该文件声明或实现 `alphatWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatWallFunction/alphatWallFunctionFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：alphatWallFunctionFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatWallFunction/alphatWallFunctionFvPatchScalarField.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：193 行
- 文件标识：`c82cc54341ad`

## 2. 功能说明

该文件声明或实现 `alphatWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：This boundary condition provides a turbulent thermal diffusivity condition when using wall functions - replicates OpenFOAM v1.5 (and earlier) behaviour The turbulent thermal diffusivity calculated using: \f[ \alpha_t = \frac{\mu_t}{Pr_t} \f] where \vartable \alpha_t| turbulence thermal diffusivity \mu_t | turbulence viscosity Pr_t | turblent Prandtl number \endvartable Usage \table Property | Description | Required | Default value nut | turbulence viscosity field name | no | nut Prt | turbulent Prandtl number | no | 0.85 \endtable Example of the boundary condition specification: \verbatim <patchName> { type alphatWallFunction; nut nut; Prt 0.85; value uniform 0; // optional value entry } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `alphatWallFunctionFvPatchScalarField` | 93 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fixedValueFvPatchFields.H`](../../../05-finite-volume/files/ff/fixedvaluefvpatchfields.h--ff21ae834f83.md)

## 8. 直接上层引用

- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatWallFunction/alphatWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/c8/alphatwallfunctionfvpatchscalarfield.c--c88dd817007c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
