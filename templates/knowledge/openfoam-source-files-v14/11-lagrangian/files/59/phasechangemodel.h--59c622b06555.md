---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-59c622b06555"
title: "OpenFOAM 14 源码解析：PhaseChangeModel.H"
summary: "该文件声明或实现 `PhaseChangeModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/PhaseChangeModel/PhaseChangeModel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：PhaseChangeModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/PhaseChangeModel/PhaseChangeModel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：249 行
- 文件标识：`59c622b06555`

## 2. 功能说明

该文件声明或实现 `PhaseChangeModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated phase change model class

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PhaseChangeModel` | 58 |

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
- [`PhaseChangeModel.C`](../../../11-lagrangian/files/c0/phasechangemodel.c--c063be1e45fc.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/ReactingCloud/ReactingCloud.C](../../../11-lagrangian/files/03/reactingcloud.c--03263e02f82b.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingParcel/ReactingParcel.C](../../../11-lagrangian/files/a1/reactingparcel.c--a1492ad16d78.md)
- [src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/LiquidEvaporation/LiquidEvaporation.H](../../../11-lagrangian/files/74/liquidevaporation.h--74ef12a8c3d4.md)
- [src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/LiquidEvaporationBoil/LiquidEvaporationBoil.H](../../../11-lagrangian/files/fb/liquidevaporationboil.h--fbddea6654c0.md)
- [src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/NoPhaseChange/NoPhaseChange.H](../../../11-lagrangian/files/ac/nophasechange.h--ac646c9e6454.md)
- [src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/PhaseChangeModel/PhaseChangeModel.C](../../../11-lagrangian/files/c0/phasechangemodel.c--c063be1e45fc.md)
- [src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/PhaseChangeModel/PhaseChangeModelNew.C](../../../11-lagrangian/files/57/phasechangemodelnew.c--5711815cb891.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
