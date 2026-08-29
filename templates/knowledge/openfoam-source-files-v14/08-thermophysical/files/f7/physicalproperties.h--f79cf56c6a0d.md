---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f79cf56c6a0d"
title: "OpenFOAM 14 源码解析：physicalProperties.H"
summary: "该文件声明或实现 `physicalProperties`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/physicalProperties/physicalProperties/physicalProperties.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：physicalProperties.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/physicalProperties/physicalProperties/physicalProperties.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：109 行
- 文件标识：`f79cf56c6a0d`

## 2. 功能说明

该文件声明或实现 `physicalProperties`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：A base class for physical properties.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `physicalProperties` | 54 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)

## 8. 直接上层引用

- [src/fvModels/general/massTransfer/massTransfer.C](../../../12-boundaries-sources/files/64/masstransfer.c--64434f7d35ba.md)
- [src/fvModels/general/phaseChange/ThermoRefPairI.H](../../../12-boundaries-sources/files/98/thermorefpairi.h--988d89ddc8d3.md)
- [src/Lagrangian/cloud/clouds/coupled/coupled.C](../../../11-lagrangian/files/6f/coupled.c--6f6768de7e30.md)
- [src/Lagrangian/cloud/clouds/coupledToConstantDensityFluid/coupledToConstantDensityFluid.C](../../../11-lagrangian/files/f6/coupledtoconstantdensityfluid.c--f62264078170.md)
- [src/Lagrangian/cloud/clouds/coupledToConstantDensityFluid/coupledToConstantDensityFluid.H](../../../11-lagrangian/files/6e/coupledtoconstantdensityfluid.h--6e28e3ddf497.md)
- [src/physicalProperties/physicalProperties/physicalProperties.C](../../../08-thermophysical/files/0a/physicalproperties.c--0a73d3be0579.md)
- [src/physicalProperties/viscosityModels/viscosityModel/viscosityModel.H](../../../08-thermophysical/files/71/viscositymodel.h--71ddc0685b08.md)
- [src/thermophysicalModels/basic/basicThermo/BasicThermo.H](../../../08-thermophysical/files/bb/basicthermo.h--bbdd788a00fb.md)
- [src/thermophysicalModels/basic/basicThermo/basicThermo.H](../../../08-thermophysical/files/f6/basicthermo.h--f61d8b7b6dd2.md)
- [src/thermophysicalModels/basic/PhysicalPropertiesThermo.H](../../../08-thermophysical/files/6d/physicalpropertiesthermo.h--6d751c2c703a.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
