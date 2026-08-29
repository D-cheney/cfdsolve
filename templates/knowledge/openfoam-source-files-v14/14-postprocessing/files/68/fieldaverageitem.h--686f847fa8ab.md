---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-686f847fa8ab"
title: "OpenFOAM 14 源码解析：fieldAverageItem.H"
summary: "该文件声明或实现 `Istream`、`fieldAverage`、`fieldAverageItem`、`iNew`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/fieldAverage/fieldAverageItem/fieldAverageItem.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：fieldAverageItem.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/fieldAverage/fieldAverageItem/fieldAverageItem.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：204 行
- 文件标识：`686f847fa8ab`

## 2. 功能说明

该文件声明或实现 `Istream`、`fieldAverage`、`fieldAverageItem`、`iNew`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Helper class to describe what form of averaging to apply. A set will be applied to each base field in Foam::fieldAverage, of the form: \verbatim { mean on; // (default = on) prime2Mean on; // (default = off) } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Istream` | 62 |
| `fieldAverage` | 66 |
| `fieldAverageItem` | 72 |
| `iNew` | 125 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`NamedEnum.H`](../../../04-core-runtime/files/34/namedenum.h--3437c5255062.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)

## 8. 直接上层引用

- [src/functionObjects/field/fieldAverage/fieldAverage.C](../../../14-postprocessing/files/39/fieldaverage.c--3960a22d913f.md)
- [src/functionObjects/field/fieldAverage/fieldAverageItem/fieldAverageItem.C](../../../14-postprocessing/files/46/fieldaverageitem.c--46f67b589f01.md)
- [src/functionObjects/field/fieldAverage/fieldAverageItem/fieldAverageItemIO.C](../../../14-postprocessing/files/f6/fieldaverageitemio.c--f6373accdd7b.md)
- [src/functionObjects/field/fieldAverage/fieldAverageTemplates.C](../../../14-postprocessing/files/b2/fieldaveragetemplates.c--b23d86c6ca01.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
