---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e95c68f5ca0b"
title: "OpenFOAM 14 源码解析：totalNumberLagrangianScalarFieldSource.H"
summary: "该文件声明或实现 `totalNumberLagrangianScalarFieldSource`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/totalNumber/totalNumberLagrangianScalarFieldSource.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：totalNumberLagrangianScalarFieldSource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/totalNumber/totalNumberLagrangianScalarFieldSource.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：174 行
- 文件标识：`e95c68f5ca0b`

## 2. 功能说明

该文件声明或实现 `totalNumberLagrangianScalarFieldSource`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：This source condition sets the values of the number field to recover a specified total volume or mass. It should be used in conjunction with an instantaneous injection model. This condition requires a uniform size to be specified. All injected parcels will have the same value of this size. The size can be \c number, \c surfaceArea, \c volume or \c mass. This choice relates to the desired discretisation of the Lagrangian material. Broadly, the uniform size chosen should be that against which the dominant effect of the Lagrangian model scales. So, if the particles are primarily evaporating droplets of fuel, then the effect of each will be primarily a function of the mass of fuel that evaporates into the system. The \c uniformSize should therefore be set to \c mass. But, if the model is purely dynamic, and the dominant effect is viscous drag, then each particle will exert a force in proport

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `totalNumberLagrangianScalarFieldSource` | 97 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`uniformSizeNumberLagrangianScalarFieldSource.H`](../../../11-lagrangian/files/59/uniformsizenumberlagrangianscalarfieldsource.h--59736e6ddb97.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/totalNumber/totalNumberLagrangianScalarFieldSource.C](../../../11-lagrangian/files/ef/totalnumberlagrangianscalarfieldsource.c--ef7c27b466ee.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
