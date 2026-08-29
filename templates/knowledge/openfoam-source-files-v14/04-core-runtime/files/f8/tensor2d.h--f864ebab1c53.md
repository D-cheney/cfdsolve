---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f864ebab1c53"
title: "OpenFOAM 14 源码解析：Tensor2D.H"
summary: "该文件声明或实现 `SymmTensor2D`、`Tensor2D`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/Tensor2D/Tensor2D.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：Tensor2D.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/Tensor2D/Tensor2D.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：170 行
- 文件标识：`f864ebab1c53`

## 2. 功能说明

该文件声明或实现 `SymmTensor2D`、`Tensor2D`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Templated 2D tensor derived from VectorSpace adding construction from 4 components, element access using xx(), xy(), yx() and yy() member functions and the iner-product (dot-product) and outer-product of two Vector2Ds (tensor-product) operators.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `SymmTensor2D` | 54 |
| `Tensor2D` | 61 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Vector2D.H`](../../../04-core-runtime/files/98/vector2d.h--98f7e89a68b3.md)
- [`SphericalTensor2D.H`](../../../04-core-runtime/files/73/sphericaltensor2d.h--7319c7c4e9c2.md)
- [`Tensor2DI.H`](../../../04-core-runtime/files/0e/tensor2di.h--0edf0dd4d96b.md)

## 8. 直接上层引用

- [src/OpenFOAM/primitives/Barycentric2D/BarycentricTensor2D.H](../../../04-core-runtime/files/f5/barycentrictensor2d.h--f5ae5550af0c.md)
- [src/OpenFOAM/primitives/SymmTensor2D/SymmTensor2DI.H](../../../04-core-runtime/files/89/symmtensor2di.h--89cac78cb0a4.md)
- [src/OpenFOAM/primitives/Tensor2D/tensor2D/tensor2D.H](../../../04-core-runtime/files/ea/tensor2d.h--eab8d9c6deb1.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
