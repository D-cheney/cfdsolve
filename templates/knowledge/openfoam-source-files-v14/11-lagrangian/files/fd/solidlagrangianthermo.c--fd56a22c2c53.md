---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fd56a22c2c53"
title: "OpenFOAM 14 源码解析：SolidLagrangianThermo.C"
summary: "该文件为“拉格朗日与颗粒”提供 `SolidLagrangianThermo` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/LagrangianThermo/solidLagrangianThermo/SolidLagrangianThermo.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：SolidLagrangianThermo.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/LagrangianThermo/solidLagrangianThermo/SolidLagrangianThermo.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：87 行
- 文件标识：`fd56a22c2c53`

## 2. 功能说明

该文件为“拉格朗日与颗粒”提供 `SolidLagrangianThermo` 相关接口、模板实例或支撑定义。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`SolidLagrangianThermo.H`](../../../11-lagrangian/files/80/solidlagrangianthermo.h--80d7d9c3d18e.md)
- [`uniformGeometricFields.H`](../../../05-finite-volume/files/a5/uniformgeometricfields.h--a50858295889.md)

## 8. 直接上层引用

- [src/Lagrangian/LagrangianThermo/solidLagrangianThermo/SolidLagrangianThermo.H](../../../11-lagrangian/files/80/solidlagrangianthermo.h--80d7d9c3d18e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
