---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-71ddc0685b08"
title: "OpenFOAM 14 源码解析：viscosityModel.H"
summary: "该文件声明或实现 `fvMesh`、`viscosityModel`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/physicalProperties/viscosityModels/viscosityModel/viscosityModel.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：viscosityModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/physicalProperties/viscosityModels/viscosityModel/viscosityModel.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：147 行
- 文件标识：`71ddc0685b08`

## 2. 功能说明

该文件声明或实现 `fvMesh`、`viscosityModel`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：A namespace for Newtonian viscosity models.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 60 |
| `viscosityModel` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`physicalProperties.H`](../../../08-thermophysical/files/f7/physicalproperties.h--f79cf56c6a0d.md)
- [`viscosity.H`](../../../08-thermophysical/files/61/viscosity.h--6109322fab0a.md)

## 8. 直接上层引用

- [applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointShapeOptimisationFoam.C](../../../17-other-libraries/files/ed/adjointshapeoptimisationfoam.c--edfd65cc01a2.md)
- [applications/legacy/incompressible/porousSimpleFoam/porousSimpleFoam.C](../../../17-other-libraries/files/23/poroussimplefoam.c--23250fda2f39.md)
- [applications/modules/incompressibleDenseParticleFluid/incompressibleDenseParticleFluid.H](../../../02-solver-modules/files/6e/incompressibledenseparticlefluid.h--6ec93149946f.md)
- [applications/modules/incompressibleDriftFlux/incompressibleDriftFluxMixture/incompressibleDriftFluxMixture.H](../../../02-solver-modules/files/86/incompressibledriftfluxmixture.h--867ebebeeb68.md)
- [applications/modules/incompressibleDriftFlux/mixtureViscosityModels/mixtureViscosityModel/mixtureViscosityModel.H](../../../02-solver-modules/files/30/mixtureviscositymodel.h--301e0a43814e.md)
- [applications/modules/incompressibleFluid/incompressibleFluid.H](../../../02-solver-modules/files/d1/incompressiblefluid.h--d1866c69fa0d.md)
- [applications/modules/incompressibleMultiphaseVoF/incompressibleMultiphaseVoFMixture/incompressibleVoFphase/incompressibleVoFphase.H](../../../02-solver-modules/files/4d/incompressiblevofphase.h--4d9aff8cba40.md)
- [applications/modules/incompressibleVoF/incompressibleTwoPhaseVoFMixture/incompressibleTwoPhaseVoFMixture.H](../../../02-solver-modules/files/85/incompressibletwophasevofmixture.h--857f4536c4a4.md)
- [applications/solvers/boundaryFoam/boundaryFoam.C](../../../01-solver-entry/files/3a/boundaryfoam.c--3a004ad2140b.md)
- [applications/utilities/preProcessing/applyBoundaryLayer/applyBoundaryLayer.C](../../../03-utilities/files/b5/applyboundarylayer.c--b58f2ecdbf4a.md)
- [src/lagrangian/functionObjects/particles/particles.C](../../../11-lagrangian/files/b3/particles.c--b38da31aca0f.md)
- [src/lagrangian/parcel/fvModels/clouds/clouds.H](../../../11-lagrangian/files/8f/clouds.h--8fb7647e2ba7.md)
- [src/physicalProperties/viscosityModels/constant/constantViscosityModel.H](../../../08-thermophysical/files/9c/constantviscositymodel.h--9c0e8e4b5203.md)
- [src/physicalProperties/viscosityModels/viscosityModel/viscosityModel.C](../../../08-thermophysical/files/3e/viscositymodel.c--3e899168a168.md)
- [src/physicalProperties/viscosityModels/viscosityModel/viscosityModelNew.C](../../../08-thermophysical/files/ba/viscositymodelnew.c--bac96788c800.md)
- [src/twoPhaseModels/twoPhaseMixture/twoPhaseMixture.C](../../../10-multiphase/files/ce/twophasemixture.c--ceb8b0840d55.md)
- [tutorials/incompressibleFluid/planarPoiseuille/validation/WatersKing/WatersKing.C](../../../16-tests-tutorials/files/25/watersking.c--259deb712a29.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
