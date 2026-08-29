---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6e5d80752dcb"
title: "OpenFOAM 14 源码解析：PaSR.H"
summary: "该文件声明或实现 `PaSR`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/reactionModels/PaSR/PaSR.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：PaSR.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/reactionModels/PaSR/PaSR.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：133 行
- 文件标识：`6e5d80752dcb`

## 2. 功能说明

该文件声明或实现 `PaSR`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Partially stirred reactor turbulent reaction model. This model calculates a finite rate, based on both turbulence and chemistry time scales. Depending on mesh resolution, the Cmix parameter can be used to scale the turbulence mixing time scale.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PaSR` | 60 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`../laminar/laminar.H`](../../../08-thermophysical/files/fd/laminar.h--fd3cfba91e2c.md)

## 8. 直接上层引用

- [src/reactionModels/PaSR/PaSR.C](../../../08-thermophysical/files/49/pasr.c--499d4783cf34.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
