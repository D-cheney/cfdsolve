---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-98a712df779b"
title: "OpenFOAM 14 源码解析：turbGen.H"
summary: "该文件声明或实现 `Kmesh`、`turbGen`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/randomProcesses/turbulence/turbGen.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：turbGen.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/randomProcesses/turbulence/turbGen.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：93 行
- 文件标识：`98a712df779b`

## 2. 功能说明

该文件声明或实现 `Kmesh`、`turbGen`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Generate a turbulent velocity field conforming to a given energy spectrum and being divergence free.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Kmesh` | 53 |
| `turbGen` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`randomGenerator.H`](../../../04-core-runtime/files/9b/randomgenerator.h--9b6aa7dc2c72.md)
- [`primitiveFields.H`](../../../04-core-runtime/files/02/primitivefields.h--022c36742947.md)

## 8. 直接上层引用

- [applications/utilities/preProcessing/boxTurb/boxTurb.C](../../../03-utilities/files/10/boxturb.c--10d7804ebd98.md)
- [src/randomProcesses/turbulence/turbGen.C](../../../17-other-libraries/files/4c/turbgen.c--4c6e6834d149.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
