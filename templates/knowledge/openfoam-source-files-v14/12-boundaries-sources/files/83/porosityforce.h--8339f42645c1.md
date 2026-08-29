---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8339f42645c1"
title: "OpenFOAM 14 源码解析：porosityForce.H"
summary: "该文件声明或实现 `porosityModel`、`porosityForce`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/porosityForce/porosityForce.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：porosityForce.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/porosityForce/porosityForce.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：217 行
- 文件标识：`8339f42645c1`

## 2. 功能说明

该文件声明或实现 `porosityModel`、`porosityForce`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：This model applies the force exerted on the fluid by a porous media Usage Example usage, here employing the Darcy-Forchheimer model: \verbatim porosityForce { type DarcyForchheimer; DarcyForchheimer { d d [0 -2 0 0 0 0 0] (5e7 -1000 -1000); f f [0 -1 0 0 0 0 0] (0 0 0); coordinateSystem { type cartesian; origin (0 0 0); coordinateRotation { type axesRotation; e1 (0.70710678 0.70710678 0); e2 (0 0 1); } } } } \endverbatim Note: The porous region must be selected as a cellZone.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `porosityModel` | 80 |
| `porosityForce` | 89 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)

## 8. 直接上层引用

- [src/atmosphericModels/kEpsilonLopesdaCosta/kEpsilonLopesdaCosta.C](../../../17-other-libraries/files/3c/kepsilonlopesdacosta.c--3c2ee108f248.md)
- [src/fvModels/general/porosityForce/porosityForce.C](../../../12-boundaries-sources/files/f6/porosityforce.c--f623c748843f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
