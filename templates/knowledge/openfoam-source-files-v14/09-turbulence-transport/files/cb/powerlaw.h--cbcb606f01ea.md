---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cbcb606f01ea"
title: "OpenFOAM 14 源码解析：powerLaw.H"
summary: "该文件声明或实现 `powerLaw`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/powerLaw/powerLaw.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：powerLaw.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/powerLaw/powerLaw.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：137 行
- 文件标识：`cbcb606f01ea`

## 2. 功能说明

该文件声明或实现 `powerLaw`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Standard power-law generalised Newtonian viscosity model The power-law model provides a function for viscosity, limited by minimum and maximum values \&#36;\nu_{\min}\&#36; and \&#36;\nu_{\max}\&#36; respectively. Kinematic viscosity [m^2/s] \f[ \nu = k\gamma^{n - 1}, \nu_{\min} \le \nu \le \nu_{\max} \f] Example specification: \verbatim viscosityModel powerLaw; nuMax 1e-3; nuMin 1e-5; k 1; n 0.5; \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `powerLaw` | 78 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`strainRateViscosityModel.H`](../../../09-turbulence-transport/files/7e/strainrateviscositymodel.h--7ea2bcf00c6b.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
