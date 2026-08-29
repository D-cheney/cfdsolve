---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a1ffd695e662"
title: "OpenFOAM 14 源码解析：createPolyBoundary.C"
summary: "该文件实现 `createPolyBoundary` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/conversion/meshReader/createPolyBoundary.C"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：createPolyBoundary.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/conversion/meshReader/createPolyBoundary.C`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：471 行
- 文件标识：`a1ffd695e662`

## 2. 功能说明

该文件实现 `createPolyBoundary` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：boundary faces - use pointCells when searching for connectivity - initialise the cell connectivity with '-1' - find both cell faces corresponding to the baffles and mark them to prevent a connection - standard connectivity checks - added baffle and monitoring support

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::meshReader::addPolyBoundaryFace` | 49 |
| `Foam::meshReader::createPolyBoundary` | 104 |
| `Foam::meshReader::polyBoundaryPatches` | 377 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`meshReader.H`](../../../17-other-libraries/files/2e/meshreader.h--2e106be10395.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`polyPatch.H`](../../../04-core-runtime/files/51/polypatch.h--5133084941b0.md)
- [`emptyPolyPatch.H`](../../../04-core-runtime/files/85/emptypolypatch.h--854da5b2d880.md)
- [`preservePatchTypes.H`](../../../04-core-runtime/files/56/preservepatchtypes.h--566cf5445940.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
