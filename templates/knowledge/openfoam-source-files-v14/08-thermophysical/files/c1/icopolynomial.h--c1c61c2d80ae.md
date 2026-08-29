---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c1c61c2d80ae"
title: "OpenFOAM 14 源码解析：icoPolynomial.H"
summary: "该文件声明或实现 `icoPolynomial`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/equationOfState/icoPolynomial/icoPolynomial.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：icoPolynomial.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/equationOfState/icoPolynomial/icoPolynomial.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：262 行
- 文件标识：`c1c61c2d80ae`

## 2. 功能说明

该文件声明或实现 `icoPolynomial`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Incompressible, polynomial form of equation of state, using a polynomial function for density. Coefficient mixing is very inaccurate and not supported, so this equation of state is not applicable to mixtures. The polynomial expression is evaluated from: \verbatim rho = 1000 - 0.05*T + 0.003*sqr(T) \endverbatim Usage \table Property | Description rhoCoeffs<8> | Density polynomial coefficients \endtable Example specification of the icoPolynomial equation of state: \verbatim equationOfState { rhoCoeffs<8> ( 1000 -0.05 0.003 0 0 0 0 0 ); } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `icoPolynomial` | 81 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`Polynomial.H`](../../../04-core-runtime/files/f5/polynomial.h--f5ee6b8c2b72.md)
- [`icoPolynomialI.H`](../../../08-thermophysical/files/88/icopolynomiali.h--88d1dd7de76e.md)
- [`icoPolynomial.C`](../../../08-thermophysical/files/4d/icopolynomial.c--4d135914f19a.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/equationOfState/icoPolynomial/icoPolynomial.C](../../../08-thermophysical/files/4d/icopolynomial.c--4d135914f19a.md)
- [src/thermophysicalModels/specie/equationOfState/icoPolynomial/icoPolynomialI.H](../../../08-thermophysical/files/88/icopolynomiali.h--88d1dd7de76e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
