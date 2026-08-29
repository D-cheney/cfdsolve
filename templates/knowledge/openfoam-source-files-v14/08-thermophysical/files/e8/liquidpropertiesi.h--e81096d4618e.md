---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e81096d4618e"
title: "OpenFOAM 14 源码解析：liquidPropertiesI.H"
summary: "该文件实现 `limit`、`Y`、`Tc`、`Pc` 等过程，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/thermophysicalProperties/liquidProperties/liquidProperties/liquidPropertiesI.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：liquidPropertiesI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/thermophysicalProperties/liquidProperties/liquidProperties/liquidPropertiesI.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：277 行
- 文件标识：`e81096d4618e`

## 2. 功能说明

该文件实现 `limit`、`Y`、`Tc`、`Pc` 等过程，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::liquidProperties::limit` | 35 |
| `Foam::liquidProperties::Y` | 40 |
| `Foam::liquidProperties::Tc` | 46 |
| `Foam::liquidProperties::Pc` | 52 |
| `Foam::liquidProperties::Vc` | 58 |
| `Foam::liquidProperties::Zc` | 64 |
| `Foam::liquidProperties::Tt` | 70 |
| `Foam::liquidProperties::Pt` | 76 |
| `Foam::liquidProperties::Tb` | 82 |
| `Foam::liquidProperties::dipm` | 88 |
| `Foam::liquidProperties::omega` | 94 |
| `Foam::liquidProperties::delta` | 100 |
| `Foam::liquidProperties::psi` | 106 |
| `Foam::liquidProperties::CpMCv` | 112 |
| `Foam::liquidProperties::es` | 118 |
| `Foam::liquidProperties::ea` | 124 |
| `Foam::liquidProperties::readIfPresent` | 130 |
| `Foam::liquidProperties::write` | 201 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`liquidProperties.H`](../../../08-thermophysical/files/c8/liquidproperties.h--c8f37948c8ac.md)

## 8. 直接上层引用

- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/liquidProperties/liquidProperties.H](../../../08-thermophysical/files/c8/liquidproperties.h--c8f37948c8ac.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
