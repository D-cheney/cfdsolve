---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a8ac4552e875"
title: "OpenFOAM 14 源码解析：advectionDiffusionPatchDistMethod.H"
summary: "该文件声明或实现 `advectionDiffusion`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/wallDist/patchDistMethods/advectionDiffusion/advectionDiffusionPatchDistMethod.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：advectionDiffusionPatchDistMethod.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/wallDist/patchDistMethods/advectionDiffusion/advectionDiffusionPatchDistMethod.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：252 行
- 文件标识：`a8ac4552e875`

## 2. 功能说明

该文件声明或实现 `advectionDiffusion`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Calculation of approximate distance to nearest patch for all cells and boundary by solving the Eikonal equation in advection form with diffusion smoothing. If the diffusion coefficient is set to 0 this method is exact in principle but the numerical schemes used are not rendering the scheme approximate, but more accurate than the Poisson method. Also many models relying on the distance to the wall benefit from this field being smooth and monotonic so the addition of diffusion smoothing improves both the convergence and stability of the solution of the Eikonal equation and the behavior of the models using the distance field generated. However, it is not clear what the optimum value for the diffusion coefficient epsilon should be; a default value of 0.1 is provided but higher values may be preferable under some circumstances. Convergence is accelerated by first generating an approximate sol

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `advectionDiffusion` | 178 |

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

- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/advectionDiffusion/advectionDiffusionPatchDistMethod.C](../../../05-finite-volume/files/c8/advectiondiffusionpatchdistmethod.c--c81ffec31f5c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
