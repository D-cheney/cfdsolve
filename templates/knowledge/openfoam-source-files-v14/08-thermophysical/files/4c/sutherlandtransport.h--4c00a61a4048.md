---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4c00a61a4048"
title: "OpenFOAM 14 源码解析：sutherlandTransport.H"
summary: "该文件声明或实现 `sutherlandTransport`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/transport/sutherland/sutherlandTransport.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：sutherlandTransport.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/transport/sutherland/sutherlandTransport.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：233 行
- 文件标识：`4c00a61a4048`

## 2. 功能说明

该文件声明或实现 `sutherlandTransport`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Transport package using Sutherland's formula for viscosity: \verbatim mu = As*sqrt(T)/(1 + Ts/T) \endverbatim and the thermal conductivity (for gases) is obtained from: \verbatim kappa = mu*Cv*(1.32 + 1.77*R/Cv) \endverbatim Usage \table Property | Description As | Sutherland constant kg/(ms K^1/2) Ts | Sutherland temperature [K] \endtable Example specification of sutherlandTransport for air: \verbatim transport { As 1.458e-06; Ts 110.4; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `sutherlandTransport` | 77 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`sutherlandTransportI.H`](../../../08-thermophysical/files/dc/sutherlandtransporti.h--dced5450eaac.md)
- [`sutherlandTransport.C`](../../../08-thermophysical/files/73/sutherlandtransport.c--73e2a63fc355.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermos.C](../../../17-other-libraries/files/cb/psiumulticomponentthermos.c--cbf50cf75a91.md)
- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.H](../../../03-utilities/files/a6/chemkinreader.h--a64993417c06.md)
- [src/thermophysicalModels/specie/include/forGases.H](../../../08-thermophysical/files/1a/forgases.h--1ae68ddb3b03.md)
- [src/thermophysicalModels/specie/transport/sutherland/sutherlandTransport.C](../../../08-thermophysical/files/73/sutherlandtransport.c--73e2a63fc355.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
