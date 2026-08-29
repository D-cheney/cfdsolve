---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-31acf059fb90"
title: "OpenFOAM 14 源码解析：meshRefinementRefine.C"
summary: "该文件实现 `meshRefinementRefine` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/mesh/snappyHexMesh/meshRefinement/meshRefinementRefine.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：meshRefinementRefine.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/mesh/snappyHexMesh/meshRefinement/meshRefinementRefine.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：2529 行
- 文件标识：`31acf059fb90`

## 2. 功能说明

该文件实现 `meshRefinementRefine` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `normalLess` | 73 |
| `pTraits` | 93 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `operator` | 83 |
| `Foam::meshRefinement::getChangedFaces` | 121 |
| `Foam::meshRefinement::markForRefine` | 301 |
| `Foam::meshRefinement::markFeatureCellLevel` | 318 |
| `Foam::meshRefinement::markFeatureRefinement` | 653 |
| `Foam::meshRefinement::markInternalDistanceToFeatureRefinement` | 709 |
| `Foam::meshRefinement::markInternalRefinement` | 790 |
| `Foam::meshRefinement::getRefineCandidateFaces` | 873 |
| `Foam::meshRefinement::markSurfaceRefinement` | 912 |
| `Foam::meshRefinement::countMatches` | 1068 |
| `Foam::meshRefinement::markSurfaceCurvatureRefinement` | 1098 |
| `Foam::meshRefinement::isGap` | 1511 |
| `Foam::meshRefinement::isNormalGap` | 1570 |
| `Foam::meshRefinement::checkProximity` | 1625 |
| `Foam::meshRefinement::markProximityRefinement` | 1708 |
| `Foam::meshRefinement::refineCandidates` | 2036 |
| `Foam::meshRefinement::refine` | 2237 |
| `Foam::meshRefinement::refineAndBalance` | 2265 |
| `Foam::meshRefinement::balanceAndRefine` | 2368 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`meshRefinement.H`](../../../07-mesh-geometry/files/27/meshrefinement.h--27b49fc2d8ae.md)
- [`trackedParticle.H`](../../../07-mesh-geometry/files/46/trackedparticle.h--46be89b7d3ec.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`refinementSurfaces.H`](../../../07-mesh-geometry/files/27/refinementsurfaces.h--27240945c5ca.md)
- [`refinementFeatures.H`](../../../07-mesh-geometry/files/1e/refinementfeatures.h--1e7cb231fd4b.md)
- [`refinementRegions.H`](../../../07-mesh-geometry/files/05/refinementregions.h--05f6e346634c.md)
- [`faceSet.H`](../../../07-mesh-geometry/files/f3/faceset.h--f3dc94c0b8ee.md)
- [`decompositionMethod.H`](../../../13-parallel/files/27/decompositionmethod.h--273aef43a3a9.md)
- [`fvMeshDistribute.H`](../../../07-mesh-geometry/files/61/fvmeshdistribute.h--61996101b57a.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`polyDistributionMap.H`](../../../04-core-runtime/files/1d/polydistributionmap.h--1d3a143688db.md)
- [`Cloud.H`](../../../11-lagrangian/files/0f/cloud.h--0fc43918cc09.md)
- [`OBJstream.H`](../../../17-other-libraries/files/7d/objstream.h--7ddc3b439962.md)
- [`cellSet.H`](../../../07-mesh-geometry/files/2c/cellset.h--2c74eeb024c7.md)
- [`meshSearch.H`](../../../07-mesh-geometry/files/49/meshsearch.h--49ea9d1012c2.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
