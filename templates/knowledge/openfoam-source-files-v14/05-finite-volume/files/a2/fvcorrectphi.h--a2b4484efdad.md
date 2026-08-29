---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a2b4484efdad"
title: "OpenFOAM 14 源码解析：fvCorrectPhi.H"
summary: "该文件声明或实现 `pressureReference`、`nonOrthogonalSolutionControl`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/correctPhi/fvCorrectPhi.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvCorrectPhi.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/correctPhi/fvCorrectPhi.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：110 行
- 文件标识：`a2b4484efdad`

## 2. 功能说明

该文件声明或实现 `pressureReference`、`nonOrthogonalSolutionControl`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Flux correction functions to ensure continuity. Required during start-up, restart, mesh-motion etc. when non-conservative fluxes may adversely affect the prediction-part of the solution algorithm (the part before the first pressure solution which would ensure continuity). This is particularly important for VoF and other multi-phase solver in which non-conservative fluxes cause unboundedness of the phase-fraction.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pressureReference` | 58 |
| `nonOrthogonalSolutionControl` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。

## 7. 直接依赖

- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`surfaceFieldsFwd.H`](../../../05-finite-volume/files/e4/surfacefieldsfwd.h--e4d506ea371b.md)

## 8. 直接上层引用

- [applications/modules/incompressibleDenseParticleFluid/moveMesh.C](../../../02-solver-modules/files/f0/movemesh.c--f0b4b1d0e301.md)
- [applications/modules/incompressibleDriftFlux/incompressibleDriftFlux.C](../../../02-solver-modules/files/af/incompressibledriftflux.c--af989babb79b.md)
- [applications/modules/incompressibleFluid/moveMesh.C](../../../02-solver-modules/files/04/movemesh.c--04015e51de31.md)
- [applications/modules/incompressibleMultiphaseVoF/incompressibleMultiphaseVoF.C](../../../02-solver-modules/files/74/incompressiblemultiphasevof.c--74d3f040674d.md)
- [applications/modules/incompressibleVoF/incompressibleVoF.C](../../../02-solver-modules/files/fe/incompressiblevof.c--fea8d8ade25e.md)
- [applications/modules/isothermalFluid/moveMesh.C](../../../02-solver-modules/files/7c/movemesh.c--7cb251f8a67c.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.C](../../../02-solver-modules/files/1c/phasesystem.c--1cb251073247.md)
- [applications/modules/VoFSolver/moveMesh.C](../../../02-solver-modules/files/08/movemesh.c--0880059dadfc.md)
- [src/finiteVolume/cfdTools/general/correctPhi/correctUphiBCs.C](../../../05-finite-volume/files/ee/correctuphibcs.c--ee10af544fc3.md)
- [src/finiteVolume/cfdTools/general/correctPhi/fvCorrectPhi.C](../../../05-finite-volume/files/a8/fvcorrectphi.c--a8c8e8644268.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
