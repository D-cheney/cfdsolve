---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-78ffb3c63d36"
title: "OpenFOAM 14 源码解析：phaseSystem.H"
summary: "该文件声明或实现 `surfaceTensionCoefficientModel`、`momentumTransferSystem`、`pressureReference`、`nonOrthogonalSolutionControl`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：phaseSystem.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：490 行
- 文件标识：`78ffb3c63d36`

## 2. 功能说明

该文件声明或实现 `surfaceTensionCoefficientModel`、`momentumTransferSystem`、`pressureReference`、`nonOrthogonalSolutionControl`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Class to represent a system of phases.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `surfaceTensionCoefficientModel` | 68 |
| `momentumTransferSystem` | 70 |
| `pressureReference` | 71 |
| `nonOrthogonalSolutionControl` | 72 |
| `phaseSystem` | 77 |
| `alphaControl` | 87 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
2. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`phaseModel.H`](../../../02-solver-modules/files/6a/phasemodel.h--6a4c6bcda31f.md)
- [`phaseInterface.H`](../../../02-solver-modules/files/2c/phaseinterface.h--2c84bd3e0874.md)
- [`phaseInterfaceKey.H`](../../../02-solver-modules/files/41/phaseinterfacekey.h--4193783aed30.md)
- [`HashPtrTable.H`](../../../04-core-runtime/files/4a/hashptrtable.h--4ab8e1bdb8c9.md)
- [`PtrListDictionary.H`](../../../04-core-runtime/files/2b/ptrlistdictionary.h--2b4aa9e279df.md)
- [`hashedWordList.H`](../../../04-core-runtime/files/1f/hashedwordlist.h--1f1f3bb79433.md)
- [`pimpleNoLoopControl.H`](../../../05-finite-volume/files/21/pimplenoloopcontrol.h--211d4bd02bbb.md)
- [`MRFZones.H`](../../../05-finite-volume/files/30/mrfzones.h--3097cedc6ca7.md)
- [`fvModels.H`](../../../05-finite-volume/files/60/fvmodels.h--6040b512bd89.md)
- [`fvConstraints.H`](../../../05-finite-volume/files/68/fvconstraints.h--68dca4db4ada.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`fvMatricesFwd.H`](../../../05-finite-volume/files/c0/fvmatricesfwd.h--c0b6e3525b0b.md)
- [`MULES.H`](../../../05-finite-volume/files/44/mules.h--4492211902ae.md)
- [`phaseSystemI.H`](../../../02-solver-modules/files/64/phasesystemi.h--64ed6fc87fde.md)
- [`phaseSystemTemplates.C`](../../../02-solver-modules/files/62/phasesystemtemplates.c--626eca492272.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/functionObjects/phaseMap/phaseMap.H](../../../02-solver-modules/files/3a/phasemap.h--3add42f7579b.md)
- [applications/modules/multiphaseEuler/fvModels/heatTransferLimitedPhaseChange/heatTransferLimitedPhaseChange.H](../../../02-solver-modules/files/d6/heattransferlimitedphasechange.h--d682bc6211c5.md)
- [applications/modules/multiphaseEuler/fvModels/homogeneousNucleation/homogeneousNucleation.C](../../../02-solver-modules/files/72/homogeneousnucleation.c--72b61d5d988f.md)
- [applications/modules/multiphaseEuler/fvModels/homogeneousNucleation/homogeneousNucleation.H](../../../02-solver-modules/files/cb/homogeneousnucleation.h--cb007319dceb.md)
- [applications/modules/multiphaseEuler/fvModels/interfaceTurbulenceDamping/interfaceTurbulenceDamping.H](../../../02-solver-modules/files/40/interfaceturbulencedamping.h--40298659dc48.md)
- [applications/modules/multiphaseEuler/fvModels/massDiffusionLimitedPhaseChange/massDiffusionLimitedPhaseChange.H](../../../02-solver-modules/files/3f/massdiffusionlimitedphasechange.h--3f20eb5ad92f.md)
- [applications/modules/multiphaseEuler/fvModels/multiphaseEulerCavitation/multiphaseEulerCavitation.H](../../../02-solver-modules/files/03/multiphaseeulercavitation.h--035d96f3178b.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.H](../../../02-solver-modules/files/00/phasesurfaceboiling.h--00489274d877.md)
- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceCondensation/phaseSurfaceCondensation.H](../../../02-solver-modules/files/0e/phasesurfacecondensation.h--0e50a10dffdf.md)
- [applications/modules/multiphaseEuler/fvModels/phaseTurbulenceStabilisation/phaseTurbulenceStabilisation.C](../../../02-solver-modules/files/da/phaseturbulencestabilisation.c--da6a9a59b674.md)
- [applications/modules/multiphaseEuler/fvModels/reactionDrivenPhaseChange/reactionDrivenPhaseChange.H](../../../02-solver-modules/files/70/reactiondrivenphasechange.h--70a8c4c28f44.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/departureDiameterModels/KocamustafaogullariIshiiDepartureDiameter/KocamustafaogullariIshiiDepartureDiameter.C](../../../02-solver-modules/files/8a/kocamustafaogullariishiideparturediameter.c--8a88cf27895c.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/departureFrequencyModels/KocamustafaogullariIshiiDepartureFrequency/KocamustafaogullariIshiiDepartureFrequency.C](../../../02-solver-modules/files/fb/kocamustafaogullariishiideparturefrequency.c--fb16ec72c166.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/nucleationSiteModels/KocamustafaogullariIshiiNucleationSite/KocamustafaogullariIshiiNucleationSite.C](../../../02-solver-modules/files/71/kocamustafaogullariishiinucleationsite.c--71eb7771b790.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.H](../../../02-solver-modules/files/75/wallboiling.h--757f2368e4d2.md)
- [applications/modules/multiphaseEuler/fvModels/wallCondensation/wallCondensation.H](../../../02-solver-modules/files/cb/wallcondensation.h--cbf7c88dd877.md)
- [applications/modules/multiphaseEuler/fvModels/wallPhaseChange/wallPhaseChange.H](../../../02-solver-modules/files/79/wallphasechange.h--79506832c065.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/kineticTheoryModel/kineticTheoryModel.C](../../../02-solver-modules/files/ef/kinetictheorymodel.c--efec362ba811.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/diameterModel/diameterModel.C](../../../02-solver-modules/files/e8/diametermodel.c--e8d97808cf35.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/IATEsource/IATEsource.H](../../../02-solver-modules/files/bd/iatesource.h--bdbf6cd4f4c9.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/linearTsubDiameter/linearTsubDiameter.C](../../../02-solver-modules/files/e0/lineartsubdiameter.c--e060d05f7098.md)
- [applications/modules/multiphaseEuler/phaseSystem/heatTransferSystem/heatTransferSystem.H](../../../02-solver-modules/files/b8/heattransfersystem.h--b8051f740e43.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/aspectRatioModels/aspectRatioModel/aspectRatioModelNew.C](../../../02-solver-modules/files/35/aspectratiomodelnew.c--35317d905eb3.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/BlendedInterfacialModel/blendingMethods/blendingMethod/blendingMethod.C](../../../02-solver-modules/files/2c/blendingmethod.c--2c82bfaf28e1.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/BlendedInterfacialModel/blendingMethods/continuous/continuous.C](../../../02-solver-modules/files/73/continuous.c--73d42f3d3b0a.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
