---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-94be4d1a5861"
title: "OpenFOAM 14 源码解析：NSRDS14.H"
summary: "该文件声明或实现 `NSRDS14`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/thermophysicalFunctions/NSRDS/NSRDS14/NSRDS14.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：NSRDS14.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/thermophysicalFunctions/NSRDS/NSRDS14/NSRDS14.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：153 行
- 文件标识：`94be4d1a5861`

## 2. 功能说明

该文件声明或实现 `NSRDS14`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：NSRDS function number 114 Source: \verbatim NSRDS - AICHE Data Compilation Tables of Properties of Pure Compounds Design Institute for Physical Property Data American Institute of Chemical Engineers 345 East 47th Street New York, New York 10017 National Standard Reference Data System American Institute of Chemical Engineers T.E. Daubert - R.P. Danner Department of Chemical Engineering The Pennsylvania State University University Park, PA 16802 \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `NSRDS14` | 75 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/thermophysicalFunctions/NSRDS/NSRDS14/NSRDS14.C](../../../08-thermophysical/files/95/nsrds14.c--951ddc473957.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/aC10H7CH3/aC10H7CH3.H](../../../08-thermophysical/files/88/ac10h7ch3.h--88bd4d838f60.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/Ar/Ar.H](../../../08-thermophysical/files/84/ar.h--84589f9f4b68.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/bC10H7CH3/bC10H7CH3.H](../../../08-thermophysical/files/5e/bc10h7ch3.h--5e5081d85994.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C10H22/C10H22.H](../../../08-thermophysical/files/ae/c10h22.h--aea2aa94a304.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C12H26/C12H26.H](../../../08-thermophysical/files/f2/c12h26.h--f2012a89da1e.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C13H28/C13H28.H](../../../08-thermophysical/files/3b/c13h28.h--3b1826fe6c2b.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C14H30/C14H30.H](../../../08-thermophysical/files/db/c14h30.h--db977972b5c7.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C16H34/C16H34.H](../../../08-thermophysical/files/c3/c16h34.h--c38191214a55.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C2H5OH/C2H5OH.H](../../../08-thermophysical/files/29/c2h5oh.h--29fd2939522c.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C2H6/C2H6.H](../../../08-thermophysical/files/92/c2h6.h--92d012017f55.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C2H6O/C2H6O.H](../../../08-thermophysical/files/96/c2h6o.h--96e0ef06c521.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C3H6O/C3H6O.H](../../../08-thermophysical/files/3e/c3h6o.h--3ea497937482.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C3H8/C3H8.H](../../../08-thermophysical/files/04/c3h8.h--044c4faad303.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C4H10O/C4H10O.H](../../../08-thermophysical/files/87/c4h10o.h--872268e5d0dc.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C6H14/C6H14.H](../../../08-thermophysical/files/59/c6h14.h--594da41f8d25.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C6H6/C6H6.H](../../../08-thermophysical/files/99/c6h6.h--99dc2823a9c5.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C7H16/C7H16.H](../../../08-thermophysical/files/2a/c7h16.h--2a131f6a1a02.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C7H8/C7H8.H](../../../08-thermophysical/files/9d/c7h8.h--9db3deca150f.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C8H18/C8H18.H](../../../08-thermophysical/files/2b/c8h18.h--2b4ec2caec8b.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/C9H20/C9H20.H](../../../08-thermophysical/files/45/c9h20.h--45f7f2ea8ab2.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/CH3OH/CH3OH.H](../../../08-thermophysical/files/1a/ch3oh.h--1abebed486a4.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/CH4N2O/CH4N2O.H](../../../08-thermophysical/files/9d/ch4n2o.h--9dedf5e6ce67.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/iC3H8O/iC3H8O.H](../../../08-thermophysical/files/9e/ic3h8o.h--9e8c23545af0.md)
- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/IC8H18/IC8H18.H](../../../08-thermophysical/files/cd/ic8h18.h--cd93236ae00b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
