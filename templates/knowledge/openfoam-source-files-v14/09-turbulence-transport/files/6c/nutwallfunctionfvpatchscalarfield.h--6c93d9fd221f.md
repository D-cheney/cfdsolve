---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6c93d9fd221f"
title: "OpenFOAM 14 源码解析：nutWallFunctionFvPatchScalarField.H"
summary: "该文件声明或实现 `momentumTransportModel`、`nutWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutWallFunction/nutWallFunctionFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：nutWallFunctionFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutWallFunction/nutWallFunctionFvPatchScalarField.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：230 行
- 文件标识：`6c93d9fd221f`

## 2. 功能说明

该文件声明或实现 `momentumTransportModel`、`nutWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：This boundary condition provides a turbulent kinematic viscosity condition when using wall functions, based on turbulence kinetic energy. - replicates OpenFOAM v1.5 (and earlier) behaviour Usage \table Property | Description | Required | Default value Cmu | Cmu coefficient | no | 0.09 kappa | Von Karman constant | no | 0.41 E | E coefficient | no | 9.8 \endtable Examples of the boundary condition specification: \verbatim <patchName> { type nutWallFunction; value uniform 0; } \endverbatim Reference for the default model coefficients: \verbatim H. Versteeg, W. Malalasekera An Introduction to Computational Fluid Dynamics: The Finite Volume Method, subsection "3.5.2 k-epsilon model" \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `momentumTransportModel` | 79 |
| `nutWallFunctionFvPatchScalarField` | 85 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Cmu` | 163 |
| `kappa` | 169 |
| `E` | 175 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`fixedValueFvPatchFields.H`](../../../05-finite-volume/files/ff/fixedvaluefvpatchfields.h--ff21ae834f83.md)

## 8. 直接上层引用

- [src/functionObjects/field/yPlus/yPlus.C](../../../14-postprocessing/files/4f/yplus.c--4fab3617740e.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/epsilonWallFunctions/epsilonWallFunction/epsilonWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/c5/epsilonwallfunctionfvpatchscalarfield.c--c5adf9770af4.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/fWallFunctions/fWallFunction/fWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/c5/fwallfunctionfvpatchscalarfield.c--c50791d6141b.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/kqRWallFunctions/kLowReWallFunction/kLowReWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/29/klowrewallfunctionfvpatchscalarfield.c--294d4cdff2ce.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkWallFunction/nutkWallFunctionFvPatchScalarField.H](../../../09-turbulence-transport/files/82/nutkwallfunctionfvpatchscalarfield.h--820dd82da920.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutLowReWallFunction/nutLowReWallFunctionFvPatchScalarField.H](../../../09-turbulence-transport/files/85/nutlowrewallfunctionfvpatchscalarfield.h--8502bf19cd48.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutUSpaldingWallFunction/nutUSpaldingWallFunctionFvPatchScalarField.H](../../../09-turbulence-transport/files/40/nutuspaldingwallfunctionfvpatchscalarfield.h--400e929b9dba.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutUWallFunction/nutUWallFunctionFvPatchScalarField.H](../../../09-turbulence-transport/files/01/nutuwallfunctionfvpatchscalarfield.h--0146e65147a3.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutWallFunction/nutWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/ab/nutwallfunctionfvpatchscalarfield.c--ab31a6449b4f.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/omegaWallFunctions/omegaWallFunction/omegaWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/8f/omegawallfunctionfvpatchscalarfield.c--8f6bcae3bbe1.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/v2WallFunctions/v2WallFunction/v2WallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/b3/v2wallfunctionfvpatchscalarfield.c--b334012e6b6d.md)
- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatJayatillekeWallFunction/alphatJayatillekeWallFunctionFvPatchScalarField.H](../../../09-turbulence-transport/files/2c/alphatjayatillekewallfunctionfvpatchscalarfield.h--2ce2c04eb86e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
