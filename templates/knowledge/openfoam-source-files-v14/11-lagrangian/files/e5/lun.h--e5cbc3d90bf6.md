---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e5cbc3d90bf6"
title: "OpenFOAM 14 源码解析：Lun.H"
summary: "该文件声明或实现 `Lun`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/Lun/Lun.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：Lun.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/Lun/Lun.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：146 行
- 文件标识：`e5cbc3d90bf6`

## 2. 功能说明

该文件声明或实现 `Lun`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Inter-particle stress model of Lun et al The stress value takes the following form: \f[ \left( \alpha \rho + \alpha^2 \rho (1 + e) \frac{3}{5} \left( 1 - \left( \frac{\alpha}{\alpha_{pack}} \right)^\frac{1}{3} \right) \right) \frac{1}{3} \sigma^2 \f] Here, \&#36;\alpha\&#36; is the volume fraction of the dispersed phase, \&#36;\rho\&#36; is the density of the dispersed phase, \&#36;e\&#36; is a coefficient of restitution, and \&#36;\sigma\&#36; is the RMS velocity fluctuation. Reference: \verbatim "Kinetic theories for granular flow: inelastic particles in Couette flow and slightly inelastic particles in a general flowfield" C Lun, S Savage, G Jeffrey, N Chepurniy Journal of Fluid Mechanics Volume 140, Pages 223-256, 1984 \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Lun` | 75 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`ParticleStressModel.H`](../../../11-lagrangian/files/57/particlestressmodel.h--57a62fcc4245.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/Lun/Lun.C](../../../11-lagrangian/files/b2/lun.c--b2d4baddb328.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
