---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1d47a0677600"
title: "OpenFOAM 14 源码解析：binaryDiffusionCoefficient.H"
summary: "该文件声明或实现 `binaryDiffusionCoefficient`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/thermophysicalFunctions/binaryDiffusionCoefficient/binaryDiffusionCoefficient.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：binaryDiffusionCoefficient.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/thermophysicalFunctions/binaryDiffusionCoefficient/binaryDiffusionCoefficient.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：128 行
- 文件标识：`1d47a0677600`

## 2. 功能说明

该文件声明或实现 `binaryDiffusionCoefficient`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Binary diffusion coefficient polynomial function of the log of temperature correcting the standard kinetic theory temperature dependence. \verbatim Dji = T^(3/2)*(c0 + c1*lnT + c2*lnT^2 + c3*lnT^3 + c4*lnT^4)/p \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `binaryDiffusionCoefficient` | 62 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Function2.H`](../../../04-core-runtime/files/11/function2.h--11115076f69a.md)
- [`Polynomial.H`](../../../04-core-runtime/files/f5/polynomial.h--f5ee6b8c2b72.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/thermophysicalFunctions/binaryDiffusionCoefficient/binaryDiffusionCoefficient.C](../../../08-thermophysical/files/6e/binarydiffusioncoefficient.c--6edc2e9df49b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
