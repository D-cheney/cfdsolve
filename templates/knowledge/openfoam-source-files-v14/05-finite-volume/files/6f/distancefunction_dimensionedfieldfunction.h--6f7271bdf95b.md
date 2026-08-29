---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6f7271bdf95b"
title: "OpenFOAM 14 源码解析：DistanceFunction_DimensionedFieldFunction.H"
summary: "该文件声明或实现 `DistanceFunction`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DistanceFunction/DistanceFunction_DimensionedFieldFunction.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：DistanceFunction_DimensionedFieldFunction.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DistanceFunction/DistanceFunction_DimensionedFieldFunction.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：150 行
- 文件标识：`6f7271bdf95b`

## 2. 功能说明

该文件声明或实现 `DistanceFunction`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Distance function internal and patch field initialisation function The field is initialised by evaluating the specified Foam::Function1 of distance in the given spatial direction. Usage To set a field with a linear ramp from 0 to 1 over the distance 1 starting at 0 in the x-direction: \verbatim internalField { type distanceFunction; direction (1 0 0); function { type linearRamp; duration 1; } } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DistanceFunction` | 78 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`DimensionedFieldFunction.H`](../../../05-finite-volume/files/74/dimensionedfieldfunction.h--747a4d63e312.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`DistanceFunction_DimensionedFieldFunction.C`](../../../05-finite-volume/files/d4/distancefunction_dimensionedfieldfunction.c--d43ec09c9a92.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/DistanceFunction/DistanceFunction_DimensionedFieldFunction.C](../../../05-finite-volume/files/d4/distancefunction_dimensionedfieldfunction.c--d43ec09c9a92.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/makeDimensionedPointFieldFunctions.C](../../../05-finite-volume/files/07/makedimensionedpointfieldfunctions.c--076e7be2abe6.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/makeDimensionedVolFieldFunctions.C](../../../05-finite-volume/files/80/makedimensionedvolfieldfunctions.c--809f37be6b8b.md)
- [src/finiteVolume/fields/fvPatchFields/DimensionedFvPatchFieldFunctions/makeDimensionedFvPatchFieldFunctions.C](../../../05-finite-volume/files/22/makedimensionedfvpatchfieldfunctions.c--2217a4ce5519.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
