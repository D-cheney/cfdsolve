---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a28b1bdd357f"
title: "OpenFOAM 14 源码解析：zeroDimensionalMassSource.C"
summary: "该文件实现 `zeroDimensionalMassSource` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/zeroDimensionalMassSource/zeroDimensionalMassSource.C"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：zeroDimensionalMassSource.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/zeroDimensionalMassSource/zeroDimensionalMassSource.C`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：105 行
- 文件标识：`a28b1bdd357f`

## 2. 功能说明

该文件实现 `zeroDimensionalMassSource` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积物理源项。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fv::zeroDimensionalMassSource::readCoeffs` | 50 |
| `Foam::fv::zeroDimensionalMassSource::massFlowRate` | 64 |
| `Foam::fv::zeroDimensionalMassSource::read` | 90 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`zeroDimensionalMassSource.H`](../../../12-boundaries-sources/files/66/zerodimensionalmasssource.h--66b5d5583c14.md)
- [`fvCellZone.H`](../../../05-finite-volume/files/be/fvcellzone.h--bee09cd009b8.md)
- [`basicThermo.H`](../../../08-thermophysical/files/f6/basicthermo.h--f61d8b7b6dd2.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
