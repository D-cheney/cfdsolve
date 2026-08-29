---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c29361c9a564"
title: "OpenFOAM 14 源码解析：rPolynomial.H"
summary: "该文件声明或实现 `rPolynomial`、`coeffList`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/equationOfState/rPolynomial/rPolynomial.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：rPolynomial.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/equationOfState/rPolynomial/rPolynomial.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：276 行
- 文件标识：`c29361c9a564`

## 2. 功能说明

该文件声明或实现 `rPolynomial`、`coeffList`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Reciprocal polynomial equation of state for liquids and solids \verbatim 1/rho = C[0] + C[1]*T + C[2]*sqr(T) - C[3]*p - C[4]*p*T \endverbatim This polynomial for the reciprocal of the density provides a much better fit than the equivalent polynomial for the density and has the advantage that it support coefficient mixing to support liquid and solid mixtures in an efficient manner. Usage \table Property | Description C | Density polynomial coefficients \endtable Example specification of the rPolynomial equation of state for pure water: \verbatim equationOfState { C (0.001278 -2.1055e-06 3.9689e-09 4.3772e-13 -2.0225e-16); } \endverbatim Note: This fit is based on the small amount of data which is freely available for the range 20-65degC and 1-100bar.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rPolynomial` | 79 |
| `coeffList` | 123 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`VectorSpace.H`](../../../04-core-runtime/files/97/vectorspace.h--9764422e1c11.md)
- [`rPolynomialI.H`](../../../08-thermophysical/files/45/rpolynomiali.h--45e7b78c3122.md)
- [`rPolynomial.C`](../../../08-thermophysical/files/58/rpolynomial.c--58cd51f714e5.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/equationOfState/rPolynomial/rPolynomial.C](../../../08-thermophysical/files/58/rpolynomial.c--58cd51f714e5.md)
- [src/thermophysicalModels/specie/equationOfState/rPolynomial/rPolynomialI.H](../../../08-thermophysical/files/45/rpolynomiali.h--45e7b78c3122.md)
- [src/thermophysicalModels/specie/include/forLiquids.H](../../../08-thermophysical/files/a6/forliquids.h--a60e3659531c.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
