---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f82b8bb6847d"
title: "OpenFOAM 14 源码解析：radialActuationDisk.H"
summary: "该文件声明或实现 `radialActuationDisk`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/radialActuationDisk/radialActuationDisk.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：radialActuationDisk.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/radialActuationDisk/radialActuationDisk.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：199 行
- 文件标识：`f82b8bb6847d`

## 2. 功能说明

该文件声明或实现 `radialActuationDisk`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Actuation disk source including radial thrust Constant values for momentum source for actuation disk \f[ T = 2 \rho A U_{o}^2 a (1-a) \f] and \f[ U_1 = (1 - a)U_{o} \f] where: \vartable A | disk area U_o | upstream velocity a | 1 - Cp/Ct U_1 | velocity at the disk \endvartable The thrust is distributed by a radial function: \f[ thrust(r) = T (C_0 + C_1 r^2 + C_2 r^4) \f] Usage Example usage: \verbatim radialActuationDisk1 { type radialActuationDisk; cellZone radialActuationDisk1; U U; // Name of the velocity field diskDir (-1 0 0); // Disk direction Cp 0.1; // Power coefficient Ct 0.5; // Thrust coefficient diskArea 5.0; // Disk area coeffs (0.1 0.5 0.01); // Radial distribution coefficients upstreamPoint (0 0 0); // Upstream point } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `radialActuationDisk` | 105 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`actuationDisk.H`](../../../12-boundaries-sources/files/1b/actuationdisk.h--1bac629f4122.md)
- [`FixedList.H`](../../../04-core-runtime/files/56/fixedlist.h--5633be515ee5.md)

## 8. 直接上层引用

- [src/fvModels/general/radialActuationDisk/radialActuationDisk.C](../../../12-boundaries-sources/files/7e/radialactuationdisk.c--7eb920915913.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
