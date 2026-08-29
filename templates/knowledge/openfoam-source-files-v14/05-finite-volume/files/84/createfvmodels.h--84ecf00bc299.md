---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-84ecf00bc299"
title: "OpenFOAM 14 源码解析：createFvModels.H"
summary: "该文件实现 `createFvModels` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/include/createFvModels.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：createFvModels.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/include/createFvModels.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：12 行
- 文件标识：`84ecf00bc299`

## 2. 功能说明

该文件实现 `createFvModels` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- 未检测到直接 `#include`；脚本/清单或自包含实现可能通过环境和命令产生依赖。

## 8. 直接上层引用

- [applications/legacy/basic/laplacianFoam/createFields.H](../../../17-other-libraries/files/7d/createfields.h--7d511807e0ed.md)
- [applications/legacy/combustion/PDRFoam/createFields.H](../../../17-other-libraries/files/90/createfields.h--902158bf9431.md)
- [applications/legacy/compressible/rhoPorousSimpleFoam/createFields.H](../../../17-other-libraries/files/8e/createfields.h--8ebb953ad730.md)
- [applications/legacy/incompressible/adjointShapeOptimisationFoam/createFields.H](../../../17-other-libraries/files/31/createfields.h--310fd4253e6e.md)
- [applications/legacy/incompressible/porousSimpleFoam/createFields.H](../../../17-other-libraries/files/c7/createfields.h--c7af550c5fd2.md)
- [applications/solvers/boundaryFoam/createFields.H](../../../01-solver-entry/files/8e/createfields.h--8e63e6b43f7d.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
