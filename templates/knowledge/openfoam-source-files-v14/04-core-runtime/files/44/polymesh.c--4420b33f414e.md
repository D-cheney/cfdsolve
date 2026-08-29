---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4420b33f414e"
title: "OpenFOAM 14 源码解析：polyMesh.C"
summary: "该文件实现 `regionDir`、`calcDirections`、`readTetBasePtIs`、`polyMesh` 等过程，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyMesh.C"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：polyMesh.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyMesh.C`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1538 行
- 文件标识：`4420b33f414e`

## 2. 功能说明

该文件实现 `regionDir`、`calcDirections`、`readTetBasePtIs`、`polyMesh` 等过程，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::polyMesh::regionDir` | 56 |
| `Foam::polyMesh::calcDirections` | 68 |
| `Foam::polyMesh::readTetBasePtIs` | 154 |
| `Foam::polyMesh::polyMesh` | 369 |
| `Foam::polyMesh::resetPrimitives` | 713 |
| `Foam::polyMesh::swap` | 821 |
| `Foam::polyMesh::meshDirInstance` | 979 |
| `Foam::polyMesh::meshDir` | 1004 |
| `Foam::polyMesh::pointsInstance` | 1010 |
| `Foam::polyMesh::facesInstance` | 1016 |
| `Foam::polyMesh::pointsWriteOpt` | 1022 |
| `Foam::polyMesh::facesWriteOpt` | 1028 |
| `Foam::polyMesh::geometricD` | 1034 |
| `Foam::polyMesh::nGeometricD` | 1045 |
| `Foam::polyMesh::solutionD` | 1051 |
| `Foam::polyMesh::nSolutionD` | 1062 |
| `Foam::polyMesh::tetBasePtIs` | 1068 |
| `Foam::polyMesh::addPatches` | 1094 |
| `Foam::polyMesh::addZones` | 1132 |
| `Foam::polyMesh::reorderPatches` | 1190 |
| `Foam::polyMesh::addPatch` | 1223 |
| `Foam::polyMesh::addedPatches` | 1287 |
| `Foam::polyMesh::points` | 1299 |
| `Foam::polyMesh::faces` | 1312 |
| `Foam::polyMesh::faceOwner` | 1325 |
| `Foam::polyMesh::faceNeighbour` | 1331 |
| `Foam::polyMesh::oldPoints` | 1337 |
| `Foam::polyMesh::oldCellCentres` | 1355 |
| `Foam::polyMesh::setPoints` | 1375 |
| `Foam::polyMesh::movePoints` | 1410 |
| `Foam::polyMesh::resetMotion` | 1467 |
| `Foam::polyMesh::globalData` | 1475 |
| `Foam::polyMesh::comm` | 1494 |
| `Foam::polyMesh::removeFiles` | 1506 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`OSspecific.H`](../../../04-core-runtime/files/da/osspecific.h--da601f5103a9.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`cellIOList.H`](../../../04-core-runtime/files/b2/celliolist.h--b243b013e2f4.md)
- [`wedgePolyPatch.H`](../../../04-core-runtime/files/c3/wedgepolypatch.h--c331343fe38f.md)
- [`emptyPolyPatch.H`](../../../04-core-runtime/files/85/emptypolypatch.h--854da5b2d880.md)
- [`globalMeshData.H`](../../../04-core-runtime/files/c7/globalmeshdata.h--c7a6bf9a1fa2.md)
- [`processorPolyPatch.H`](../../../04-core-runtime/files/42/processorpolypatch.h--42c8af29a130.md)
- [`polyMeshTetDecomposition.H`](../../../04-core-runtime/files/35/polymeshtetdecomposition.h--3533db67d602.md)
- [`meshObjects.H`](../../../04-core-runtime/files/f9/meshobjects.h--f974900fdffa.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
