---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-842517adba6f"
title: "OpenFOAM 14 源码解析：STARCDMeshReader.H"
summary: "该文件声明或实现 `STARCD`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/conversion/meshReader/starcd/STARCDMeshReader.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：STARCDMeshReader.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/conversion/meshReader/starcd/STARCDMeshReader.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：190 行
- 文件标识：`842517adba6f`

## 2. 功能说明

该文件声明或实现 `STARCD`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Read pro-STAR vrt/cel/bnd files. The protected data in meshReader are filled. Starting with pro-STAR version 4, the files have become easier to read. - vertices are space-delimited. - the cell format is logical. - trimmed and degenerate cells are saved as polyhedral. - the boundaries corresponds to cells and their faces.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `STARCD` | 67 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`meshReader.H`](../../../17-other-libraries/files/2e/meshreader.h--2e106be10395.md)
- [`boundaryRegion.H`](../../../17-other-libraries/files/76/boundaryregion.h--76cae4e83f3a.md)
- [`cellShape.H`](../../../04-core-runtime/files/15/cellshape.h--157f231d8c3e.md)
- [`IFstream.H`](../../../04-core-runtime/files/eb/ifstream.h--eb1022c00d02.md)

## 8. 直接上层引用

- [applications/utilities/mesh/conversion/star4ToFoam/star4ToFoam.C](../../../03-utilities/files/da/star4tofoam.c--da925b2d289c.md)
- [src/conversion/meshReader/starcd/STARCDMeshReader.C](../../../17-other-libraries/files/46/starcdmeshreader.c--46e124e4f93d.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
