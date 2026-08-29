---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-45e0dd02efd6"
title: "OpenFOAM 14 源码解析：PointEdgeWave.H"
summary: "该文件声明或实现 `polyMesh`、`polyPatch`、`transformer`、`PointEdgeWave`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/algorithms/PointEdgeWave/PointEdgeWave.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：PointEdgeWave.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/algorithms/PointEdgeWave/PointEdgeWave.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：363 行
- 文件标识：`45e0dd02efd6`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyPatch`、`transformer`、`PointEdgeWave`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Wave propagation of information through grid. Every iteration information goes through one layer of edges. Templated on information that is transferred. Handles parallel and cyclics. Only parallel reasonably tested. Cyclics hardly tested. Note: whether to propagate depends on the return value of Type::update which returns true (i.e. propagate) if the value changes by more than a certain tolerance. Note: parallel is done in two steps: -# transfer patch points in offset notation, i.e. every patch point is denoted by a patchface label and an index in this face. Receiving end uses that fact that f[0] is shared and order is reversed. -# do all non-local shared points by means of reduce of data on them. Note: cyclics is with offset in patchface as well. Patch is divided into two sub patches and the point-point addressing is never explicitly calculated but instead use is made of the face-face c

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 77 |
| `polyPatch` | 78 |
| `transformer` | 79 |
| `PointEdgeWave` | 91 |
| `listUpdateOp` | 322 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `operator` | 337 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`tensorField.H`](../../../04-core-runtime/files/01/tensorfield.h--0143721bda3d.md)
- [`PointEdgeWave.C`](../../../07-mesh-geometry/files/b2/pointedgewave.c--b262a71dbe03.md)

## 8. 直接上层引用

- [applications/test/PointEdgeWave/Test-PointEdgeWave.C](../../../17-other-libraries/files/74/test-pointedgewave.c--74af733b923f.md)
- [src/finiteVolume/pointMesh/pointDist/pointDist.C](../../../05-finite-volume/files/59/pointdist.c--5986b2d70dc4.md)
- [src/fvMeshMovers/fvMotionSolvers/motionDiffusivity/inversePointDistance/inversePointDistanceDiffusivity.C](../../../07-mesh-geometry/files/77/inversepointdistancediffusivity.c--77770038260b.md)
- [src/fvMeshMovers/multiValveEngine/zoneGenerators/pistonBowlPoints/pistonBowlPoints.C](../../../07-mesh-geometry/files/51/pistonbowlpoints.c--51258edc3148.md)
- [src/mesh/snappyHexMesh/externalDisplacementMeshMover/medialAxisMeshMover.C](../../../07-mesh-geometry/files/19/medialaxismeshmover.c--19b44ead8f3d.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriverShrink.C](../../../07-mesh-geometry/files/43/snappylayerdrivershrink.c--4351d2260c13.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/snappySnapDriver.C](../../../07-mesh-geometry/files/40/snappysnapdriver.c--40de51c15316.md)
- [src/meshTools/algorithms/PointEdgeWave/PointEdgeWave.C](../../../07-mesh-geometry/files/b2/pointedgewave.c--b262a71dbe03.md)
- [src/meshTools/algorithms/PointEdgeWave/PointEdgeWaveName.C](../../../07-mesh-geometry/files/a6/pointedgewavename.c--a61ce691b9c9.md)
- [src/meshTools/mappedPatches/mappedExtrudedPatchBase/mappedExtrudedPatchBase.C](../../../07-mesh-geometry/files/eb/mappedextrudedpatchbase.c--eb99d93dd128.md)
- [src/meshTools/meshStructure/meshStructure.C](../../../07-mesh-geometry/files/c3/meshstructure.c--c34dc55f5562.md)
- [src/pointMeshMovers/displacement/layered/layeredDisplacement_pointMeshMover.C](../../../07-mesh-geometry/files/74/layereddisplacement_pointmeshmover.c--74f87faaf3a8.md)
- [src/polyTopoChange/polyTopoChange/edgeCollapser.C](../../../07-mesh-geometry/files/69/edgecollapser.c--6956911e33d3.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
