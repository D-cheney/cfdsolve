---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6a4c6bcda31f"
title: "OpenFOAM 14 源码解析：phaseModel.H"
summary: "该文件实现 `phaseModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/phaseModel/phaseModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：phaseModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/phaseModel/phaseModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：420 行
- 文件标识：`6a4c6bcda31f`

## 2. 功能说明

该文件实现 `phaseModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `phaseSystem` | 53 |
| `diameterModel` | 55 |
| `phaseModel` | 60 |
| `iNew` | 136 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`dimensionedScalar.H`](../../../04-core-runtime/files/94/dimensionedscalar.h--94226c94054a.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`fvMatricesFwd.H`](../../../05-finite-volume/files/c0/fvmatricesfwd.h--c0b6e3525b0b.md)
- [`rhoFluidThermo.H`](../../../08-thermophysical/files/e6/rhofluidthermo.h--e68eb3d5b8b1.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/phaseTurbulenceStabilisation/phaseTurbulenceStabilisation.H](../../../02-solver-modules/files/ce/phaseturbulencestabilisation.h--ceed93a68c31.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/departureDiameterModels/departureDiameterModel/departureDiameterModel.H](../../../02-solver-modules/files/62/departurediametermodel.h--62ed4aa3816d.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/departureFrequencyModels/departureFrequencyModel/departureFrequencyModel.H](../../../02-solver-modules/files/c9/departurefrequencymodel.h--c90dfbd63ecf.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/nucleationSiteModels/nucleationSiteModel/nucleationSiteModel.H](../../../02-solver-modules/files/b9/nucleationsitemodel.h--b9a4e3acd390.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/frictionalStressModel/frictionalStressModel/frictionalStressModel.H](../../../02-solver-modules/files/c0/frictionalstressmodel.h--c0108992b2e4.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/kineticTheoryModel/kineticTheoryModel.H](../../../02-solver-modules/files/ac/kinetictheorymodel.h--accedfde16f8.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/phasePressureModel/phasePressureModel.H](../../../02-solver-modules/files/a4/phasepressuremodel.h--a4af1831149f.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/diameterModel/diameterModel.H](../../../02-solver-modules/files/05/diametermodel.h--05dead0a1c2d.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/interfaceCompositionModels/interfaceCompositionModel/interfaceCompositionModel.C](../../../02-solver-modules/files/cb/interfacecompositionmodel.c--cb27647d5858.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseInterface/phaseInterface/phaseInterface.H](../../../02-solver-modules/files/2c/phaseinterface.h--2c84bd3e0874.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseInterface/phaseInterfaceKey/phaseInterfaceKey.C](../../../02-solver-modules/files/04/phaseinterfacekey.c--04951c8e6f98.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModel/phaseModel.C](../../../02-solver-modules/files/4e/phasemodel.c--4ec5b563e4b8.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModel/phaseModelNew.C](../../../02-solver-modules/files/02/phasemodelnew.c--02a3391b6014.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/InertPhaseModel/InertPhaseModel.H](../../../02-solver-modules/files/09/inertphasemodel.h--091572f6235e.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/MovingPhaseModel/MovingPhaseModel.H](../../../02-solver-modules/files/de/movingphasemodel.h--de4ce986f741.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/MulticomponentPhaseModel/MulticomponentPhaseModel.H](../../../02-solver-modules/files/a2/multicomponentphasemodel.h--a22b23814957.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/phaseModels.C](../../../02-solver-modules/files/a1/phasemodels.c--a128ef34cd1e.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/PurePhaseModel/PurePhaseModel.H](../../../02-solver-modules/files/7a/purephasemodel.h--7a4fd27878df.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/ReactingPhaseModel/ReactingPhaseModel.H](../../../02-solver-modules/files/c9/reactingphasemodel.h--c98a8fae2293.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/SolidIsothermalPhaseModel/SolidIsothermalPhaseModel.H](../../../02-solver-modules/files/f5/solidisothermalphasemodel.h--f59515658855.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/SolidThermalPhaseModel/SolidThermalPhaseModel.H](../../../02-solver-modules/files/8c/solidthermalphasemodel.h--8c99852ff083.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/SolidThermoPhaseModel/SolidThermoPhaseModel.H](../../../02-solver-modules/files/ca/solidthermophasemodel.h--cae17e03c311.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/StationaryPhaseModel/StationaryPhaseModel.H](../../../02-solver-modules/files/a5/stationaryphasemodel.h--a5e00f417bde.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/ThermoPhaseModel/ThermoPhaseModel.H](../../../02-solver-modules/files/3a/thermophasemodel.h--3a3993300d1e.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/ThermophysicalTransportPhaseModel/ThermophysicalTransportPhaseModel.H](../../../02-solver-modules/files/4f/thermophysicaltransportphasemodel.h--4fa50dae5b8e.md)

## 9. 运行时机制

`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
