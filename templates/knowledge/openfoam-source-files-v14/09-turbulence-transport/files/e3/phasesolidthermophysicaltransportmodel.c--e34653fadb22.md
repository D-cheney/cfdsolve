---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e34653fadb22"
title: "OpenFOAM 14 源码解析：phaseSolidThermophysicalTransportModel.C"
summary: "该文件实现 `phaseSolidThermophysicalTransportModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/phaseSolid/phaseSolidThermophysicalTransportModel/phaseSolidThermophysicalTransportModel.C"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：phaseSolidThermophysicalTransportModel.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/phaseSolid/phaseSolidThermophysicalTransportModel/phaseSolidThermophysicalTransportModel.C`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：175 行
- 文件标识：`e34653fadb22`

## 2. 功能说明

该文件实现 `phaseSolidThermophysicalTransportModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：热物性输运模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::phaseSolidThermophysicalTransportModel::New` | 64 |
| `Foam::phaseSolidThermophysicalTransportModel::typeDict` | 129 |
| `Foam::phaseSolidThermophysicalTransportModel::kappa` | 142 |
| `Foam::phaseSolidThermophysicalTransportModel::read` | 159 |
| `Foam::phaseSolidThermophysicalTransportModel::predict` | 165 |
| `Foam::phaseSolidThermophysicalTransportModel::correct` | 169 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`phaseSolidThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/b9/phasesolidthermophysicaltransportmodel.h--b9ffcb1c9c30.md)
- `isotropic.H`

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
