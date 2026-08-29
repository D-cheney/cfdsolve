---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-dac1834647e5"
title: "OpenFOAM 14 源码解析：DarcyForchheimer.H"
summary: "该文件声明或实现 `DarcyForchheimer`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/porosityModel/DarcyForchheimer/DarcyForchheimer.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：DarcyForchheimer.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/porosityModel/DarcyForchheimer/DarcyForchheimer.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：199 行
- 文件标识：`dac1834647e5`

## 2. 功能说明

该文件声明或实现 `DarcyForchheimer`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Darcy-Forchheimer law porosity model, given by: \f[ S = - (\mu d + \frac{\rho |U|}{2} f) U \f] where \vartable d | Darcy coefficient [1/m^2] f | Forchheimer coefficient [1/m] \endvartable Since negative Darcy/Forchheimer parameters are invalid, they can be used to specify a multiplier (of the max component). The orientation of the porous region is defined with the same notation as a co-ordinate system, but only a Cartesian co-ordinate system is valid.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DarcyForchheimer` | 74 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`porosityModel.H`](../../../05-finite-volume/files/f3/porositymodel.h--f38befd5a70d.md)
- [`dimensionedTensor.H`](../../../04-core-runtime/files/98/dimensionedtensor.h--986eb1e8f89d.md)
- [`DarcyForchheimerTemplates.C`](../../../05-finite-volume/files/be/darcyforchheimertemplates.c--beeee5e1a4b8.md)

## 8. 直接上层引用

- [src/finiteVolume/cfdTools/general/porosityModel/DarcyForchheimer/DarcyForchheimer.C](../../../05-finite-volume/files/dc/darcyforchheimer.c--dcf29da4fd13.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
