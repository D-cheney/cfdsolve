---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4491179b07b1"
title: "OpenFOAM 14 源码解析：mixedEnergyFvPatchScalarField.H"
summary: "该文件声明或实现 `mixedEnergyFvPatchScalarField`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/derivedFvPatchFields/mixedEnergy/mixedEnergyFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：mixedEnergyFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/derivedFvPatchFields/mixedEnergy/mixedEnergyFvPatchScalarField.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：174 行
- 文件标识：`4491179b07b1`

## 2. 功能说明

该文件声明或实现 `mixedEnergyFvPatchScalarField`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：This boundary condition provides a mixed condition for energy. This is selected when the corresponding temperature condition is mixed, or mixedEnergyCalculatedTemperature. If the temperature condition is mixed, the parameters of the energy condition are obtained from a linearisation of the corresponding parameters of the temperature condition. If the temperature condition is mixedEnergyCalculatedTemperature, then the temperature condition explicitly provides energy refValue/refGrad/valueFraction fields, so no linearisation is needed.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `mixedEnergyFvPatchScalarField` | 68 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`mixedFvPatchFields.H`](../../../05-finite-volume/files/fd/mixedfvpatchfields.h--fde273d73f26.md)

## 8. 直接上层引用

- [src/thermophysicalModels/basic/basicThermo/basicThermo.C](../../../08-thermophysical/files/fd/basicthermo.c--fde783e68bbd.md)
- [src/thermophysicalModels/basic/basicThermo/BasicThermo.C](../../../08-thermophysical/files/87/basicthermo.c--87065cf422b3.md)
- [src/thermophysicalModels/basic/derivedFvPatchFields/mixedEnergy/mixedEnergyFvPatchScalarField.C](../../../08-thermophysical/files/6f/mixedenergyfvpatchscalarfield.c--6f3eac5fd5a2.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
