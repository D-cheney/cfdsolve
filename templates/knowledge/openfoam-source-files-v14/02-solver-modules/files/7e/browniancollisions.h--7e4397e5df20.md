---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7e4397e5df20"
title: "OpenFOAM 14 源码解析：BrownianCollisions.H"
summary: "该文件声明或实现 `BrownianCollisions`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/coalescenceModels/BrownianCollisions/BrownianCollisions.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：BrownianCollisions.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/coalescenceModels/BrownianCollisions/BrownianCollisions.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：160 行
- 文件标识：`7e4397e5df20`

## 2. 功能说明

该文件声明或实现 `BrownianCollisions`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Model describing coagulation due to Brownian motion. Utilises collisional diameters and the Cunningham slip correction. The slip correction coefficient is implemented in the following form: \f[ C_{c_i} = 1 + \lambda [A_1 + A_2 \exp(-A_3 d_i/\lambda)]/d_i\,. \f] The coefficients default to the values proposed by Davis (1945). The mean free path is computed by \f[ \lambda = \frac{kT}{\sqrt{2} \pi p \sigma^{2}}\,. \f] \vartable A_1 | Coefficient [-] A_2 | Coefficient [-] A_3 | Coefficient [-] \sigma | Lennard-Jones parameter [m] \endvartable Reference: \verbatim Davies, C. N. (1945). Definitive equations for the fluid resistance of spheres. Proceedings of the Physical Society, 57(4), 259. \endverbatim Usage \table Property | Description | Required | Default value A1 | Coefficient A1 | no | 2.514 A2 | Coefficient A2 | no | 0.8 A3 | Coefficient A2 | no | 0.55 sigma | Lennard-Jones parameter |

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `BrownianCollisions` | 94 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`coalescenceModel.H`](../../../02-solver-modules/files/68/coalescencemodel.h--6815becd5c16.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/BrownianCollisions/BrownianCollisions.C](../../../02-solver-modules/files/fe/browniancollisions.c--fe400f5e39f1.md)
- [applications/modules/multiphaseEuler/populationBalance/coalescenceModels/DahnekeInterpolation/DahnekeInterpolation.C](../../../02-solver-modules/files/2f/dahnekeinterpolation.c--2fdd968c1680.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
