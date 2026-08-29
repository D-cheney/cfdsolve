---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a7153d5e8cf9"
title: "OpenFOAM 14 源码解析：CrankNicolsonDdtScheme.H"
summary: "该文件声明或实现 `CrankNicolsonDdtScheme`、`DDt0Field`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/ddtSchemes/CrankNicolsonDdtScheme/CrankNicolsonDdtScheme.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：CrankNicolsonDdtScheme.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/ddtSchemes/CrankNicolsonDdtScheme/CrankNicolsonDdtScheme.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：428 行
- 文件标识：`a7153d5e8cf9`

## 2. 功能说明

该文件声明或实现 `CrankNicolsonDdtScheme`、`DDt0Field`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Second-oder Crank-Nicolson implicit ddt using the current and previous time-step fields as well as the previous time-step ddt. The Crank-Nicolson scheme is often unstable for complex flows in complex geometries and it is necessary to "off-centre" the scheme to stabilise it while retaining greater temporal accuracy than the first-order Euler-implicit scheme. Off-centering is specified via the mandatory coefficient \c ocCoeff in the range [0,1] following the scheme name e.g. \verbatim ddtSchemes { default CrankNicolson 0.9; } \endverbatim or with an optional "ramp" function to transition from the Euler scheme to Crank-Nicolson over a initial period to avoid start-up problems, e.g. \verbatim ddtSchemes { default CrankNicolson ocCoeff { type scale; scale linearRamp; duration 0.01; value 0.9; }; } \endverbatim With a coefficient of 1 the scheme is fully centred and second-order, with a coeffi

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `CrankNicolsonDdtScheme` | 115 |
| `DDt0Field` | 126 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `ocCoeff` | 232 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`ddtScheme.H`](../../../05-finite-volume/files/01/ddtscheme.h--01f0d2789ae9.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`CrankNicolsonDdtScheme.C`](../../../05-finite-volume/files/08/cranknicolsonddtscheme.c--08d57493541a.md)

## 8. 直接上层引用

- [applications/modules/twoPhaseSolver/alphaPredictor.C](../../../02-solver-modules/files/34/alphapredictor.c--3466ce3e439c.md)
- [src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.C](../../../05-finite-volume/files/3f/advectivefvpatchfield.c--3f81b03d3d89.md)
- [src/finiteVolume/fields/fvPatchFields/derived/waveSurfacePressure/waveSurfacePressureFvPatchScalarField.C](../../../05-finite-volume/files/85/wavesurfacepressurefvpatchscalarfield.c--8525d3a89e34.md)
- [src/finiteVolume/fields/fvPatchFields/derived/waveTransmissive/waveTransmissiveFvPatchField.C](../../../05-finite-volume/files/3f/wavetransmissivefvpatchfield.c--3f79e0a3fac8.md)
- [src/finiteVolume/finiteVolume/ddtSchemes/CrankNicolsonDdtScheme/CrankNicolsonDdtScheme.C](../../../05-finite-volume/files/08/cranknicolsonddtscheme.c--08d57493541a.md)
- [src/finiteVolume/finiteVolume/ddtSchemes/CrankNicolsonDdtScheme/CrankNicolsonDdtSchemes.C](../../../05-finite-volume/files/4f/cranknicolsonddtschemes.c--4f162e44f224.md)
- [src/functionObjects/solvers/scalarTransport/scalarTransport.C](../../../14-postprocessing/files/88/scalartransport.c--88c19cb5c21e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
