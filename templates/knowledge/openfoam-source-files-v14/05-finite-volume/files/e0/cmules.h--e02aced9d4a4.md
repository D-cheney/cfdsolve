---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e02aced9d4a4"
title: "OpenFOAM 14 源码解析：CMULES.H"
summary: "该文件声明或实现 `RhoType`、`SpType`、`PsiMaxType`、`PsiMinType`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMatrices/solvers/MULES/CMULES.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：CMULES.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMatrices/solvers/MULES/CMULES.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：224 行
- 文件标识：`e02aced9d4a4`

## 2. 功能说明

该文件声明或实现 `RhoType`、`SpType`、`PsiMaxType`、`PsiMinType`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：CMULES: Multidimensional universal limiter for explicit corrected implicit solution. Solve a convective-only transport equation using an explicit universal multi-dimensional limiter to correct an implicit conservative bounded obtained using rigorously bounded schemes such as Euler-implicit in time upwind in space. Parameters are the variable to solve, the normal convective flux and the actual explicit flux of the variable which is also used to return limited flux used in the bounded-solution.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `RhoType` | 110 |
| `SpType` | 111 |
| `PsiMaxType` | 112 |
| `PsiMinType` | 113 |
| `RdeltaTType` | 148 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`MULES.H`](../../../05-finite-volume/files/44/mules.h--4492211902ae.md)
- [`EulerDdtScheme.H`](../../../05-finite-volume/files/af/eulerddtscheme.h--afa5e4cb5ca0.md)
- [`localEulerDdtScheme.H`](../../../05-finite-volume/files/fb/localeulerddtscheme.h--fb7ce050de98.md)
- [`gaussConvectionScheme.H`](../../../05-finite-volume/files/2a/gaussconvectionscheme.h--2abb1c2b592f.md)
- [`CMULESTemplates.C`](../../../05-finite-volume/files/dc/cmulestemplates.c--dc3553108074.md)

## 8. 直接上层引用

- [applications/modules/compressibleMultiphaseVoF/alphaPredictor.C](../../../02-solver-modules/files/b8/alphapredictor.c--b84b8267c9da.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystemSolve.C](../../../02-solver-modules/files/98/phasesystemsolve.c--98397a99cdb9.md)
- [applications/modules/twoPhaseSolver/alphaPredictor.C](../../../02-solver-modules/files/34/alphapredictor.c--3466ce3e439c.md)
- [applications/modules/XiFluid/thermophysicalPredictor.C](../../../02-solver-modules/files/ff/thermophysicalpredictor.c--ff733a56bae4.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/CMULESTemplates.C](../../../05-finite-volume/files/dc/cmulestemplates.c--dc3553108074.md)
- [src/functionObjects/solvers/scalarTransport/scalarTransport.C](../../../14-postprocessing/files/88/scalartransport.c--88c19cb5c21e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
