---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1abc86eeb9b6"
title: "OpenFOAM 14 源码解析：symplectic.H"
summary: "该文件实现 `symplectic` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/symplectic/symplectic.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：symplectic.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyDynamics/rigidBodySolvers/symplectic/symplectic.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：129 行
- 文件标识：`1abc86eeb9b6`

## 2. 功能说明

该文件实现 `symplectic` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Symplectic 2nd-order explicit time-integrator for rigid-body motion. Reference: \verbatim Dullweber, A., Leimkuhler, B., & McLachlan, R. (1997). Symplectic splitting methods for rigid body molecular dynamics. The Journal of chemical physics, 107(15), 5840-5851. \endverbatim Can only be used for explicit integration of the motion of the body, i.e. may only be called once per time-step, no outer-correctors may be applied. For implicit integration with outer-correctors choose either CrankNicolson or Newmark schemes. Example specification in dynamicMeshDict: \verbatim solver { type symplectic; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `symplectic` | 82 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`rigidBodySolver.H`](../../../17-other-libraries/files/2d/rigidbodysolver.h--2da5fe927842.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
