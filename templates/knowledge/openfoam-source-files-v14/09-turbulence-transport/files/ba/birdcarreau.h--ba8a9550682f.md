---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ba8a9550682f"
title: "OpenFOAM 14 源码解析：BirdCarreau.H"
summary: "该文件声明或实现 `BirdCarreau`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/BirdCarreau/BirdCarreau.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：BirdCarreau.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/BirdCarreau/BirdCarreau.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：162 行
- 文件标识：`ba8a9550682f`

## 2. 功能说明

该文件声明或实现 `BirdCarreau`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Bird-Carreau generalised Newtonian viscosity model The Bird-Carreau-Yasuda form is also supported if the optional \c a coefficient is specified. \c a defaults to 2 for the Bird-Carreau model. The coefficient applied to strain rate \&#36;\gamma\&#36; can be specified either as the constant \c k or the critical stress level at the transition to shear thinning \c tauStar if \c tauStar is provided: Kinematic viscosity [m^2/s] \f[ \nu = \nu_\infty\, + (\nu_0 - \nu_\infty)\, \left(1 + (k\gamma)^a \right)^{(n - 1)/a} \f] or \f[ \nu = \nu_\infty + (\nu_0 - \nu_\infty) \left(1 + (\frac{\nu_0\gamma}{\tau^*} )^a \right)^{(n - 1)/a} \f] Example specification for a paint using the first form of the model: \verbatim viscosityModel BirdCarreau; nuInf 1e-5; k 10; n 0.5; \endverbatim Example specification for a polymer using the second form of the model: \verbatim viscosityModel BirdCarreau; nuInf 0; tauStar 9

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `BirdCarreau` | 102 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`strainRateViscosityModel.H`](../../../09-turbulence-transport/files/7e/strainrateviscositymodel.h--7ea2bcf00c6b.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/BirdCarreau/BirdCarreau.C](../../../09-turbulence-transport/files/cc/birdcarreau.c--ccd5b2da2b0e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
