---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-51ca8fdeb074"
title: "OpenFOAM 14 源码解析：sensibleEnthalpy.H"
summary: "该文件声明或实现 `sensibleEnthalpy`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/thermo/sensibleEnthalpy/sensibleEnthalpy.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：sensibleEnthalpy.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/thermo/sensibleEnthalpy/sensibleEnthalpy.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：129 行
- 文件标识：`51ca8fdeb074`

## 2. 功能说明

该文件声明或实现 `sensibleEnthalpy`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Thermodynamics mapping class to expose the sensible enthalpy functions.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `sensibleEnthalpy` | 49 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Cpv` | 85 |
| `he` | 96 |
| `The` | 108 |

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- 未检测到直接 `#include`；脚本/清单或自包含实现可能通过环境和命令产生依赖。

## 8. 直接上层引用

- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.H](../../../03-utilities/files/a6/chemkinreader.h--a64993417c06.md)
- [src/thermophysicalModels/basic/liquidThermo/liquidThermos.C](../../../08-thermophysical/files/a6/liquidthermos.c--a6488a6b8966.md)
- [src/thermophysicalModels/specie/include/forGases.H](../../../08-thermophysical/files/1a/forgases.h--1ae68ddb3b03.md)
- [src/thermophysicalModels/specie/include/forLiquids.H](../../../08-thermophysical/files/a6/forliquids.h--a60e3659531c.md)
- [src/thermophysicalModels/specie/include/forTabulated.H](../../../08-thermophysical/files/34/fortabulated.h--34b9ccd302b4.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
