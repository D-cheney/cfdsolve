---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-bf48b1df5668"
title: "OpenFOAM 14 源码解析：KochFriedlanderSintering.H"
summary: "该文件声明或实现 `KochFriedlanderSintering`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/fvModels/KochFriedlanderSintering/KochFriedlanderSintering.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：KochFriedlanderSintering.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/fvModels/KochFriedlanderSintering/KochFriedlanderSintering.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：215 行
- 文件标识：`bf48b1df5668`

## 2. 功能说明

该文件声明或实现 `KochFriedlanderSintering`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Sintering model of Koch and Friedlander (1990). The characteristic time for sintering is given by \f[ \tau = c_s d_{p_i}^n T^m \exp(T_a/T \cdot [1 - d_{p,min}/d_{p_i}])\;. \f] Note that the correction factor in the exponential function can be eliminated by setting \&#36;d_{p,min}\&#36; to zero which is done by default. Reference: \verbatim Koch, W., & Friedlander, S. K. (1990). The effect of particle coalescence on the surface area of a coagulating aerosol. Journal of Colloid and Interface Science, 140(2), 419-427. \endverbatim Usage \table Property | Description | Required | Default value Cs | Sintering time coefficient | yes | none n | Particle diameter exponent | yes | none m | Temperature exponent | yes | none Ta | Activation temperature | yes | none dpMin | Minimum primary particle diameter | no | 0 \endtable Example usage: \verbatim sintering { type KochFriedlanderSintering; libs ("libmu

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `KochFriedlanderSintering` | 98 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`populationBalanceModel.H`](../../../02-solver-modules/files/c6/populationbalancemodel.h--c61e09f33eb3.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/KochFriedlanderSintering/KochFriedlanderSintering.C](../../../02-solver-modules/files/c0/kochfriedlandersintering.c--c012a517a7a8.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
