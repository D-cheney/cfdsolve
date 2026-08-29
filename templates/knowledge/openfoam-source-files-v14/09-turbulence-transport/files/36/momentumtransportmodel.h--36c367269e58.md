---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-36c367269e58"
title: "OpenFOAM 14 源码解析：momentumTransportModel.H"
summary: "该文件声明或实现 `fvMesh`、`momentumTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/momentumTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：momentumTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/momentumTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：270 行
- 文件标识：`36c367269e58`

## 2. 功能说明

该文件声明或实现 `fvMesh`、`momentumTransportModel`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Abstract base class for momentum transport models (RAS, LES and laminar).

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 58 |
| `momentumTransportModel` | 63 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`primitiveFieldsFwd.H`](../../../04-core-runtime/files/7a/primitivefieldsfwd.h--7a313a3cc235.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`fvMatricesFwd.H`](../../../05-finite-volume/files/c0/fvmatricesfwd.h--c0b6e3525b0b.md)
- [`geometricOneField.H`](../../../05-finite-volume/files/95/geometriconefield.h--95138167ad6f.md)
- [`viscosity.H`](../../../08-thermophysical/files/61/viscosity.h--6109322fab0a.md)
- [`momentumTransportModelTemplates.C`](../../../09-turbulence-transport/files/77/momentumtransportmodeltemplates.c--77fde8e55515.md)

## 8. 直接上层引用

- [applications/modules/incompressibleDriftFlux/incompressibleDriftFlux.H](../../../02-solver-modules/files/45/incompressibledriftflux.h--45caa100e2f0.md)
- [src/atmosphericModels/derivedFvPatchFields/nutAtmosphericBoundaryLayerWallFunction/nutAtmosphericBoundaryLayerWallFunctionFvPatchScalarField.C](../../../17-other-libraries/files/1f/nutatmosphericboundarylayerwallfunctionfvpatchscalarfield.c--1ffa61071265.md)
- [src/functionObjects/field/power/power.C](../../../14-postprocessing/files/44/power.c--44495401227a.md)
- [src/functionObjects/field/turbulenceIntensity/turbulenceIntensity.C](../../../14-postprocessing/files/7e/turbulenceintensity.c--7e7c746f8408.md)
- [src/functionObjects/field/yPlus/yPlus.C](../../../14-postprocessing/files/4f/yplus.c--4fab3617740e.md)
- [src/functionObjects/solvers/age/age.C](../../../14-postprocessing/files/ae/age.c--ae51614b81d8.md)
- [src/functionObjects/solvers/phaseScalarTransport/phaseScalarTransport.C](../../../14-postprocessing/files/d0/phasescalartransport.c--d03f165e0e1c.md)
- [src/Lagrangian/cloud/LagrangianModels/turbulentDispersion/turbulentDispersion.H](../../../11-lagrangian/files/d5/turbulentdispersion.h--d5060b9bce77.md)
- [src/lagrangian/parcel/submodels/Momentum/DispersionModel/DispersionRASModel/DispersionRASModel.C](../../../11-lagrangian/files/bc/dispersionrasmodel.c--bc13d71b59c1.md)
- [src/lagrangian/parcel/submodels/Thermodynamic/ParticleForces/BrownianMotion/BrownianMotionForce.C](../../../11-lagrangian/files/e5/brownianmotionforce.c--e53677ad2d3c.md)
- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/eb/compressiblemomentumtransportmodel.h--eb183e43a318.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/d6/incompressiblemomentumtransportmodel.h--d66b1dda583c.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/fixedShearStress/fixedShearStressFvPatchVectorField.C](../../../09-turbulence-transport/files/de/fixedshearstressfvpatchvectorfield.c--de40a1e0a5d9.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/porousBafflePressure/porousBafflePressureFvPatchField.C](../../../09-turbulence-transport/files/a1/porousbafflepressurefvpatchfield.c--a133af29b75d.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/epsilonWallFunctions/epsilonWallFunction/epsilonWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/c5/epsilonwallfunctionfvpatchscalarfield.c--c5adf9770af4.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/fWallFunctions/fWallFunction/fWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/c5/fwallfunctionfvpatchscalarfield.c--c50791d6141b.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/kqRWallFunctions/kLowReWallFunction/kLowReWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/29/klowrewallfunctionfvpatchscalarfield.c--294d4cdff2ce.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkRoughWallFunction/nutkRoughWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/56/nutkroughwallfunctionfvpatchscalarfield.c--566d659c8662.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkWallFunction/nutkWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/dc/nutkwallfunctionfvpatchscalarfield.c--dc9211f8231b.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutLowReWallFunction/nutLowReWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/d1/nutlowrewallfunctionfvpatchscalarfield.c--d160a9d9dafb.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutURoughWallFunction/nutURoughWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/af/nuturoughwallfunctionfvpatchscalarfield.c--afe17fb008ad.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutUSpaldingWallFunction/nutUSpaldingWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/c5/nutuspaldingwallfunctionfvpatchscalarfield.c--c5dc7be3f381.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutUWallFunction/nutUWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/eb/nutuwallfunctionfvpatchscalarfield.c--eb299db9eb40.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutWallFunction/nutWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/ab/nutwallfunctionfvpatchscalarfield.c--ab31a6449b4f.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/omegaWallFunctions/omegaWallFunction/omegaWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/8f/omegawallfunctionfvpatchscalarfield.c--8f6bcae3bbe1.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
