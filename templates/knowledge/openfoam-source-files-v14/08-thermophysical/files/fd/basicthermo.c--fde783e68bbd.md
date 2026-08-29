---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fde783e68bbd"
title: "OpenFOAM 14 源码解析：basicThermo.C"
summary: "该文件实现 `basicThermo` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/basicThermo/basicThermo.C"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：basicThermo.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/basicThermo/basicThermo.C`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：405 行
- 文件标识：`fde783e68bbd`

## 2. 功能说明

该文件实现 `basicThermo` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::basicThermo::mixtureName` | 53 |
| `Foam::basicThermo::lookupOrConstruct` | 66 |
| `Foam::basicThermo::splitThermoName` | 97 |
| `Foam::basicThermo::thermoNameComponents` | 159 |
| `Foam::basicThermo::heBoundaryBaseTypes` | 180 |
| `Foam::basicThermo::heBoundaryTypes` | 197 |
| `Foam::basicThermo::heSourcesTypes` | 242 |
| `Foam::basicThermo::New` | 304 |
| `Foam::basicThermo::validate` | 326 |
| `Foam::basicThermo::gamma` | 365 |
| `Foam::basicThermo::implementation::T` | 381 |
| `Foam::basicThermo::implementation::kappa` | 393 |
| `Foam::basicThermo::implementation::read` | 399 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
8. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`basicThermo.H`](../../../08-thermophysical/files/f6/basicthermo.h--f61d8b7b6dd2.md)
- [`zeroGradientFvPatchFields.H`](../../../05-finite-volume/files/9a/zerogradientfvpatchfields.h--9a96ee93ac86.md)
- [`fixedEnergyFvPatchScalarField.H`](../../../08-thermophysical/files/e3/fixedenergyfvpatchscalarfield.h--e3cfeef8bce1.md)
- [`gradientEnergyFvPatchScalarField.H`](../../../08-thermophysical/files/d8/gradientenergyfvpatchscalarfield.h--d87b863e4032.md)
- [`gradientEnergyCalculatedTemperatureFvPatchScalarField.H`](../../../08-thermophysical/files/01/gradientenergycalculatedtemperaturefvpatchscalarfield.h--014bf273b740.md)
- [`mixedEnergyFvPatchScalarField.H`](../../../08-thermophysical/files/44/mixedenergyfvpatchscalarfield.h--4491179b07b1.md)
- [`mixedEnergyCalculatedTemperatureFvPatchScalarField.H`](../../../08-thermophysical/files/91/mixedenergycalculatedtemperaturefvpatchscalarfield.h--91e2ba67c8f7.md)
- [`fixedJumpFvPatchFields.H`](../../../05-finite-volume/files/bf/fixedjumpfvpatchfields.h--bfe722b8f772.md)
- [`energyJumpFvPatchScalarField.H`](../../../08-thermophysical/files/b2/energyjumpfvpatchscalarfield.h--b29f43f47194.md)
- [`energyFvScalarFieldSource.H`](../../../08-thermophysical/files/a3/energyfvscalarfieldsource.h--a3631221d4db.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
