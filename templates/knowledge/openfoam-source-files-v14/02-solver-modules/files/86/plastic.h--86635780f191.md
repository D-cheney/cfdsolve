---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-86635780f191"
title: "OpenFOAM 14 源码解析：plastic.H"
summary: "该文件声明或实现 `incompressibleDriftFluxMixture`、`plastic`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/incompressibleDriftFlux/mixtureViscosityModels/plastic/plastic.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：plastic.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/incompressibleDriftFlux/mixtureViscosityModels/plastic/plastic.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：120 行
- 文件标识：`86635780f191`

## 2. 功能说明

该文件声明或实现 `incompressibleDriftFluxMixture`、`plastic`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Viscosity correction model for a generic power-law plastic.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `incompressibleDriftFluxMixture` | 51 |
| `plastic` | 60 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`mixtureViscosityModel.H`](../../../02-solver-modules/files/30/mixtureviscositymodel.h--301e0a43814e.md)
- [`dimensionedScalar.H`](../../../04-core-runtime/files/94/dimensionedscalar.h--94226c94054a.md)

## 8. 直接上层引用

- [applications/modules/incompressibleDriftFlux/mixtureViscosityModels/BinghamPlastic/BinghamPlastic.H](../../../02-solver-modules/files/02/binghamplastic.h--02259beca2c2.md)
- [applications/modules/incompressibleDriftFlux/mixtureViscosityModels/plastic/plastic.C](../../../02-solver-modules/files/1d/plastic.c--1d70a7967e2a.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
