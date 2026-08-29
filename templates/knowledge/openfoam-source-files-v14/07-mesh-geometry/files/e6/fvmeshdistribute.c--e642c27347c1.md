---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e642c27347c1"
title: "OpenFOAM 14 源码解析：fvMeshDistribute.C"
summary: "该文件实现 `fvMeshDistribute` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/fvMeshDistribute/fvMeshDistribute.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：fvMeshDistribute.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/fvMeshDistribute/fvMeshDistribute.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：3137 行
- 文件标识：`e642c27347c1`

## 2. 功能说明

该文件实现 `fvMeshDistribute` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `lessProcPatches` | 54 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `operator` | 73 |
| `Foam::fvMeshDistribute::inplaceRenumberWithFlip` | 114 |
| `Foam::fvMeshDistribute::select` | 187 |
| `Foam::fvMeshDistribute::fieldNames` | 218 |
| `Foam::fvMeshDistribute::checkEqualWordList` | 238 |
| `Foam::fvMeshDistribute::mergeWordList` | 267 |
| `Foam::fvMeshDistribute::printMeshInfo` | 286 |
| `Foam::fvMeshDistribute::printCoupleInfo` | 345 |
| `Foam::fvMeshDistribute::findInternalPatch` | 372 |
| `Foam::fvMeshDistribute::findNonEmptyPatch` | 432 |
| `Foam::fvMeshDistribute::deleteProcPatches` | 469 |
| `Foam::fvMeshDistribute::repatch` | 536 |
| `Foam::fvMeshDistribute::mergeSharedPoints` | 634 |
| `Foam::fvMeshDistribute::getCouplingData` | 801 |
| `Foam::fvMeshDistribute::subsetCouplingData` | 1004 |
| `Foam::fvMeshDistribute::findCouples` | 1082 |
| `Foam::fvMeshDistribute::mapBoundaryData` | 1156 |
| `Foam::fvMeshDistribute::mapPointData` | 1194 |
| `Foam::fvMeshDistribute::doRemoveCells` | 1229 |
| `Foam::fvMeshDistribute::addProcPatches` | 1291 |
| `Foam::fvMeshDistribute::addNccProcPatches` | 1380 |
| `Foam::fvMeshDistribute::getBoundaryPatch` | 1455 |
| `Foam::fvMeshDistribute::sendMesh` | 1485 |
| `Foam::fvMeshDistribute::receiveMesh` | 1657 |
| `Foam::fvMeshDistribute::countCells` | 1792 |
| `Foam::fvMeshDistribute::distribute` | 1815 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **分布式映射**：依据全局到局部寻址重排和交换数据。
5. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
8. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fvMeshDistribute.H`](../../../07-mesh-geometry/files/61/fvmeshdistribute.h--61996101b57a.md)
- [`fvMeshAdder.H`](../../../07-mesh-geometry/files/00/fvmeshadder.h--007bafa20297.md)
- [`processorCyclicFvPatchField.H`](../../../05-finite-volume/files/0e/processorcyclicfvpatchfield.h--0e5d84a35d90.md)
- [`processorCyclicFvsPatchField.H`](../../../05-finite-volume/files/2a/processorcyclicfvspatchfield.h--2a0187571268.md)
- [`nonConformalProcessorCyclicFvPatchField.H`](../../../05-finite-volume/files/40/nonconformalprocessorcyclicfvpatchfield.h--4079cd9c657c.md)
- [`nonConformalProcessorCyclicFvsPatchField.H`](../../../05-finite-volume/files/5b/nonconformalprocessorcyclicfvspatchfield.h--5b2848d8b671.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`removeCells.H`](../../../07-mesh-geometry/files/38/removecells.h--38005de7d36a.md)
- [`polyDistributionMap.H`](../../../04-core-runtime/files/1d/polydistributionmap.h--1d3a143688db.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`CompactListList.H`](../../../04-core-runtime/files/00/compactlistlist.h--009109c57c35.md)
- [`fvMeshTools.H`](../../../07-mesh-geometry/files/eb/fvmeshtools.h--eb1d9720596b.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
