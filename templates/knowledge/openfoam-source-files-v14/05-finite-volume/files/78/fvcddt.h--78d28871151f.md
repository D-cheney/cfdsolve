---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-78d28871151f"
title: "OpenFOAM 14 源码解析：fvcDdt.H"
summary: "该文件为“有限体积离散”提供 `fvcDdt` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/fvc/fvcDdt.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvcDdt.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/fvc/fvcDdt.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：225 行
- 文件标识：`78d28871151f`

## 2. 功能说明

该文件为“有限体积离散”提供 `fvcDdt` 相关接口、模板实例或支撑定义。

中文导航角色：有限体积离散核心。

上游说明：Calculate the first temporal derivative.

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`surfaceFieldsFwd.H`](../../../05-finite-volume/files/e4/surfacefieldsfwd.h--e4d506ea371b.md)
- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`one.H`](../../../04-core-runtime/files/5d/one.h--5da5d6ee632b.md)
- [`geometricZeroField.H`](../../../05-finite-volume/files/2d/geometriczerofield.h--2d28148df18f.md)
- [`fvcDdt.C`](../../../05-finite-volume/files/8f/fvcddt.c--8f1e6798c9d5.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)
- [applications/legacy/compressible/rhoPorousSimpleFoam/rhoPorousSimpleFoam.C](../../../17-other-libraries/files/b7/rhoporoussimplefoam.c--b77cea8351a3.md)
- [applications/legacy/electromagnetics/mhdFoam/mhdFoam.C](../../../17-other-libraries/files/9c/mhdfoam.c--9cb4b58689a2.md)
- [applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointShapeOptimisationFoam.C](../../../17-other-libraries/files/ed/adjointshapeoptimisationfoam.c--edfd65cc01a2.md)
- [applications/legacy/incompressible/icoFoam/icoFoam.C](../../../17-other-libraries/files/ab/icofoam.c--ab0010b9a47e.md)
- [applications/legacy/incompressible/porousSimpleFoam/porousSimpleFoam.C](../../../17-other-libraries/files/23/poroussimplefoam.c--23250fda2f39.md)
- [applications/legacy/incompressible/shallowWaterFoam/shallowWaterFoam.C](../../../17-other-libraries/files/f6/shallowwaterfoam.c--f6afc7eba01a.md)
- [applications/modules/compressibleMultiphaseVoF/compressibleMultiphaseVoF.C](../../../02-solver-modules/files/5e/compressiblemultiphasevof.c--5e6191731884.md)
- [applications/modules/compressibleMultiphaseVoF/pressureCorrector.C](../../../02-solver-modules/files/19/pressurecorrector.c--199d86d8efd8.md)
- [applications/modules/compressibleMultiphaseVoF/thermophysicalPredictor.C](../../../02-solver-modules/files/ff/thermophysicalpredictor.c--ffdddeb3c3e6.md)
- [applications/modules/compressibleVoF/compressibleVoF.C](../../../02-solver-modules/files/b7/compressiblevof.c--b7d8de5a4f40.md)
- [applications/modules/compressibleVoF/fvModels/VoFSolidificationMelting/VoFSolidificationMelting.C](../../../02-solver-modules/files/c7/vofsolidificationmelting.c--c7a6854523bf.md)
- [applications/modules/compressibleVoF/pressureCorrector.C](../../../02-solver-modules/files/52/pressurecorrector.c--5263cc73e8ec.md)
- [applications/modules/compressibleVoF/thermophysicalPredictor.C](../../../02-solver-modules/files/59/thermophysicalpredictor.c--591c20ed3691.md)
- [applications/modules/fluid/thermophysicalPredictor.C](../../../02-solver-modules/files/ff/thermophysicalpredictor.c--ff3e975f83bb.md)
- [applications/modules/incompressibleDenseParticleFluid/correctPressure.C](../../../02-solver-modules/files/d2/correctpressure.c--d2a285686407.md)
- [applications/modules/incompressibleDenseParticleFluid/momentumPredictor.C](../../../02-solver-modules/files/d5/momentumpredictor.c--d5cab762b959.md)
- [applications/modules/incompressibleDriftFlux/incompressibleDriftFlux.C](../../../02-solver-modules/files/af/incompressibledriftflux.c--af989babb79b.md)
- [applications/modules/incompressibleFluid/correctPressure.C](../../../02-solver-modules/files/ae/correctpressure.c--ae7b387bbaad.md)
- [applications/modules/incompressibleMultiphaseVoF/pressureCorrector.C](../../../02-solver-modules/files/f5/pressurecorrector.c--f54bea298648.md)
- [applications/modules/incompressibleVoF/fvModels/VoFCavitation/VoFCavitation.C](../../../02-solver-modules/files/6a/vofcavitation.c--6a6a9d472bf4.md)
- [applications/modules/isothermalFilm/continuityPredictor.C](../../../02-solver-modules/files/90/continuitypredictor.c--9069418c14a1.md)
- [applications/modules/isothermalFilm/isothermalFilm.C](../../../02-solver-modules/files/89/isothermalfilm.c--894f1e2e362a.md)
- [applications/modules/isothermalFluid/correctBuoyantPressure.C](../../../02-solver-modules/files/87/correctbuoyantpressure.c--87005fc57fa1.md)
- [applications/modules/isothermalFluid/correctPressure.C](../../../02-solver-modules/files/b8/correctpressure.c--b879f8e6e3fb.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
