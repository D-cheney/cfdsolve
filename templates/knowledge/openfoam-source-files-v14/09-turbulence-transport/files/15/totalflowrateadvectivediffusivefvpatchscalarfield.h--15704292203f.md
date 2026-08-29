---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-15704292203f"
title: "OpenFOAM 14 源码解析：totalFlowRateAdvectiveDiffusiveFvPatchScalarField.H"
summary: "该文件声明或实现 `totalFlowRateAdvectiveDiffusiveFvPatchScalarField`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/totalFlowRateAdvectiveDiffusive/totalFlowRateAdvectiveDiffusiveFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：totalFlowRateAdvectiveDiffusiveFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/totalFlowRateAdvectiveDiffusive/totalFlowRateAdvectiveDiffusiveFvPatchScalarField.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：170 行
- 文件标识：`15704292203f`

## 2. 功能说明

该文件声明或实现 `totalFlowRateAdvectiveDiffusiveFvPatchScalarField`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：This BC is used for species inlets. The diffusion and advection fluxes are considered to calculate the inlet value for the species The massFluxFraction sets the fraction of the flux of each particular species.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `totalFlowRateAdvectiveDiffusiveFvPatchScalarField` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`mixedFvPatchFields.H`](../../../05-finite-volume/files/fd/mixedfvpatchfields.h--fde273d73f26.md)

## 8. 直接上层引用

- [src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/totalFlowRateAdvectiveDiffusive/totalFlowRateAdvectiveDiffusiveFvPatchScalarField.C](../../../09-turbulence-transport/files/ee/totalflowrateadvectivediffusivefvpatchscalarfield.c--ee56e9b34129.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
