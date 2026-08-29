---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e820cc28dc94"
title: "OpenFOAM 14 源码解析：mappedValueFvPatchField.H"
summary: "该文件声明或实现 `mappedValueFvPatchField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/derived/mappedValue/mappedValueFvPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：mappedValueFvPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/derived/mappedValue/mappedValueFvPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：226 行
- 文件标识：`e820cc28dc94`

## 2. 功能说明

该文件声明或实现 `mappedValueFvPatchField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：This boundary condition maps the values from a neighbouring patch to this patch. Usage \table Property | Description | Required | Default value field | name of field to be mapped | no | this field name setAverage | set the average value? | no | yes if average \\ is specified, \\ no otherwise average | average value to apply | if setAverage is true | \endtable Example of the boundary condition specification: \verbatim <patchName> { type mappedValue; field T; average 300; value uniform 300; } \endverbatim This boundary condition will usually be applied to a patch which is of mappedPatchBase type, and which holds all the necessary mapping information. It can also create its own mapping data which overrides that in the mapped patch, or so that it can be applied to a non-mapped patch. This is triggered by the presence of controls relating to mappedPatchBase (i.e., neighbourRegion, neighbourPa

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `mappedValueFvPatchField` | 89 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fixedValueFvPatchFields.H`](../../../05-finite-volume/files/ff/fixedvaluefvpatchfields.h--ff21ae834f83.md)
- [`mappedPatchBase.H`](../../../07-mesh-geometry/files/ec/mappedpatchbase.h--ec75730251c5.md)
- [`mappedValueFvPatchField.C`](../../../05-finite-volume/files/f9/mappedvaluefvpatchfield.c--f90be17b25ed.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/derived/mappedValue/mappedValueFvPatchField.C](../../../05-finite-volume/files/f9/mappedvaluefvpatchfield.c--f90be17b25ed.md)
- [src/finiteVolume/fields/fvPatchFields/derived/mappedValue/mappedValueFvPatchFields.H](../../../05-finite-volume/files/22/mappedvaluefvpatchfields.h--221d28ca9faf.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
