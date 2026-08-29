---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0e19ba72056e"
title: "OpenFOAM 14 源码解析：solver.H"
summary: "该文件实现 `solver` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/solver/solver.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：solver.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/solver/solver.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：239 行
- 文件标识：`0e19ba72056e`

## 2. 功能说明

该文件实现 `solver` 相关对象的读取、写出或流序列化。

中文导航角色：有限体积离散核心。

上游说明：Abstract base class for run-time selectable region solvers.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `solver` | 59 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `transient` | 163 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`pimpleNoLoopControl.H`](../../../05-finite-volume/files/21/pimplenoloopcontrol.h--211d4bd02bbb.md)
- [`fvModels.H`](../../../05-finite-volume/files/60/fvmodels.h--6040b512bd89.md)
- [`fvConstraints.H`](../../../05-finite-volume/files/68/fvconstraints.h--68dca4db4ada.md)
- [`regionName.H`](../../../04-core-runtime/files/49/regionname.h--495c11cc6099.md)

## 8. 直接上层引用

- [applications/modules/basicFluidSolver/basicFluidSolver.H](../../../02-solver-modules/files/f8/basicfluidsolver.h--f8f825032c0c.md)
- [applications/modules/isothermalFilm/isothermalFilm.H](../../../02-solver-modules/files/a7/isothermalfilm.h--a76e491fa6a0.md)
- [applications/modules/movingMesh/movingMesh.H](../../../02-solver-modules/files/c3/movingmesh.h--c3c35176c96b.md)
- [applications/modules/solid/solid.H](../../../02-solver-modules/files/b5/solid.h--b5ea4188c462.md)
- [applications/solvers/foamMultiRun/regionSolvers/regionSolvers.C](../../../01-solver-entry/files/e4/regionsolvers.c--e46558241789.md)
- [applications/solvers/foamMultiRun/regionSolvers/regionSolvers.H](../../../01-solver-entry/files/a3/regionsolvers.h--a333ef8c4315.md)
- [applications/solvers/foamMultiRun/setDeltaT.H](../../../01-solver-entry/files/e7/setdeltat.h--e75db1a5d022.md)
- [applications/solvers/foamRun/foamRun.C](../../../01-solver-entry/files/3d/foamrun.c--3d7dd5e70d12.md)
- [applications/solvers/foamRun/setDeltaT.H](../../../01-solver-entry/files/05/setdeltat.h--0533a25f5c17.md)
- [applications/utilities/postProcessing/foamPostProcess/foamPostProcess.C](../../../03-utilities/files/22/foampostprocess.c--22d5380c4863.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleMultiRegionControl/pimpleMultiRegionControl.H](../../../05-finite-volume/files/78/pimplemultiregioncontrol.h--784001142878.md)
- [src/finiteVolume/solver/solver.C](../../../05-finite-volume/files/96/solver.c--964bf466fa3f.md)
- [src/finiteVolume/solver/solverNew.C](../../../05-finite-volume/files/24/solvernew.c--2469e2778aa3.md)
- [src/reactionModels/functionObjects/adjustTimeStepToReaction/adjustTimeStepToReaction.C](../../../08-thermophysical/files/bc/adjusttimesteptoreaction.c--bcc15d4aae6f.md)
- [src/thermophysicalModels/chemistryModel/functionObjects/adjustTimeStepToChemistry/adjustTimeStepToChemistry.C](../../../08-thermophysical/files/de/adjusttimesteptochemistry.c--de30f7f4a1c4.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
