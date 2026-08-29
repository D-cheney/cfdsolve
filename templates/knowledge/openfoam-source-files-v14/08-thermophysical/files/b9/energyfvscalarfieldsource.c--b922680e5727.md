---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b922680e5727"
title: "OpenFOAM 14 源码解析：energyFvScalarFieldSource.C"
summary: "该文件实现 `energyFvScalarFieldSource`、`sourceValue`、`internalCoeff` 等过程，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/derivedFvFieldSources/energy/energyFvScalarFieldSource.C"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：energyFvScalarFieldSource.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/derivedFvFieldSources/energy/energyFvScalarFieldSource.C`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：166 行
- 文件标识：`b922680e5727`

## 2. 功能说明

该文件实现 `energyFvScalarFieldSource`、`sourceValue`、`internalCoeff` 等过程，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::energyFvScalarFieldSource::energyFvScalarFieldSource` | 48 |
| `Foam::energyFvScalarFieldSource::sourceValue` | 77 |
| `Foam::energyFvScalarFieldSource::internalCoeff` | 124 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`energyFvScalarFieldSource.H`](../../../08-thermophysical/files/a3/energyfvscalarfieldsource.h--a3631221d4db.md)
- [`energyCalculatedTemperatureFvScalarFieldSource.H`](../../../08-thermophysical/files/bd/energycalculatedtemperaturefvscalarfieldsource.h--bd5b8684bc91.md)
- [`fvSource.H`](../../../05-finite-volume/files/de/fvsource.h--dea7bbe6bfb1.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`basicThermo.H`](../../../08-thermophysical/files/f6/basicthermo.h--f61d8b7b6dd2.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
