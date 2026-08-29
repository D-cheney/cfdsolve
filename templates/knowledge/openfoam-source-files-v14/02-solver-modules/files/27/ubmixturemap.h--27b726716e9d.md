---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-27b726716e9d"
title: "OpenFOAM 14 源码解析：ubMixtureMap.H"
summary: "该文件声明或实现 `ubMixtureMap`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/XiFluid/ubMixtureMaps/ubMixtureMap/ubMixtureMap.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：ubMixtureMap.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/XiFluid/ubMixtureMaps/ubMixtureMap/ubMixtureMap.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：183 行
- 文件标识：`27b726716e9d`

## 2. 功能说明

该文件声明或实现 `ubMixtureMap`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Base class for unburnt/burnt gas composition mapping

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ubMixtureMap` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`uRhoMulticomponentThermo.H`](../../../02-solver-modules/files/74/urhomulticomponentthermo.h--7462c0884b23.md)
- [`bRhoMulticomponentThermo.H`](../../../02-solver-modules/files/da/brhomulticomponentthermo.h--dae91176faf1.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/modules/XiFluid/ubMixtureMaps/ubMixtureMap/ubMixtureMap.C](../../../02-solver-modules/files/ea/ubmixturemap.c--eabbd33b5da3.md)
- [applications/modules/XiFluid/ubMixtureMaps/uHomogeneousbHomogeneous/uHomogeneousbHomogeneous.H](../../../02-solver-modules/files/94/uhomogeneousbhomogeneous.h--94da63cf679a.md)
- [applications/modules/XiFluid/ubMixtureMaps/uInhomogeneousbInhomogeneous/uInhomogeneousbInhomogeneous.H](../../../02-solver-modules/files/fe/uinhomogeneousbinhomogeneous.h--feece3c96a75.md)
- [applications/modules/XiFluid/ubMixtureMaps/uInhomogeneousbMulticomponent/uInhomogeneousbMulticomponent.H](../../../02-solver-modules/files/a7/uinhomogeneousbmulticomponent.h--a7fa638c4fb9.md)
- [applications/modules/XiFluid/ubMixtureMaps/uInhomogeneousEGRbInhomogeneous/uInhomogeneousEGRbInhomogeneous.H](../../../02-solver-modules/files/ed/uinhomogeneousegrbinhomogeneous.h--edf386907618.md)
- [applications/modules/XiFluid/ubMixtureMaps/uMulticomponentbInhomogeneous/uMulticomponentbInhomogeneous.H](../../../02-solver-modules/files/a2/umulticomponentbinhomogeneous.h--a2dd49f4ba9b.md)
- [applications/modules/XiFluid/ubRhoThermo/ubRhoThermo.H](../../../02-solver-modules/files/e5/ubrhothermo.h--e5f0c905448b.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
