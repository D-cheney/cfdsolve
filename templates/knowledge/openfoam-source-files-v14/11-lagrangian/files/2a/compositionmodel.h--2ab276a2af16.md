---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2ab276a2af16"
title: "OpenFOAM 14 源码解析：CompositionModel.H"
summary: "该文件声明或实现 `CompositionModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Reacting/CompositionModel/CompositionModel/CompositionModel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：CompositionModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Reacting/CompositionModel/CompositionModel/CompositionModel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：305 行
- 文件标识：`2ab276a2af16`

## 2. 功能说明

该文件声明或实现 `CompositionModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated reacting parcel composition model class Consists of carrier species (via thermo package), and additional liquids and solids

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `CompositionModel` | 61 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`CloudSubModelBase.H`](../../../11-lagrangian/files/6a/cloudsubmodelbase.h--6a933e89d200.md)
- [`parcelThermo.H`](../../../11-lagrangian/files/b1/parcelthermo.h--b155f4a61149.md)
- [`fluidMulticomponentThermo.H`](../../../08-thermophysical/files/1f/fluidmulticomponentthermo.h--1f2b100c90da.md)
- [`phasePropertiesList.H`](../../../11-lagrangian/files/01/phasepropertieslist.h--018136918711.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`CompositionModel.C`](../../../11-lagrangian/files/7e/compositionmodel.c--7ed32048f016.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/ReactingCloud/ReactingCloud.C](../../../11-lagrangian/files/03/reactingcloud.c--03263e02f82b.md)
- [src/lagrangian/parcel/clouds/Templates/ThermoCloud/ThermoCloud.C](../../../11-lagrangian/files/3e/thermocloud.c--3e895abe9081.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingMultiphaseParcel/ReactingMultiphaseParcel.C](../../../11-lagrangian/files/65/reactingmultiphaseparcel.c--65879af47a1f.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingParcel/ReactingParcel.C](../../../11-lagrangian/files/a1/reactingparcel.c--a1492ad16d78.md)
- [src/lagrangian/parcel/parcels/Templates/SprayParcel/SprayParcel.C](../../../11-lagrangian/files/95/sprayparcel.c--95f0d1b79720.md)
- [src/lagrangian/parcel/submodels/Reacting/CompositionModel/CompositionModel/CompositionModel.C](../../../11-lagrangian/files/7e/compositionmodel.c--7ed32048f016.md)
- [src/lagrangian/parcel/submodels/Reacting/CompositionModel/CompositionModel/CompositionModelNew.C](../../../11-lagrangian/files/85/compositionmodelnew.c--85de799eeefe.md)
- [src/lagrangian/parcel/submodels/Reacting/CompositionModel/NoComposition/NoComposition.H](../../../11-lagrangian/files/b4/nocomposition.h--b4910d49e4b9.md)
- [src/lagrangian/parcel/submodels/Reacting/CompositionModel/SingleMixtureFraction/SingleMixtureFraction.H](../../../11-lagrangian/files/51/singlemixturefraction.h--5114ba2c1685.md)
- [src/lagrangian/parcel/submodels/Reacting/CompositionModel/SinglePhaseMixture/SinglePhaseMixture.H](../../../11-lagrangian/files/96/singlephasemixture.h--96049240de2a.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
