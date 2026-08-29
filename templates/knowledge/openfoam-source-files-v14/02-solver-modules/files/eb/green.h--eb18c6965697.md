---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-eb18c6965697"
title: "OpenFOAM 14 源码解析：Green.H"
summary: "该文件声明或实现 `Green`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/incompressibleDriftFlux/packingDispersionModels/Green/Green.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：Green.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/incompressibleDriftFlux/packingDispersionModels/Green/Green.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：125 行
- 文件标识：`eb18c6965697`

## 2. 功能说明

该文件声明或实现 `Green`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Green packing dispersion model for industrial separations Reference: \verbatim Green, M. D., Eberl, M., & Landman, K. A. (1996). Compressive yield stress of flocculated suspensions: determination via experiment. AIChE journal, 42(8), 2308-2318. \endverbatim Usage Example usage: \verbatim packingDispersionModel Green; Green { sigma0 2.11e-3; n 9; alphaGel 0.1; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Green` | 77 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`packingDispersionModel.H`](../../../02-solver-modules/files/36/packingdispersionmodel.h--3629563df7a5.md)

## 8. 直接上层引用

- [applications/modules/incompressibleDriftFlux/packingDispersionModels/Green/Green.C](../../../02-solver-modules/files/f2/green.c--f2daca41715d.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
