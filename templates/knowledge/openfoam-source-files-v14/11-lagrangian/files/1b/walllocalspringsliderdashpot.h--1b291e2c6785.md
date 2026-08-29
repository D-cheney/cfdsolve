---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1b291e2c6785"
title: "OpenFOAM 14 源码解析：WallLocalSpringSliderDashpot.H"
summary: "该文件声明或实现 `WallLocalSpringSliderDashpot`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Momentum/CollisionModel/PairCollision/WallModel/WallLocalSpringSliderDashpot/WallLocalSpringSliderDashpot.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：WallLocalSpringSliderDashpot.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Momentum/CollisionModel/PairCollision/WallModel/WallLocalSpringSliderDashpot/WallLocalSpringSliderDashpot.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：199 行
- 文件标识：`1b291e2c6785`

## 2. 功能说明

该文件声明或实现 `WallLocalSpringSliderDashpot`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Forces between particles and walls, interacting with a spring, slider, damper model

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `WallLocalSpringSliderDashpot` | 53 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`WallModel.H`](../../../11-lagrangian/files/a6/wallmodel.h--a6a4be1211bc.md)
- [`scalarList.H`](../../../04-core-runtime/files/b0/scalarlist.h--b0b5e67cb3ba.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`WallLocalSpringSliderDashpot.C`](../../../11-lagrangian/files/1e/walllocalspringsliderdashpot.c--1e62847181c6.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/include/makeParcelCollisionModels.H](../../../11-lagrangian/files/f4/makeparcelcollisionmodels.h--f4f0d5f1a91c.md)
- [src/lagrangian/parcel/submodels/Momentum/CollisionModel/PairCollision/WallModel/WallLocalSpringSliderDashpot/WallLocalSpringSliderDashpot.C](../../../11-lagrangian/files/1e/walllocalspringsliderdashpot.c--1e62847181c6.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
