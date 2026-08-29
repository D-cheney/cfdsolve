---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-19ce9c880850"
title: "OpenFOAM 14 源码解析：sootModel.H"
summary: "该文件声明或实现 `sootModel`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/radiationModels/sootModels/sootModel/sootModel.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：sootModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/radiationModels/sootModels/sootModel/sootModel.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：143 行
- 文件标识：`19ce9c880850`

## 2. 功能说明

该文件声明或实现 `sootModel`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base class for soot models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `sootModel` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)

## 8. 直接上层引用

- [src/radiationModels/radiationModels/radiationModel/radiationModel.C](../../../17-other-libraries/files/41/radiationmodel.c--41d52fa2aec6.md)
- [src/radiationModels/sootModels/noSoot/noSoot.H](../../../17-other-libraries/files/a9/nosoot.h--a9eecb24bc43.md)
- [src/radiationModels/sootModels/sootModel/makeThermoSootModel.H](../../../17-other-libraries/files/6d/makethermosootmodel.h--6d483e25cb19.md)
- [src/radiationModels/sootModels/sootModel/sootModel.C](../../../17-other-libraries/files/66/sootmodel.c--665e52675247.md)
- [src/radiationModels/sootModels/sootModel/sootModelNew.C](../../../17-other-libraries/files/07/sootmodelnew.c--079773d562e4.md)
- [src/reactionModels/radiationModels/sootModels/mixtureFraction/mixtureFraction.H](../../../08-thermophysical/files/6f/mixturefraction.h--6f9fe89bfc69.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
