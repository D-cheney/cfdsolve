---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7fa5845eb077"
title: "OpenFOAM 14 源码解析：COxidationMurphyShaddix.C"
summary: "该文件为“拉格朗日与颗粒”提供 `COxidationMurphyShaddix` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/ReactingMultiphase/SurfaceReactionModel/COxidationMurphyShaddix/COxidationMurphyShaddix.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：COxidationMurphyShaddix.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/ReactingMultiphase/SurfaceReactionModel/COxidationMurphyShaddix/COxidationMurphyShaddix.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：242 行
- 文件标识：`7fa5845eb077`

## 2. 功能说明

该文件为“拉格朗日与颗粒”提供 `COxidationMurphyShaddix` 相关接口、模板实例或支撑定义。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`COxidationMurphyShaddix.H`](../../../11-lagrangian/files/b1/coxidationmurphyshaddix.h--b10cc39b1a82.md)
- [`mathematicalConstants.H`](../../../04-core-runtime/files/80/mathematicalconstants.h--8059f1c384fb.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/submodels/ReactingMultiphase/SurfaceReactionModel/COxidationMurphyShaddix/COxidationMurphyShaddix.H](../../../11-lagrangian/files/b1/coxidationmurphyshaddix.h--b10cc39b1a82.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
