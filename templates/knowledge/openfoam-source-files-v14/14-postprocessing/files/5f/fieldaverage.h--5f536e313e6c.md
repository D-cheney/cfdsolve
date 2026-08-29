---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5f536e313e6c"
title: "OpenFOAM 14 源码解析：fieldAverage.H"
summary: "该文件声明或实现 `fieldAverageItem`、`fieldAverage`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/fieldAverage/fieldAverage.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：fieldAverage.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/fieldAverage/fieldAverage.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：386 行
- 文件标识：`5f536e313e6c`

## 2. 功能说明

该文件声明或实现 `fieldAverageItem`、`fieldAverage`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Calculates average quantities for a user-specified selection of volumetric and surface fields. Fields are entered as a list of sub-dictionaries, which indicate the type of averages to perform, and can be updated during the calculation. The current options include: - \c mean: arithmetic mean - \c prime2Mean: prime-squared mean - \c base: average over 'time', or 'iteration' - \c window: optional averaging window, specified in 'base' units Average field names are constructed by concatenating the base field with the averaging type, e.g. when averaging field 'U', the resultant fields are: - arithmetic mean field, \c UMean - prime-squared field, \c UPrime2Mean Information regarding the number of averaging steps, and total averaging time are written on a per-field basis to the \c "<functionObject name>Properties" dictionary, located in \<time\>/uniform When restarting form a previous calculatio

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fieldAverageItem` | 126 |
| `fieldAverage` | 131 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `window` | 333 |

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`fieldAverageTemplates.C`](../../../14-postprocessing/files/b2/fieldaveragetemplates.c--b23d86c6ca01.md)

## 8. 直接上层引用

- [src/functionObjects/field/fieldAverage/fieldAverage.C](../../../14-postprocessing/files/39/fieldaverage.c--3960a22d913f.md)
- [src/functionObjects/field/fieldAverage/fieldAverageItem/fieldAverageItemIO.C](../../../14-postprocessing/files/f6/fieldaverageitemio.c--f6373accdd7b.md)
- [src/functionObjects/field/fieldAverage/fieldAverageTemplates.C](../../../14-postprocessing/files/b2/fieldaveragetemplates.c--b23d86c6ca01.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
