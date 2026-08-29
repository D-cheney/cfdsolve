---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8ca833f641fa"
title: "OpenFOAM 14 源码解析：parMetis.H"
summary: "该文件声明或实现 `parMetis`，属于“并行与域分解”模块。"
category: { slug: openfoam-v14-13-parallel, name: OpenFOAM 源码 · 并行与域分解 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/parallel/decompose/parMetis/parMetis.H"
tags: [OpenFOAM14, 源码解析, 并行与域分解]
---

# OpenFOAM 14 源码解析：parMetis.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/parallel/decompose/parMetis/parMetis.H`
- 功能分类：并行与域分解
- 文件类型：C/C++ 或词法/语法源文件
- 规模：219 行
- 文件标识：`8ca833f641fa`

## 2. 功能说明

该文件声明或实现 `parMetis`，属于“并行与域分解”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：ParMetis redistribution in parallel Note: parMetis methods do not support serial operation. Parameters - Method of decomposition - kWay: multilevel k-way - geomKway: combined coordinate-based and multi-level k-way - adaptiveRepart: balances the work load of a graph - Options - options[0]: The specified options are used if options[0] = 1 - options[1]: Speciﬁes the level of information to be returned during the execution of the algorithm. Timing information can be obtained by setting this to 1. Additional options for this parameter can be obtained by looking at parmetis.h. Default: 0. - options[2]: Random number seed for the routine - options[3]: Speciﬁes whether the sub-domains and processors are coupled or un-coupled. If the number of sub-domains desired (i.e., nparts) and the number of processors that are being used is not the same, then these must be un-coupled. However, if nparts equa

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `parMetis` | 96 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`decompositionMethod.H`](../../../13-parallel/files/27/decompositionmethod.h--273aef43a3a9.md)
- `parmetis.h`

## 8. 直接上层引用

- [src/parallel/decompose/parMetis/parMetis.C](../../../13-parallel/files/30/parmetis.c--30ae126eab2f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
