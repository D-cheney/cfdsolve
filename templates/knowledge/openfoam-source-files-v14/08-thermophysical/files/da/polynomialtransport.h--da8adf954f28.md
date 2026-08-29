---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-da8adf954f28"
title: "OpenFOAM 14 源码解析：polynomialTransport.H"
summary: "该文件声明或实现 `polynomialTransport`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/transport/polynomial/polynomialTransport.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：polynomialTransport.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/transport/polynomial/polynomialTransport.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：218 行
- 文件标识：`da8adf954f28`

## 2. 功能说明

该文件声明或实现 `polynomialTransport`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Transport package using polynomial functions of temperature for the dynamic viscosity and thermal conductivity: \verbatim mu = muCoeffs[0] + muCoeffs[1]*T + muCoeffs[2]*sqr(T) + muCoeffs[3]*pow3(T) + muCoeffs[4]*pow4(T) + muCoeffs[5]*pow(T, 5) + muCoeffs[6]*pow(T, 6) + muCoeffs[7]*pow(T, 7) kappa = kappaCoeffs[0] + kappaCoeffs[1]*T + kappaCoeffs[2]*sqr(T) + kappaCoeffs[3]*pow3(T) + kappaCoeffs[4]*pow4(T) + kappaCoeffs[5]*pow(T, 5) + kappaCoeffs[6]*pow(T, 6) + kappaCoeffs[7]*pow(T, 7) \endverbatim The polynomial function is templated on the order of the polynomial which defaults to 8. Usage \table Property | Description muCoeffs<8> | Dynamic viscosity polynomial coefficients kappaCoeffs<8> | Thermal conductivity polynomial coefficients \endtable Example of the specification of the transport properties: \verbatim transport { muCoeffs<8> (1000 -0.05 0.003 0 0 0 0 0); kappaCoeffs<8> (2000 -0

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polynomialTransport` | 88 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Polynomial.H`](../../../04-core-runtime/files/f5/polynomial.h--f5ee6b8c2b72.md)
- [`polynomialTransportI.H`](../../../08-thermophysical/files/1b/polynomialtransporti.h--1bc9d494ef35.md)
- [`polynomialTransport.C`](../../../08-thermophysical/files/f4/polynomialtransport.c--f43da1bb2721.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/include/forGases.H](../../../08-thermophysical/files/1a/forgases.h--1ae68ddb3b03.md)
- [src/thermophysicalModels/specie/transport/polynomial/polynomialTransport.C](../../../08-thermophysical/files/f4/polynomialtransport.c--f43da1bb2721.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
