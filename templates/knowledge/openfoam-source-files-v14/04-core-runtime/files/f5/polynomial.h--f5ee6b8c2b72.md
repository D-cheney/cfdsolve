---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f5ee6b8c2b72"
title: "OpenFOAM 14 源码解析：Polynomial.H"
summary: "该文件声明或实现 `Polynomial`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/functions/Polynomial/Polynomial.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：Polynomial.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/functions/Polynomial/Polynomial.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：183 行
- 文件标识：`f5ee6b8c2b72`

## 2. 功能说明

该文件声明或实现 `Polynomial`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Polynomial templated on size (order): \verbatim poly = sum(coeffs[i]*x^i) + logCoeff*log(x) \endverbatim where <tt> 0 <= i <= N </tt> - integer powers, starting at zero - \c value(x) to evaluate the poly for a given value - \c derivative(x) returns derivative at value - \c integral(x1, x2) returns integral between two scalar values - \c integral() to return a new, integral coeff polynomial - increases the size (order) - \c integralMinus1() to return a new, integral coeff polynomial where the base poly starts at order -1

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Polynomial` | 71 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`word.H`](../../../04-core-runtime/files/76/word.h--763cd4c0a88d.md)
- [`scalar.H`](../../../04-core-runtime/files/cb/scalar.h--cb9b81900254.md)
- [`Ostream.H`](../../../04-core-runtime/files/f6/ostream.h--f61e6ce854c8.md)
- [`VectorSpace.H`](../../../04-core-runtime/files/97/vectorspace.h--9764422e1c11.md)
- `type_traits`
- [`Polynomial.C`](../../../04-core-runtime/files/f3/polynomial.c--f30a6bdb6b64.md)
- [`PolynomialIO.C`](../../../04-core-runtime/files/af/polynomialio.c--af516833d7ae.md)

## 8. 直接上层引用

- [applications/test/Polynomial/Test-Polynomial.C](../../../17-other-libraries/files/96/test-polynomial.c--9679f0f999c2.md)
- [src/OpenFOAM/primitives/functions/Polynomial/Polynomial.C](../../../04-core-runtime/files/f3/polynomial.c--f30a6bdb6b64.md)
- [src/OpenFOAM/primitives/functions/Polynomial/PolynomialIO.C](../../../04-core-runtime/files/af/polynomialio.c--af516833d7ae.md)
- [src/thermophysicalModels/saturationModels/polynomialTemperature/polynomialTemperature.H](../../../08-thermophysical/files/18/polynomialtemperature.h--18049d280070.md)
- [src/thermophysicalModels/solidThermo/solidSpecie/transport/polynomial/polynomialSolidTransport.H](../../../08-thermophysical/files/c2/polynomialsolidtransport.h--c2494ebf0e11.md)
- [src/thermophysicalModels/specie/equationOfState/icoPolynomial/icoPolynomial.H](../../../08-thermophysical/files/c1/icopolynomial.h--c1c61c2d80ae.md)
- [src/thermophysicalModels/specie/thermo/ePolynomial/ePolynomialThermo.H](../../../08-thermophysical/files/a6/epolynomialthermo.h--a67c272d1494.md)
- [src/thermophysicalModels/specie/thermo/hPolynomial/hPolynomialThermo.H](../../../08-thermophysical/files/6e/hpolynomialthermo.h--6ef7ab478764.md)
- [src/thermophysicalModels/specie/thermophysicalFunctions/binaryDiffusionCoefficient/binaryDiffusionCoefficient.H](../../../08-thermophysical/files/1d/binarydiffusioncoefficient.h--1d47a0677600.md)
- [src/thermophysicalModels/specie/transport/logPolynomial/logPolynomialTransport.H](../../../08-thermophysical/files/b4/logpolynomialtransport.h--b46ef8c9fd88.md)
- [src/thermophysicalModels/specie/transport/polynomial/polynomialTransport.H](../../../08-thermophysical/files/da/polynomialtransport.h--da8adf954f28.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
