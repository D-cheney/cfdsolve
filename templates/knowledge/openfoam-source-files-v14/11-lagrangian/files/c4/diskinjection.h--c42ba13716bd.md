---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c42ba13716bd"
title: "OpenFOAM 14 源码解析：diskInjection.H"
summary: "该文件声明或实现 `diskInjection`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/diskInjection/diskInjection.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：diskInjection.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/diskInjection/diskInjection.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：208 行
- 文件标识：`c42ba13716bd`

## 2. 功能说明

该文件声明或实现 `diskInjection`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Disk injection model. This injects particles continuously over a disk with a given number rate. The disk is characterised by a centre, and axis and an inner and an outer diameter. The centre and axis and number rate are all Function1-s and can vary with time. Note that this model only controls the number and position of injected Lagrangian particles. All physical properties are specified by corresponding source conditions. So the velocity/direction/angle/etc..., is controlled by the velocity source condition, the size distribution by the diameter source condition, and the flow rate by the number source condition. Usage \table Property | Description | Required? | Default centre | The centre of the disk | yes | axis | The axis normal to the disk | yes | diameter | The diameter of the circle | if innerDiameter \ and outerDiameter \ are not specified | innerDiameter | The inner diameter of t

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `diskInjection` | 97 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`LagrangianInjection.H`](../../../11-lagrangian/files/da/lagrangianinjection.h--dadcfebc2b16.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`restartableRandomGenerator.H`](../../../04-core-runtime/files/30/restartablerandomgenerator.h--304292ca6e1f.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/coneDiskDirection/coneDiskDirectionLagrangianVectorFieldSource.C](../../../11-lagrangian/files/c1/conediskdirectionlagrangianvectorfieldsource.c--c1e0a3b4f66b.md)
- [src/Lagrangian/cloud/fields/derivedLagrangianFieldSources/flowRateConeDiskVelocity/flowRateConeDiskVelocityLagrangianVectorFieldSource.C](../../../11-lagrangian/files/c5/flowrateconediskvelocitylagrangianvectorfieldsource.c--c5b45955702f.md)
- [src/Lagrangian/cloud/LagrangianModels/diskInjection/diskInjection.C](../../../11-lagrangian/files/aa/diskinjection.c--aa2ba6eaa723.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
