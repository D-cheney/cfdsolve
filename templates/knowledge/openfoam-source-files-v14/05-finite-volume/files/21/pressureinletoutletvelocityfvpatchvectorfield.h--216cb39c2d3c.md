---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-216cb39c2d3c"
title: "OpenFOAM 14 源码解析：pressureInletOutletVelocityFvPatchVectorField.H"
summary: "该文件声明或实现 `pressureInletOutletVelocityFvPatchVectorField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/derived/pressureInletOutletVelocity/pressureInletOutletVelocityFvPatchVectorField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pressureInletOutletVelocityFvPatchVectorField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/derived/pressureInletOutletVelocity/pressureInletOutletVelocityFvPatchVectorField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：226 行
- 文件标识：`216cb39c2d3c`

## 2. 功能说明

该文件声明或实现 `pressureInletOutletVelocityFvPatchVectorField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Velocity inlet/outlet boundary condition for patches where the pressure is specified in some manner, e.g. fixedValue, totalPressure, entrainmentPressure etc. This boundary condition is directionMixed: Flux outflow: zeroGradient condition Flux inflow: zeroGradient condition for normal component fixedValue for tangential component The external tangential velocity can be optionally specified otherwise it is assumed zero. Usage \table Property | Description | Required | Default value phi | flux field name | no | phi tangentialVelocity | tangential velocity | no | value | initial velocity | no | evaluated \endtable Example of the boundary condition specification: \verbatim <patchName> { type pressureInletOutletVelocity; tangentialVelocity \&#36;internalField; } \endverbatim The \c tangentialVelocity entry is a \c UFunctionalDimensionedField providing total flexibility in the specification of the t

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pressureInletOutletVelocityFvPatchVectorField` | 94 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`directionMixedFvPatchFields.H`](../../../05-finite-volume/files/51/directionmixedfvpatchfields.h--51ac24353492.md)
- [`UFunctionalDimensionedField.H`](../../../05-finite-volume/files/ee/ufunctionaldimensionedfield.h--eef8dfcc1993.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/derived/pressureInletOutletVelocity/pressureInletOutletVelocityFvPatchVectorField.C](../../../05-finite-volume/files/86/pressureinletoutletvelocityfvpatchvectorfield.c--86c13bf5688c.md)
- [src/finiteVolume/fields/fvPatchFields/derived/rotatingPressureInletOutletVelocity/rotatingPressureInletOutletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/07/rotatingpressureinletoutletvelocityfvpatchvectorfield.h--07e0b877cf46.md)
- [src/finiteVolume/fields/fvPatchFields/derived/totalPressure/totalPressureFvPatchScalarField.C](../../../05-finite-volume/files/b3/totalpressurefvpatchscalarfield.c--b37d5b5b0943.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
