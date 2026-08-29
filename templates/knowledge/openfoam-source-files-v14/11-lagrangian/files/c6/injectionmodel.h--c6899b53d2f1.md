---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c6899b53d2f1"
title: "OpenFOAM 14 源码解析：InjectionModel.H"
summary: "该文件声明或实现 `InjectionModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Momentum/InjectionModel/InjectionModel/InjectionModel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：InjectionModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Momentum/InjectionModel/InjectionModel/InjectionModel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：412 行
- 文件标识：`c6899b53d2f1`

## 2. 功能说明

该文件声明或实现 `InjectionModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated injection model class. The injection model nominally describes the parcel: - position - diameter - velocity In this case, the fullyDescribed() flag should be set to 0 (false). When the parcel is then added to the cloud, the remaining properties are populated using values supplied in the constant properties. If, however, all of a parcel's properties are described in the model, the fullyDescribed() flag should be set to 1 (true).

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `InjectionModel` | 70 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`injectionModel.H`](../../../11-lagrangian/files/00/injectionmodel.h--00116ab18015.md)
- [`CloudSubModelBase.H`](../../../11-lagrangian/files/6a/cloudsubmodelbase.h--6a933e89d200.md)
- `particle.H`
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`InjectionModelI.H`](../../../11-lagrangian/files/5f/injectionmodeli.h--5f5edf9ce487.md)
- [`InjectionModel.C`](../../../11-lagrangian/files/69/injectionmodel.c--6991ed406727.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/CellZoneInjection/CellZoneInjection.H](../../../11-lagrangian/files/60/cellzoneinjection.h--6075235f312e.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/ConeInjection/ConeInjection.H](../../../11-lagrangian/files/0f/coneinjection.h--0f42b9e8e4c0.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/FieldActivatedInjection/FieldActivatedInjection.H](../../../11-lagrangian/files/53/fieldactivatedinjection.h--539aeebe9be6.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/InjectionModel/InjectionModel.C](../../../11-lagrangian/files/69/injectionmodel.c--6991ed406727.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/InjectionModel/InjectionModelI.H](../../../11-lagrangian/files/5f/injectionmodeli.h--5f5edf9ce487.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/InjectionModel/InjectionModelList.C](../../../11-lagrangian/files/1a/injectionmodellist.c--1aed3be0b601.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/InjectionModel/InjectionModelList.H](../../../11-lagrangian/files/8c/injectionmodellist.h--8c8002b8f92a.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/InjectionModel/InjectionModelNew.C](../../../11-lagrangian/files/86/injectionmodelnew.c--8628d14dd185.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/ManualInjection/ManualInjection.H](../../../11-lagrangian/files/d4/manualinjection.h--d40fca951f1e.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/MomentumLookupTableInjection/MomentumLookupTableInjection.H](../../../11-lagrangian/files/a3/momentumlookuptableinjection.h--a309f55f30a3.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/NoInjection/NoInjection.H](../../../11-lagrangian/files/c8/noinjection.h--c81c596b0137.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchFlowRateInjection/PatchFlowRateInjection.H](../../../11-lagrangian/files/69/patchflowrateinjection.h--69bb58fc469d.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchInjection/PatchInjection.H](../../../11-lagrangian/files/e3/patchinjection.h--e30a81f894ad.md)
- [src/lagrangian/parcel/submodels/Reacting/InjectionModel/ReactingLookupTableInjection/ReactingLookupTableInjection.H](../../../11-lagrangian/files/1d/reactinglookuptableinjection.h--1dc18518752b.md)
- [src/lagrangian/parcel/submodels/ReactingMultiphase/InjectionModel/ReactingMultiphaseLookupTableInjection/ReactingMultiphaseLookupTableInjection.H](../../../11-lagrangian/files/f8/reactingmultiphaselookuptableinjection.h--f866b6e3c30b.md)
- [src/lagrangian/parcel/submodels/Thermodynamic/InjectionModel/ThermoLookupTableInjection/ThermoLookupTableInjection.H](../../../11-lagrangian/files/20/thermolookuptableinjection.h--200a3c325782.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
