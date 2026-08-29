---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6364f9720d8b"
title: "OpenFOAM 14 源码解析：turbulentOmegaFvScalarFieldSource.H"
summary: "该文件声明或实现 `turbulentOmegaFvScalarFieldSource`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvFieldSources/turbulentOmega/turbulentOmegaFvScalarFieldSource.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：turbulentOmegaFvScalarFieldSource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvFieldSources/turbulentOmega/turbulentOmegaFvScalarFieldSource.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：195 行
- 文件标识：`6364f9720d8b`

## 2. 功能说明

该文件声明或实现 `turbulentOmegaFvScalarFieldSource`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：This source condition provides a turbulence specific dissipation, \&#36;\omega\&#36; (omega), based on a specified mixing length. The source values are calculated using: \f[ \omega = \frac{k^{0.5}}{C_{\mu}^{0.25} L} \f] where \vartable \omega | omega values C_{\mu} | Model coefficient, set to 0.09 k | turbulence kinetic energy L | length scale \endvartable In the case of a sink, the current cell values are used instead. Usage \table Property | Description | Required | Default value mixingLength | Length scale [m] | yes | k | turbulence kinetic energy field name | no | k Cmu | Turbulence model coefficient | no | 0.09 \endtable Example of the source condition specification: \verbatim <sourceName> { type turbulentOmega; mixingLength 0.005; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `turbulentOmegaFvScalarFieldSource` | 88 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`fvFieldSources.H`](../../../05-finite-volume/files/ce/fvfieldsources.h--cef22099733c.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvFieldSources/turbulentOmega/turbulentOmegaFvScalarFieldSource.C](../../../09-turbulence-transport/files/ef/turbulentomegafvscalarfieldsource.c--ef85cf0bf39e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
