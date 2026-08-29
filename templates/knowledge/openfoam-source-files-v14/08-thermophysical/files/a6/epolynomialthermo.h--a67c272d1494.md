---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a67c272d1494"
title: "OpenFOAM 14 源码解析：ePolynomialThermo.H"
summary: "该文件声明或实现 `ePolynomialThermo`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/thermo/ePolynomial/ePolynomialThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：ePolynomialThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/thermo/ePolynomial/ePolynomialThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：277 行
- 文件标识：`a67c272d1494`

## 2. 功能说明

该文件声明或实现 `ePolynomialThermo`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Internal energy based thermodynamics package using a polynomial function of temperature for the constant heat capacity at constant volume: \verbatim Cv = CvCoeffs[0] + CvCoeffs[1]*T + CvCoeffs[2]*sqr(T) + CvCoeffs[3]*pow3(T) + CvCoeffs[4]*pow4(T) + CvCoeffs[5]*pow(T, 5) + CvCoeffs[6]*pow(T, 6) + CvCoeffs[7]*pow(T, 7) \endverbatim The polynomial function is templated on the order of the polynomial which defaults to 8. Usage \table Property | Description hf | Heat of formation sf | Standard entropy CvCoeffs<8> | Specific heat at constant volume polynomial coeffs \endtable Example of the specification of the thermodynamic properties: \verbatim thermodynamics { hf 0; sf 0; CvCoeffs<8> (1000 -0.05 0.003 0 0 0 0 0); } \endverbatim Note: Specific heat at constant volume polynomial coefficients evaluate to an expression in [J/kg/K].

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ePolynomialThermo` | 90 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`scalar.H`](../../../04-core-runtime/files/cb/scalar.h--cb9b81900254.md)
- [`Polynomial.H`](../../../04-core-runtime/files/f5/polynomial.h--f5ee6b8c2b72.md)
- [`EtoHthermo.H`](../../../08-thermophysical/files/84/etohthermo.h--84c527f319ea.md)
- [`ePolynomialThermoI.H`](../../../08-thermophysical/files/0e/epolynomialthermoi.h--0e1a6ef43b4b.md)
- [`ePolynomialThermo.C`](../../../08-thermophysical/files/ec/epolynomialthermo.c--ecb1ed176806.md)

## 8. 直接上层引用

- [src/thermophysicalModels/solidThermo/solidSpecie/include/forSolids.H](../../../08-thermophysical/files/37/forsolids.h--3771cbfe67d8.md)
- [src/thermophysicalModels/specie/thermo/ePolynomial/ePolynomialThermo.C](../../../08-thermophysical/files/ec/epolynomialthermo.c--ecb1ed176806.md)
- [src/thermophysicalModels/specie/thermo/ePolynomial/ePolynomialThermoI.H](../../../08-thermophysical/files/0e/epolynomialthermoi.h--0e1a6ef43b4b.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
