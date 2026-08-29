---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d1f5adf2bb1c"
title: "OpenFOAM 14 源码解析：WLFTransport.H"
summary: "该文件声明或实现 `WLFTransport`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/transport/WLF/WLFTransport.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：WLFTransport.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/transport/WLF/WLFTransport.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：236 行
- 文件标识：`d1f5adf2bb1c`

## 2. 功能说明

该文件声明或实现 `WLFTransport`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Transport package using the Williams-Landel-Ferry model for viscosity of polymer melts: \verbatim mu = mu0*exp(-C1*(T - Tr)/(C2 + T - Tr)) \endverbatim References: \verbatim Williams, M. L., Landel, R. F., & Ferry, J. D. (1955). The temperature dependence of relaxation mechanisms in amorphous polymers and other glass-forming liquids. Journal of the American Chemical society, 77(14), 3701-3707. \endverbatim The thermal conductivity is obtained using a constant Prandtl number. Usage \table Property | Description mu0 | Reference dynamic viscosity [Pa.s] Tref | Reference temperature [K] C1 | WLF constant [] C2 | WLF constant [K] Pr | Constant Prandtl number [] \endtable Example specification of WLFTransport for a polymer: \verbatim transport { mu0 50000; Tr 416; C1 20.4; C2 101.6; Pr 10000; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `WLFTransport` | 88 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`WLFTransportI.H`](../../../08-thermophysical/files/84/wlftransporti.h--84f7c4247131.md)
- [`WLFTransport.C`](../../../08-thermophysical/files/62/wlftransport.c--629daf8ff832.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/transport/WLF/WLFTransport.C](../../../08-thermophysical/files/62/wlftransport.c--629daf8ff832.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
