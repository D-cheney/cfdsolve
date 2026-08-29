---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4492211902ae"
title: "OpenFOAM 14 源码解析：MULES.H"
summary: "该文件声明或实现 `control`、`RhoType`、`SpType`、`SuType`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMatrices/solvers/MULES/MULES.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：MULES.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMatrices/solvers/MULES/MULES.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：352 行
- 文件标识：`4492211902ae`

## 2. 功能说明

该文件声明或实现 `control`、`RhoType`、`SpType`、`SuType`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：MULES: Multidimensional universal limiter for explicit solution. Solve a convective-only transport equation using an explicit universal multi-dimensional limiter. Parameters are the variable to solve, the normal convective flux and the actual explicit flux of the variable which is also used to return limited flux used in the bounded-solution.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `control` | 75 |
| `RhoType` | 169 |
| `SpType` | 170 |
| `SuType` | 171 |
| `PsiMaxType` | 172 |
| `PsiMinType` | 173 |
| `RdeltaTType` | 190 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`surfaceFieldsFwd.H`](../../../05-finite-volume/files/e4/surfacefieldsfwd.h--e4d506ea371b.md)
- [`primitiveFieldsFwd.H`](../../../04-core-runtime/files/7a/primitivefieldsfwd.h--7a313a3cc235.md)
- [`geometricOneField.H`](../../../05-finite-volume/files/95/geometriconefield.h--95138167ad6f.md)
- [`zero.H`](../../../04-core-runtime/files/30/zero.h--30f5e83691a8.md)
- [`zeroField.H`](../../../04-core-runtime/files/47/zerofield.h--47b8c11cb682.md)
- [`UPtrList.H`](../../../04-core-runtime/files/56/uptrlist.h--568a1b406670.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`UniformField.H`](../../../04-core-runtime/files/1a/uniformfield.h--1ac057680340.md)
- [`MULESlimiter.C`](../../../05-finite-volume/files/d9/muleslimiter.c--d9d0373c961c.md)
- [`MULESTemplates.C`](../../../05-finite-volume/files/9d/mulestemplates.c--9d1fa1509f79.md)

## 8. 直接上层引用

- [applications/modules/incompressibleMultiphaseVoF/alphaPredictor.C](../../../02-solver-modules/files/8a/alphapredictor.c--8a1c7f2822a7.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.H](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [applications/modules/multiphaseVoFSolver/multiphaseVoFSolver.H](../../../02-solver-modules/files/e6/multiphasevofsolver.h--e64fae32ef7d.md)
- [applications/modules/twoPhaseSolver/twoPhaseSolver.H](../../../02-solver-modules/files/c0/twophasesolver.h--c09e9817b144.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/CMULES.H](../../../05-finite-volume/files/e0/cmules.h--e02aced9d4a4.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/MULES.C](../../../05-finite-volume/files/f1/mules.c--f1024a37fe81.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/MULESlimiter.C](../../../05-finite-volume/files/d9/muleslimiter.c--d9d0373c961c.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/MULESTemplates.C](../../../05-finite-volume/files/9d/mulestemplates.c--9d1fa1509f79.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
