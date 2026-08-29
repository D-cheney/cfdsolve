---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-49fa11851298"
title: "OpenFOAM 14 源码解析：pureMixture.H"
summary: "该文件声明或实现 `pureMixture`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/mixtures/pureMixture/pureMixture.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：pureMixture.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/mixtures/pureMixture/pureMixture.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：147 行
- 文件标识：`49fa11851298`

## 2. 功能说明

该文件声明或实现 `pureMixture`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Pure mixture model. This does no mixing, it just returns the single underlying thermo model.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pureMixture` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`pureMixture.C`](../../../08-thermophysical/files/e3/puremixture.c--e33e09b89c7a.md)

## 8. 直接上层引用

- [src/Lagrangian/LagrangianThermo/fluidLagrangianThermo/fluidLagrangianThermos.C](../../../11-lagrangian/files/c6/fluidlagrangianthermos.c--c64b754a05d2.md)
- [src/Lagrangian/LagrangianThermo/liquidLagrangianThermo/liquidLagrangianThermos.C](../../../11-lagrangian/files/c6/liquidlagrangianthermos.c--c6cbc85822b0.md)
- [src/Lagrangian/LagrangianThermo/solidLagrangianThermo/solidLagrangianThermos.C](../../../11-lagrangian/files/99/solidlagrangianthermos.c--9937bf268759.md)
- [src/thermophysicalModels/basic/liquidThermo/liquidThermos.C](../../../08-thermophysical/files/a6/liquidthermos.c--a6488a6b8966.md)
- [src/thermophysicalModels/basic/mixtures/pureMixture/pureMixture.C](../../../08-thermophysical/files/e3/puremixture.c--e33e09b89c7a.md)
- [src/thermophysicalModels/basic/psiThermo/psiThermos.C](../../../08-thermophysical/files/36/psithermos.c--36866d3b8e3c.md)
- [src/thermophysicalModels/basic/rhoFluidThermo/rhoFluidThermos.C](../../../08-thermophysical/files/48/rhofluidthermos.c--4854ddff0372.md)
- [src/thermophysicalModels/solidThermo/solidThermo/solidThermos.C](../../../08-thermophysical/files/d4/solidthermos.c--d401170a8b6f.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
