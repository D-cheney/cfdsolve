---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d1317205357a"
title: "OpenFOAM 14 源码解析：Liao.H"
summary: "该文件声明或实现 `Liao`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/breakupModels/Liao/Liao.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：Liao.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/breakupModels/Liao/Liao.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：168 行
- 文件标识：`d1317205357a`

## 2. 功能说明

该文件声明或实现 `Liao`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Bubble breakup model of Liao et al. (2015). The terminal velocities and drag coefficients are computed by an iterative procedure based on the drag model of Ishii and Zuber (1979) at the beginning of the simulation, assuming single bubbles rising in quiescent liquid. References: \verbatim Liao, Y.; Rzehak, R.; Lucas, D.; Krepper, E. (2015). Baseline closure models for dispersed bubbly flow: Bubble coalescence and breakup. Chemical Engineering Science, 122, 336-349. Ishii, M., & Zuber, N. (1979). Drag coefficient and relative velocity in bubbly, droplet or particulate flows. AIChE Journal, 25(5), 843-855. \endverbatim Usage \table Property | Description | Required | Default value BTurb | coefficient BTurb | no | 1.0 BShear | coefficient Bbuoy | no | 1.0 BEddy | coefficient BEddy | no | 1.0 BFric | coefficient Bwake | no | 1.0 turbulence | Switch for turbulence | yes | none laminarShear | S

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Liao` | 88 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- `binary.H`
- [`LiaoBase.H`](../../../02-solver-modules/files/50/liaobase.h--501372e1c0e8.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/populationBalance/breakupModels/Liao/Liao.C](../../../02-solver-modules/files/cc/liao.c--cc556dd630e3.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
