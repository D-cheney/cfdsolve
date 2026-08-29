---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c3e873c4aa13"
title: "OpenFOAM 14 源码解析：manualInjection.H"
summary: "该文件声明或实现 `manualInjection`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/manualInjection/manualInjection.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：manualInjection.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/manualInjection/manualInjection.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：158 行
- 文件标识：`c3e873c4aa13`

## 2. 功能说明

该文件声明或实现 `manualInjection`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Manual injection model. This injects particles instantaneously at a list of positions specified in a separate file. Usage \table Property | Description | Required? | Default positions | Positions at which to inject | if file not specified | file | File containing the positions | if positions not specified | units | Units of the positions in the file | if file specified | [m] time | The time at which to inject | no | 0 \endtable Example specification: \verbatim <LagrangianModelName> { type manualInjection; positions ((0 0 0) (1 1 1) (2 2 2)) [m]; time 1.23 [s]; } \endverbatim Example specification with positions in a file: \verbatim <LagrangianModelName> { type manualInjection; file "manualInjectionPositions"; units [mm]; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `manualInjection` | 86 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`LagrangianInjection.H`](../../../11-lagrangian/files/da/lagrangianinjection.h--dadcfebc2b16.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/LagrangianModels/manualInjection/manualInjection.C](../../../11-lagrangian/files/d0/manualinjection.c--d0bd94ba387d.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
