---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fbddea6654c0"
title: "OpenFOAM 14 源码解析：LiquidEvaporationBoil.H"
summary: "该文件声明或实现 `LiquidEvaporationBoil`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/LiquidEvaporationBoil/LiquidEvaporationBoil.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LiquidEvaporationBoil.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/LiquidEvaporationBoil/LiquidEvaporationBoil.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：173 行
- 文件标识：`fbddea6654c0`

## 2. 功能说明

该文件声明或实现 `LiquidEvaporationBoil`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Liquid evaporation model - uses ideal gas assumption - includes boiling model based on: \verbatim "Studies of Superheated Fuel Spray Structures and Vaporization in GDI Engines" Zuo, B., Gomes, A. M. and Rutland C. J. International Journal of Engine Research, 2000, Vol. 1(4), pp. 321-336 \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LiquidEvaporationBoil` | 62 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`PhaseChangeModel.H`](../../../11-lagrangian/files/59/phasechangemodel.h--59c622b06555.md)
- [`liquidMixtureProperties.H`](../../../08-thermophysical/files/b0/liquidmixtureproperties.h--b0febd74edee.md)
- [`LiquidEvaporationBoil.C`](../../../11-lagrangian/files/6f/liquidevaporationboil.c--6f623a9cccdc.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/include/makeReactingParcelPhaseChangeModels.H](../../../11-lagrangian/files/3f/makereactingparcelphasechangemodels.h--3f39d6711e4a.md)
- [src/lagrangian/parcel/submodels/Reacting/PhaseChangeModel/LiquidEvaporationBoil/LiquidEvaporationBoil.C](../../../11-lagrangian/files/6f/liquidevaporationboil.c--6f623a9cccdc.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
