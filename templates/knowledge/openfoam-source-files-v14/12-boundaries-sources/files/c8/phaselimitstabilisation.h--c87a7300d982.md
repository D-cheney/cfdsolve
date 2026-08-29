---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c87a7300d982"
title: "OpenFOAM 14 源码解析：phaseLimitStabilisation.H"
summary: "该文件声明或实现 `phaseLimitStabilisation`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/phaseLimitStabilisation/phaseLimitStabilisation.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：phaseLimitStabilisation.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/phaseLimitStabilisation/phaseLimitStabilisation.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：210 行
- 文件标识：`c87a7300d982`

## 2. 功能说明

该文件声明或实现 `phaseLimitStabilisation`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Stabilisation source for phase transport equations Applies an implicit source to the phase transport equation for the specified \c field when the phase volume fraction is below \c residualAlpha. The stabilisation rate is provided by the registered \c rate which can either be a uniformDimensionedScalarField, a volScalarField or a volScalarField::Internal. The \c field is currently stabilised towards zero in the limit of the phase volume fraction approaching zero but this could be extended to support a specified value or a value or field looked-up from the database. Usage Example usage: \verbatim stabilisation { type phaseLimitStabilisation; field sigma.liquid; rate rLambda.liquid; residualAlpha 1e-3; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `phaseLimitStabilisation` | 80 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)

## 8. 直接上层引用

- [src/fvModels/general/phaseLimitStabilisation/phaseLimitStabilisation.C](../../../12-boundaries-sources/files/64/phaselimitstabilisation.c--64ef0619645b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
