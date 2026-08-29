---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-32306f8dc3a6"
title: "OpenFOAM 14 源码解析：fvmDiv.H"
summary: "该文件声明或实现 `fvMatrix`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/fvm/fvmDiv.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvmDiv.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/fvm/fvmDiv.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：118 行
- 文件标识：`32306f8dc3a6`

## 2. 功能说明

该文件声明或实现 `fvMatrix`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Calculate the matrix for the divergence of the given field and flux.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMatrix` | 52 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`surfaceFieldsFwd.H`](../../../05-finite-volume/files/e4/surfacefieldsfwd.h--e4d506ea371b.md)
- [`surfaceInterpolationScheme.H`](../../../05-finite-volume/files/10/surfaceinterpolationscheme.h--10c72ee316fc.md)
- [`fvmDiv.C`](../../../05-finite-volume/files/24/fvmdiv.c--24156fc1821f.md)

## 8. 直接上层引用

- [applications/legacy/basic/financialFoam/financialFoam.C](../../../17-other-libraries/files/8a/financialfoam.c--8af6e6543723.md)
- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)
- [applications/legacy/combustion/PDRFoam/XiModels/transport/transport.C](../../../17-other-libraries/files/3d/transport.c--3d9eb1b38fe8.md)
- [applications/legacy/compressible/rhoPorousSimpleFoam/rhoPorousSimpleFoam.C](../../../17-other-libraries/files/b7/rhoporoussimplefoam.c--b77cea8351a3.md)
- [applications/legacy/electromagnetics/electrostaticFoam/electrostaticFoam.C](../../../17-other-libraries/files/3c/electrostaticfoam.c--3cb4b1ff424a.md)
- [applications/legacy/electromagnetics/mhdFoam/mhdFoam.C](../../../17-other-libraries/files/9c/mhdfoam.c--9cb4b58689a2.md)
- [applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointShapeOptimisationFoam.C](../../../17-other-libraries/files/ed/adjointshapeoptimisationfoam.c--edfd65cc01a2.md)
- [applications/legacy/incompressible/icoFoam/icoFoam.C](../../../17-other-libraries/files/ab/icofoam.c--ab0010b9a47e.md)
- [applications/legacy/incompressible/porousSimpleFoam/porousSimpleFoam.C](../../../17-other-libraries/files/23/poroussimplefoam.c--23250fda2f39.md)
- [applications/legacy/incompressible/shallowWaterFoam/shallowWaterFoam.C](../../../17-other-libraries/files/f6/shallowwaterfoam.c--f6afc7eba01a.md)
- [applications/modules/compressibleMultiphaseVoF/thermophysicalPredictor.C](../../../02-solver-modules/files/ff/thermophysicalpredictor.c--ffdddeb3c3e6.md)
- [applications/modules/compressibleVoF/pressureCorrector.C](../../../02-solver-modules/files/52/pressurecorrector.c--5263cc73e8ec.md)
- [applications/modules/compressibleVoF/thermophysicalPredictor.C](../../../02-solver-modules/files/59/thermophysicalpredictor.c--591c20ed3691.md)
- [applications/modules/film/thermophysicalPredictor.C](../../../02-solver-modules/files/15/thermophysicalpredictor.c--15315998133f.md)
- [applications/modules/fluid/thermophysicalPredictor.C](../../../02-solver-modules/files/ff/thermophysicalpredictor.c--ff3e975f83bb.md)
- [applications/modules/incompressibleDenseParticleFluid/momentumPredictor.C](../../../02-solver-modules/files/d5/momentumpredictor.c--d5cab762b959.md)
- [applications/modules/incompressibleFluid/momentumPredictor.C](../../../02-solver-modules/files/b5/momentumpredictor.c--b598e15fafc6.md)
- [applications/modules/isothermalFilm/correctAlpha.C](../../../02-solver-modules/files/27/correctalpha.c--27d236a29c4c.md)
- [applications/modules/isothermalFilm/momentumPredictor.C](../../../02-solver-modules/files/b0/momentumpredictor.c--b02ab83d85a3.md)
- [applications/modules/isothermalFluid/correctBuoyantPressure.C](../../../02-solver-modules/files/87/correctbuoyantpressure.c--87005fc57fa1.md)
- [applications/modules/isothermalFluid/correctPressure.C](../../../02-solver-modules/files/b8/correctpressure.c--b879f8e6e3fb.md)
- [applications/modules/isothermalFluid/momentumPredictor.C](../../../02-solver-modules/files/5f/momentumpredictor.c--5fcbf8c53eeb.md)
- [applications/modules/multiphaseEuler/cellPressureCorrector.C](../../../02-solver-modules/files/a4/cellpressurecorrector.c--a47979c370a6.md)
- [applications/modules/multiphaseEuler/compressibilityEqns.C](../../../02-solver-modules/files/09/compressibilityeqns.c--09b1dcb8a98a.md)
- [applications/modules/multiphaseEuler/facePressureCorrector.C](../../../02-solver-modules/files/07/facepressurecorrector.c--07a6a3b2eb59.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
