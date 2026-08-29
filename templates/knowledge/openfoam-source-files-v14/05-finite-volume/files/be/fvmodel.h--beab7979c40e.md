---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-beab7979c40e"
title: "OpenFOAM 14 源码解析：fvModel.H"
summary: "该文件实现 `fvModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/fvModels/fvModel.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/fvModels/fvModel.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：442 行
- 文件标识：`beab7979c40e`

## 2. 功能说明

该文件实现 `fvModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：Finite volume model abstract base class.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 56 |
| `polyTopoChangeMap` | 58 |
| `polyMeshMap` | 59 |
| `polyDistributionMap` | 60 |
| `fvModel` | 65 |
| `iNew` | 208 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvMatricesFwd.H`](../../../05-finite-volume/files/c0/fvmatricesfwd.h--c0b6e3525b0b.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`dimensionSet.H`](../../../04-core-runtime/files/bc/dimensionset.h--bca4d2124acd.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`fvModelM.H`](../../../05-finite-volume/files/c5/fvmodelm.h--c59d5a7a4ba0.md)
- [`geometricOneField.H`](../../../05-finite-volume/files/95/geometriconefield.h--95138167ad6f.md)
- [`fvModelI.H`](../../../05-finite-volume/files/c4/fvmodeli.h--c4038b4e267f.md)
- [`fvModelTemplates.C`](../../../05-finite-volume/files/13/fvmodeltemplates.c--13acc19620f0.md)

## 8. 直接上层引用

- [applications/modules/compressibleVoF/fvModels/VoFCavitation/VoFCavitation.H](../../../02-solver-modules/files/57/vofcavitation.h--57a49848bef0.md)
- [applications/modules/compressibleVoF/fvModels/VoFClouds/VoFClouds.H](../../../02-solver-modules/files/c0/vofclouds.h--c06b108f7d04.md)
- [applications/modules/compressibleVoF/fvModels/VoFSolidificationMelting/VoFSolidificationMelting.H](../../../02-solver-modules/files/c1/vofsolidificationmelting.h--c192c92cd8c4.md)
- [applications/modules/compressibleVoF/fvModels/VoFTurbulenceDamping/VoFTurbulenceDamping.H](../../../02-solver-modules/files/5b/vofturbulencedamping.h--5baabb151294.md)
- [applications/modules/incompressibleVoF/fvModels/VoFCavitation/VoFCavitation.H](../../../02-solver-modules/files/d0/vofcavitation.h--d045b6305e54.md)
- [applications/modules/incompressibleVoF/fvModels/VoFTurbulenceDamping/VoFTurbulenceDamping.H](../../../02-solver-modules/files/be/vofturbulencedamping.h--be32278f00ae.md)
- [applications/modules/isothermalFilm/fvModels/filmCloudTransfer/filmCloudTransfer.H](../../../02-solver-modules/files/4d/filmcloudtransfer.h--4d990d2e2029.md)
- [applications/modules/isothermalFilm/fvModels/filmVoFTransfer/filmVoFTransfer.H](../../../02-solver-modules/files/e1/filmvoftransfer.h--e163db835293.md)
- [applications/modules/isothermalFilm/fvModels/filmVoFTransfer/VoFFilmTransfer.H](../../../02-solver-modules/files/e7/voffilmtransfer.h--e7cb2257f86e.md)
- [applications/modules/multiphaseEuler/fvModels/interfaceTurbulenceDamping/interfaceTurbulenceDamping.H](../../../02-solver-modules/files/40/interfaceturbulencedamping.h--40298659dc48.md)
- [applications/modules/multiphaseEuler/fvModels/phaseTurbulenceStabilisation/phaseTurbulenceStabilisation.H](../../../02-solver-modules/files/ce/phaseturbulencestabilisation.h--ceed93a68c31.md)
- [applications/modules/XiFluid/fvModels/ignition/bXiIgnition/bXiIgnition.H](../../../02-solver-modules/files/fc/bxiignition.h--fcdac9b952bd.md)
- [etc/codeTemplates/dynamicCode/codedFvModelTemplate.H](../../../15-build-config/files/c9/codedfvmodeltemplate.h--c90606e77edd.md)
- [src/finiteVolume/cfdTools/general/fvConstraints/fvConstraints.C](../../../05-finite-volume/files/93/fvconstraints.c--93f82cee96b6.md)
- [src/finiteVolume/cfdTools/general/fvModels/fvModel.C](../../../05-finite-volume/files/32/fvmodel.c--32f88c6604a9.md)
- [src/finiteVolume/cfdTools/general/fvModels/fvModelI.H](../../../05-finite-volume/files/c4/fvmodeli.h--c4038b4e267f.md)
- [src/finiteVolume/cfdTools/general/fvModels/fvModels.H](../../../05-finite-volume/files/60/fvmodels.h--6040b512bd89.md)
- [src/finiteVolume/cfdTools/general/fvModels/fvModelTemplates.C](../../../05-finite-volume/files/13/fvmodeltemplates.c--13acc19620f0.md)
- [src/finiteVolume/cfdTools/general/fvSource/fvSource.H](../../../05-finite-volume/files/de/fvsource.h--dea7bbe6bfb1.md)
- [src/finiteVolume/functionObjects/fvModelFunctionObject/fvModelFunctionObject.H](../../../05-finite-volume/files/69/fvmodelfunctionobject.h--690c2132c349.md)
- [src/fvConstraints/zeroDimensionalFixedPressure/zeroDimensionalFixedPressureModel.H](../../../12-boundaries-sources/files/d1/zerodimensionalfixedpressuremodel.h--d1e586ae7c37.md)
- [src/fvModels/general/acceleration/acceleration.H](../../../12-boundaries-sources/files/18/acceleration.h--1836ad78f2db.md)
- [src/fvModels/general/actuationDisk/actuationDisk.H](../../../12-boundaries-sources/files/1b/actuationdisk.h--1bac629f4122.md)
- [src/fvModels/general/buoyancyEnergy/buoyancyEnergy.H](../../../12-boundaries-sources/files/eb/buoyancyenergy.h--eb9df90df219.md)
- [src/fvModels/general/buoyancyForce/buoyancyForce.H](../../../12-boundaries-sources/files/5d/buoyancyforce.h--5dfb2e72ef9d.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
