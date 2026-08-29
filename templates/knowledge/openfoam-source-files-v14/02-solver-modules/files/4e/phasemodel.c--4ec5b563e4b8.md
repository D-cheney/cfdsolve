---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4ec5b563e4b8"
title: "OpenFOAM 14 源码解析：phaseModel.C"
summary: "该文件实现 `phaseModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/phaseModel/phaseModel.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：phaseModel.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/phaseModel/phaseModel.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：222 行
- 文件标识：`4ec5b563e4b8`

## 2. 功能说明

该文件实现 `phaseModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::phaseModel::clone` | 81 |
| `Foam::phaseModel::name` | 97 |
| `Foam::phaseModel::keyword` | 102 |
| `Foam::phaseModel::index` | 108 |
| `Foam::phaseModel::fluid` | 114 |
| `Foam::phaseModel::residualAlpha` | 120 |
| `Foam::phaseModel::alphaMax` | 126 |
| `Foam::phaseModel::d` | 132 |
| `Foam::phaseModel::diameter` | 138 |
| `Foam::phaseModel::correct` | 150 |
| `Foam::phaseModel::correctContinuityError` | 156 |
| `Foam::phaseModel::correctKinematics` | 160 |
| `Foam::phaseModel::correctThermo` | 164 |
| `Foam::phaseModel::correctReactions` | 168 |
| `Foam::phaseModel::correctSpecies` | 172 |
| `Foam::phaseModel::predictMomentumTransport` | 176 |
| `Foam::phaseModel::predictThermophysicalTransport` | 180 |
| `Foam::phaseModel::correctMomentumTransport` | 184 |
| `Foam::phaseModel::correctThermophysicalTransport` | 188 |
| `Foam::phaseModel::correctUf` | 192 |
| `Foam::phaseModel::read` | 196 |
| `Foam::phaseModel::correctInflowOutflow` | 202 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`phaseModel.H`](../../../02-solver-modules/files/6a/phasemodel.h--6a4c6bcda31f.md)
- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`diameterModel.H`](../../../02-solver-modules/files/05/diametermodel.h--05dead0a1c2d.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
