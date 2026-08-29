---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d2d39720b940"
title: "OpenFOAM 14 源码解析：wideBand.H"
summary: "该文件声明或实现 `wideBand`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/radiationModels/absorptionEmissionModels/wideBand/wideBand.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：wideBand.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/radiationModels/absorptionEmissionModels/wideBand/wideBand.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：245 行
- 文件标识：`d2d39720b940`

## 2. 功能说明

该文件声明或实现 `wideBand`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：wideBand radiation absorption and emission coefficients for continuous phase. All the bands should have the same number of species and have to be entered in the same order. There is no check of continuity of the bands. They should not overlap or have gaps. The emission constant proportionality is specified per band (EhrrCoeff). The coefficients for the species have to be specified for use in moles x P [atm], i.e. (k[i] = species[i]*p*9.869231e-6). The lookup table file should be in the constant directory. Usage \verbatim absorptionEmissionModel wideBand; wideBand { band0 { bandLimits (1e-6 2.63e-6); CH4 { Tcommon 300; Tlow 300; Thigh 2500; invTemp false; loTcoeffs (0 0 0 0 0 0) ; hiTcoeffs (0.1 0 0 0 0 0); } CO2 { Tcommon 300; Tlow 300; Thigh 2500; invTemp false; loTcoeffs (0 0 0 0 0 0) ; hiTcoeffs (0.1 0 0 0 0 0); } H2O { Tcommon 300; Tlow 300; Thigh 2500; invTemp false; loTcoeffs (0 0 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `wideBand` | 128 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`interpolationLookUpTable.H`](../../../17-other-libraries/files/31/interpolationlookuptable.h--31a83490e87d.md)
- [`absorptionEmissionModel.H`](../../../17-other-libraries/files/71/absorptionemissionmodel.h--715f408c07d2.md)
- [`HashTable.H`](../../../04-core-runtime/files/cb/hashtable.h--cbcdb4c4948d.md)
- [`absorptionCoeffs.H`](../../../17-other-libraries/files/5e/absorptioncoeffs.h--5e333439d8e2.md)
- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)

## 8. 直接上层引用

- [src/radiationModels/absorptionEmissionModels/wideBand/wideBand.C](../../../17-other-libraries/files/af/wideband.c--af0ca24e1c4c.md)
- [src/radiationModels/derivedFvPatchFields/wideBandDiffusiveRadiation/wideBandDiffusiveRadiationMixedFvPatchScalarField.C](../../../17-other-libraries/files/80/widebanddiffusiveradiationmixedfvpatchscalarfield.c--80cc3168940f.md)
- [src/reactionModels/radiationModels/absorptionEmissionModels/wideBandReaction/wideBandReaction.H](../../../08-thermophysical/files/9c/widebandreaction.h--9c3e5b7c4a0f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
