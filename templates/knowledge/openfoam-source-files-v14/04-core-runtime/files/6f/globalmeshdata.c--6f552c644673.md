---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6f552c644673"
title: "OpenFOAM 14 源码解析：globalMeshData.C"
summary: "该文件实现 `initProcAddr`、`calcSharedPoints`、`countSharedEdges`、`calcSharedEdges` 等过程，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/globalMeshData/globalMeshData.C"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：globalMeshData.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/globalMeshData/globalMeshData.C`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：2716 行
- 文件标识：`6f552c644673`

## 2. 功能说明

该文件实现 `initProcAddr`、`calcSharedPoints`、`countSharedEdges`、`calcSharedEdges` 等过程，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::globalMeshData::initProcAddr` | 53 |
| `Foam::globalMeshData::calcSharedPoints` | 119 |
| `Foam::globalMeshData::countSharedEdges` | 239 |
| `Foam::globalMeshData::calcSharedEdges` | 281 |
| `Foam::globalMeshData::calcGlobalPointSlaves` | 522 |
| `Foam::globalMeshData::calcPointConnectivity` | 559 |
| `Foam::globalMeshData::calcGlobalPointEdges` | 663 |
| `Foam::globalMeshData::findTransform` | 825 |
| `Foam::globalMeshData::calcGlobalEdgeSlaves` | 883 |
| `Foam::globalMeshData::calcGlobalEdgeOrientation` | 1103 |
| `Foam::globalMeshData::calcPointBoundaryFaces` | 1153 |
| `Foam::globalMeshData::calcGlobalPointBoundaryFaces` | 1232 |
| `Foam::globalMeshData::calcGlobalPointBoundaryCells` | 1425 |
| `Foam::globalMeshData::calcGlobalCoPointSlaves` | 1653 |
| `Foam::globalMeshData::clearOut` | 1721 |
| `Foam::globalMeshData::sharedPointGlobalLabels` | 1774 |
| `Foam::globalMeshData::sharedPoints` | 1823 |
| `Foam::globalMeshData::nGlobalPoints` | 1912 |
| `Foam::globalMeshData::sharedPointLabels` | 1922 |
| `Foam::globalMeshData::sharedPointAddr` | 1932 |
| `Foam::globalMeshData::nGlobalEdges` | 1942 |
| `Foam::globalMeshData::sharedEdgeLabels` | 1952 |
| `Foam::globalMeshData::sharedEdgeAddr` | 1962 |
| `Foam::globalMeshData::coupledPatch` | 1972 |
| `Foam::globalMeshData::coupledPatchMeshEdges` | 2033 |
| `Foam::globalMeshData::coupledPatchMeshEdgeMap` | 2053 |
| `Foam::globalMeshData::globalPointNumbering` | 2072 |
| `Foam::globalMeshData::globalTransforms` | 2085 |
| `Foam::globalMeshData::globalPointSlaves` | 2096 |
| `Foam::globalMeshData::globalPointTransformedSlaves` | 2106 |
| `Foam::globalMeshData::globalPointSlavesMap` | 2117 |
| `Foam::globalMeshData::globalEdgeNumbering` | 2127 |
| `Foam::globalMeshData::globalEdgeSlaves` | 2140 |
| `Foam::globalMeshData::globalEdgeTransformedSlaves` | 2150 |
| `Foam::globalMeshData::globalEdgeOrientation` | 2161 |
| `Foam::globalMeshData::globalEdgeSlavesMap` | 2171 |
| `Foam::globalMeshData::globalBoundaryFaceNumbering` | 2181 |
| `Foam::globalMeshData::globalPointBoundaryFaces` | 2192 |
| `Foam::globalMeshData::globalPointTransformedBoundaryFaces` | 2203 |
| `Foam::globalMeshData::globalPointBoundaryFacesMap` | 2214 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`globalMeshData.H`](../../../04-core-runtime/files/c7/globalmeshdata.h--c7a6bf9a1fa2.md)
- [`Pstream.H`](../../../04-core-runtime/files/2f/pstream.h--2f930fcee072.md)
- [`PstreamCombineReduceOps.H`](../../../04-core-runtime/files/ef/pstreamcombinereduceops.h--ef40559c9d24.md)
- [`processorPolyPatch.H`](../../../04-core-runtime/files/42/processorpolypatch.h--42c8af29a130.md)
- [`globalPoints.H`](../../../04-core-runtime/files/1a/globalpoints.h--1ad6086a47a3.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`distributionMap.H`](../../../04-core-runtime/files/2c/distributionmap.h--2c72c12e6e17.md)
- [`labelIOList.H`](../../../04-core-runtime/files/ee/labeliolist.h--ee3c796c3931.md)
- [`globalIndexAndTransform.H`](../../../04-core-runtime/files/9d/globalindexandtransform.h--9dd772e72984.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
