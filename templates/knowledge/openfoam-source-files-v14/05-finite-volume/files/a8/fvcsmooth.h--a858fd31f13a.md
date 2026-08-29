---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a858fd31f13a"
title: "OpenFOAM 14 源码解析：fvcSmooth.H"
summary: "该文件为“有限体积离散”提供 `fvcSmooth` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/fvc/fvcSmooth/fvcSmooth.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvcSmooth.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/fvc/fvcSmooth/fvcSmooth.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：96 行
- 文件标识：`a858fd31f13a`

## 2. 功能说明

该文件为“有限体积离散”提供 `fvcSmooth` 相关接口、模板实例或支撑定义。

中文导航角色：有限体积离散核心。

上游说明：Provides functions smooth spread and sweep which use the FvFaceCellWave algorithm to smooth and redistribute the first field argument. smooth: smooths the field by ensuring the values in neighbouring cells are at least coeff* the cell value. spread: redistributes the field by spreading the maximum value within the region defined by the value (being between alphaMax and alphaMin) and gradient of alpha (where the difference between the values in neighbouring cells is larger than alphaDiff). sweep: redistributes the field by sweeping the maximum value where the gradient of alpha is large (where the difference between the values in neighbouring cells is larger than alphaDiff) away from that starting point of the sweep.

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)

## 8. 直接上层引用

- [applications/modules/incompressibleFluid/setRDeltaT.C](../../../02-solver-modules/files/2d/setrdeltat.c--2d2842840e1f.md)
- [applications/modules/isothermalFluid/setRDeltaT.C](../../../02-solver-modules/files/29/setrdeltat.c--29967fb8c375.md)
- [applications/modules/multicomponentFluid/setRDeltaT.C](../../../02-solver-modules/files/64/setrdeltat.c--64220523f0b8.md)
- [applications/modules/multiphaseEuler/setRDeltaT.C](../../../02-solver-modules/files/74/setrdeltat.c--7449d867c777.md)
- [applications/modules/multiphaseVoFSolver/setInterfaceRDeltaT.C](../../../02-solver-modules/files/c9/setinterfacerdeltat.c--c9a93b36f4bf.md)
- [applications/modules/shockFluid/setRDeltaT.C](../../../02-solver-modules/files/53/setrdeltat.c--5308b3e03236.md)
- [applications/modules/twoPhaseVoFSolver/setInterfaceRDeltaT.C](../../../02-solver-modules/files/99/setinterfacerdeltat.c--99050fdf7817.md)
- [src/finiteVolume/finiteVolume/fvc/fvcSmooth/fvcSmooth.C](../../../05-finite-volume/files/20/fvcsmooth.c--2076225e8e81.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
