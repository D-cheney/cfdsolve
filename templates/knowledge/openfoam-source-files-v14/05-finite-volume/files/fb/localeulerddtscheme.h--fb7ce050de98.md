---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fb7ce050de98"
title: "OpenFOAM 14 源码解析：localEulerDdtScheme.H"
summary: "该文件声明或实现 `localEulerDdt`、`localEulerDdtScheme`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/ddtSchemes/localEulerDdtScheme/localEulerDdtScheme.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：localEulerDdtScheme.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/ddtSchemes/localEulerDdtScheme/localEulerDdtScheme.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：367 行
- 文件标识：`fb7ce050de98`

## 2. 功能说明

该文件声明或实现 `localEulerDdt`、`localEulerDdtScheme`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Local time-step first-order Euler implicit/explicit ddt. The reciprocal of the local time-step field is looked-up from the database. This scheme should only be used for steady-state computations using transient codes where local time-stepping is preferably to under-relaxation for transport consistency reasons.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `localEulerDdt` | 70 |
| `localEulerDdtScheme` | 117 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`ddtScheme.H`](../../../05-finite-volume/files/01/ddtscheme.h--01f0d2789ae9.md)
- [`localEulerDdtScheme.C`](../../../05-finite-volume/files/e4/localeulerddtscheme.c--e4552d397709.md)

## 8. 直接上层引用

- [applications/modules/compressibleVoF/compressibleVoF.C](../../../02-solver-modules/files/b7/compressiblevof.c--b7d8de5a4f40.md)
- [applications/modules/incompressibleFluid/incompressibleFluid.C](../../../02-solver-modules/files/f6/incompressiblefluid.c--f69e01ebae16.md)
- [applications/modules/incompressibleVoF/incompressibleVoF.C](../../../02-solver-modules/files/fe/incompressiblevof.c--fea8d8ade25e.md)
- [applications/modules/isothermalFluid/isothermalFluid.C](../../../02-solver-modules/files/e2/isothermalfluid.c--e2c3b3270f63.md)
- [applications/modules/multicomponentFluid/multicomponentFluid.C](../../../02-solver-modules/files/f0/multicomponentfluid.c--f0c16ce2ca3e.md)
- [applications/modules/multiphaseEuler/multiphaseEuler.C](../../../02-solver-modules/files/15/multiphaseeuler.c--1540429042b5.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.C](../../../02-solver-modules/files/1c/phasesystem.c--1cb251073247.md)
- [applications/modules/multiphaseVoFSolver/multiphaseVoFSolver.C](../../../02-solver-modules/files/e3/multiphasevofsolver.c--e39b0462c104.md)
- [applications/modules/shockFluid/shockFluid.C](../../../02-solver-modules/files/c8/shockfluid.c--c84ae7f028de.md)
- [applications/modules/solid/solid.C](../../../02-solver-modules/files/5b/solid.c--5b1632420e5b.md)
- [applications/modules/VoFSolver/VoFSolver.C](../../../02-solver-modules/files/06/vofsolver.c--06f61cee2c07.md)
- [src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.C](../../../05-finite-volume/files/3f/advectivefvpatchfield.c--3f81b03d3d89.md)
- [src/finiteVolume/finiteVolume/ddtSchemes/localEulerDdtScheme/localEulerDdt.C](../../../05-finite-volume/files/47/localeulerddt.c--47ec399dece1.md)
- [src/finiteVolume/finiteVolume/ddtSchemes/localEulerDdtScheme/localEulerDdtScheme.C](../../../05-finite-volume/files/e4/localeulerddtscheme.c--e4552d397709.md)
- [src/finiteVolume/finiteVolume/ddtSchemes/localEulerDdtScheme/localEulerDdtSchemes.C](../../../05-finite-volume/files/1e/localeulerddtschemes.c--1e236cc01ebf.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/CMULES.H](../../../05-finite-volume/files/e0/cmules.h--e02aced9d4a4.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/CMULESTemplates.C](../../../05-finite-volume/files/dc/cmulestemplates.c--dc3553108074.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/MULESTemplates.C](../../../05-finite-volume/files/9d/mulestemplates.c--9d1fa1509f79.md)
- [src/finiteVolume/solver/solver.C](../../../05-finite-volume/files/96/solver.c--964bf466fa3f.md)
- [src/functionObjects/solvers/scalarTransport/scalarTransport.C](../../../14-postprocessing/files/88/scalartransport.c--88c19cb5c21e.md)
- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/cloudSolution/cloudSolution.C](../../../11-lagrangian/files/f8/cloudsolution.c--f8d78328c44c.md)
- [src/reactionModels/laminar/laminar.C](../../../08-thermophysical/files/44/laminar.c--44411651e2a7.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
