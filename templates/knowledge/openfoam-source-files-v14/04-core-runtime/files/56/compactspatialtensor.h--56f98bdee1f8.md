---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-56f98bdee1f8"
title: "OpenFOAM 14 源码解析：CompactSpatialTensor.H"
summary: "该文件声明或实现 `CompactSpatialTensor`、`typeOfInnerProduct`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/spatialVectorAlgebra/CompactSpatialTensor/CompactSpatialTensor.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：CompactSpatialTensor.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/spatialVectorAlgebra/CompactSpatialTensor/CompactSpatialTensor.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：146 行
- 文件标识：`56f98bdee1f8`

## 2. 功能说明

该文件声明或实现 `CompactSpatialTensor`、`typeOfInnerProduct`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Templated 3D compact spatial tensor derived from MatrixSpace used to represent transformations of spatial vectors and the angular and linear inertia of rigid bodies. Reference: \verbatim Featherstone, R. (2008). Rigid body dynamics algorithms. Springer. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `CompactSpatialTensor` | 67 |
| `typeOfInnerProduct` | 103 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`SpatialTensor.H`](../../../04-core-runtime/files/64/spatialtensor.h--64b6907d9153.md)
- [`CompactSpatialTensorT.H`](../../../04-core-runtime/files/96/compactspatialtensort.h--96633cf22893.md)
- [`CompactSpatialTensorI.H`](../../../04-core-runtime/files/01/compactspatialtensori.h--01861241d67d.md)

## 8. 直接上层引用

- [src/OpenFOAM/primitives/spatialVectorAlgebra/CompactSpatialTensor/compactSpatialTensor/compactSpatialTensor.H](../../../04-core-runtime/files/98/compactspatialtensor.h--98549218f8ef.md)
- [src/OpenFOAM/primitives/spatialVectorAlgebra/CompactSpatialTensorT/CompactSpatialTensorT.H](../../../04-core-runtime/files/96/compactspatialtensort.h--96633cf22893.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
