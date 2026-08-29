---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-90774d0310b7"
title: "OpenFOAM 14 源码解析：volumeInjection.H"
summary: "该文件声明或实现 `volumeInjection`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/volumeInjection/volumeInjection.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：volumeInjection.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/volumeInjection/volumeInjection.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：187 行
- 文件标识：`90774d0310b7`

## 2. 功能说明

该文件声明或实现 `volumeInjection`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Volume injection model. This injects particles instantaneously within the volume of a set of cells. Particles are positioned randomly. Usage \table Property | Description | Required? | Default cellZone | The name of the cell zone | yes | number | The number to inject | if numberDensity is \ not specified | numberDensity | The number to inject per unit \ volume | if number is not \ specified | time | The time at which to inject | no | 0 \endtable Example specification: \verbatim <LagrangianModelName> { type volumeInjection; cellZone bed; numberDensity 2 [mm^-3]; time 0.01; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `volumeInjection` | 85 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`LagrangianInjection.H`](../../../11-lagrangian/files/da/lagrangianinjection.h--dadcfebc2b16.md)
- [`generatedCellZone.H`](../../../07-mesh-geometry/files/b3/generatedcellzone.h--b3c204fda914.md)
- [`restartableRandomGenerator.H`](../../../04-core-runtime/files/30/restartablerandomgenerator.h--304292ca6e1f.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/LagrangianModels/volumeInjection/volumeInjection.C](../../../11-lagrangian/files/0f/volumeinjection.c--0f89648a7923.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
