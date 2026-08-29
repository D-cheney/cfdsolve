---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3a5df0a38959"
title: "OpenFOAM 14 源码解析：BreakupModel.H"
summary: "该文件声明或实现 `BreakupModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Spray/BreakupModel/BreakupModel/BreakupModel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：BreakupModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Spray/BreakupModel/BreakupModel/BreakupModel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：240 行
- 文件标识：`3a5df0a38959`

## 2. 功能说明

该文件声明或实现 `BreakupModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated break-up model class

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `BreakupModel` | 57 |

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
- [`BreakupModel.C`](../../../11-lagrangian/files/09/breakupmodel.c--09baea3f8962.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/SprayCloud/SprayCloud.C](../../../11-lagrangian/files/c9/spraycloud.c--c9df0c30d626.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/BreakupModel/BreakupModel.C](../../../11-lagrangian/files/09/breakupmodel.c--09baea3f8962.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/BreakupModel/BreakupModelNew.C](../../../11-lagrangian/files/c9/breakupmodelnew.c--c9c4922cb1ae.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/ETAB/ETAB.H](../../../11-lagrangian/files/71/etab.h--718db79d2924.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/NoBreakup/NoBreakup.H](../../../11-lagrangian/files/fd/nobreakup.h--fd307aa25e84.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/PilchErdman/PilchErdman.H](../../../11-lagrangian/files/b0/pilcherdman.h--b0bfe8315ae0.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/ReitzDiwakar/ReitzDiwakar.H](../../../11-lagrangian/files/0a/reitzdiwakar.h--0a7b78635532.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/ReitzKHRT/ReitzKHRT.H](../../../11-lagrangian/files/e4/reitzkhrt.h--e4f2069909dc.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/SHF/SHF.H](../../../11-lagrangian/files/bc/shf.h--bca1a760ccca.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/TAB/TAB.H](../../../11-lagrangian/files/71/tab.h--71d863268e74.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
