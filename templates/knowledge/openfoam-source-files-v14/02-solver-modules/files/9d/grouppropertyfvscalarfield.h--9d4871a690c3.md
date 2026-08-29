---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9d4871a690c3"
title: "OpenFOAM 14 源码解析：groupPropertyFvScalarField.H"
summary: "该文件声明或实现 `populationBalanceModel`、`groupPropertyFvScalarField`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/derivedFvFields/groupProperty/groupPropertyFvScalarField.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：groupPropertyFvScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/derivedFvFields/groupProperty/groupPropertyFvScalarField.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：107 行
- 文件标识：`9d4871a690c3`

## 2. 功能说明

该文件声明或实现 `populationBalanceModel`、`groupPropertyFvScalarField`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Base class for source conditions of properties of the groups in a population balance model.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `populationBalanceModel` | 54 |
| `groupPropertyFvScalarField` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`DimensionedField.H`](../../../05-finite-volume/files/5d/dimensionedfield.h--5d3e98805c1c.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/derivedFvFieldSources/nucleationGroupFraction/nucleationGroupFractionFvScalarFieldSource.H](../../../02-solver-modules/files/b9/nucleationgroupfractionfvscalarfieldsource.h--b9545789594a.md)
- [applications/modules/multiphaseEuler/fvModels/derivedFvFieldSources/nucleationGroupSurfaceAreaVolumeRatio/nucleationGroupSurfaceAreaVolumeRatioFvScalarFieldSource.H](../../../02-solver-modules/files/37/nucleationgroupsurfaceareavolumeratiofvscalarfieldsource.h--374f7ecef84f.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFields/groupProperty/groupPropertyFvScalarField.C](../../../02-solver-modules/files/57/grouppropertyfvscalarfield.c--57a2a136a7dc.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/distributionGroupFraction/distributionGroupFractionFvScalarFieldSource.H](../../../02-solver-modules/files/dd/distributiongroupfractionfvscalarfieldsource.h--dda9a2086b0a.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/growthGroupFraction/growthGroupFractionFvScalarFieldSource.H](../../../02-solver-modules/files/8b/growthgroupfractionfvscalarfieldsource.h--8bd238ffd34a.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/growthSecondaryProperty/growthSecondaryPropertyFvScalarFieldSource.H](../../../02-solver-modules/files/b7/growthsecondarypropertyfvscalarfieldsource.h--b74ca60a74f1.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/singleGroupFraction/singleGroupFractionFvScalarFieldSource.H](../../../02-solver-modules/files/1a/singlegroupfractionfvscalarfieldsource.h--1a29e8c8b5c5.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/uniformFixedValueGroupSurfaceAreaVolumeRatio/uniformFixedValueGroupSurfaceAreaVolumeRatioFvScalarFieldSource.H](../../../02-solver-modules/files/3a/uniformfixedvaluegroupsurfaceareavolumeratiofvscalarfieldsource.h--3a94be22bc40.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvPatchFields/distributionGroupFraction/distributionGroupFractionFvPatchScalarField.H](../../../02-solver-modules/files/a8/distributiongroupfractionfvpatchscalarfield.h--a8e93a40b07d.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvPatchFields/singleGroupFraction/singleGroupFractionFvPatchScalarField.H](../../../02-solver-modules/files/d1/singlegroupfractionfvpatchscalarfield.h--d1c6adf617ff.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
