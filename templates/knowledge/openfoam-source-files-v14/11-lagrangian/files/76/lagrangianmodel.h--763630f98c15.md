---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-763630f98c15"
title: "OpenFOAM 14 源码解析：LagrangianModel.H"
summary: "该文件实现 `LagrangianModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModel/LagrangianModel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModel/LagrangianModel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：412 行
- 文件标识：`763630f98c15`

## 2. 功能说明

该文件实现 `LagrangianModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base class for Lagrangian models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LagrangianMesh` | 53 |
| `polyTopoChangeMap` | 55 |
| `polyMeshMap` | 56 |
| `polyDistributionMap` | 57 |
| `LagrangianModel` | 62 |
| `PrimitiveField` | 154 |
| `iNew` | 225 |
| `PrimitiveEqnField` | 295 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`LagrangianEqn.H`](../../../11-lagrangian/files/43/lagrangianeqn.h--43cec0631587.md)
- [`LagrangianModelM.H`](../../../11-lagrangian/files/cc/lagrangianmodelm.h--cce6fd1366a4.md)
- [`stateModel.H`](../../../11-lagrangian/files/a4/statemodel.h--a47b8976a167.md)
- [`LagrangianModelI.H`](../../../11-lagrangian/files/57/lagrangianmodeli.h--5765f8e4129c.md)
- [`LagrangianModelTemplates.C`](../../../11-lagrangian/files/f5/lagrangianmodeltemplates.c--f5620e20dfb0.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/cloud/cloudLagrangianFieldSourceTemplates.C](../../../11-lagrangian/files/75/cloudlagrangianfieldsourcetemplates.c--75b27cd99591.md)
- [src/Lagrangian/cloud/LagrangianModels/cloudLagrangianModel/cloudLagrangianModel.H](../../../11-lagrangian/files/2a/cloudlagrangianmodel.h--2a59a45d077b.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianFieldSources/LagrangianFieldSource/LagrangianFieldSourceBaseTemplates.C](../../../11-lagrangian/files/6c/lagrangianfieldsourcebasetemplates.c--6c1a5694cd4f.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianInjection/LagrangianInjection.H](../../../11-lagrangian/files/da/lagrangianinjection.h--dadcfebc2b16.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModel/LagrangianModel.C](../../../11-lagrangian/files/34/lagrangianmodel.c--34c3e71f252e.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModel/LagrangianModelI.H](../../../11-lagrangian/files/57/lagrangianmodeli.h--5765f8e4129c.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModel/LagrangianModelTemplates.C](../../../11-lagrangian/files/f5/lagrangianmodeltemplates.c--f5620e20dfb0.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModels/LagrangianModels.H](../../../11-lagrangian/files/21/lagrangianmodels.h--216068724d05.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianSource/LagrangianSource.H](../../../11-lagrangian/files/50/lagrangiansource.h--50fcdc59e6b0.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
