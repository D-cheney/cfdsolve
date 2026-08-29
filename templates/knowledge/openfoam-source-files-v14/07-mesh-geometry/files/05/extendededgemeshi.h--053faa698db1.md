---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-053faa698db1"
title: "OpenFOAM 14 源码解析：extendedEdgeMeshI.H"
summary: "该文件实现 `convexStart`、`concaveStart`、`mixedStart`、`nonFeatureStart` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMeshI.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：extendedEdgeMeshI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMeshI.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：299 行
- 文件标识：`053faa698db1`

## 2. 功能说明

该文件实现 `convexStart`、`concaveStart`、`mixedStart`、`nonFeatureStart` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::extendedEdgeMesh::convexStart` | 33 |
| `Foam::extendedEdgeMesh::concaveStart` | 38 |
| `Foam::extendedEdgeMesh::mixedStart` | 44 |
| `Foam::extendedEdgeMesh::nonFeatureStart` | 50 |
| `Foam::extendedEdgeMesh::externalStart` | 56 |
| `Foam::extendedEdgeMesh::internalStart` | 62 |
| `Foam::extendedEdgeMesh::flatStart` | 68 |
| `Foam::extendedEdgeMesh::openStart` | 74 |
| `Foam::extendedEdgeMesh::multipleStart` | 80 |
| `Foam::extendedEdgeMesh::featurePoint` | 86 |
| `Foam::extendedEdgeMesh::normals` | 92 |
| `Foam::extendedEdgeMesh::normalVolumeTypes` | 98 |
| `Foam::extendedEdgeMesh::edgeDirections` | 105 |
| `Foam::extendedEdgeMesh::normalDirections` | 112 |
| `Foam::extendedEdgeMesh::edgeDirection` | 119 |
| `Foam::extendedEdgeMesh::edgeNormals` | 148 |
| `Foam::extendedEdgeMesh::featurePointNormals` | 178 |
| `Foam::extendedEdgeMesh::featurePointEdges` | 213 |
| `Foam::extendedEdgeMesh::regionEdges` | 220 |
| `Foam::extendedEdgeMesh::getPointStatus` | 226 |
| `Foam::extendedEdgeMesh::getEdgeStatus` | 248 |
| `Foam::extendedEdgeMesh::edgeBaffles` | 274 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- 未检测到直接 `#include`；脚本/清单或自包含实现可能通过环境和命令产生依赖。

## 8. 直接上层引用

- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMesh.H](../../../07-mesh-geometry/files/df/extendededgemesh.h--dff6875133d3.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
