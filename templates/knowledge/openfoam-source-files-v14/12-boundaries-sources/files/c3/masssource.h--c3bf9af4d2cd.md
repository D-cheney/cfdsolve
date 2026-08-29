---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c3bf9af4d2cd"
title: "OpenFOAM 14 源码解析：massSource.H"
summary: "该文件声明或实现 `massSource`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/massSource/massSource.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：massSource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/massSource/massSource.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：187 行
- 文件标识：`c3bf9af4d2cd`

## 2. 功能说明

该文件声明或实现 `massSource`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：This fvModel applies a mass source to the continuity equation and to all field equations. It can be applied to compressible solvers, such as fluid, isothermalFluid, compressibleVoF and multiphaseEuler. For incompressible solvers, use the volumeSource model instead. This model requires a corresponding field source to be specified for all solved-for fields. Usage Example usage for a constant mass flow rate applied to a cell set: \verbatim massSource { type massSource; cellZone massSource; massFlowRate 1e-4; } \endverbatim Example usage for a pulsing flow rate applied at a point: \verbatim massSource { type massSource; cellZone { type containsPoints; points ((2.75 0.5 0)); } massFlowRate { type scale; scale squarePulse; start 0.2; duration 2; value 1e-4; } } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `massSource` | 103 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`massSourceBase.H`](../../../12-boundaries-sources/files/71/masssourcebase.h--714be527897d.md)
- [`fvCellZone.H`](../../../05-finite-volume/files/be/fvcellzone.h--bee09cd009b8.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/fvModels/general/massSource/massSource.C](../../../12-boundaries-sources/files/6b/masssource.c--6b27ee8b2054.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
