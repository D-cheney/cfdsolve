---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-757f2368e4d2"
title: "OpenFOAM 14 源码解析：wallBoiling.H"
summary: "该文件声明或实现 `saturationTemperatureModel`、`partitioningModel`、`nucleationSiteModel`、`departureDiameterModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：wallBoiling.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：383 行
- 文件标识：`757f2368e4d2`

## 2. 功能说明

该文件声明或实现 `saturationTemperatureModel`、`partitioningModel`、`nucleationSiteModel`、`departureDiameterModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model for nucleate wall boiling between two phases on the surface of a number of wall patches. This model implements a version of the well-known RPI wall boiling model (Kurul & Podowski, 1991). The model is based on an implementation described in Peltola et al. (2019) and is similar to the model described by Peltola & Pättikangas (2012). References: \verbatim Kurul, N., & Podowski, M.Z. (1991). On the modeling of multidimensional effects in boiling channels. ANS. Proc. National Heat Transfer Con. Minneapolis, Minnesota, USA, 1991. ISBN: 0-89448-162-1, pp. 30-40. \endverbatim \verbatim Peltola, J., Pättikangas, T., Bainbridge, W., Lehnigk, R., Schlegel, F. (2019). On Development and validation of subcooled nucleate boiling models for OpenFOAM Foundation Release. NURETH-18 Conference Proceedings, Portland, Oregon, United States, 2019. \endverbatim \verbatim Peltola, J., & Pättikangas, T.J.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `saturationTemperatureModel` | 142 |
| `partitioningModel` | 146 |
| `nucleationSiteModel` | 147 |
| `departureDiameterModel` | 148 |
| `departureFrequencyModel` | 149 |
| `wallBoilingPhaseChangeRateFvPatchScalarField` | 151 |
| `wallBoiling` | 160 |
| `laggedProperties` | 172 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`wallPhaseChange.H`](../../../02-solver-modules/files/79/wallphasechange.h--79506832c065.md)
- [`nucleation.H`](../../../02-solver-modules/files/8d/nucleation.h--8dd79411f109.md)
- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/functionObjects/wallBoilingProperty/wallBoilingProperty.C](../../../02-solver-modules/files/33/wallboilingproperty.c--33c3bac97576.md)
- [applications/modules/multiphaseEuler/functionObjects/wallBoilingProperty/wallBoilingProperty.H](../../../02-solver-modules/files/fb/wallboilingproperty.h--fb1f5b53abb3.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.C](../../../02-solver-modules/files/cf/wallboiling.c--cf724a332c73.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoilingPhaseChangeRateFvPatchScalarField.H](../../../02-solver-modules/files/0f/wallboilingphasechangeratefvpatchscalarfield.h--0f5f3bd070f9.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
