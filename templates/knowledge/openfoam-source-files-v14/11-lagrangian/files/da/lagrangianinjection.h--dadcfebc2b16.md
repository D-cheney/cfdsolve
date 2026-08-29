---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-dadcfebc2b16"
title: "OpenFOAM 14 源码解析：LagrangianInjection.H"
summary: "该文件声明或实现 `timeIOdictionary`、`LagrangianInjection`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/LagrangianModels/LagrangianInjection/LagrangianInjection.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianInjection.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/LagrangianModels/LagrangianInjection/LagrangianInjection.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：140 行
- 文件标识：`dadcfebc2b16`

## 2. 功能说明

该文件声明或实现 `timeIOdictionary`、`LagrangianInjection`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base class for Lagrangian injections. Minimal wrapper over LagrangianSource. Implements some utility functions, and reports that all fields require a source value to be specified. Also serves as a type that can be identified and cast to.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `timeIOdictionary` | 53 |
| `LagrangianInjection` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`LagrangianModel.H`](../../../11-lagrangian/files/76/lagrangianmodel.h--763630f98c15.md)
- [`LagrangianInjectionTemplates.C`](../../../11-lagrangian/files/e8/lagrangianinjectiontemplates.c--e88b80b56546.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/coneDirection/coneDirectionLagrangianVectorFieldSource.H](../../../11-lagrangian/files/60/conedirectionlagrangianvectorfieldsource.h--60382599c808.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/coneDiskDirection/coneDiskDirectionLagrangianVectorFieldSource.H](../../../11-lagrangian/files/3f/conediskdirectionlagrangianvectorfieldsource.h--3f32cdcaab78.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/fanDirection/fanDirectionLagrangianVectorFieldSource.H](../../../11-lagrangian/files/8e/fandirectionlagrangianvectorfieldsource.h--8e3c77e97660.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/totalPressureVelocityMagnitude/totalPressureVelocityMagnitudeLagrangianScalarFieldSource.H](../../../11-lagrangian/files/ba/totalpressurevelocitymagnitudelagrangianscalarfieldsource.h--ba310b6cc18a.md)
- [src/Lagrangian/cloud/LagrangianModels/diskInjection/diskInjection.H](../../../11-lagrangian/files/c4/diskinjection.h--c42ba13716bd.md)
- [src/Lagrangian/cloud/LagrangianModels/manualInjection/manualInjection.H](../../../11-lagrangian/files/c3/manualinjection.h--c3e873c4aa13.md)
- [src/Lagrangian/cloud/LagrangianModels/patchInjection/patchInjection.H](../../../11-lagrangian/files/6e/patchinjection.h--6e02eb7c71bc.md)
- [src/Lagrangian/cloud/LagrangianModels/pointInjection/pointInjection.H](../../../11-lagrangian/files/6e/pointinjection.h--6e5a2a6cb976.md)
- [src/Lagrangian/cloud/LagrangianModels/volumeInjection/volumeInjection.H](../../../11-lagrangian/files/90/volumeinjection.h--90774d0310b7.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianFieldSources/LagrangianFieldSource/LagrangianFieldSource.C](../../../11-lagrangian/files/e5/lagrangianfieldsource.c--e543192d8f92.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianInjection/LagrangianInjection.C](../../../11-lagrangian/files/48/lagrangianinjection.c--48c3a47a7dd0.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianInjection/LagrangianInjectionTemplates.C](../../../11-lagrangian/files/e8/lagrangianinjectiontemplates.c--e88b80b56546.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
