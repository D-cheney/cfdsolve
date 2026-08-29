---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-376e4bbfd0e8"
title: "OpenFOAM 14 源码解析：ParticleCollector.H"
summary: "该文件声明或实现 `ParticleCollector`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/CloudFunctionObjects/ParticleCollector/ParticleCollector.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ParticleCollector.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/CloudFunctionObjects/ParticleCollector/ParticleCollector.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：316 行
- 文件标识：`376e4bbfd0e8`

## 2. 功能说明

该文件声明或实现 `ParticleCollector`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Function object to collect the parcel mass- and mass flow rate over a set of polygons. The polygons can either be specified by sets of user- supplied points, or in a concentric circles arrangement. If a parcel is 'collected', it can be flagged to be removed from the domain using the removeCollected entry. Example usage: \verbatim particleCollector1 { type particleCollector; mode concentricCircle; origin (0.05 0.025 0.005); radius (0.01 0.025 0.05); nSector 10; refDir (1 0 0); normal (0 0 1); negateParcelsOppositeNormal no; removeCollected no; surfaceFormat vtk; resetOnWrite no; log yes; } particleCollector2 { type particleCollector; mode polygon; polygons ( ( (0 0 0) (1 0 0) (1 1 0) (0 1 0) ) ( (0 0 1) (1 0 1) (1 1 1) (0 1 1) ) ); normal (0 0 1); negateParcelsOppositeNormal no; removeCollected no; surfaceFormat vtk; resetOnWrite no; log yes; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ParticleCollector` | 112 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`CloudFunctionObject.H`](../../../11-lagrangian/files/34/cloudfunctionobject.h--347e27416773.md)
- [`cylindricalCS.H`](../../../07-mesh-geometry/files/d5/cylindricalcs.h--d5c5989683f8.md)
- [`face.H`](../../../04-core-runtime/files/bc/face.h--bc0ffa4a6982.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`ParticleCollectorI.H`](../../../11-lagrangian/files/c9/particlecollectori.h--c967d65f495c.md)
- [`ParticleCollector.C`](../../../11-lagrangian/files/63/particlecollector.c--63a101630de5.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/include/makeParcelCloudFunctionObjects.H](../../../11-lagrangian/files/96/makeparcelcloudfunctionobjects.h--96935de19542.md)
- [src/lagrangian/parcel/submodels/CloudFunctionObjects/ParticleCollector/ParticleCollector.C](../../../11-lagrangian/files/63/particlecollector.c--63a101630de5.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
