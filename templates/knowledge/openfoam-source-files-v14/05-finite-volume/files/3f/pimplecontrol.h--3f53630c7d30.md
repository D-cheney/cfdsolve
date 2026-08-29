---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3f53630c7d30"
title: "OpenFOAM 14 源码解析：pimpleControl.H"
summary: "该文件声明或实现 `pimpleControl`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleControl/pimpleControl.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pimpleControl.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleControl/pimpleControl.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：105 行
- 文件标识：`3f53630c7d30`

## 2. 功能说明

该文件声明或实现 `pimpleControl`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：SourceFiles pimpleControl.C

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pimpleControl` | 53 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `firstPimpleIter` | 84 |
| `finalPimpleIter` | 90 |

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`pimpleSingleRegionControl.H`](../../../05-finite-volume/files/41/pimplesingleregioncontrol.h--41b257cda08f.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)
- [applications/legacy/incompressible/shallowWaterFoam/shallowWaterFoam.C](../../../17-other-libraries/files/f6/shallowwaterfoam.c--f6afc7eba01a.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleControl/pimpleControl.C](../../../05-finite-volume/files/50/pimplecontrol.c--503f41e9cf12.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleMultiRegionControl/pimpleMultiRegionControl.C](../../../05-finite-volume/files/67/pimplemultiregioncontrol.c--679df6e7b5c6.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
