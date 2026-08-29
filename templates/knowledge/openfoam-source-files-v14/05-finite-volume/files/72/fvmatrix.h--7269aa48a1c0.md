---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7269aa48a1c0"
title: "OpenFOAM 14 源码解析：fvMatrix.H"
summary: "该文件声明或实现 `fvMatrix`、`UIndirectList`、`fvSolver`、`ListType`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvMatrix.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1216 行
- 文件标识：`7269aa48a1c0`

## 2. 功能说明

该文件声明或实现 `fvMatrix`、`UIndirectList`、`fvSolver`、`ListType`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：A special matrix type and solver, designed for finite volume solutions of scalar equations. Face addressing is used to make all matrix assembly and solution loops vectorise.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMatrix` | 64 |
| `UIndirectList` | 112 |
| `fvSolver` | 234 |
| `ListType` | 349 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **步骤 1**：以 `lduMatrix` 为标量系数骨架保存内部单元耦合。
2. **步骤 2**：保存未知体场引用、量纲、源项以及内部/边界伪矩阵系数。
3. **步骤 3**：通过模板把同一装配结构推广到标量、向量和张量场。
4. **步骤 4**：在求解前合并边界贡献并转换为线性系统，在求解后回写未知场。
5. **步骤 5**：可保存面通量修正，用于非正交修正和守恒通量恢复。

## 6. 数学与离散关系

- $A_P\boldsymbol{\psi}_P+\sum_N A_N\boldsymbol{\psi}_N=\mathbf{b}_P$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`lduMatrix.H`](../../../06-linear-algebra/files/44/ldumatrix.h--4447a7923382.md)
- [`tmp.H`](../../../04-core-runtime/files/ae/tmp.h--aed1da89cfb2.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`zero.H`](../../../04-core-runtime/files/30/zero.h--30f5e83691a8.md)
- [`className.H`](../../../04-core-runtime/files/50/classname.h--5030be164aba.md)
- [`fvMatrix.C`](../../../05-finite-volume/files/0e/fvmatrix.c--0e2e21b817ea.md)
- [`fvScalarMatrix.H`](../../../05-finite-volume/files/2e/fvscalarmatrix.h--2e8428896826.md)

## 8. 直接上层引用

- [applications/modules/compressibleVoF/compressibleInterPhaseTransportModel/compressibleInterPhaseTransportModel.C](../../../02-solver-modules/files/f1/compressibleinterphasetransportmodel.c--f126dade8955.md)
- [applications/modules/compressibleVoF/fvModels/VoFTurbulenceDamping/VoFTurbulenceDamping.C](../../../02-solver-modules/files/14/vofturbulencedamping.c--1406202a103c.md)
- [applications/modules/incompressibleDenseParticleFluid/incompressibleDenseParticleFluid.C](../../../02-solver-modules/files/0d/incompressibledenseparticlefluid.c--0d46d61caa73.md)
- [applications/modules/incompressibleVoF/fvModels/VoFTurbulenceDamping/VoFTurbulenceDamping.C](../../../02-solver-modules/files/d4/vofturbulencedamping.c--d4eca87b0b3a.md)
- [applications/modules/incompressibleVoF/incompressibleInterPhaseTransportModel/incompressibleInterPhaseTransportModel.C](../../../02-solver-modules/files/df/incompressibleinterphasetransportmodel.c--df5a324d3b92.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/IATEsource/IATEsource.C](../../../02-solver-modules/files/0c/iatesource.c--0ceea8c508d8.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/MulticomponentPhaseModel/MulticomponentPhaseModel.C](../../../02-solver-modules/files/85/multicomponentphasemodel.c--851baf9639e7.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/ReactingPhaseModel/ReactingPhaseModel.C](../../../02-solver-modules/files/f6/reactingphasemodel.c--f6a78c5924ac.md)
- [applications/modules/XiFluid/ubMomentumTransportModel/ubMomentumTransportModel.C](../../../02-solver-modules/files/5b/ubmomentumtransportmodel.c--5bf1dacea5fa.md)
- [etc/codeTemplates/dynamicCode/codedFvModelTemplate.C](../../../15-build-config/files/de/codedfvmodeltemplate.c--de39f0655690.md)
- [src/finiteVolume/cfdTools/general/fvSource/fvTotalSource.C](../../../05-finite-volume/files/42/fvtotalsource.c--42124cd3c6b1.md)
- [src/finiteVolume/fields/fvPatchFields/derived/fixedInternalValue/fixedInternalValueFvPatchField.C](../../../05-finite-volume/files/a2/fixedinternalvaluefvpatchfield.c--a2bec1d2dd81.md)
- [src/finiteVolume/finiteVolume/ddtSchemes/ddtScheme/ddtScheme.C](../../../05-finite-volume/files/b0/ddtscheme.c--b00012f20aeb.md)
- [src/finiteVolume/finiteVolume/fvm/fvmD2dt2.C](../../../05-finite-volume/files/6b/fvmd2dt2.c--6bcafdfe609c.md)
- [src/finiteVolume/finiteVolume/fvm/fvmDdt.C](../../../05-finite-volume/files/9e/fvmddt.c--9eacd8a93422.md)
- [src/finiteVolume/finiteVolume/fvm/fvmDiv.C](../../../05-finite-volume/files/24/fvmdiv.c--24156fc1821f.md)
- [src/finiteVolume/finiteVolume/fvm/fvmLaplacian.C](../../../05-finite-volume/files/3b/fvmlaplacian.c--3b5dd1555005.md)
- [src/finiteVolume/finiteVolume/fvm/fvmSup.C](../../../05-finite-volume/files/e2/fvmsup.c--e25ee9be20db.md)
- [src/finiteVolume/finiteVolume/laplacianSchemes/laplacianScheme/laplacianScheme.C](../../../05-finite-volume/files/36/laplacianscheme.c--3631f8391d98.md)
- [src/finiteVolume/fvMatrices/fvScalarMatrix/fvScalarMatrix.H](../../../05-finite-volume/files/2e/fvscalarmatrix.h--2e8428896826.md)
- [src/fvConstraints/zeroDimensionalFixedPressure/zeroDimensionalFixedPressureConstraint.C](../../../12-boundaries-sources/files/61/zerodimensionalfixedpressureconstraint.c--61dd57e38689.md)
- [src/fvModels/general/acceleration/acceleration.C](../../../12-boundaries-sources/files/0f/acceleration.c--0fdfb7e717a1.md)
- [src/fvModels/general/actuationDisk/actuationDisk.C](../../../12-boundaries-sources/files/89/actuationdisk.c--89a2068dee01.md)
- [src/fvModels/general/effectivenessHeatExchanger/effectivenessHeatExchanger.C](../../../12-boundaries-sources/files/f3/effectivenessheatexchanger.c--f31db6734663.md)
- [src/fvModels/general/heatSource/heatSource.C](../../../12-boundaries-sources/files/b1/heatsource.c--b15e8d8e7b25.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
