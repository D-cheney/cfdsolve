---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f0cb77bbd82c"
title: "OpenFOAM 14 源码解析：fractal.H"
summary: "该文件声明或实现 `fractal`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/shapeModels/fractal/fractal.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：fractal.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/shapeModels/fractal/fractal.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：185 行
- 文件标识：`f0cb77bbd82c`

## 2. 功能说明

该文件声明或实现 `fractal`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Class for modelling the shape of particle aggregates using the concept of fractal geometry. Returns a collisional diameter \f[ d_{c_i} = \frac{6}{\kappa_i} \left( \frac{v_i \kappa_i^3}{36 \pi \alpha_c} \right)^{1/D_{f_i}}\,, \f] computed from a constant fractal dimension \&#36;D_{f_i}\&#36; and a field-dependent surface area to volume ratio \&#36;\kappa_i\&#36;, assuming that the primary particles in an aggregate have the same size. Usage \table Property | Description | Required | Default value Df | Fractal dimension | yes | alphaC | Scaling prefactor | yes | \endtable

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fractal` | 82 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`SecondaryPropertyModel.H`](../../../02-solver-modules/files/a1/secondarypropertymodel.h--a1e6da6f4eae.md)
- [`shapeModel.H`](../../../02-solver-modules/files/ab/shapemodel.h--abafc88d3bd3.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/fvModels/KochFriedlanderSintering/KochFriedlanderSintering.C](../../../02-solver-modules/files/c0/kochfriedlandersintering.c--c012a517a7a8.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/hardSphereGroupSurfaceAreaVolumeRatio/hardSphereGroupSurfaceAreaVolumeRatioFvScalarFieldSource.C](../../../02-solver-modules/files/86/hardspheregroupsurfaceareavolumeratiofvscalarfieldsource.c--86736ee5e07f.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/interfacialGrowthGroupSurfaceAreaVolumeRatio/interfacialGrowthGroupSurfaceAreaVolumeRatioFvScalarFieldSource.C](../../../02-solver-modules/files/92/interfacialgrowthgroupsurfaceareavolumeratiofvscalarfieldsource.c--9276c7f205b7.md)
- [applications/modules/multiphaseEuler/populationBalance/derivedFvFieldSources/ParkRogakGroupSurfaceAreaVolumeRatio/ParkRogakGroupSurfaceAreaVolumeRatioFvScalarFieldSource.C](../../../02-solver-modules/files/77/parkrogakgroupsurfaceareavolumeratiofvscalarfieldsource.c--77896afff496.md)
- [applications/modules/multiphaseEuler/populationBalance/shapeModels/fractal/fractal.C](../../../02-solver-modules/files/50/fractal.c--50e8820b6c8f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
