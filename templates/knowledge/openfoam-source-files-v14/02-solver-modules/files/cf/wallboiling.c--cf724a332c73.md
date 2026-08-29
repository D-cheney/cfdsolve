---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cf724a332c73"
title: "OpenFOAM 14 源码解析：wallBoiling.C"
summary: "该文件实现 `wallBoiling` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：wallBoiling.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoiling.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：970 行
- 文件标识：`cf724a332c73`

## 2. 功能说明

该文件实现 `wallBoiling` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Foam` | 54 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fv::wallBoiling::readCoeffs` | 246 |
| `Foam::fv::wallBoiling::getLiquidTemperaturePatchField` | 303 |
| `Foam::fv::wallBoiling::calcBoiling` | 370 |
| `Foam::fv::wallBoiling::evaluateBoiling` | 549 |
| `Foam::fv::wallBoiling::correctMDot` | 572 |
| `Foam::fv::wallBoiling::active` | 762 |
| `Foam::fv::wallBoiling::alphats` | 770 |
| `Foam::fv::wallBoiling::Lfraction` | 784 |
| `Foam::fv::wallBoiling::d` | 798 |
| `Foam::fv::wallBoiling::nDot` | 835 |
| `Foam::fv::wallBoiling::tau` | 867 |
| `Foam::fv::wallBoiling::mDot` | 875 |
| `Foam::fv::wallBoiling::mDotPf` | 882 |
| `Foam::fv::wallBoiling::mDotPfRef` | 900 |
| `Foam::fv::wallBoiling::addSup` | 918 |
| `Foam::fv::wallBoiling::correct` | 944 |
| `Foam::fv::wallBoiling::read` | 954 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`wallBoiling.H`](../../../02-solver-modules/files/75/wallboiling.h--757f2368e4d2.md)
- [`multiphaseEuler.H`](../../../02-solver-modules/files/1d/multiphaseeuler.h--1da7f90917b2.md)
- [`fluidThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/5b/fluidthermophysicaltransportmodel.h--5b059a3966c4.md)
- [`saturationTemperatureModel.H`](../../../08-thermophysical/files/d5/saturationtemperaturemodel.h--d5b7fc4d2db0.md)
- [`partitioningModel.H`](../../../02-solver-modules/files/a6/partitioningmodel.h--a6ff0895b6bd.md)
- [`nucleationSiteModel.H`](../../../02-solver-modules/files/b9/nucleationsitemodel.h--b9a4e3acd390.md)
- [`departureDiameterModel.H`](../../../02-solver-modules/files/62/departurediametermodel.h--62ed4aa3816d.md)
- [`departureFrequencyModel.H`](../../../02-solver-modules/files/c9/departurefrequencymodel.h--c90dfbd63ecf.md)
- [`alphatPhaseChangeWallFunctionFvPatchScalarField.H`](../../../02-solver-modules/files/48/alphatphasechangewallfunctionfvpatchscalarfield.h--48ba8ebff702.md)
- [`alphatJayatillekeWallFunctionFvPatchScalarField.H`](../../../09-turbulence-transport/files/2c/alphatjayatillekewallfunctionfvpatchscalarfield.h--2ce2c04eb86e.md)
- [`wallBoilingPhaseChangeRateFvPatchScalarField.H`](../../../02-solver-modules/files/0f/wallboilingphasechangeratefvpatchscalarfield.h--0f5f3bd070f9.md)
- [`zeroGradientFvPatchFields.H`](../../../05-finite-volume/files/9a/zerogradientfvpatchfields.h--9a96ee93ac86.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
