---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2abb1c2b592f"
title: "OpenFOAM 14 源码解析：gaussConvectionScheme.H"
summary: "该文件实现 `gaussConvectionScheme` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/convectionSchemes/gaussConvectionScheme/gaussConvectionScheme.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：gaussConvectionScheme.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/convectionSchemes/gaussConvectionScheme/gaussConvectionScheme.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：163 行
- 文件标识：`2abb1c2b592f`

## 2. 功能说明

该文件实现 `gaussConvectionScheme` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：Basic second-order convection using face-gradients and Gauss' theorem.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `gaussConvectionScheme` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`convectionScheme.H`](../../../05-finite-volume/files/99/convectionscheme.h--99eb0e4db0f6.md)
- [`gaussConvectionScheme.C`](../../../05-finite-volume/files/33/gaussconvectionscheme.c--33dc6adaa9b7.md)

## 8. 直接上层引用

- [applications/modules/XiFluid/thermophysicalPredictor.C](../../../02-solver-modules/files/ff/thermophysicalpredictor.c--ff733a56bae4.md)
- [src/finiteVolume/finiteVolume/convectionSchemes/gaussConvectionScheme/gaussConvectionScheme.C](../../../05-finite-volume/files/33/gaussconvectionscheme.c--33dc6adaa9b7.md)
- [src/finiteVolume/finiteVolume/convectionSchemes/gaussConvectionScheme/gaussConvectionSchemes.C](../../../05-finite-volume/files/d0/gaussconvectionschemes.c--d046b0a8d173.md)
- [src/finiteVolume/finiteVolume/convectionSchemes/multivariateGaussConvectionScheme/multivariateGaussConvectionScheme.C](../../../05-finite-volume/files/9b/multivariategaussconvectionscheme.c--9b047ce68983.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/CMULES.H](../../../05-finite-volume/files/e0/cmules.h--e02aced9d4a4.md)
- [src/functionObjects/field/blendingFactor/blendingFactorTemplates.C](../../../14-postprocessing/files/b0/blendingfactortemplates.c--b0bf31138db0.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
