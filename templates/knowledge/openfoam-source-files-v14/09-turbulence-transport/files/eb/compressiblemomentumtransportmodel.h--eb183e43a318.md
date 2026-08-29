---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-eb183e43a318"
title: "OpenFOAM 14 源码解析：compressibleMomentumTransportModel.H"
summary: "该文件声明或实现 `compressibleMomentumTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/compressible/compressibleMomentumTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：compressibleMomentumTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/compressible/compressibleMomentumTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：175 行
- 文件标识：`eb183e43a318`

## 2. 功能说明

该文件声明或实现 `compressibleMomentumTransportModel`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Base class for single-phase compressible momentum transport models.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `compressibleMomentumTransportModel` | 54 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`momentumTransportModel.H`](../../../09-turbulence-transport/files/36/momentumtransportmodel.h--36c367269e58.md)
- [`compressibleMomentumTransportModelTemplates.C`](../../../09-turbulence-transport/files/0a/compressiblemomentumtransportmodeltemplates.c--0a161645855b.md)

## 8. 直接上层引用

- [applications/modules/compressibleMultiphaseVoF/compressibleMultiphaseVoF.H](../../../02-solver-modules/files/2d/compressiblemultiphasevof.h--2de7769ce0e1.md)
- [applications/modules/compressibleVoF/compressibleInterPhaseTransportModel/compressibleInterPhaseTransportModel.H](../../../02-solver-modules/files/3b/compressibleinterphasetransportmodel.h--3b3a19178384.md)
- [applications/modules/compressibleVoF/fvModels/VoFTurbulenceDamping/VoFTurbulenceDamping.C](../../../02-solver-modules/files/14/vofturbulencedamping.c--1406202a103c.md)
- [applications/modules/isothermalFilm/derivedFvPatchFields/filmSurfaceVelocity/filmSurfaceVelocityFvPatchVectorField.C](../../../02-solver-modules/files/00/filmsurfacevelocityfvpatchvectorfield.c--00d98a766ee0.md)
- [applications/modules/isothermalFilm/filmCompressibleMomentumTransportModels/filmCompressibleMomentumTransportModel.H](../../../02-solver-modules/files/aa/filmcompressiblemomentumtransportmodel.h--aa36e9d41308.md)
- [applications/modules/isothermalFluid/isothermalFluid.H](../../../02-solver-modules/files/4d/isothermalfluid.h--4db48b548d4f.md)
- [applications/modules/multiphaseEuler/thermophysicalTransportModels/derivedFvPatchFields/multiphaseCoupledTemperature/multiphaseCoupledTemperatureFvPatchScalarField.C](../../../02-solver-modules/files/13/multiphasecoupledtemperaturefvpatchscalarfield.c--136bdcc61a0e.md)
- [applications/modules/shockFluid/shockFluid.H](../../../02-solver-modules/files/a1/shockfluid.h--a1c77b1647ce.md)
- [src/functionObjects/field/PecletNo/PecletNo.C](../../../14-postprocessing/files/56/pecletno.c--5620af1d860a.md)
- [src/functionObjects/field/shearStress/shearStress.C](../../../14-postprocessing/files/de/shearstress.c--de6d6279fbbb.md)
- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeff.C](../../../14-postprocessing/files/74/wallheattransfercoeff.c--74b3d3622019.md)
- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeffModels/ReynoldsAnalogy/ReynoldsAnalogy.C](../../../14-postprocessing/files/e7/reynoldsanalogy.c--e77e563adedd.md)
- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeffModels/wallHeatTransferCoeffModel/wallHeatTransferCoeffModel.C](../../../14-postprocessing/files/d3/wallheattransfercoeffmodel.c--d39f2cfe0835.md)
- [src/functionObjects/field/wallShearStress/wallShearStress.C](../../../14-postprocessing/files/b4/wallshearstress.c--b44f2ad466c6.md)
- [src/functionObjects/forces/forcesBase/forcesBase.C](../../../14-postprocessing/files/a2/forcesbase.c--a21561ee004f.md)
- [src/functionObjects/forces/sectionalForcesBase/sectionalForcesBase.C](../../../14-postprocessing/files/ef/sectionalforcesbase.c--ef6d57e454d5.md)
- [src/functionObjects/solvers/scalarTransport/scalarTransport.C](../../../14-postprocessing/files/88/scalartransport.c--88c19cb5c21e.md)
- [src/fvModels/general/viscousHeating/viscousHeating.C](../../../12-boundaries-sources/files/f9/viscousheating.c--f903427be699.md)
- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModel.C](../../../09-turbulence-transport/files/09/compressiblemomentumtransportmodel.c--0919654e3a0f.md)
- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.H](../../../09-turbulence-transport/files/07/compressiblemomentumtransportmodels.h--0745b4a591f5.md)
- [src/MomentumTransportModels/compressible/makeCompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/76/makecompressiblemomentumtransportmodel.h--76018bb87199.md)
- [src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/cc/phasecompressiblemomentumtransportmodel.h--cc1b40028f94.md)
- [src/ThermophysicalTransportModels/fluid/fluidThermophysicalTransportModel/fluidThermophysicalTransportModel.H](../../../09-turbulence-transport/files/5b/fluidthermophysicaltransportmodel.h--5b059a3966c4.md)

## 9. 运行时机制

`declareRunTimeNewSelectionTable`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
