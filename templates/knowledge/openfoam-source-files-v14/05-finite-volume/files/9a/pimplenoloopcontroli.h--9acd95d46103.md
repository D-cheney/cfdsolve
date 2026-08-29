---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9acd95d46103"
title: "OpenFOAM 14 源码解析：pimpleNoLoopControlI.H"
summary: "该文件实现 `moveMeshOuterCorrectors`、`simpleRho`、`predictTransport`、`correctTransport` 等过程，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleNoLoopControl/pimpleNoLoopControlI.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pimpleNoLoopControlI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleNoLoopControl/pimpleNoLoopControlI.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：78 行
- 文件标识：`9acd95d46103`

## 2. 功能说明

该文件实现 `moveMeshOuterCorrectors`、`simpleRho`、`predictTransport`、`correctTransport` 等过程，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::pimpleNoLoopControl::moveMeshOuterCorrectors` | 35 |
| `Foam::pimpleNoLoopControl::simpleRho` | 40 |
| `Foam::pimpleNoLoopControl::predictTransport` | 46 |
| `Foam::pimpleNoLoopControl::correctTransport` | 52 |
| `Foam::pimpleNoLoopControl::nCorr` | 58 |
| `Foam::pimpleNoLoopControl::firstIter` | 64 |
| `Foam::pimpleNoLoopControl::finalIter` | 70 |

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`pimpleLoop.H`](../../../05-finite-volume/files/67/pimpleloop.h--67b83fc7a8a9.md)

## 8. 直接上层引用

- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleNoLoopControl/pimpleNoLoopControl.H](../../../05-finite-volume/files/21/pimplenoloopcontrol.h--211d4bd02bbb.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
