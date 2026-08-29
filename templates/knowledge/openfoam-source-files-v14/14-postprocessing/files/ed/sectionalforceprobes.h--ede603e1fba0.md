---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ede603e1fba0"
title: "OpenFOAM 14 源码解析：sectionalForceProbes.H"
summary: "该文件声明或实现 `sectionalForceProbes`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/forces/sectionalForceProbes/sectionalForceProbes.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：sectionalForceProbes.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/forces/sectionalForceProbes/sectionalForceProbes.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：185 行
- 文件标识：`ede603e1fba0`

## 2. 功能说明

该文件声明或实现 `sectionalForceProbes`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：This function calculates the fluid forces and moments at a number of section-planes through a given set of patches. It writes the result into a log file. The cut-planes are defined by a single normal and a number of points. Forces and moments are calculated on the side of the planes to which the normal points. If the "other" side also needs to be generated then the function can be executed with the normal reversed. Note that this function only generates the contribution from the fluid to the sectional forces and moments in the object. To compute the complete sectional force would require supporting and/or dynamic forces to be included also. Example of function object specification: \verbatim sectionalForceProbes1 { type sectionalForceProbes; libs ("libforces.so"); patches (hull); points ( (-0.8 0 0) ( 0 0 0) ( 0.8 0 0) ); normal (1 0 0); } \endverbatim Usage \table Property | Description

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `sectionalForceProbes` | 101 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`sectionalForcesBase.H`](../../../14-postprocessing/files/92/sectionalforcesbase.h--922ec4e86357.md)
- [`logFiles.H`](../../../04-core-runtime/files/da/logfiles.h--da24c47050f0.md)

## 8. 直接上层引用

- [src/functionObjects/forces/sectionalForceProbes/sectionalForceProbes.C](../../../14-postprocessing/files/53/sectionalforceprobes.c--539613e7a68b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
