---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f61d8b7b6dd2"
title: "OpenFOAM 14 源码解析：basicThermo.H"
summary: "该文件声明或实现 `basicThermo`、`implementation`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/basicThermo/basicThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：basicThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/basicThermo/basicThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：605 行
- 文件标识：`f61d8b7b6dd2`

## 2. 功能说明

该文件声明或实现 `basicThermo`、`implementation`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Base-class for fluid and solid thermodynamic properties. The basicThermo class is the pure virtual interface, plus static data and functions, including the selection table. It is default-constructable and holds no non-static data. The basicThermo::implementation class contains the class data, non-default construction and other implementation details. This structure allows for arbitrary mixing of the interfaces. Derived levels should implement a similar separation of interface and implementation. All interface classes should be default-constructable, and should be inherited virtually into whatever interfaces are required. Implementation classes should virtually inherit from their corresponding interface class and *not* a lower level implementation class. In derived levels that are complete enough to act as the base of a thermodynamic instantiation, an additional *::composite sub class sho

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `basicThermo` | 83 |
| `implementation` | 137 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `phasePropertyName` | 227 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`physicalProperties.H`](../../../08-thermophysical/files/f7/physicalproperties.h--f79cf56c6a0d.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`wordIOList.H`](../../../04-core-runtime/files/e3/wordiolist.h--e3ac3c405053.md)
- [`basicThermoTemplates.C`](../../../08-thermophysical/files/4b/basicthermotemplates.c--4b406e13a151.md)

## 8. 直接上层引用

- [applications/modules/shockFluid/derivedFvPatchFields/T/smoluchowskiJumpTFvPatchScalarField.C](../../../02-solver-modules/files/13/smoluchowskijumptfvpatchscalarfield.c--138eaec96408.md)
- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeff.C](../../../14-postprocessing/files/74/wallheattransfercoeff.c--74b3d3622019.md)
- [src/fvConstraints/fixedTemperature/fixedTemperature.C](../../../12-boundaries-sources/files/cb/fixedtemperature.c--cb8da008efe0.md)
- [src/fvConstraints/limitTemperature/limitTemperature.C](../../../12-boundaries-sources/files/63/limittemperature.c--63bb31738144.md)
- [src/fvModels/general/buoyancyEnergy/buoyancyEnergy.C](../../../12-boundaries-sources/files/cf/buoyancyenergy.c--cf364bae15be.md)
- [src/fvModels/general/effectivenessHeatExchanger/effectivenessHeatExchanger.C](../../../12-boundaries-sources/files/f3/effectivenessheatexchanger.c--f31db6734663.md)
- [src/fvModels/general/heatSource/heatSource.C](../../../12-boundaries-sources/files/b1/heatsource.c--b15e8d8e7b25.md)
- [src/fvModels/general/solidElectricalConduction/solidElectricalConduction.C](../../../12-boundaries-sources/files/1b/solidelectricalconduction.c--1b437c9b39f5.md)
- [src/fvModels/general/solidificationMelting/solidificationMelting.C](../../../12-boundaries-sources/files/28/solidificationmelting.c--28dbbd9ceabf.md)
- [src/fvModels/general/viscousHeating/viscousHeating.C](../../../12-boundaries-sources/files/f9/viscousheating.c--f903427be699.md)
- [src/fvModels/general/volumeSource/volumeSource.C](../../../12-boundaries-sources/files/7a/volumesource.c--7a65324192b4.md)
- [src/fvModels/general/zeroDimensionalMassSource/zeroDimensionalMassSource.C](../../../12-boundaries-sources/files/a2/zerodimensionalmasssource.c--a28b1bdd357f.md)
- [src/fvModels/general/zeroDimensionalMassSource/zeroDimensionalMassSourceBase.C](../../../12-boundaries-sources/files/6e/zerodimensionalmasssourcebase.c--6e37fb1b4564.md)
- [src/fvModels/interRegion/heatTransfer/heatTransfer.C](../../../12-boundaries-sources/files/a5/heattransfer.c--a5df118da76c.md)
- [src/fvModels/interRegion/interRegionHeatTransfer/interRegionHeatTransfer.C](../../../12-boundaries-sources/files/10/interregionheattransfer.c--10b56952e713.md)
- [src/Lagrangian/cloud/clouds/coupledToThermalFluid/coupledToThermalFluid.C](../../../11-lagrangian/files/a8/coupledtothermalfluid.c--a8cc2ea3197f.md)
- [src/Lagrangian/LagrangianThermo/basicLagrangianThermo/basicLagrangianThermoTemplates.C](../../../11-lagrangian/files/98/basiclagrangianthermotemplates.c--98309c7b63e7.md)
- [src/radiationModels/radiationModels/radiationModel/radiationModel.C](../../../17-other-libraries/files/41/radiationmodel.c--41d52fa2aec6.md)
- [src/radiationModels/sootModels/sootModel/sootModelNew.C](../../../17-other-libraries/files/07/sootmodelnew.c--079773d562e4.md)
- [src/specieTransfer/derivedFvPatchFields/specieTransferVelocity/specieTransferVelocityFvPatchVectorField.C](../../../08-thermophysical/files/9d/specietransfervelocityfvpatchvectorfield.c--9d19014ae181.md)
- [src/thermophysicalModels/basic/basicThermo/basicThermo.C](../../../08-thermophysical/files/fd/basicthermo.c--fde783e68bbd.md)
- [src/thermophysicalModels/basic/basicThermo/basicThermoTemplates.C](../../../08-thermophysical/files/4b/basicthermotemplates.c--4b406e13a151.md)
- [src/thermophysicalModels/basic/derivedFvFieldSources/energy/energyFvScalarFieldSource.C](../../../08-thermophysical/files/b9/energyfvscalarfieldsource.c--b922680e5727.md)
- [src/thermophysicalModels/basic/derivedFvFieldSources/uniformFixedEnergyTemperature/uniformFixedEnergyTemperatureFvScalarFieldSource.C](../../../08-thermophysical/files/97/uniformfixedenergytemperaturefvscalarfieldsource.c--97b416249a7f.md)
- [src/thermophysicalModels/basic/derivedFvFieldSources/uniformInletOutletEnergyTemperature/uniformInletOutletEnergyTemperatureFvScalarFieldSource.C](../../../08-thermophysical/files/1b/uniforminletoutletenergytemperaturefvscalarfieldsource.c--1bc311c7f6bf.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
