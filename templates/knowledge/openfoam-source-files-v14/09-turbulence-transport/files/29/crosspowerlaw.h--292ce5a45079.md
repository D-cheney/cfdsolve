---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-292ce5a45079"
title: "OpenFOAM 14 源码解析：CrossPowerLaw.H"
summary: "该文件声明或实现 `CrossPowerLaw`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/CrossPowerLaw/CrossPowerLaw.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：CrossPowerLaw.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/CrossPowerLaw/CrossPowerLaw.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：147 行
- 文件标识：`292ce5a45079`

## 2. 功能说明

该文件声明或实现 `CrossPowerLaw`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Cross-Power law generalised Newtonian viscosity model The coefficient applied to strain rate \&#36;\gamma\&#36; can be specified either as the constant \c m or the critical stress level at the transition to shear thinning \c tauStar if \c tauStar is provided: Kinematic viscosity [m^2/s] \f[ \nu = \nu_\infty + \frac{(\nu_0 - \nu_\infty)}{1 + (m\gamma)^n} \f] or \f[ \nu = \nu_\infty + \frac{(\nu_0 - \nu_\infty)} {1 + \left(\frac{\nu_0\gamma}{\tau^*}\right)^n} \f] Example specification: \verbatim viscosityModel CrossPowerLaw; nuInf 10; m 0.4; n 3; \endverbatim Note the viscosity \c nu0 at zero strain rate is a physical property, generally specified in the physicalProperties file.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `CrossPowerLaw` | 88 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`strainRateViscosityModel.H`](../../../09-turbulence-transport/files/7e/strainrateviscositymodel.h--7ea2bcf00c6b.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/CrossPowerLaw/CrossPowerLaw.C](../../../09-turbulence-transport/files/16/crosspowerlaw.c--164c64544f33.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
