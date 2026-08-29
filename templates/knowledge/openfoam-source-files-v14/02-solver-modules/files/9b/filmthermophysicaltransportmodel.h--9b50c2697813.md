---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9b50c2697813"
title: "OpenFOAM 14 源码解析：filmThermophysicalTransportModel.H"
summary: "该文件为“模块化求解器”提供 `filmThermophysicalTransportModel` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/film/filmThermophysicalTransportModels/filmThermophysicalTransportModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：filmThermophysicalTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/film/filmThermophysicalTransportModels/filmThermophysicalTransportModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：60 行
- 文件标识：`9b50c2697813`

## 2. 功能说明

该文件为“模块化求解器”提供 `filmThermophysicalTransportModel` 相关接口、模板实例或支撑定义。

中文导航角色：模块化求解器实现。

上游说明：Typedefs for film thermophysical transport models

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)
- [`PhaseThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/75/phasethermophysicaltransportmodel.h--75091d8323e3.md)
- [`filmCompressibleMomentumTransportModel.H`](../../../02-solver-modules/files/aa/filmcompressiblemomentumtransportmodel.h--aa36e9d41308.md)

## 8. 直接上层引用

- [applications/modules/film/film.H](../../../02-solver-modules/files/17/film.h--17e7e29ab737.md)
- [applications/modules/film/filmThermophysicalTransportModels/filmThermophysicalTransportModels.H](../../../02-solver-modules/files/37/filmthermophysicaltransportmodels.h--37818052a20c.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
