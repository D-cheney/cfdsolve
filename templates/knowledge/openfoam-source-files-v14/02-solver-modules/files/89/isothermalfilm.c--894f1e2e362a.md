---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-894f1e2e362a"
title: "OpenFOAM 14 源码解析：isothermalFilm.C"
summary: "该文件实现 `isothermalFilm` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/isothermalFilm/isothermalFilm.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：isothermalFilm.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/isothermalFilm/isothermalFilm.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：523 行
- 文件标识：`894f1e2e362a`

## 2. 功能说明

该文件实现 `isothermalFilm` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::solvers::isothermalFilm::initFilmMesh` | 59 |
| `Foam::solvers::isothermalFilm::alphaTypes` | 149 |
| `Foam::solvers::isothermalFilm::correctCoNum` | 175 |
| `Foam::solvers::isothermalFilm::continuityErrors` | 191 |
| `Foam::solvers::isothermalFilm::dependenciesModified` | 228 |
| `Foam::solvers::isothermalFilm::read` | 233 |
| `Foam::solvers::isothermalFilm::isothermalFilm` | 425 |
| `Foam::solvers::isothermalFilm::surfacePatch` | 440 |
| `Foam::solvers::isothermalFilm::surfacePatchMap` | 445 |
| `Foam::solvers::isothermalFilm::maxDeltaT` | 452 |
| `Foam::solvers::isothermalFilm::preSolve` | 465 |
| `Foam::solvers::isothermalFilm::prePredictor` | 471 |
| `Foam::solvers::isothermalFilm::momentumTransportPredictor` | 477 |
| `Foam::solvers::isothermalFilm::thermophysicalTransportPredictor` | 483 |
| `Foam::solvers::isothermalFilm::moveMesh` | 487 |
| `Foam::solvers::isothermalFilm::motionCorrector` | 491 |
| `Foam::solvers::isothermalFilm::thermophysicalPredictor` | 495 |
| `Foam::solvers::isothermalFilm::pressureCorrector` | 501 |
| `Foam::solvers::isothermalFilm::momentumTransportCorrector` | 507 |
| `Foam::solvers::isothermalFilm::thermophysicalTransportCorrector` | 513 |
| `Foam::solvers::isothermalFilm::postSolve` | 517 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
4. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
5. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
6. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
7. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
8. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
9. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
10. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`isothermalFilm.H`](../../../02-solver-modules/files/a7/isothermalfilm.h--a76e491fa6a0.md)
- [`filmWallPolyPatch.H`](../../../02-solver-modules/files/23/filmwallpolypatch.h--232616de5ca3.md)
- [`filmSurfacePolyPatch.H`](../../../02-solver-modules/files/f2/filmsurfacepolypatch.h--f21b4fbe9c3e.md)
- [`mappedFvPatchBaseBase.H`](../../../05-finite-volume/files/48/mappedfvpatchbasebase.h--488fa85927cc.md)
- [`zeroGradientFvPatchFields.H`](../../../05-finite-volume/files/9a/zerogradientfvpatchfields.h--9a96ee93ac86.md)
- [`alphaOneFvPatchScalarField.H`](../../../02-solver-modules/files/e0/alphaonefvpatchscalarfield.h--e04a2651542f.md)
- [`constantSurfaceTension.H`](../../../10-multiphase/files/d5/constantsurfacetension.h--d5b85cf86c67.md)
- [`fvcVolumeIntegrate.H`](../../../05-finite-volume/files/64/fvcvolumeintegrate.h--6472da24b320.md)
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`fvcSurfaceIntegrate.H`](../../../05-finite-volume/files/4c/fvcsurfaceintegrate.h--4c6ccc53fb7e.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
