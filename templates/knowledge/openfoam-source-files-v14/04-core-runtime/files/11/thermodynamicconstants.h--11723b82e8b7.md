---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-11723b82e8b7"
title: "OpenFOAM 14 源码解析：thermodynamicConstants.H"
summary: "该文件为“核心运行时”提供 `thermodynamicConstants` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/global/constants/thermodynamic/thermodynamicConstants.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：thermodynamicConstants.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/global/constants/thermodynamic/thermodynamicConstants.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：72 行
- 文件标识：`11723b82e8b7`

## 2. 功能说明

该文件为“核心运行时”提供 `thermodynamicConstants` 相关接口、模板实例或支撑定义。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Thermodynamic scalar constants

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- 未检测到直接 `#include`；脚本/清单或自包含实现可能通过环境和命令产生依赖。

## 8. 直接上层引用

- [src/OpenFOAM/global/constants/constants.H](../../../04-core-runtime/files/2d/constants.h--2d9792376d91.md)
- [src/OpenFOAM/global/constants/thermodynamic/thermodynamicConstants.C](../../../04-core-runtime/files/27/thermodynamicconstants.c--279b4871642e.md)
- [src/thermophysicalModels/specie/reaction/reactionRate/fluxLimitedLangmuirHinshelwoodReactionRate/fluxLimitedLangmuirHinshelwoodReactionRateI.H](../../../08-thermophysical/files/79/fluxlimitedlangmuirhinshelwoodreactionratei.h--7931dc4fb861.md)
- [src/thermophysicalModels/specie/specie/specie.H](../../../08-thermophysical/files/23/specie.h--23b4330818d5.md)
- [src/thermophysicalModels/specie/thermo/thermo/thermo.H](../../../08-thermophysical/files/30/thermo.h--308626059d5d.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/aC10H7CH3/aC10H7CH3.C](../../../08-thermophysical/files/e2/ac10h7ch3.c--e21ecdca5590.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/Ar/Ar.C](../../../08-thermophysical/files/2d/ar.c--2d5e07e16142.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/bC10H7CH3/bC10H7CH3.C](../../../08-thermophysical/files/7a/bc10h7ch3.c--7a9118b29dd6.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C10H22/C10H22.C](../../../08-thermophysical/files/a0/c10h22.c--a0299ea8b05f.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C12H26/C12H26.C](../../../08-thermophysical/files/ec/c12h26.c--ecd83f225407.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C13H28/C13H28.C](../../../08-thermophysical/files/e9/c13h28.c--e957331f8c4b.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C14H30/C14H30.C](../../../08-thermophysical/files/5f/c14h30.c--5fffcb97ebdf.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C16H34/C16H34.C](../../../08-thermophysical/files/5c/c16h34.c--5cb073f219bd.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C2H5OH/C2H5OH.C](../../../08-thermophysical/files/f0/c2h5oh.c--f0293cb8eaf9.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C2H6/C2H6.C](../../../08-thermophysical/files/df/c2h6.c--df2393ee40d3.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C2H6O/C2H6O.C](../../../08-thermophysical/files/1d/c2h6o.c--1df252e5c492.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C3H6O/C3H6O.C](../../../08-thermophysical/files/28/c3h6o.c--280a7ba1a080.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C3H8/C3H8.C](../../../08-thermophysical/files/f0/c3h8.c--f00c5b8c929f.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C4H10O/C4H10O.C](../../../08-thermophysical/files/5d/c4h10o.c--5d1cdb01289f.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C6H14/C6H14.C](../../../08-thermophysical/files/cd/c6h14.c--cd6cee4b0268.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C6H6/C6H6.C](../../../08-thermophysical/files/78/c6h6.c--789aa7a1439a.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C7H16/C7H16.C](../../../08-thermophysical/files/83/c7h16.c--832993b8df94.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C7H8/C7H8.C](../../../08-thermophysical/files/e6/c7h8.c--e6ee4e128ea0.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C8H10/C8H10.C](../../../08-thermophysical/files/35/c8h10.c--3567cb3e8acd.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C8H18/C8H18.C](../../../08-thermophysical/files/2a/c8h18.c--2ac79ff4b4d7.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
