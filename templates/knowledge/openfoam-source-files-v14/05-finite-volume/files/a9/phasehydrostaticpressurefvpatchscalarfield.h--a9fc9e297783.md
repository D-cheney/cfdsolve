---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a9fc9e297783"
title: "OpenFOAM 14 源码解析：phaseHydrostaticPressureFvPatchScalarField.H"
summary: "该文件声明或实现 `phaseHydrostaticPressureFvPatchScalarField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/derived/phaseHydrostaticPressure/phaseHydrostaticPressureFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：phaseHydrostaticPressureFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/derived/phaseHydrostaticPressure/phaseHydrostaticPressureFvPatchScalarField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：260 行
- 文件标识：`a9fc9e297783`

## 2. 功能说明

该文件声明或实现 `phaseHydrostaticPressureFvPatchScalarField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：This boundary condition provides a phase-based hydrostatic pressure condition, calculated as: \f[ p_{hyd} = p_{ref} + \rho g (x - x_{ref}) \f] where \vartable p_{hyd} | hyrostatic pressure [Pa] p_{ref} | reference pressure [Pa] x_{ref} | reference point in Cartesian co-ordinates \rho | density (assumed uniform) g | acceleration due to gravity [m/s^2] \endtable The values are assigned according to the phase-fraction field: - 1: apply \\&#36;fp_{hyd}\\&#36;f - 0: apply a zero-gradient condition Usage \table Property | Description | Required | Default value phaseFraction | phase-fraction field name | no | alpha rho | density field name | no | rho pRefValue | reference pressure [Pa] | yes | pRefPoint | reference pressure location | yes | \endtable Example of the boundary condition specification: \verbatim <patchName> { type phaseHydrostaticPressure; phaseFraction alpha1; rho rho; pRefValue 1e5; pRefPo

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `phaseHydrostaticPressureFvPatchScalarField` | 97 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `rho` | 198 |
| `pRefValue` | 211 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`mixedFvPatchFields.H`](../../../05-finite-volume/files/fd/mixedfvpatchfields.h--fde273d73f26.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/derived/phaseHydrostaticPressure/phaseHydrostaticPressureFvPatchScalarField.C](../../../05-finite-volume/files/10/phasehydrostaticpressurefvpatchscalarfield.c--105cb141d976.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
