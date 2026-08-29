---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9107890df127"
title: "OpenFOAM 14 源码解析：contactAngleModel.H"
summary: "该文件声明或实现 `contactAngleModel`，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceProperties/contactAngleModels/contactAngleModel/contactAngleModel.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：contactAngleModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceProperties/contactAngleModels/contactAngleModel/contactAngleModel.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：149 行
- 文件标识：`9107890df127`

## 2. 功能说明

该文件声明或实现 `contactAngleModel`，属于“多相与界面”模块。

中文导航角色：两相流与界面模型。

上游说明：Abstract base-class for contact-angle models which return the cosine contact angle field. Usage Example of the surface tension specification: \verbatim contactAngle { type <contact angle model type>; <coefficient name> <coefficient value>; . . . } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `contactAngleModel` | 70 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvPatchFields.H`](../../../05-finite-volume/files/aa/fvpatchfields.h--aad5a99ecf68.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/derivedFvPatchFields/filmContactAngle/filmContactAngleFvPatchScalarField.H](../../../02-solver-modules/files/d2/filmcontactanglefvpatchscalarfield.h--d20635704b29.md)
- [src/twoPhaseModels/interfaceProperties/contactAngle/contactAngleFvPatchScalarField.H](../../../10-multiphase/files/64/contactanglefvpatchscalarfield.h--64ea260f0a7a.md)
- [src/twoPhaseModels/interfaceProperties/contactAngleModels/constant/constantContactAngle.H](../../../10-multiphase/files/69/constantcontactangle.h--6929e17ce4cc.md)
- [src/twoPhaseModels/interfaceProperties/contactAngleModels/contactAngleModel/contactAngleModel.C](../../../10-multiphase/files/32/contactanglemodel.c--3279ec4e0019.md)
- [src/twoPhaseModels/interfaceProperties/contactAngleModels/contactAngleModel/contactAngleModelNew.C](../../../10-multiphase/files/86/contactanglemodelnew.c--86f46708bcf6.md)
- [src/twoPhaseModels/interfaceProperties/contactAngleModels/dynamic/dynamicContactAngle.H](../../../10-multiphase/files/88/dynamiccontactangle.h--88b9bace0bf7.md)
- [src/twoPhaseModels/interfaceProperties/contactAngleModels/gravitational/gravitationalContactAngle.H](../../../10-multiphase/files/a8/gravitationalcontactangle.h--a80fa8ec187e.md)
- [src/twoPhaseModels/interfaceProperties/contactAngleModels/temperatureDependent/temperatureDependentContactAngle.H](../../../10-multiphase/files/47/temperaturedependentcontactangle.h--47d8827492e2.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
