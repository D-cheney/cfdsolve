---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6040b512bd89"
title: "OpenFOAM 14 源码解析：fvModels.H"
summary: "该文件实现 `fvModels` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/fvModels/fvModels.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvModels.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/fvModels/fvModels.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：333 行
- 文件标识：`6040b512bd89`

## 2. 功能说明

该文件实现 `fvModels` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：Finite volume models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvModels` | 57 |
| `typeGlobal` | 312 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)
- [`PtrListDictionary.H`](../../../04-core-runtime/files/2b/ptrlistdictionary.h--2b4aa9e279df.md)
- [`DemandDrivenMeshObject.H`](../../../04-core-runtime/files/0c/demanddrivenmeshobject.h--0c78b4372cd3.md)
- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`geometricOneField.H`](../../../05-finite-volume/files/95/geometriconefield.h--95138167ad6f.md)
- [`fvModelsTemplates.C`](../../../05-finite-volume/files/e4/fvmodelstemplates.c--e4f700df28d3.md)

## 8. 直接上层引用

- [applications/legacy/basic/laplacianFoam/laplacianFoam.C](../../../17-other-libraries/files/b0/laplacianfoam.c--b0c02eb45927.md)
- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)
- [applications/legacy/compressible/rhoPorousSimpleFoam/rhoPorousSimpleFoam.C](../../../17-other-libraries/files/b7/rhoporoussimplefoam.c--b77cea8351a3.md)
- [applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointShapeOptimisationFoam.C](../../../17-other-libraries/files/ed/adjointshapeoptimisationfoam.c--edfd65cc01a2.md)
- [applications/legacy/incompressible/porousSimpleFoam/porousSimpleFoam.C](../../../17-other-libraries/files/23/poroussimplefoam.c--23250fda2f39.md)
- [applications/modules/multiphaseEuler/functionObjects/adjustTimeStepToNucleation/adjustTimeStepToNucleation.C](../../../02-solver-modules/files/7e/adjusttimesteptonucleation.c--7e4daa0f34f7.md)
- [applications/modules/multiphaseEuler/functionObjects/wallBoilingProperty/wallBoilingProperty.C](../../../02-solver-modules/files/33/wallboilingproperty.c--33c3bac97576.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/kineticTheoryModel/kineticTheoryModel.C](../../../02-solver-modules/files/ef/kinetictheorymodel.c--efec362ba811.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATE.C](../../../02-solver-modules/files/61/iate.c--617b89faf05c.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.H](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [applications/modules/XiFluid/SuModels/transport/transport_SuModel.C](../../../02-solver-modules/files/67/transport_sumodel.c--675cdb8e51b3.md)
- [applications/modules/XiFluid/XiModels/transport/transport.C](../../../02-solver-modules/files/3c/transport.c--3c5f3e493569.md)
- [applications/solvers/boundaryFoam/boundaryFoam.C](../../../01-solver-entry/files/3a/boundaryfoam.c--3a004ad2140b.md)
- [src/atmosphericModels/kEpsilonLopesdaCosta/kEpsilonLopesdaCosta.C](../../../17-other-libraries/files/3c/kepsilonlopesdacosta.c--3c2ee108f248.md)
- [src/finiteVolume/cfdTools/general/fvModels/fvModels.C](../../../05-finite-volume/files/f4/fvmodels.c--f4a1422bdc66.md)
- [src/finiteVolume/cfdTools/general/fvModels/fvModelsTemplates.C](../../../05-finite-volume/files/e4/fvmodelstemplates.c--e4f700df28d3.md)
- [src/finiteVolume/solver/solver.H](../../../05-finite-volume/files/0e/solver.h--0e19ba72056e.md)
- [src/functionObjects/solvers/age/age.C](../../../14-postprocessing/files/ae/age.c--ae51614b81d8.md)
- [src/functionObjects/solvers/phaseScalarTransport/phaseScalarTransport.C](../../../14-postprocessing/files/d0/phasescalartransport.c--d03f165e0e1c.md)
- [src/functionObjects/solvers/scalarTransport/scalarTransport.C](../../../14-postprocessing/files/88/scalartransport.c--88c19cb5c21e.md)
- [src/fvConstraints/zeroDimensionalFixedPressure/zeroDimensionalFixedPressureConstraint.C](../../../12-boundaries-sources/files/61/zerodimensionalfixedpressureconstraint.c--61dd57e38689.md)
- [src/fvModels/general/heatSource/heatSource.C](../../../12-boundaries-sources/files/b1/heatsource.c--b15e8d8e7b25.md)
- [src/fvModels/interRegion/heatTransfer/heatTransfer.C](../../../12-boundaries-sources/files/a5/heattransfer.c--a5df118da76c.md)
- [src/fvModels/interRegion/interRegionModel/interRegionModel.C](../../../12-boundaries-sources/files/e2/interregionmodel.c--e2257cac385d.md)
- [src/fvModels/rigidBodyPropellerDisk/propellerDiskForce/propellerDiskForce.C](../../../12-boundaries-sources/files/29/propellerdiskforce.c--29a1eeb202f2.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
