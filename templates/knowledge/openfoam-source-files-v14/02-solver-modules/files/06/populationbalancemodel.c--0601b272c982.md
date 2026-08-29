---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0601b272c982"
title: "OpenFOAM 14 源码解析：populationBalanceModel.C"
summary: "该文件实现 `populationBalanceModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：populationBalanceModel.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/populationBalance/populationBalanceModel/populationBalanceModel.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1708 行
- 文件标识：`0601b272c982`

## 2. 功能说明

该文件实现 `populationBalanceModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::populationBalanceModel::groupFieldIo` | 59 |
| `Foam::populationBalanceModel::groupField` | 85 |
| `Foam::populationBalanceModel::typeDict` | 130 |
| `Foam::populationBalanceModel::precomputeCoalescenceAndBreakup` | 135 |
| `Foam::populationBalanceModel::birthByCoalescence` | 143 |
| `Foam::populationBalanceModel::deathByCoalescence` | 194 |
| `Foam::populationBalanceModel::birthByDaughterSizeDistributionBreakup` | 209 |
| `Foam::populationBalanceModel::deathByDaughterSizeDistributionBreakup` | 240 |
| `Foam::populationBalanceModel::birthByBinaryBreakup` | 250 |
| `Foam::populationBalanceModel::deathByBinaryBreakup` | 308 |
| `Foam::populationBalanceModel::computeCoalescenceAndBreakup` | 319 |
| `Foam::populationBalanceModel::precomputeExpansion` | 380 |
| `Foam::populationBalanceModel::expansionSus` | 398 |
| `Foam::populationBalanceModel::computeExpansion` | 435 |
| `Foam::populationBalanceModel::precomputeModelSources` | 467 |
| `Foam::populationBalanceModel::modelSourceRhoSus` | 473 |
| `Foam::populationBalanceModel::computeModelSources` | 533 |
| `Foam::populationBalanceModel::computeDilatationErrors` | 567 |
| `Foam::populationBalanceModel::updateSources` | 608 |
| `Foam::populationBalanceModel::etaCoeffs0` | 618 |
| `Foam::populationBalanceModel::etaCoeffs1` | 638 |
| `Foam::populationBalanceModel::etaVCoeffs0` | 658 |
| `Foam::populationBalanceModel::etaVCoeffs1` | 678 |
| `Foam::populationBalanceModel::shape` | 1087 |
| `Foam::populationBalanceModel::a` | 1093 |
| `Foam::populationBalanceModel::d` | 1102 |
| `Foam::populationBalanceModel::eta` | 1111 |
| `Foam::populationBalanceModel::etaV` | 1155 |
| `Foam::populationBalanceModel::sigmaWithContinuousPhase` | 1325 |
| `Foam::populationBalanceModel::continuousTurbulence` | 1345 |
| `Foam::populationBalanceModel::Sp` | 1356 |
| `Foam::populationBalanceModel::expansionSu` | 1365 |
| `Foam::populationBalanceModel::expansionSp` | 1381 |
| `Foam::populationBalanceModel::modelSourceSu` | 1414 |
| `Foam::populationBalanceModel::solve` | 1438 |
| `Foam::populationBalanceModel::correct` | 1573 |
| `Foam::populationBalanceModel::writeData` | 1700 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **隐式时间项**：把时间导数装配到矩阵对角与源项，参与线性方程求解。
3. **隐式对流项**：按面通量和选定格式把对流贡献装配到有限体积矩阵。
4. **显式时间算子**：直接计算时间导数场，不把未知量系数写入矩阵。
5. **显式散度**：由面通量求控制体净通量并返回单元场。
6. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
7. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
8. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
9. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
10. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
11. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
12. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
13. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`populationBalance.H`](../../../02-solver-modules/files/3a/populationbalance.h--3aa9f65ead29.md)
- [`populationBalanceModel.H`](../../../02-solver-modules/files/c6/populationbalancemodel.h--c61e09f33eb3.md)
- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`phaseCompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/cc/phasecompressiblemomentumtransportmodel.h--cc1b40028f94.md)
- [`shapeModel.H`](../../../02-solver-modules/files/ab/shapemodel.h--abafc88d3bd3.md)
- [`coalescenceModel.H`](../../../02-solver-modules/files/68/coalescencemodel.h--6815becd5c16.md)
- [`daughterSizeDistribution.H`](../../../02-solver-modules/files/7b/daughtersizedistribution.h--7b934cb401e4.md)
- `binary.H`
- [`fvmDdt.H`](../../../05-finite-volume/files/be/fvmddt.h--bee4ba370e19.md)
- [`fvmDiv.H`](../../../05-finite-volume/files/32/fvmdiv.h--32306f8dc3a6.md)
- [`fvmSup.H`](../../../05-finite-volume/files/6c/fvmsup.h--6ce628800519.md)
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`distribution.H`](../../../04-core-runtime/files/a7/distribution.h--a74f26d87987.md)
- [`fvSpecificSource.H`](../../../05-finite-volume/files/d7/fvspecificsource.h--d75fc3d76aba.md)
- [`growthFvScalarFieldSource.H`](../../../02-solver-modules/files/ad/growthfvscalarfieldsource.h--ad61e758efee.md)
- [`oneDimensionalDiscretisation.H`](../../../02-solver-modules/files/5d/onedimensionaldiscretisation.h--5d0bfb12d11d.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
