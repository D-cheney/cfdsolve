---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3812c4bc1bde"
title: "OpenFOAM 14 源码解析：meshRefinement.C"
summary: "该文件实现 `meshRefinement` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：meshRefinement.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：2767 行
- 文件标识：`3812c4bc1bde`

## 2. 功能说明

该文件实现 `meshRefinement` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::meshRefinement::calcNeighbourData` | 102 |
| `Foam::meshRefinement::updateIntersections` | 188 |
| `Foam::meshRefinement::testSyncPointList` | 290 |
| `Foam::meshRefinement::checkData` | 384 |
| `Foam::meshRefinement::setInstance` | 584 |
| `Foam::meshRefinement::doRemoveCells` | 591 |
| `Foam::meshRefinement::splitFaces` | 639 |
| `Foam::meshRefinement::countHits` | 1161 |
| `Foam::meshRefinement::balance` | 1322 |
| `Foam::meshRefinement::intersectedFaces` | 1600 |
| `Foam::meshRefinement::intersectedPoints` | 1626 |
| `Foam::meshRefinement::makePatch` | 1693 |
| `Foam::meshRefinement::makeDisplacementField` | 1738 |
| `Foam::meshRefinement::checkCoupledFaceZones` | 1787 |
| `Foam::meshRefinement::calculateEdgeWeights` | 1865 |
| `Foam::meshRefinement::addMeshedPatch` | 1921 |
| `Foam::meshRefinement::addedMeshedPatches` | 1979 |
| `Foam::meshRefinement::meshedPatches` | 1985 |
| `Foam::meshRefinement::selectSeparatedCoupledFaces` | 2012 |
| `Foam::meshRefinement::findRegion` | 2035 |
| `Foam::meshRefinement::findRegions` | 2068 |
| `Foam::meshRefinement::splitMeshRegions` | 2143 |
| `Foam::meshRefinement::distribute` | 2243 |
| `Foam::meshRefinement::topoChange` | 2295 |
| `Foam::meshRefinement::write` | 2376 |
| `Foam::meshRefinement::getMasterPoints` | 2415 |
| `Foam::meshRefinement::getMasterEdges` | 2452 |
| `Foam::meshRefinement::printMeshInfo` | 2489 |
| `Foam::meshRefinement::name` | 2556 |
| `Foam::meshRefinement::dumpRefinementLevel` | 2569 |
| `Foam::meshRefinement::dumpIntersections` | 2630 |
| `Foam::meshRefinement::writeLevel` | 2741 |
| `Foam::meshRefinement::outputLevel` | 2753 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **分布式映射**：依据全局到局部寻址重排和交换数据。
5. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
6. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
7. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
8. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
9. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
10. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`meshRefinement.H`](../../../07-mesh-geometry/files/27/meshrefinement.h--27b49fc2d8ae.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`refinementHistory.H`](../../../07-mesh-geometry/files/41/refinementhistory.h--41c7cb618b4a.md)
- [`refinementSurfaces.H`](../../../07-mesh-geometry/files/27/refinementsurfaces.h--27240945c5ca.md)
- [`refinementFeatures.H`](../../../07-mesh-geometry/files/1e/refinementfeatures.h--1e7cb231fd4b.md)
- [`decompositionMethod.H`](../../../13-parallel/files/27/decompositionmethod.h--273aef43a3a9.md)
- [`regionSplit.H`](../../../07-mesh-geometry/files/ed/regionsplit.h--edd42622f90b.md)
- [`fvMeshDistribute.H`](../../../07-mesh-geometry/files/61/fvmeshdistribute.h--61996101b57a.md)
- [`indirectPrimitivePatch.H`](../../../04-core-runtime/files/ab/indirectprimitivepatch.h--ab8f04d3f0d8.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`removeCells.H`](../../../07-mesh-geometry/files/38/removecells.h--38005de7d36a.md)
- [`polyDistributionMap.H`](../../../04-core-runtime/files/1d/polydistributionmap.h--1d3a143688db.md)
- [`localPointRegion.H`](../../../07-mesh-geometry/files/31/localpointregion.h--312b3d9c79c5.md)
- [`pointMesh.H`](../../../05-finite-volume/files/89/pointmesh.h--89d6d6fe0d17.md)
- [`pointFields.H`](../../../05-finite-volume/files/ab/pointfields.h--ab4bc596bad4.md)
- [`slipPointPatchFields.H`](../../../05-finite-volume/files/4b/slippointpatchfields.h--4b195b58ce59.md)
- [`fixedValuePointPatchFields.H`](../../../05-finite-volume/files/16/fixedvaluepointpatchfields.h--16eb03e02337.md)
- [`calculatedPointPatchFields.H`](../../../05-finite-volume/files/59/calculatedpointpatchfields.h--59f0255b09f2.md)
- [`cyclicSlipPointPatchFields.H`](../../../05-finite-volume/files/a4/cyclicslippointpatchfields.h--a4e34f24c693.md)
- [`processorPointPatch.H`](../../../05-finite-volume/files/66/processorpointpatch.h--66f8ac3a71af.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`geometric.H`](../../../13-parallel/files/71/geometric.h--71cb1412a9ec.md)
- [`randomGenerator.H`](../../../04-core-runtime/files/9b/randomgenerator.h--9b6aa7dc2c72.md)
- [`searchableSurfaceList.H`](../../../07-mesh-geometry/files/94/searchablesurfacelist.h--94484000d575.md)
- [`meshSearch.H`](../../../07-mesh-geometry/files/49/meshsearch.h--49ea9d1012c2.md)
- [`fvMeshTools.H`](../../../07-mesh-geometry/files/eb/fvmeshtools.h--eb1d9720596b.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
