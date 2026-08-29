---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e3cfeef8bce1"
title: "OpenFOAM 14 源码解析：fixedEnergyFvPatchScalarField.H"
summary: "该文件声明或实现 `fixedEnergyFvPatchScalarField`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/derivedFvPatchFields/fixedEnergy/fixedEnergyFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：fixedEnergyFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/derivedFvPatchFields/fixedEnergy/fixedEnergyFvPatchScalarField.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：160 行
- 文件标识：`e3cfeef8bce1`

## 2. 功能说明

该文件声明或实现 `fixedEnergyFvPatchScalarField`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：This boundary condition provides a fixed condition for energy. This is selected when the corresponding temperature condition is fixedValue.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fixedEnergyFvPatchScalarField` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`fixedValueFvPatchFields.H`](../../../05-finite-volume/files/ff/fixedvaluefvpatchfields.h--ff21ae834f83.md)

## 8. 直接上层引用

- [src/thermophysicalModels/basic/basicThermo/basicThermo.C](../../../08-thermophysical/files/fd/basicthermo.c--fde783e68bbd.md)
- [src/thermophysicalModels/basic/derivedFvPatchFields/fixedEnergy/fixedEnergyFvPatchScalarField.C](../../../08-thermophysical/files/28/fixedenergyfvpatchscalarfield.c--2858e4a4a686.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
