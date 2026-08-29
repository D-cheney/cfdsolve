---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a6ff0895b6bd"
title: "OpenFOAM 14 源码解析：partitioningModel.H"
summary: "该文件声明或实现 `partitioningModel`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/partitioningModel/partitioningModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：partitioningModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/partitioningModel/partitioningModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：141 行
- 文件标识：`a6ff0895b6bd`

## 2. 功能说明

该文件声明或实现 `partitioningModel`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Base class for wall heat flux partitioning models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `partitioningModel` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/phaseSurfaceBoiling/phaseSurfaceBoiling.C](../../../02-solver-modules/files/23/phasesurfaceboiling.c--2323be6dc4a8.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/cosine/cosine.H](../../../02-solver-modules/files/93/cosine.h--93142491018c.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/Lavieville/Lavieville.H](../../../02-solver-modules/files/37/lavieville.h--3752a5e6f8dc.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/linear/linear.H](../../../02-solver-modules/files/20/linear.h--20ae36bea2e4.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/partitioningModel/partitioningModel.C](../../../02-solver-modules/files/db/partitioningmodel.c--dba64e431997.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/partitioningModel/partitioningModelNew.C](../../../02-solver-modules/files/a5/partitioningmodelnew.c--a5df8ea0ec41.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/partitioningModels/phaseFraction/phaseFraction.H](../../../02-solver-modules/files/c7/phasefraction.h--c77cdf7fb44f.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.C](../../../02-solver-modules/files/cf/wallboiling.c--cf724a332c73.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
