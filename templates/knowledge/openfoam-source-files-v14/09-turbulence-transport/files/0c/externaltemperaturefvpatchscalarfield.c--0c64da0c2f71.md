---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0c64da0c2f71"
title: "OpenFOAM 14 源码解析：externalTemperatureFvPatchScalarField.C"
summary: "该文件实现 `externalTemperatureFvPatchScalarField` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalTemperature/externalTemperatureFvPatchScalarField.C"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：externalTemperatureFvPatchScalarField.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalTemperature/externalTemperatureFvPatchScalarField.C`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：578 行
- 文件标识：`0c64da0c2f71`

## 2. 功能说明

该文件实现 `externalTemperatureFvPatchScalarField` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：热物性输运模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::externalTemperatureFvPatchScalarField::plusEqOp` | 39 |
| `Foam::externalTemperatureFvPatchScalarField::getKappa` | 77 |
| `Foam::externalTemperatureFvPatchScalarField::clone` | 281 |
| `Foam::externalTemperatureFvPatchScalarField::map` | 304 |
| `Foam::externalTemperatureFvPatchScalarField::reset` | 326 |
| `Foam::externalTemperatureFvPatchScalarField::updateCoeffs` | 348 |
| `Foam::externalTemperatureFvPatchScalarField::write` | 498 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`externalTemperatureFvPatchScalarField.H`](../../../09-turbulence-transport/files/4a/externaltemperaturefvpatchscalarfield.h--4a00be15d767.md)
- [`thermophysicalTransportModel.H`](../../../09-turbulence-transport/files/ad/thermophysicaltransportmodel.h--ad7d97fa3ad6.md)
- [`FunctionalDimensionedField.H`](../../../05-finite-volume/files/10/functionaldimensionedfield.h--10c38e4d5d18.md)
- [`physicoChemicalConstants.H`](../../../04-core-runtime/files/b6/physicochemicalconstants.h--b630740da18d.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`addBackwardCompatibleToRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
