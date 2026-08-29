---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e37ecc32003a"
title: "OpenFOAM 14 源码解析：twoDPointCorrector.C"
summary: "该文件实现 `calcAddressing`、`clearAddressing`、`snapToWedge`、`normalDir` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/twoDPointCorrector/twoDPointCorrector.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：twoDPointCorrector.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/twoDPointCorrector/twoDPointCorrector.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：395 行
- 文件标识：`e37ecc32003a`

## 2. 功能说明

该文件实现 `calcAddressing`、`clearAddressing`、`snapToWedge`、`normalDir` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::twoDPointCorrector::calcAddressing` | 50 |
| `Foam::twoDPointCorrector::clearAddressing` | 178 |
| `Foam::twoDPointCorrector::snapToWedge` | 185 |
| `Foam::twoDPointCorrector::normalDir` | 230 |
| `Foam::twoDPointCorrector::planeNormal` | 257 |
| `Foam::twoDPointCorrector::normalEdgeIndices` | 268 |
| `Foam::twoDPointCorrector::correctPoints` | 279 |
| `Foam::twoDPointCorrector::correctDisplacement` | 319 |
| `Foam::twoDPointCorrector::topoChange` | 369 |
| `Foam::twoDPointCorrector::mapMesh` | 375 |
| `Foam::twoDPointCorrector::distribute` | 381 |
| `Foam::twoDPointCorrector::movePoints` | 387 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **分布式映射**：依据全局到局部寻址重排和交换数据。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`twoDPointCorrector.H`](../../../07-mesh-geometry/files/68/twodpointcorrector.h--68a460366756.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`wedgePolyPatch.H`](../../../04-core-runtime/files/c3/wedgepolypatch.h--c331343fe38f.md)
- [`emptyPolyPatch.H`](../../../04-core-runtime/files/85/emptypolypatch.h--854da5b2d880.md)
- [`SubField.H`](../../../04-core-runtime/files/82/subfield.h--82a0cf10f077.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
