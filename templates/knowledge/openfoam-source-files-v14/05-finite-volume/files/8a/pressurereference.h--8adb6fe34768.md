---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8adb6fe34768"
title: "OpenFOAM 14 源码解析：pressureReference.H"
summary: "该文件声明或实现 `pressureReference`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/pressureReference/pressureReference.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pressureReference.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/pressureReference/pressureReference.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：113 行
- 文件标识：`8adb6fe34768`

## 2. 功能说明

该文件声明或实现 `pressureReference`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Provides controls for the pressure reference in closed-volume simulations

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pressureReference` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`dimensionedScalar.H`](../../../04-core-runtime/files/94/dimensionedscalar.h--94226c94054a.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`pressureReferenceI.H`](../../../05-finite-volume/files/da/pressurereferencei.h--daf33a5db1d2.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)
- [applications/legacy/compressible/rhoPorousSimpleFoam/rhoPorousSimpleFoam.C](../../../17-other-libraries/files/b7/rhoporoussimplefoam.c--b77cea8351a3.md)
- [applications/legacy/electromagnetics/mhdFoam/mhdFoam.C](../../../17-other-libraries/files/9c/mhdfoam.c--9cb4b58689a2.md)
- [applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointShapeOptimisationFoam.C](../../../17-other-libraries/files/ed/adjointshapeoptimisationfoam.c--edfd65cc01a2.md)
- [applications/legacy/incompressible/icoFoam/icoFoam.C](../../../17-other-libraries/files/ab/icofoam.c--ab0010b9a47e.md)
- [applications/legacy/incompressible/porousSimpleFoam/porousSimpleFoam.C](../../../17-other-libraries/files/23/poroussimplefoam.c--23250fda2f39.md)
- [applications/modules/compressibleMultiphaseVoF/compressibleMultiphaseVoF.H](../../../02-solver-modules/files/2d/compressiblemultiphasevof.h--2de7769ce0e1.md)
- [applications/modules/incompressibleDenseParticleFluid/incompressibleDenseParticleFluid.H](../../../02-solver-modules/files/6e/incompressibledenseparticlefluid.h--6ec93149946f.md)
- [applications/modules/incompressibleFluid/incompressibleFluid.H](../../../02-solver-modules/files/d1/incompressiblefluid.h--d1866c69fa0d.md)
- [applications/modules/isothermalFluid/isothermalFluid.H](../../../02-solver-modules/files/4d/isothermalfluid.h--4db48b548d4f.md)
- [applications/modules/multiphaseEuler/multiphaseEuler.H](../../../02-solver-modules/files/1d/multiphaseeuler.h--1da7f90917b2.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.C](../../../02-solver-modules/files/1c/phasesystem.c--1cb251073247.md)
- [applications/modules/VoFSolver/VoFSolver.H](../../../02-solver-modules/files/76/vofsolver.h--766e82b270c1.md)
- [src/finiteVolume/cfdTools/general/correctPhi/CorrectPhi.C](../../../05-finite-volume/files/13/correctphi.c--131ea778a3a4.md)
- [src/finiteVolume/cfdTools/general/pressureReference/pressureReference.C](../../../05-finite-volume/files/ca/pressurereference.c--ca2f0d6ee059.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
