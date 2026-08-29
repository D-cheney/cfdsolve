---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1d240616969d"
title: "OpenFOAM 14 源码解析：propellerDiskAdjustment.H"
summary: "该文件声明或实现 `propellerDiskAdjustment`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/propellerDisk/propellerDiskAdjustment/propellerDiskAdjustment.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：propellerDiskAdjustment.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/propellerDisk/propellerDiskAdjustment/propellerDiskAdjustment.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：239 行
- 文件标识：`1d240616969d`

## 2. 功能说明

该文件声明或实现 `propellerDiskAdjustment`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Automatic adjustment option for the propellerDisk momentum source A proportional-integral (PI) controller is used to adjust the propeller rotation speed to achieve balance between the propeller thrust and the hull resistance. A user-specified relaxation time is used to control the rate at which the porpeller speed is adjusted. Reference: \verbatim Nuutinen, M. (2019). Automated self-propulsion point search algorithm for ship performance CFD simulations. Sixth International Symposium on Marine Propulsors, SMP’19 Rome, Italy. \endverbatim Usage Example usage: \verbatim diskSource { type propellerDisk; libs ("libpropellerDisk.so"); cellZone propeller; normal (1 0 0); // Normal direction of the propeller n 26.03; // Rotation speed [1/s] dPropeller 0.203; // Propeller diameter dHub 0.039179; // Hub diameter // Automatic adjustment controls adjustment yes; startTime 0; // Start time of rotatio

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `propellerDiskAdjustment` | 140 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `n` | 184 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`propellerDisk.H`](../../../12-boundaries-sources/files/f6/propellerdisk.h--f65b17995dae.md)

## 8. 直接上层引用

- [src/fvModels/propellerDisk/propellerDisk.C](../../../12-boundaries-sources/files/56/propellerdisk.c--565d3cefeb30.md)
- [src/fvModels/propellerDisk/propellerDiskAdjustment/propellerDiskAdjustment.C](../../../12-boundaries-sources/files/59/propellerdiskadjustment.c--59a796024691.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
