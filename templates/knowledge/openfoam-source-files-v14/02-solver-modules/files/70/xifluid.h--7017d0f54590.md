---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7017d0f54590"
title: "OpenFOAM 14 源码解析：XiFluid.H"
summary: "该文件声明或实现 `XiFluid`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/XiFluid/XiFluid.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：XiFluid.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/XiFluid/XiFluid.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：376 行
- 文件标识：`7017d0f54590`

## 2. 功能说明

该文件声明或实现 `XiFluid`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Solver module for compressible premixed/partially-premixed combustion with turbulence modelling. Combusting RANS code using the Weller b-Xi two-equation combustion model. Xi may be obtained by either the solution of the Xi transport equation or from an algebraic expression. Reference: \verbatim Weller, H. G. (1993). The development of a new flame area combustion model using conditional averaging. Thermo-fluids section report TF 9307. \endverbatim Both approaches are based on Gulder's flame speed correlation which has been shown to be appropriate by comparison with the results from the spectral model. Reference: \verbatim Weller, H. G., Marooney, C. J., & Gosman, A. D. (1991, January). A new spectral method for calculation of the time-varying area of a laminar flame in homogeneous turbulence. In Symposium (International) on Combustion (Vol. 23, No. 1, pp. 629-636). Elsevier. \endverbatim 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `XiFluid` | 147 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `bMin` | 339 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`isothermalFluid.H`](../../../02-solver-modules/files/4d/isothermalfluid.h--4db48b548d4f.md)
- [`ubRhoThermo.H`](../../../02-solver-modules/files/e5/ubrhothermo.h--e5f0c905448b.md)
- [`reactionModel.H`](../../../08-thermophysical/files/cf/reactionmodel.h--cf0e29c1fdfe.md)
- [`ubMomentumTransportModel.H`](../../../02-solver-modules/files/16/ubmomentumtransportmodel.h--16db0f5ac71b.md)
- [`PhaseThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/75/phasethermophysicaltransportmodel.h--75091d8323e3.md)
- [`SuModel.H`](../../../02-solver-modules/files/3a/sumodel.h--3a8f4eda1013.md)
- `XiModel.H`

## 8. 直接上层引用

- [applications/modules/XiFluid/functionObjects/ubAverage/ubAverage.C](../../../02-solver-modules/files/1e/ubaverage.c--1e540480e378.md)
- [applications/modules/XiFluid/functionObjects/ubDWEA/ubDWEA.C](../../../02-solver-modules/files/fd/ubdwea.c--fdc91f106c15.md)
- [applications/modules/XiFluid/fvModels/ignition/bXiIgnition/bXiIgnition.H](../../../02-solver-modules/files/fc/bxiignition.h--fcdac9b952bd.md)
- [applications/modules/XiFluid/thermophysicalPredictor.C](../../../02-solver-modules/files/ff/thermophysicalpredictor.c--ff733a56bae4.md)
- [applications/modules/XiFluid/ubRhoThermo/derivedFvPatchFields/ubCoupledTemperature/ubCoupledTemperatureFvPatchScalarField.C](../../../02-solver-modules/files/86/ubcoupledtemperaturefvpatchscalarfield.c--86537edcc6d9.md)
- [applications/modules/XiFluid/XiFluid.C](../../../02-solver-modules/files/e1/xifluid.c--e1da30eafa96.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
