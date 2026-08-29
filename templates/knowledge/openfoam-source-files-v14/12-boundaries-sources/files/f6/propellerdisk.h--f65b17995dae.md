---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f65b17995dae"
title: "OpenFOAM 14 源码解析：propellerDisk.H"
summary: "该文件声明或实现 `propellerDiskAdjustment`、`propellerDisk`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/propellerDisk/propellerDisk.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：propellerDisk.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/propellerDisk/propellerDisk.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：338 行
- 文件标识：`f65b17995dae`

## 2. 功能说明

该文件声明或实现 `propellerDiskAdjustment`、`propellerDisk`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Disk momentum source which approximates a propeller based on a given propeller curve. Reference: \verbatim Hough, G. R., & Ordway, D. E. (1964). The generalized actuator disk. Developments in theoretical and applied mechanics, 2, 317-336. \endverbatim Usage Example usage: \verbatim diskSource { type propellerDisk; libs ("libpropellerDisk.so"); cellZone propeller; normal (1 0 0); // Normal direction of the propeller n 26.03; // Rotation speed [1/s] dPropeller 0.203; // Propeller diameter dHub 0.039179; // Hub diameter propellerCurve { type table; // J Kt Kq values ( (0.10 (0.3267 0.03748)) (0.15 (0.3112 0.03629)) (0.20 (0.2949 0.03500)) (0.25 (0.2777 0.03361)) (0.30 (0.2598 0.03210)) (0.35 (0.2410 0.03047)) (0.40 (0.2214 0.02871)) (0.45 (0.2010 0.02682)) (0.50 (0.1798 0.02479)) (0.55 (0.1577 0.02261)) (0.60 (0.1349 0.02027)) (0.65 (0.1112 0.01777)) (0.70 (0.0867 0.01509)) (0.75 (0.0614 0.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `propellerDiskAdjustment` | 112 |
| `propellerDisk` | 118 |

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
- [`logFile.H`](../../../04-core-runtime/files/a8/logfile.h--a82e01bd2d71.md)
- [`fvCellZone.H`](../../../05-finite-volume/files/be/fvcellzone.h--bee09cd009b8.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`vector2D.H`](../../../04-core-runtime/files/bd/vector2d.h--bdec043e6f47.md)
- [`forces.H`](../../../14-postprocessing/files/c0/forces.h--c0cecfe47639.md)
- [`uniformDimensionedFields.H`](../../../05-finite-volume/files/4e/uniformdimensionedfields.h--4e5431e912f3.md)
- [`propellerDiskTemplates.C`](../../../12-boundaries-sources/files/56/propellerdisktemplates.c--567c53c5fe23.md)

## 8. 直接上层引用

- [src/fvModels/propellerDisk/propellerDisk.C](../../../12-boundaries-sources/files/56/propellerdisk.c--565d3cefeb30.md)
- [src/fvModels/propellerDisk/propellerDiskAdjustment/propellerDiskAdjustment.H](../../../12-boundaries-sources/files/1d/propellerdiskadjustment.h--1d240616969d.md)
- [src/fvModels/propellerDisk/propellerDiskTemplates.C](../../../12-boundaries-sources/files/56/propellerdisktemplates.c--567c53c5fe23.md)
- [src/fvModels/rigidBodyPropellerDisk/rigidBodyPropellerDisk.H](../../../12-boundaries-sources/files/64/rigidbodypropellerdisk.h--641bb4589ff2.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
