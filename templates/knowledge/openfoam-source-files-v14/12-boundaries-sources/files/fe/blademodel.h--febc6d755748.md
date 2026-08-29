---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-febc6d755748"
title: "OpenFOAM 14 源码解析：bladeModel.H"
summary: "该文件声明或实现 `bladeModel`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/rotorDisk/bladeModel/bladeModel.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：bladeModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/rotorDisk/bladeModel/bladeModel.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：172 行
- 文件标识：`febc6d755748`

## 2. 功能说明

该文件声明或实现 `bladeModel`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Blade model class calculates: Linear interpolated blade twist and chord based on radial position Interpolation factor (for interpolating profile performance) Input in list format: data ( (profile1 (radius1 twist1 chord1)) (profile2 (radius2 twist2 chord2)) ); where: radius [m] twist [deg], converted to [rad] internally chord [m]

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `bladeModel` | 70 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`List.H`](../../../04-core-runtime/files/af/list.h--af8268cb7768.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)

## 8. 直接上层引用

- [src/fvModels/rotorDisk/bladeModel/bladeModel.C](../../../12-boundaries-sources/files/4a/blademodel.c--4a2ca24f2f85.md)
- [src/fvModels/rotorDisk/rotorDisk.H](../../../12-boundaries-sources/files/38/rotordisk.h--38da686189e1.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
