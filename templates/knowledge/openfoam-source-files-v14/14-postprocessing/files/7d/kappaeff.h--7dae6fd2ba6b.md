---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7dae6fd2ba6b"
title: "OpenFOAM 14 源码解析：kappaEff.H"
summary: "该文件声明或实现 `kappaEff`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeffModels/kappaEff/kappaEff.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：kappaEff.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeffModels/kappaEff/kappaEff.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：206 行
- 文件标识：`7dae6fd2ba6b`

## 2. 功能说明

该文件声明或实现 `kappaEff`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Calculates the estimated flow heat transfer coefficient at wall patches as the volScalarField field 'kappaEff' using one of equations below. kappaEff model, given by: \f[ htc = \rho*C_p*({\frac{\nu}{Pr} + \frac{\nu_t}{Prt}}) \f] kappaEff model with characteristic length, given by: \f[ htc = \rho*C_p*({\frac{\nu}{Pr} + \frac{\nu_t}{Prt}})\frac{1}{L_{char}}; \f] where \vartable rho | Density [kg/m^3] Cp | Specific heat capacity [m^2/K/s^2)] Pr | Fluid laminar Prandtl number [] Prt | Fluid turbulent Prandtl number [] Lchar | Characteristic length [m] \endvartable Example of function object specification: \verbatim kappaEff1 { type wallHeatTransferCoeff; libs ("libfieldFunctionObjects.so"); model kappaEff; ... region fluid; patches (".*Wall"); rho 1.225; Cp 1005; Pr 0.707; Prt 0.9; } \endverbatim \verbatim kappaEff2 { type wallHeatTransferCoeff; libs ("libfieldFunctionObjects.so"); model kap

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `kappaEff` | 130 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`wallHeatTransferCoeffModel.H`](../../../14-postprocessing/files/ae/wallheattransfercoeffmodel.h--aed5b0205c73.md)

## 8. 直接上层引用

- [src/functionObjects/field/wallHeatTransferCoeff/wallHeatTransferCoeffModels/kappaEff/kappaEff.C](../../../14-postprocessing/files/f9/kappaeff.c--f98dd805cdb5.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
