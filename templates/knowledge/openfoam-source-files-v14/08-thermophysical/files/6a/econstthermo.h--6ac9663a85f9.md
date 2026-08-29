---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6ac9663a85f9"
title: "OpenFOAM 14 源码解析：eConstThermo.H"
summary: "该文件声明或实现 `eConstThermo`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/thermo/eConst/eConstThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：eConstThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/thermo/eConst/eConstThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：254 行
- 文件标识：`6ac9663a85f9`

## 2. 功能说明

该文件声明或实现 `eConstThermo`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Internal energy based thermodynamics package using a constant heat capacity at constant volume. The sensible internal energy is evaluated as: \verbatim es = Cv*(T - Tref) + esRef \endverbatim Usage \table Property | Description Cv | Constant Heat capacity at constant volume [J/kg/K] Tref | Reference temperature [K] (defaults to Tstd) esRef | Reference sensible internal energy [J/kg] (defaults to 0) hf | Heat of formation [J/kg] \endtable Example specification of eConstThermo for air: \verbatim thermodynamics { Cv 724; hf 0; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `eConstThermo` | 75 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`EtoHthermo.H`](../../../08-thermophysical/files/84/etohthermo.h--84c527f319ea.md)
- [`eConstThermoI.H`](../../../08-thermophysical/files/cf/econstthermoi.h--cf8538291b51.md)
- [`eConstThermo.C`](../../../08-thermophysical/files/ed/econstthermo.c--ed33f31d95bb.md)

## 8. 直接上层引用

- [src/thermophysicalModels/solidThermo/solidSpecie/include/forSolids.H](../../../08-thermophysical/files/37/forsolids.h--3771cbfe67d8.md)
- [src/thermophysicalModels/specie/include/forGases.H](../../../08-thermophysical/files/1a/forgases.h--1ae68ddb3b03.md)
- [src/thermophysicalModels/specie/include/forLiquids.H](../../../08-thermophysical/files/a6/forliquids.h--a60e3659531c.md)
- [src/thermophysicalModels/specie/thermo/eConst/eConstThermo.C](../../../08-thermophysical/files/ed/econstthermo.c--ed33f31d95bb.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
