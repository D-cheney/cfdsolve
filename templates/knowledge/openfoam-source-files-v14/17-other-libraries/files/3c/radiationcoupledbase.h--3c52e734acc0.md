---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3c52e734acc0"
title: "OpenFOAM 14 源码解析：radiationCoupledBase.H"
summary: "该文件声明或实现 `radiationCoupledBase`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/radiationModels/derivedFvPatchFields/radiationCoupledBase/radiationCoupledBase.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：radiationCoupledBase.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/radiationModels/derivedFvPatchFields/radiationCoupledBase/radiationCoupledBase.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：173 行
- 文件标识：`3c52e734acc0`

## 2. 功能说明

该文件声明或实现 `radiationCoupledBase`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Common functions to emissivity. It gets supplied from lookup into a dictionary or calculated by the solidThermo: - 'lookup' : Read the patch emissivity field from the dictionary - 'solidRadiation' : Use the emissivity field mapped from the adjacent solid

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `radiationCoupledBase` | 61 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `emissivityMethod` | 141 |

## 5. 算法与控制流程

1. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`NamedEnum.H`](../../../04-core-runtime/files/34/namedenum.h--3437c5255062.md)
- [`fvPatch.H`](../../../05-finite-volume/files/c6/fvpatch.h--c645cd2545f4.md)
- [`fieldMapper.H`](../../../04-core-runtime/files/96/fieldmapper.h--9635053bfe32.md)

## 8. 直接上层引用

- [src/radiationModels/derivedFvPatchFields/greyDiffusiveRadiation/greyDiffusiveRadiationMixedFvPatchScalarField.H](../../../17-other-libraries/files/6a/greydiffusiveradiationmixedfvpatchscalarfield.h--6aab39f3f588.md)
- [src/radiationModels/derivedFvPatchFields/greyDiffusiveViewFactor/greyDiffusiveViewFactorFixedValueFvPatchScalarField.H](../../../17-other-libraries/files/68/greydiffusiveviewfactorfixedvaluefvpatchscalarfield.h--683a1ec568c5.md)
- [src/radiationModels/derivedFvPatchFields/MarshakRadiation/MarshakRadiationFvPatchScalarField.H](../../../17-other-libraries/files/a3/marshakradiationfvpatchscalarfield.h--a30515b4fc22.md)
- [src/radiationModels/derivedFvPatchFields/MarshakRadiationFixedTemperature/MarshakRadiationFixedTemperatureFvPatchScalarField.H](../../../17-other-libraries/files/67/marshakradiationfixedtemperaturefvpatchscalarfield.h--67be8b188f0e.md)
- [src/radiationModels/derivedFvPatchFields/radiationCoupledBase/radiationCoupledBase.C](../../../17-other-libraries/files/fa/radiationcoupledbase.c--fac1b1f7c60d.md)
- [src/radiationModels/derivedFvPatchFields/wideBandDiffusiveRadiation/wideBandDiffusiveRadiationMixedFvPatchScalarField.H](../../../17-other-libraries/files/c9/widebanddiffusiveradiationmixedfvpatchscalarfield.h--c9d7eb42e642.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
