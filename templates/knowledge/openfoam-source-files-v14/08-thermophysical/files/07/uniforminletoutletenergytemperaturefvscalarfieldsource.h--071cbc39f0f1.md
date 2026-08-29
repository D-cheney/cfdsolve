---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-071cbc39f0f1"
title: "OpenFOAM 14 源码解析：uniformInletOutletEnergyTemperatureFvScalarFieldSource.H"
summary: "该文件声明或实现 `uniformInletOutletEnergyTemperatureFvScalarFieldSource`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/derivedFvFieldSources/uniformInletOutletEnergyTemperature/uniformInletOutletEnergyTemperatureFvScalarFieldSource.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：uniformInletOutletEnergyTemperatureFvScalarFieldSource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/derivedFvFieldSources/uniformInletOutletEnergyTemperature/uniformInletOutletEnergyTemperatureFvScalarFieldSource.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：173 行
- 文件标识：`071cbc39f0f1`

## 2. 功能说明

该文件声明或实现 `uniformInletOutletEnergyTemperatureFvScalarFieldSource`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：This source condition is applied to the temperature field, but provides a uniform fixed energy into the energy equation when the source is positive, and the internal value when it is negative (i.e., a sink) Usage \table Property | Description | Required | Default value uniformInletHe | uniform inlet energy value | yes | \endtable Example of the boundary condition specification: \verbatim <sourceName> { type uniformInletOutletEnergyTemperature; uniformInletHe 3700000; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `uniformInletOutletEnergyTemperatureFvScalarFieldSource` | 72 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`energyCalculatedTemperatureFvScalarFieldSource.H`](../../../08-thermophysical/files/bd/energycalculatedtemperaturefvscalarfieldsource.h--bd5b8684bc91.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/thermophysicalModels/basic/derivedFvFieldSources/uniformInletOutletEnergyTemperature/uniformInletOutletEnergyTemperatureFvScalarFieldSource.C](../../../08-thermophysical/files/1b/uniforminletoutletenergytemperaturefvscalarfieldsource.c--1bc311c7f6bf.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
