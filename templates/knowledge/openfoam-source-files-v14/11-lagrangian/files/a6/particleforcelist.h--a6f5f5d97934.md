---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a6f5f5d97934"
title: "OpenFOAM 14 源码解析：ParticleForceList.H"
summary: "该文件声明或实现 `ParticleForceList`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/ForceTypes/ParticleForceList/ParticleForceList.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ParticleForceList.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/ForceTypes/ParticleForceList/ParticleForceList.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：180 行
- 文件标识：`a6f5f5d97934`

## 2. 功能说明

该文件声明或实现 `ParticleForceList`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：List of particle forces

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ParticleForceList` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`ParticleForce.H`](../../../11-lagrangian/files/90/particleforce.h--90c76165f41d.md)
- [`forceSuSp.H`](../../../11-lagrangian/files/90/forcesusp.h--90f6ed02b8b2.md)
- [`ParticleForceListI.H`](../../../11-lagrangian/files/bc/particleforcelisti.h--bc341f4e4f8f.md)
- [`ParticleForceList.C`](../../../11-lagrangian/files/08/particleforcelist.c--08943d5d42be.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.H](../../../11-lagrangian/files/ff/momentumcloud.h--ffe06b1f4abd.md)
- [src/lagrangian/parcel/submodels/ForceTypes/ParticleForceList/ParticleForceList.C](../../../11-lagrangian/files/08/particleforcelist.c--08943d5d42be.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
