---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e2a66c8a46dc"
title: "OpenFOAM 14 源码解析：patchMeanVelocityForce.H"
summary: "该文件声明或实现 `patchMeanVelocityForce`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvConstraints/meanVelocityForce/patchMeanVelocityForce/patchMeanVelocityForce.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：patchMeanVelocityForce.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvConstraints/meanVelocityForce/patchMeanVelocityForce/patchMeanVelocityForce.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：135 行
- 文件标识：`e2a66c8a46dc`

## 2. 功能说明

该文件声明或实现 `patchMeanVelocityForce`，属于“边界、源项与约束”模块。

中文导航角色：有限体积方程/场约束。

上游说明：Calculates and applies the force necessary to maintain the specified mean velocity averaged over the specified patch. Usage Example usage: \verbatim patchMeanVelocityForce1 { type patchMeanVelocityForce; cellZone all; U U; // Name of velocity field patch inlet; // Name of the patch Ubar (10.0 0 0); // Desired mean velocity relaxation 0.2; // Optional relaxation factor } \endverbatim Note: Currently only handles kinematic pressure (incompressible solvers).

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `patchMeanVelocityForce` | 78 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`meanVelocityForce.H`](../../../12-boundaries-sources/files/00/meanvelocityforce.h--006ca34c005c.md)

## 8. 直接上层引用

- [src/fvConstraints/meanVelocityForce/patchMeanVelocityForce/patchMeanVelocityForce.C](../../../12-boundaries-sources/files/de/patchmeanvelocityforce.c--deb8b3fcd1c6.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

确认约束施加在矩阵还是解场，以及调用时机。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
