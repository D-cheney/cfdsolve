---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-944906faec75"
title: "OpenFOAM 14 源码解析：SingleKineticRateDevolatilisation.H"
summary: "该文件声明或实现 `SingleKineticRateDevolatilisation`、`volatileData`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/SingleKineticRateDevolatilisation/SingleKineticRateDevolatilisation.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：SingleKineticRateDevolatilisation.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/SingleKineticRateDevolatilisation/SingleKineticRateDevolatilisation.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：252 行
- 文件标识：`944906faec75`

## 2. 功能说明

该文件声明或实现 `SingleKineticRateDevolatilisation`、`volatileData`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Single kinetic rate devolatisation model. - acts on a per-specie basis - Rate given by Arrhenius eqn kappa = A1.exp(- E/R.T) Where: kappa = rate constant A1 = pre-exponential factor (user input) E = activation energy (user input) R = universal gas constant T = temperature Usage: SingleKineticRateDevolatilisation { volatileData ( (CH4 12 0.5) // (name A1 E) (CO2 12 0.5) // (name A1 E) ); volatileResidualCoeff 1e-6; }

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `SingleKineticRateDevolatilisation` | 74 |
| `volatileData` | 81 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `A1` | 132 |
| `E` | 138 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`DevolatilisationModel.H`](../../../11-lagrangian/files/92/devolatilisationmodel.h--92c678f96b8a.md)
- [`SingleKineticRateDevolatilisation.C`](../../../11-lagrangian/files/ab/singlekineticratedevolatilisation.c--ab65f9fe5a05.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/include/makeReactingMultiphaseParcelDevolatilisationModels.H](../../../11-lagrangian/files/11/makereactingmultiphaseparceldevolatilisationmodels.h--11de192d23b6.md)
- [src/lagrangian/parcel/submodels/ReactingMultiphase/DevolatilisationModel/SingleKineticRateDevolatilisation/SingleKineticRateDevolatilisation.C](../../../11-lagrangian/files/ab/singlekineticratedevolatilisation.c--ab65f9fe5a05.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
