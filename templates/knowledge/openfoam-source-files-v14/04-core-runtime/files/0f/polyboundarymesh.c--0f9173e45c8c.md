---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0f9173e45c8c"
title: "OpenFOAM 14 源码解析：polyBoundaryMesh.C"
summary: "该文件实现 `polyBoundaryMesh` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyBoundaryMesh/polyBoundaryMesh.C"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：polyBoundaryMesh.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyBoundaryMesh/polyBoundaryMesh.C`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1282 行
- 文件标识：`0f9173e45c8c`

## 2. 功能说明

该文件实现 `polyBoundaryMesh` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::polyBoundaryMesh::polyBoundaryMesh` | 110 |
| `Foam::polyBoundaryMesh::clearGeom` | 200 |
| `Foam::polyBoundaryMesh::clearAddressing` | 212 |
| `Foam::polyBoundaryMesh::calcGeometry` | 232 |
| `Foam::polyBoundaryMesh::nbrEdges` | 277 |
| `Foam::polyBoundaryMesh::patchIndices` | 410 |
| `Foam::polyBoundaryMesh::patchFaceIndices` | 439 |
| `Foam::polyBoundaryMesh::groupPatchIndices` | 468 |
| `Foam::polyBoundaryMesh::setGroup` | 523 |
| `Foam::polyBoundaryMesh::toc` | 574 |
| `Foam::polyBoundaryMesh::names` | 589 |
| `Foam::polyBoundaryMesh::types` | 595 |
| `Foam::polyBoundaryMesh::physicalTypes` | 610 |
| `Foam::polyBoundaryMesh::findIndices` | 625 |
| `Foam::polyBoundaryMesh::findIndex` | 701 |
| `Foam::polyBoundaryMesh::whichPatch` | 726 |
| `Foam::polyBoundaryMesh::patchSet` | 772 |
| `Foam::polyBoundaryMesh::matchGroups` | 876 |
| `Foam::polyBoundaryMesh::checkParallelSync` | 924 |
| `Foam::polyBoundaryMesh::checkDefinition` | 1011 |
| `Foam::polyBoundaryMesh::movePoints` | 1051 |
| `Foam::polyBoundaryMesh::topoChange` | 1097 |
| `Foam::polyBoundaryMesh::renamePatches` | 1148 |
| `Foam::polyBoundaryMesh::reorderPatches` | 1170 |
| `Foam::polyBoundaryMesh::writeData` | 1196 |
| `Foam::polyBoundaryMesh::writeObject` | 1219 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
7. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
8. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`polyBoundaryMesh.H`](../../../04-core-runtime/files/55/polyboundarymesh.h--55eed959a136.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`primitiveMesh.H`](../../../04-core-runtime/files/18/primitivemesh.h--18af96254eb4.md)
- [`processorPolyPatch.H`](../../../04-core-runtime/files/42/processorpolypatch.h--42c8af29a130.md)
- [`stringListOps.H`](../../../04-core-runtime/files/06/stringlistops.h--06d8314554d3.md)
- [`PstreamBuffers.H`](../../../04-core-runtime/files/03/pstreambuffers.h--03b90e8f97af.md)
- [`lduSchedule.H`](../../../06-linear-algebra/files/7c/lduschedule.h--7cefeb8e4c05.md)
- [`globalMeshData.H`](../../../04-core-runtime/files/c7/globalmeshdata.h--c7a6bf9a1fa2.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
