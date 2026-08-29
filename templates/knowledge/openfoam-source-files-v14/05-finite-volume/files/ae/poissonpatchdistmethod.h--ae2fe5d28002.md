---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ae2fe5d28002"
title: "OpenFOAM 14 源码解析：PoissonPatchDistMethod.H"
summary: "该文件声明或实现 `Poisson`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/wallDist/patchDistMethods/Poisson/PoissonPatchDistMethod.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：PoissonPatchDistMethod.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/wallDist/patchDistMethods/Poisson/PoissonPatchDistMethod.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：183 行
- 文件标识：`ae2fe5d28002`

## 2. 功能说明

该文件声明或实现 `Poisson`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Calculation of approximate distance to nearest patch for all cells and boundary by solving Poisson's equation. References: \verbatim D.B. Spalding, "Calculation of turbulent heat transfer in cluttered spaces", Proc. 10th Int. Heat Transfer Conference, Brighton, UK, (1994). E. Fares and W. Schroder, "Differential Equation for Approximate Wall Distance", Int.J.Numer.Meth., 39:743-762, (2002). P.G. Tucker, "Differential equation based wall distance computation for DES and RANS", J.Comp.Phys., Vol. 190, Issue 1, 1 st September, pp. 229-248 (2003) \endverbatim Example of the wallDist specification in fvSchemes: \verbatim laplacianSchemes { . . laplacian(yPsi) Gauss linear corrected; . . } wallDist { method Poisson; // Optional entry enabling the calculation // of the normal-to-wall field nRequired false; } \endverbatim Also the solver specification for yPsi is required in fvSolution, e.g. for

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Poisson` | 119 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`patchDistMethod.H`](../../../05-finite-volume/files/f7/patchdistmethod.h--f75c6ffc5601.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/Poisson/PoissonPatchDistMethod.C](../../../05-finite-volume/files/ea/poissonpatchdistmethod.c--ea0d4fb48ee6.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
