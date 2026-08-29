---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1cb251073247"
title: "OpenFOAM 14 源码解析：phaseSystem.C"
summary: "该文件实现 `phaseSystem` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：phaseSystem.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/phaseSystem/phaseSystem.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：977 行
- 文件标识：`1cb251073247`

## 2. 功能说明

该文件实现 `phaseSystem` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::phaseSystem::sumAlphaMoving` | 62 |
| `Foam::phaseSystem::setMixtureU` | 87 |
| `Foam::phaseSystem::setMixturePhi` | 107 |
| `Foam::phaseSystem::nHatfv` | 131 |
| `Foam::phaseSystem::nHatf` | 157 |
| `Foam::phaseSystem::K` | 168 |
| `Foam::phaseSystem::alphaControl::read` | 426 |
| `Foam::phaseSystem::alphaControl::correct` | 456 |
| `Foam::phaseSystem::rho` | 462 |
| `Foam::phaseSystem::U` | 489 |
| `Foam::phaseSystem::sigma` | 516 |
| `Foam::phaseSystem::nearInterface` | 552 |
| `Foam::phaseSystem::surfaceTension` | 578 |
| `Foam::phaseSystem::incompressible` | 617 |
| `Foam::phaseSystem::correct` | 631 |
| `Foam::phaseSystem::correctContinuityError` | 640 |
| `Foam::phaseSystem::correctKinematics` | 676 |
| `Foam::phaseSystem::correctThermo` | 694 |
| `Foam::phaseSystem::correctReactions` | 703 |
| `Foam::phaseSystem::correctSpecies` | 712 |
| `Foam::phaseSystem::predictMomentumTransport` | 721 |
| `Foam::phaseSystem::predictThermophysicalTransport` | 730 |
| `Foam::phaseSystem::correctMomentumTransport` | 739 |
| `Foam::phaseSystem::correctThermophysicalTransport` | 748 |
| `Foam::phaseSystem::meshUpdate` | 757 |
| `Foam::phaseSystem::correctBoundaryFlux` | 769 |
| `Foam::phaseSystem::correctPhi` | 801 |
| `Foam::phaseSystem::read` | 913 |
| `Foam::byDt` | 949 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **显式时间算子**：直接计算时间导数场，不把未知量系数写入矩阵。
3. **显式散度**：由面通量求控制体净通量并返回单元场。
4. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
5. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
6. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
7. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
8. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
9. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
10. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
11. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`surfaceTensionCoefficientModel.H`](../../../02-solver-modules/files/d7/surfacetensioncoefficientmodel.h--d7c5fabc4dd9.md)
- `surfaceInterpolate.H`
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [`localEulerDdtScheme.H`](../../../05-finite-volume/files/fb/localeulerddtscheme.h--fb7ce050de98.md)
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`fvcGrad.H`](../../../05-finite-volume/files/d3/fvcgrad.h--d32a079c3240.md)
- [`fvcSnGrad.H`](../../../05-finite-volume/files/9c/fvcsngrad.h--9cae40f16e0c.md)
- [`fvCorrectPhi.H`](../../../05-finite-volume/files/a2/fvcorrectphi.h--a2b4484efdad.md)
- [`fvcMeshPhi.H`](../../../05-finite-volume/files/ea/fvcmeshphi.h--eae2819d7090.md)
- [`generateInterfacialModels.H`](../../../02-solver-modules/files/fe/generateinterfacialmodels.h--fe56c90c4032.md)
- [`generateInterfacialValues.H`](../../../02-solver-modules/files/3d/generateinterfacialvalues.h--3d1a48fcc182.md)
- [`correctContactAngle.H`](../../../10-multiphase/files/88/correctcontactangle.h--885bf81b0021.md)
- [`fixedValueFvsPatchFields.H`](../../../05-finite-volume/files/d4/fixedvaluefvspatchfields.h--d47094d0692f.md)
- [`movingWallVelocityFvPatchVectorField.H`](../../../05-finite-volume/files/e4/movingwallvelocityfvpatchvectorfield.h--e4f1ca4e5151.md)
- [`movingWallSlipVelocityFvPatchVectorField.H`](../../../05-finite-volume/files/a2/movingwallslipvelocityfvpatchvectorfield.h--a2a3aa047541.md)
- [`pressureReference.H`](../../../05-finite-volume/files/8a/pressurereference.h--8adb6fe34768.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
