---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-92c678f96b8a"
title: "OpenFOAM 14 源码解析：DevolatilisationModel.H"
summary: "该文件声明或实现 `DevolatilisationModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/DevolatilisationModel/DevolatilisationModel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：DevolatilisationModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/DevolatilisationModel/DevolatilisationModel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：200 行
- 文件标识：`92c678f96b8a`

## 2. 功能说明

该文件声明或实现 `DevolatilisationModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated devolatilisation model class

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DevolatilisationModel` | 58 |

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
- [`CloudSubModelBase.H`](../../../11-lagrangian/files/6a/cloudsubmodelbase.h--6a933e89d200.md)
- [`DevolatilisationModel.C`](../../../11-lagrangian/files/4b/devolatilisationmodel.c--4bd6ffb11d73.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/ReactingMultiphaseCloud/ReactingMultiphaseCloud.C](../../../11-lagrangian/files/cc/reactingmultiphasecloud.c--cc167f9166b3.md)
- [src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/ConstantRateDevolatilisation/ConstantRateDevolatilisation.H](../../../11-lagrangian/files/b5/constantratedevolatilisation.h--b5e4ac03d0a0.md)
- [src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/DevolatilisationModel/DevolatilisationModel.C](../../../11-lagrangian/files/4b/devolatilisationmodel.c--4bd6ffb11d73.md)
- [src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/DevolatilisationModel/DevolatilisationModelNew.C](../../../11-lagrangian/files/3e/devolatilisationmodelnew.c--3e06b6f22119.md)
- [src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/NoDevolatilisation/NoDevolatilisation.H](../../../11-lagrangian/files/79/nodevolatilisation.h--79c273cfaf17.md)
- [src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/SingleKineticRateDevolatilisation/SingleKineticRateDevolatilisation.H](../../../11-lagrangian/files/94/singlekineticratedevolatilisation.h--944906faec75.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
