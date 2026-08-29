---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-18d2629195a8"
title: "OpenFOAM 14 源码解析：turbulentKineticEnergyFvScalarFieldSource.H"
summary: "该文件声明或实现 `turbulentKineticEnergyFvScalarFieldSource`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvFieldSources/derived/turbulentKineticEnergy/turbulentKineticEnergyFvScalarFieldSource.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：turbulentKineticEnergyFvScalarFieldSource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvFieldSources/derived/turbulentKineticEnergy/turbulentKineticEnergyFvScalarFieldSource.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：190 行
- 文件标识：`18d2629195a8`

## 2. 功能说明

该文件声明或实现 `turbulentKineticEnergyFvScalarFieldSource`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：This source condition provides a turbulent kinetic energy based on user-supplied turbulence intensity, defined as a fraction of the mean velocity: \f[ k = 1.5 (I |U|)^2 \f] where \vartable k | kinetic energy values I | turbulence intensity U | velocity field \endvartable In the case of a sink, the current cell values are used instead. Usage \table Property | Description | Required | Default value intensity | fraction of mean field [0-1] | yes | U | velocity field name | no | U \endtable Example of the boundary condition specification: \verbatim <sourceName> { type turbulentKineticEnergy; intensity 0.05; // 5% turbulence } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `turbulentKineticEnergyFvScalarFieldSource` | 86 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`fvFieldSources.H`](../../../05-finite-volume/files/ce/fvfieldsources.h--cef22099733c.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvFieldSources/derived/turbulentKineticEnergy/turbulentKineticEnergyFvScalarFieldSource.C](../../../05-finite-volume/files/f8/turbulentkineticenergyfvscalarfieldsource.c--f849193b39fc.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
