---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-138530a0a774"
title: "OpenFOAM 14 源码解析：PrinceBlanch.H"
summary: "该文件声明或实现 `PrinceBlanch`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/coalescenceModels/PrinceBlanch/PrinceBlanch.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：PrinceBlanch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/coalescenceModels/PrinceBlanch/PrinceBlanch.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：234 行
- 文件标识：`138530a0a774`

## 2. 功能说明

该文件声明或实现 `PrinceBlanch`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model of Prince and Blanch (1990). The coalescence rate is calculated by \f[ \left( \theta_{ij}^{T} + \theta_{ij}^{B} + \theta_{ij}^{LS} \right) \lambda_{ij}\;, \f] with the coalescence efficiency \f[ \lambda_{ij} = \mathrm{exp} \left( - \sqrt{\frac{r_{ij}^3 \rho_c}{16 \sigma}} \mathrm{ln} \left(\frac{h_0}{h_f}\right) \epsilon_c^{1/3}/r_{ij}^{2/3} \right)\;, \f] the turbulent collision rate \f[ \theta_{ij}^{T} = C_1 \pi (d_i + d_j)^{2} \epsilon_c^{1/3} \sqrt{d_{i}^{2/3} + d_{j}^{2/3}}\;, \f] the buoyancy-driven collision rate \f[ \theta_{ij}^{B} = S_{ij} \left| u_{ri} - u_{rj} \right|\;, \f] and the laminar shear collision rate \f[ \theta_{ij}^{LS} = \frac{1}{6} \left(d_i + d_j\right)^{3} \dot{\gamma}_c\;. \f] The rise velocity of bubble i is calculated by \f[ u_{ri} = \sqrt{2.14 \sigma / \left(\rho_c d_i \right) + 0.505 g d_i}\;, \f] the equivalent radius by \f[ r_{ij} = \left( \frac{1}

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PrinceBlanch` | 162 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`coalescenceModel.H`](../../../02-solver-modules/files/68/coalescencemodel.h--6815becd5c16.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/PrinceBlanch/PrinceBlanch.C](../../../02-solver-modules/files/a0/princeblanch.c--a0700a93d70e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
