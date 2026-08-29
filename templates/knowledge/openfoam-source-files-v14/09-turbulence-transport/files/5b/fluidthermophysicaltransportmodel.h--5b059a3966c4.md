---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5b059a3966c4"
title: "OpenFOAM 14 源码解析：fluidThermophysicalTransportModel.H"
summary: "该文件声明或实现 `fluidThermophysicalTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/fluidThermophysicalTransportModel/fluidThermophysicalTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：fluidThermophysicalTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/fluidThermophysicalTransportModel/fluidThermophysicalTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：153 行
- 文件标识：`5b059a3966c4`

## 2. 功能说明

该文件声明或实现 `fluidThermophysicalTransportModel`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：Abstract base class for fluid thermophysical transport models RAS, LES and laminar.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fluidThermophysicalTransportModel` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`thermophysicalTransportModel.H`](../../../09-turbulence-transport/files/ad/thermophysicaltransportmodel.h--ad7d97fa3ad6.md)
- [`compressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/eb/compressiblemomentumtransportmodel.h--eb183e43a318.md)
- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceCondensation/phaseSurfaceCondensation.C](../../../02-solver-modules/files/94/phasesurfacecondensation.c--94f55988374d.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.C](../../../02-solver-modules/files/cf/wallboiling.c--cf724a332c73.md)
- [applications/modules/multiphaseEuler/fvModels/wallCondensation/wallCondensation.C](../../../02-solver-modules/files/8a/wallcondensation.c--8ac7e61c3c3a.md)
- [src/functionObjects/field/energyFlux/energyFlux.C](../../../14-postprocessing/files/61/energyflux.c--6179405ea6c5.md)
- [src/functionObjects/field/specieFlux/specieFlux.C](../../../14-postprocessing/files/9a/specieflux.c--9a4bfd35e978.md)
- [src/functionObjects/field/turbulenceFields/turbulenceFields.C](../../../14-postprocessing/files/3e/turbulencefields.c--3e7b3e8ff534.md)
- [src/fvModels/general/volumeBlockage/volumeBlockage.C](../../../12-boundaries-sources/files/55/volumeblockage.c--5558747c96c4.md)
- [src/fvModels/interRegion/heatTransferCoefficientModels/variable/variable.C](../../../12-boundaries-sources/files/da/variable.c--da364346df81.md)
- [src/specieTransfer/derivedFvPatchFields/adsorptionMassFraction/adsorptionMassFractionFvPatchScalarField.C](../../../08-thermophysical/files/57/adsorptionmassfractionfvpatchscalarfield.c--57f8afd32608.md)
- [src/specieTransfer/derivedFvPatchFields/semiPermeableBaffleMassFraction/semiPermeableBaffleMassFractionFvPatchScalarField.C](../../../08-thermophysical/files/41/semipermeablebafflemassfractionfvpatchscalarfield.c--41ca018aff88.md)
- [src/specieTransfer/derivedFvPatchFields/specieTransferMassFraction/specieTransferMassFractionFvPatchScalarField.C](../../../08-thermophysical/files/b7/specietransfermassfractionfvpatchscalarfield.c--b72a3119895e.md)
- [src/specieTransfer/derivedFvPatchFields/specieTransferTemperature/specieTransferTemperatureFvPatchScalarField.C](../../../08-thermophysical/files/63/specietransfertemperaturefvpatchscalarfield.c--63d6e015e04b.md)
- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatJayatillekeWallFunction/alphatJayatillekeWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/06/alphatjayatillekewallfunctionfvpatchscalarfield.c--06bfcfba5630.md)
- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatWallFunction/alphatWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/c8/alphatwallfunctionfvpatchscalarfield.c--c88dd817007c.md)
- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/convectiveHeatTransfer/convectiveHeatTransferFvPatchScalarField.C](../../../09-turbulence-transport/files/5e/convectiveheattransferfvpatchscalarfield.c--5e1791edfbfc.md)
- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/externalCoupledTemperatureMixed/externalCoupledTemperatureMixedFvPatchScalarField.C](../../../09-turbulence-transport/files/2b/externalcoupledtemperaturemixedfvpatchscalarfield.c--2b5dc4a10b03.md)
- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/totalFlowRateAdvectiveDiffusive/totalFlowRateAdvectiveDiffusiveFvPatchScalarField.C](../../../09-turbulence-transport/files/ee/totalflowrateadvectivediffusivefvpatchscalarfield.c--ee56e9b34129.md)
- [src/ThermophysicalTransportModels/fluid/fluidThermophysicalTransportModel/fluidThermophysicalTransportModel.C](../../../09-turbulence-transport/files/c4/fluidthermophysicaltransportmodel.c--c4900f12b2f2.md)
- [src/ThermophysicalTransportModels/fluid/ThermophysicalTransportModel/ThermophysicalTransportModel.H](../../../09-turbulence-transport/files/9d/thermophysicaltransportmodel.h--9dc2721a261c.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
