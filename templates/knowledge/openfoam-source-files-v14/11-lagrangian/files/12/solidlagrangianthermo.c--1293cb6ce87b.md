---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1293cb6ce87b"
title: "OpenFOAM 14 源码解析：solidLagrangianThermo.C"
summary: "该文件实现 `solidLagrangianThermo` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/LagrangianThermo/solidLagrangianThermo/solidLagrangianThermo.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：solidLagrangianThermo.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/LagrangianThermo/solidLagrangianThermo/solidLagrangianThermo.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：121 行
- 文件标识：`1293cb6ce87b`

## 2. 功能说明

该文件实现 `solidLagrangianThermo` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::solidLagrangianThermo::implementation::p` | 43 |
| `Foam::solidLagrangianThermo::New` | 87 |
| `Foam::solidLagrangianThermo::initialise` | 110 |
| `Foam::solidLagrangianThermo::correctPressure` | 115 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。

## 7. 直接依赖

- [`solidLagrangianThermo.H`](../../../11-lagrangian/files/02/solidlagrangianthermo.h--02c6800d4074.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
