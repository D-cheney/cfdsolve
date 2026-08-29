---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-47d8827492e2"
title: "OpenFOAM 14 源码解析：temperatureDependentContactAngle.H"
summary: "该文件声明或实现 `temperatureDependent`，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceProperties/contactAngleModels/temperatureDependent/temperatureDependentContactAngle.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：temperatureDependentContactAngle.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceProperties/contactAngleModels/temperatureDependent/temperatureDependentContactAngle.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：141 行
- 文件标识：`47d8827492e2`

## 2. 功能说明

该文件声明或实现 `temperatureDependent`，属于“多相与界面”模块。

中文导航角色：两相流与界面模型。

上游说明：Temperature-dependent contact angle model. The contact angle is evaluated from the specified Foam::Function1 for the temperature field looked-up from the mesh database the name of which may optionally be provided. Usage \table Property | Description | Required | Default value T | Temperature field name | no | T contactAngle | contact angle function | yes | \endtable Example of the contact angle specification: \verbatim contactAngle { type temperatureDependent; contactAngle constant 0.07; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `temperatureDependent` | 82 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`contactAngleModel.H`](../../../10-multiphase/files/91/contactanglemodel.h--9107890df127.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/twoPhaseModels/interfaceProperties/contactAngleModels/temperatureDependent/temperatureDependentContactAngle.C](../../../10-multiphase/files/ac/temperaturedependentcontactangle.c--ac186fd79f2b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
