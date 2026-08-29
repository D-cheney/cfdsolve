---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f8f0e21a1b7d"
title: "OpenFOAM 14 源码解析：polyMesh.H"
summary: "该文件声明或实现 `globalMeshData`、`polyTopoChangeMap`、`polyMeshMap`、`polyDistributionMap`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyMesh.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：polyMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyMesh.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：639 行
- 文件标识：`f8f0e21a1b7d`

## 2. 功能说明

该文件声明或实现 `globalMeshData`、`polyTopoChangeMap`、`polyMeshMap`、`polyDistributionMap`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Mesh consisting of general polyhedral cells.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `globalMeshData` | 71 |
| `polyTopoChangeMap` | 72 |
| `polyMeshMap` | 73 |
| `polyDistributionMap` | 74 |
| `polyMeshTetDecomposition` | 75 |
| `polyMesh` | 80 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `moving` | 469 |
| `topoChanged` | 475 |
| `changing` | 481 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`objectRegistry.H`](../../../04-core-runtime/files/c4/objectregistry.h--c41bbba65898.md)
- [`primitiveMesh.H`](../../../04-core-runtime/files/18/primitivemesh.h--18af96254eb4.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`faceList.H`](../../../04-core-runtime/files/bc/facelist.h--bc39a0876345.md)
- [`cellList.H`](../../../04-core-runtime/files/ae/celllist.h--ae3e6a9d44cc.md)
- [`cellShapeList.H`](../../../04-core-runtime/files/72/cellshapelist.h--723111c69b11.md)
- [`pointIOField.H`](../../../04-core-runtime/files/5a/pointiofield.h--5a3b0a7e0000.md)
- [`faceIOList.H`](../../../04-core-runtime/files/ae/faceiolist.h--ae7b8a7bb7d0.md)
- [`labelIOList.H`](../../../04-core-runtime/files/ee/labeliolist.h--ee3c796c3931.md)
- [`polyBoundaryMesh.H`](../../../04-core-runtime/files/55/polyboundarymesh.h--55eed959a136.md)
- [`boundBox.H`](../../../04-core-runtime/files/e0/boundbox.h--e05c5ab0a2fb.md)
- [`pointZoneList.H`](../../../04-core-runtime/files/80/pointzonelist.h--8018013e2361.md)
- [`faceZoneList.H`](../../../04-core-runtime/files/8e/facezonelist.h--8e32f5650cb9.md)
- [`cellZoneList.H`](../../../04-core-runtime/files/d7/cellzonelist.h--d7b7e91c86e4.md)

## 8. 直接上层引用

- [applications/test/CompactIOList/Test-CompactIOList.C](../../../17-other-libraries/files/6a/test-compactiolist.c--6a3bb8a28bdf.md)
- [applications/test/globalIndex/Test-globalIndex.C](../../../17-other-libraries/files/ff/test-globalindex.c--ffcf3fa16899.md)
- [applications/test/globalMeshData/Test-globalMeshData.C](../../../17-other-libraries/files/58/test-globalmeshdata.c--58e9c0f472e3.md)
- [applications/test/IOField/Test-IOField.C](../../../17-other-libraries/files/03/test-iofield.c--039ecd3d306d.md)
- [applications/test/momentOfInertia/Test-momentOfInertia.C](../../../17-other-libraries/files/d8/test-momentofinertia.c--d85164ec9181.md)
- [applications/test/patchIntersection/Test-patchIntersection.C](../../../17-other-libraries/files/fb/test-patchintersection.c--fb833ec12328.md)
- [applications/test/patchRegion/Test-patchRegion.C](../../../17-other-libraries/files/aa/test-patchregion.c--aa21ce819eaf.md)
- [applications/test/patchToPatch/Test-patchToPatch.C](../../../17-other-libraries/files/2e/test-patchtopatch.c--2ee882f07d54.md)
- [applications/test/PointEdgeWave/Test-PointEdgeWave.C](../../../17-other-libraries/files/74/test-pointedgewave.c--74af733b923f.md)
- [applications/test/primitivePatch/Test-PrimitivePatch.C](../../../17-other-libraries/files/6e/test-primitivepatch.c--6ef97f8ca655.md)
- [applications/test/syncTools/Test-syncTools.C](../../../17-other-libraries/files/ba/test-synctools.c--ba97f85aa4b8.md)
- [applications/utilities/deprecated/topoSet/fvTopoSetSources/cellSources/fieldToCell/fieldToCell.C](../../../03-utilities/files/9e/fieldtocell.c--9e14f13be614.md)
- [applications/utilities/deprecated/topoSet/fvTopoSetSources/faceSources/patchFluxToFace/patchFluxToFace.C](../../../03-utilities/files/54/patchfluxtoface.c--542e245650ca.md)
- [applications/utilities/deprecated/topoSet/topoSet.C](../../../03-utilities/files/be/toposet.c--be4f2cd4c3af.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/badQualityToCell/badQualityToCell.C](../../../03-utilities/files/ce/badqualitytocell.c--ce92caec7d6c.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/badQualityToFace/badQualityToFace.C](../../../03-utilities/files/9c/badqualitytoface.c--9cb4ed58f37f.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/boxToCell/boxToCell.C](../../../03-utilities/files/d6/boxtocell.c--d663a46a7963.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/cylinderAnnulusToCell/cylinderAnnulusToCell.C](../../../03-utilities/files/7a/cylinderannulustocell.c--7a49e5e9688e.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/cylinderToCell/cylinderToCell.C](../../../03-utilities/files/05/cylindertocell.c--05435c040c1c.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/faceToCell/faceToCell.C](../../../03-utilities/files/8a/facetocell.c--8abbd5690337.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/faceZoneToCell/faceZoneToCell.C](../../../03-utilities/files/a3/facezonetocell.c--a382258ba81e.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/hemisphereToCell/hemisphereToCell.C](../../../03-utilities/files/17/hemispheretocell.c--17d6f3fa36e4.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/labelToCell/labelToCell.C](../../../03-utilities/files/9f/labeltocell.c--9fa204e2ffa0.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/nbrToCell/nbrToCell.C](../../../03-utilities/files/bd/nbrtocell.c--bd38504ca787.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/pointToCell/pointToCell.C](../../../03-utilities/files/07/pointtocell.c--070af663b073.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
