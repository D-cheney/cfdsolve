---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c6695a4193db"
title: "OpenFOAM 14 源码解析：CoulaloglouTavlarides.H"
summary: "该文件声明或实现 `CoulaloglouTavlarides`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/coalescenceModels/CoulaloglouTavlarides/CoulaloglouTavlarides.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：CoulaloglouTavlarides.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/coalescenceModels/CoulaloglouTavlarides/CoulaloglouTavlarides.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：154 行
- 文件标识：`c6695a4193db`

## 2. 功能说明

该文件声明或实现 `CoulaloglouTavlarides`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model of Coulaloglou and Tavlarides (1977). The coalescence rate is calculated by \f[ C_1 (v_i^{2/3} + v_j^{2/3}) (v_i^{2/9} + v_j^{2/9})^{1/2} \frac{\epsilon_c^{1/3}}{1 + \alpha_d} \text{exp} \left[ - C_2 \frac{\mu_c \rho_c}{\sigma^2} \frac{\epsilon_c}{(1 + \alpha_d)^{3}} \left( \frac{v_i^{1/3} v_j^{1/3}}{v_i^{1/3} + v_j^{1/3}} \right)^{4} \right] \f] where \vartable \sigma | Surface tension [N/m] v_i | Volume of droplet i [m^3] v_j | Volume of droplet j [m^3] \epsilon_c | Turbulent dissipation rate of continuous phase [m^2/s^3] \alpha_d | Total void fraction of disperse phase [-] \mu_c | Molecular dynamic viscosity of liquid phase [Pa s] \rho_c | Density of continuous phase [kg/m^3] \endvartable References: \verbatim Coulaloglou, C. A., & Tavlarides, L. L. (1977). Description of interaction processes in agitated liquid-liquid dispersions. Chemical Engineering Science, 32(11), 1289-1297

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `CoulaloglouTavlarides` | 100 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`coalescenceModel.H`](../../../02-solver-modules/files/68/coalescencemodel.h--6815becd5c16.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/CoulaloglouTavlarides/CoulaloglouTavlarides.C](../../../02-solver-modules/files/1e/coulalogloutavlarides.c--1e427082bc86.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
