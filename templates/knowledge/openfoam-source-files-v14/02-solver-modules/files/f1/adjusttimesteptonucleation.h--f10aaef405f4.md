---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f10aaef405f4"
title: "OpenFOAM 14 源码解析：adjustTimeStepToNucleation.H"
summary: "该文件声明或实现 `adjustTimeStepToNucleation`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/functionObjects/adjustTimeStepToNucleation/adjustTimeStepToNucleation.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：adjustTimeStepToNucleation.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/functionObjects/adjustTimeStepToNucleation/adjustTimeStepToNucleation.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：154 行
- 文件标识：`f10aaef405f4`

## 2. 功能说明

该文件声明或实现 `adjustTimeStepToNucleation`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Controls the time-step to the minimum nucleation time scale. A specific nucleation model can be specified, otherwise it will scan for and use all the nucleation fvModels in operation. Note that this function only does anything if time step adjustment is enabled in the controlDict. Example of function object specification: \verbatim adjustTimeStepToNucleation { type adjustTimeStepToNucleation; libs ("libmultiphaseEulerFunctionObjects.so"); maxCo 0.1; } \endverbatim Usage \table Property | Description | Required | Default value type | type name: adjustTimeStepToNucleation | yes | model | name of the nucleation fvModel | no | maxCo | maximum nucleation "Courant" number | no | 1 \endtable

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `adjustTimeStepToNucleation` | 79 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/functionObjects/adjustTimeStepToNucleation/adjustTimeStepToNucleation.C](../../../02-solver-modules/files/7e/adjusttimesteptonucleation.c--7e4daa0f34f7.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
