---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d66b1dda583c"
title: "OpenFOAM 14 源码解析：incompressibleMomentumTransportModel.H"
summary: "该文件声明或实现 `incompressibleMomentumTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：incompressibleMomentumTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：185 行
- 文件标识：`d66b1dda583c`

## 2. 功能说明

该文件声明或实现 `incompressibleMomentumTransportModel`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Base class for single-phase incompressible momentum transport models.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `incompressibleMomentumTransportModel` | 54 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`momentumTransportModel.H`](../../../09-turbulence-transport/files/36/momentumtransportmodel.h--36c367269e58.md)
- [`incompressibleMomentumTransportModelTemplates.C`](../../../09-turbulence-transport/files/f6/incompressiblemomentumtransportmodeltemplates.c--f64d8471d1f1.md)

## 8. 直接上层引用

- [applications/modules/incompressibleFluid/incompressibleFluid.H](../../../02-solver-modules/files/d1/incompressiblefluid.h--d1866c69fa0d.md)
- [applications/modules/incompressibleMultiphaseVoF/incompressibleMultiphaseVoF.H](../../../02-solver-modules/files/14/incompressiblemultiphasevof.h--14419da205c9.md)
- [applications/modules/incompressibleVoF/fvModels/VoFTurbulenceDamping/VoFTurbulenceDamping.C](../../../02-solver-modules/files/d4/vofturbulencedamping.c--d4eca87b0b3a.md)
- [applications/modules/incompressibleVoF/incompressibleInterPhaseTransportModel/incompressibleInterPhaseTransportModel.H](../../../02-solver-modules/files/2b/incompressibleinterphasetransportmodel.h--2bf4a52a4cd1.md)
- [src/functionObjects/field/PecletNo/PecletNo.C](../../../14-postprocessing/files/56/pecletno.c--5620af1d860a.md)
- [src/functionObjects/field/shearStress/shearStress.C](../../../14-postprocessing/files/de/shearstress.c--de6d6279fbbb.md)
- [src/functionObjects/field/turbulenceFields/turbulenceFields.C](../../../14-postprocessing/files/3e/turbulencefields.c--3e7b3e8ff534.md)
- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeff.C](../../../14-postprocessing/files/74/wallheattransfercoeff.c--74b3d3622019.md)
- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeffModels/kappaEff/kappaEff.C](../../../14-postprocessing/files/f9/kappaeff.c--f98dd805cdb5.md)
- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeffModels/ReynoldsAnalogy/ReynoldsAnalogy.C](../../../14-postprocessing/files/e7/reynoldsanalogy.c--e77e563adedd.md)
- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeffModels/wallHeatTransferCoeffModel/wallHeatTransferCoeffModel.H](../../../14-postprocessing/files/ae/wallheattransfercoeffmodel.h--aed5b0205c73.md)
- [src/functionObjects/field/wallShearStress/wallShearStress.C](../../../14-postprocessing/files/b4/wallshearstress.c--b44f2ad466c6.md)
- [src/functionObjects/forces/forcesBase/forcesBase.C](../../../14-postprocessing/files/a2/forcesbase.c--a21561ee004f.md)
- [src/functionObjects/forces/sectionalForcesBase/sectionalForcesBase.C](../../../14-postprocessing/files/ef/sectionalforcesbase.c--ef6d57e454d5.md)
- [src/functionObjects/solvers/scalarTransport/scalarTransport.C](../../../14-postprocessing/files/88/scalartransport.c--88c19cb5c21e.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModel.C](../../../09-turbulence-transport/files/18/incompressiblemomentumtransportmodel.c--18b92fa9f905.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.H](../../../09-turbulence-transport/files/17/incompressiblemomentumtransportmodels.h--177fb8e614f3.md)
- [src/MomentumTransportModels/incompressible/makeIncompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/be/makeincompressiblemomentumtransportmodel.h--be4ca35e202a.md)
- [src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/71/phaseincompressiblemomentumtransportmodel.h--711c3bc93613.md)
- [tutorials/incompressibleFluid/planarPoiseuille/validation/WatersKing/WatersKing.C](../../../16-tests-tutorials/files/25/watersking.c--259deb712a29.md)

## 9. 运行时机制

`declareRunTimeNewSelectionTable`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
