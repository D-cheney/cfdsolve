---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a76e491fa6a0"
title: "OpenFOAM 14 源码解析：isothermalFilm.H"
summary: "该文件声明或实现 `surfaceTensionModel`、`mappedFvPatchBaseBase`、`isothermalFilm`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/isothermalFilm/isothermalFilm.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：isothermalFilm.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/isothermalFilm/isothermalFilm.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：411 行
- 文件标识：`a76e491fa6a0`

## 2. 功能说明

该文件声明或实现 `surfaceTensionModel`、`mappedFvPatchBaseBase`、`isothermalFilm`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Solver module for flow of compressible isothermal liquid films Uses the flexible PIMPLE (PISO-SIMPLE) solution for time-resolved and pseudo-transient and steady simulations. Optional fvModels and fvConstraints are provided to enhance the simulation in many ways including adding various sources, Lagrangian particles, surface film etc. and constraining or limiting the solution.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `surfaceTensionModel` | 65 |
| `mappedFvPatchBaseBase` | 66 |
| `isothermalFilm` | 74 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`solver.H`](../../../05-finite-volume/files/0e/solver.h--0e19ba72056e.md)
- [`rhoFluidThermo.H`](../../../08-thermophysical/files/e6/rhofluidthermo.h--e68eb3d5b8b1.md)
- [`filmCompressibleMomentumTransportModel.H`](../../../02-solver-modules/files/aa/filmcompressiblemomentumtransportmodel.h--aa36e9d41308.md)
- [`uniformDimensionedFields.H`](../../../05-finite-volume/files/4e/uniformdimensionedfields.h--4e5431e912f3.md)
- [`isothermalFilmTemplates.C`](../../../02-solver-modules/files/2a/isothermalfilmtemplates.c--2ab56235aeeb.md)

## 8. 直接上层引用

- [applications/modules/film/film.H](../../../02-solver-modules/files/17/film.h--17e7e29ab737.md)
- [applications/modules/isothermalFilm/contactForce.C](../../../02-solver-modules/files/61/contactforce.c--61015a686cef.md)
- [applications/modules/isothermalFilm/continuityPredictor.C](../../../02-solver-modules/files/90/continuitypredictor.c--9069418c14a1.md)
- [applications/modules/isothermalFilm/correctAlpha.C](../../../02-solver-modules/files/27/correctalpha.c--27d236a29c4c.md)
- [applications/modules/isothermalFilm/fvModels/filmCloudTransfer/ejectionModels/ejectionModel/ejectionModel.H](../../../02-solver-modules/files/4c/ejectionmodel.h--4c76a64026e5.md)
- [applications/modules/isothermalFilm/fvModels/filmCloudTransfer/filmCloudTransfer.H](../../../02-solver-modules/files/4d/filmcloudtransfer.h--4d990d2e2029.md)
- [applications/modules/isothermalFilm/fvModels/filmVoFTransfer/filmVoFTransfer.H](../../../02-solver-modules/files/e1/filmvoftransfer.h--e163db835293.md)
- [applications/modules/isothermalFilm/isothermalFilm.C](../../../02-solver-modules/files/89/isothermalfilm.c--894f1e2e362a.md)
- [applications/modules/isothermalFilm/momentumPredictor.C](../../../02-solver-modules/files/b0/momentumpredictor.c--b02ab83d85a3.md)
- [applications/modules/isothermalFilm/patches/filmFvPatch/filmFvPatch.C](../../../02-solver-modules/files/5d/filmfvpatch.c--5dacc12a18d3.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
