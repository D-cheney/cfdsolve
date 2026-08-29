---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fd1295447080"
title: "OpenFOAM 14 源码解析：basicLagrangianThermo.H"
summary: "该文件声明或实现 `basicLagrangianThermo`、`implementation`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/LagrangianThermo/basicLagrangianThermo/basicLagrangianThermo.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：basicLagrangianThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/LagrangianThermo/basicLagrangianThermo/basicLagrangianThermo.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：342 行
- 文件标识：`fd1295447080`

## 2. 功能说明

该文件声明或实现 `basicLagrangianThermo`、`implementation`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base-class for Lagrangian fluid and solid thermodynamic models. The design of Lagrangian thermodynamic models is the same as that for finite-volume. See basicThermo for an explanation of how the interface class, and the implementation and composite sub-classes fit together.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `basicLagrangianThermo` | 62 |
| `implementation` | 88 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。

## 6. 数学与离散关系

- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`LagrangianFields.H`](../../../11-lagrangian/files/0e/lagrangianfields.h--0e720ce1f457.md)
- [`basicLagrangianThermoTemplates.C`](../../../11-lagrangian/files/98/basiclagrangianthermotemplates.c--98309c7b63e7.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/clouds/thermal/thermal.H](../../../11-lagrangian/files/9f/thermal.h--9fd3585c17a6.md)
- [src/Lagrangian/LagrangianThermo/basicLagrangianThermo/basicLagrangianThermo.C](../../../11-lagrangian/files/46/basiclagrangianthermo.c--4697c64b9f8d.md)
- [src/Lagrangian/LagrangianThermo/basicLagrangianThermo/BasicLagrangianThermo.H](../../../11-lagrangian/files/2c/basiclagrangianthermo.h--2c56dcb91b7e.md)
- [src/Lagrangian/LagrangianThermo/basicLagrangianThermo/basicLagrangianThermoTemplates.C](../../../11-lagrangian/files/98/basiclagrangianthermotemplates.c--98309c7b63e7.md)
- [src/Lagrangian/LagrangianThermo/fields/derivedLagrangianFieldSources/density/densityLagrangianScalarFieldSource.C](../../../11-lagrangian/files/d6/densitylagrangianscalarfieldsource.c--d6ce20dfca5e.md)
- [src/Lagrangian/LagrangianThermo/fields/derivedLagrangianFieldSources/energy/energyLagrangianScalarFieldSource.C](../../../11-lagrangian/files/d5/energylagrangianscalarfieldsource.c--d574258ce679.md)
- [src/Lagrangian/LagrangianThermo/fields/derivedLagrangianFieldSources/specificHeatCapacity/specificHeatCapacityLagrangianScalarFieldSource.C](../../../11-lagrangian/files/02/specificheatcapacitylagrangianscalarfieldsource.c--02f035883647.md)
- [src/Lagrangian/LagrangianThermo/fields/derivedLagrangianFieldSources/thermalConductivity/thermalConductivityLagrangianScalarFieldSource.C](../../../11-lagrangian/files/19/thermalconductivitylagrangianscalarfieldsource.c--1925d3df1e4c.md)
- [src/Lagrangian/LagrangianThermo/multicomponentLagrangianThermo/multicomponentLagrangianThermo.H](../../../11-lagrangian/files/30/multicomponentlagrangianthermo.h--308ba1655679.md)
- [src/Lagrangian/LagrangianThermo/pureLagrangianThermo/pureLagrangianThermo.H](../../../11-lagrangian/files/d8/purelagrangianthermo.h--d885ac2790ce.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
