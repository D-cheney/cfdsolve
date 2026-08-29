---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-085f6dcbbef7"
title: "OpenFOAM 14 源码解析：fluidLagrangianThermo.H"
summary: "该文件声明或实现 `fluidLagrangianThermo`、`implementation`、`composite`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/LagrangianThermo/fluidLagrangianThermo/fluidLagrangianThermo.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：fluidLagrangianThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/LagrangianThermo/fluidLagrangianThermo/fluidLagrangianThermo.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：311 行
- 文件标识：`085f6dcbbef7`

## 2. 功能说明

该文件声明或实现 `fluidLagrangianThermo`、`implementation`、`composite`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base-class for fluid Lagrangian thermodynamic models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fluidLagrangianThermo` | 58 |
| `implementation` | 68 |
| `composite` | 71 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`FluidLagrangianThermo.H`](../../../11-lagrangian/files/d7/fluidlagrangianthermo.h--d762e2e6e0d2.md)
- [`pureLagrangianThermo.H`](../../../11-lagrangian/files/d8/purelagrangianthermo.h--d885ac2790ce.md)
- [`uniformDimensionedFields.H`](../../../05-finite-volume/files/4e/uniformdimensionedfields.h--4e5431e912f3.md)
- [`uniformGeometricFields.H`](../../../05-finite-volume/files/a5/uniformgeometricfields.h--a50858295889.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/LagrangianModels/pressureWork/pressureWork.C](../../../11-lagrangian/files/2e/pressurework.c--2e1434294be4.md)
- [src/Lagrangian/LagrangianThermo/fields/derivedLagrangianFieldSources/compressibility/compressibilityLagrangianScalarFieldSource.C](../../../11-lagrangian/files/4d/compressibilitylagrangianscalarfieldsource.c--4d0c26b788b6.md)
- [src/Lagrangian/LagrangianThermo/fields/derivedLagrangianFieldSources/dynamicViscosity/dynamicViscosityLagrangianScalarFieldSource.C](../../../11-lagrangian/files/d3/dynamicviscositylagrangianscalarfieldsource.c--d3ef8f914721.md)
- [src/Lagrangian/LagrangianThermo/fields/derivedLagrangianFieldSources/pressure/pressureLagrangianScalarFieldSource.C](../../../11-lagrangian/files/bd/pressurelagrangianscalarfieldsource.c--bdd0045cfd3c.md)
- [src/Lagrangian/LagrangianThermo/fluidLagrangianThermo/fluidLagrangianThermo.C](../../../11-lagrangian/files/50/fluidlagrangianthermo.c--505c7c9940be.md)
- [src/Lagrangian/LagrangianThermo/fluidLagrangianThermo/fluidLagrangianThermos.C](../../../11-lagrangian/files/c6/fluidlagrangianthermos.c--c64b754a05d2.md)
- [src/Lagrangian/LagrangianThermo/fluidMulticomponentLagrangianThermo/fluidMulticomponentLagrangianThermo.H](../../../11-lagrangian/files/3c/fluidmulticomponentlagrangianthermo.h--3c05753da2d5.md)
- [src/Lagrangian/LagrangianThermo/liquidLagrangianThermo/liquidLagrangianThermos.C](../../../11-lagrangian/files/c6/liquidlagrangianthermos.c--c6cbc85822b0.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
