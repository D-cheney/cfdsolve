---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-16f6ce872e60"
title: "OpenFOAM 14 源码解析：cloudGravitationalPotentialEnergy.H"
summary: "该文件声明或实现 `cloudGravitationalPotentialEnergy`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloudFunctionObjects/cloudGravitationalPotentialEnergy/cloudGravitationalPotentialEnergy.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：cloudGravitationalPotentialEnergy.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloudFunctionObjects/cloudGravitationalPotentialEnergy/cloudGravitationalPotentialEnergy.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：154 行
- 文件标识：`16f6ce872e60`

## 2. 功能说明

该文件声明或实现 `cloudGravitationalPotentialEnergy`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Function to compute and write the gravitational potential energy field for a cloud Usage \table Property | Description | Required? | Default cloud | Name of the cloud | yes | \endtable Example specification: \verbatim cloudGravitationalPotentialEnergy1 { type cloudGravitationalPotentialEnergy; libs ("libLagrangianCloudFunctionObjects.so"); cloud cloud; writeControl writeTime; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `cloudGravitationalPotentialEnergy` | 74 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`cloudLagrangianMeshFunctionObject.H`](../../../11-lagrangian/files/d9/cloudlagrangianmeshfunctionobject.h--d94eed5f6a70.md)

## 8. 直接上层引用

- [src/Lagrangian/cloudFunctionObjects/cloudGravitationalPotentialEnergy/cloudGravitationalPotentialEnergy.C](../../../11-lagrangian/files/e2/cloudgravitationalpotentialenergy.c--e2575db3656c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
