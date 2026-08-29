---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-20c310d89dee"
title: "OpenFOAM 14 源码解析：AndradeTransport.H"
summary: "该文件声明或实现 `AndradeTransport`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/transport/Andrade/AndradeTransport.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：AndradeTransport.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/transport/Andrade/AndradeTransport.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：212 行
- 文件标识：`20c310d89dee`

## 2. 功能说明

该文件声明或实现 `AndradeTransport`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Transport package using the Andrade function for the natural logarithm of dynamic viscosity and thermal conductivity of liquids: \verbatim log(mu) = muCoeffs[0] + muCoeffs[1]*T + muCoeffs[2]*sqr(T) + muCoeffs_[3]/(muCoeffs_[4] + T) log(kappa) = kappaCoeffs[0] + kappaCoeffs[1]*T + kappaCoeffs[2]*sqr(T) + kappaCoeffs_[3]/(kappaCoeffs_[4] + T) ); \endverbatim References: \verbatim Andrade, E. D. C. (1934). XLI. A theory of the viscosity of liquids.—Part I. The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science, 17(112), 497-511. Andrade, E. D. C. (1934). LVIII. A theory of the viscosity of liquids.—Part II. The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science, 17(113), 698-732. \endverbatim Usage \table Property | Description muCoeffs | Dynamic viscosity polynomial coefficients kappaCoeffs | Thermal conductivity polynomial coefficients \en

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `AndradeTransport` | 92 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`FixedList.H`](../../../04-core-runtime/files/56/fixedlist.h--5633be515ee5.md)
- [`AndradeTransportI.H`](../../../08-thermophysical/files/02/andradetransporti.h--02b34c4a9c33.md)
- [`AndradeTransport.C`](../../../08-thermophysical/files/21/andradetransport.c--218bc998ff50.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/transport/Andrade/AndradeTransport.C](../../../08-thermophysical/files/21/andradetransport.c--218bc998ff50.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
