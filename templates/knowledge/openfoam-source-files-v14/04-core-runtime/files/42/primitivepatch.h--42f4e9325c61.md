---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-42f4e9325c61"
title: "OpenFOAM 14 源码解析：PrimitivePatch.H"
summary: "该文件声明或实现 `PrimitivePatch`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatch.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：PrimitivePatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatch.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：516 行
- 文件标识：`42f4e9325c61`

## 2. 功能说明

该文件声明或实现 `PrimitivePatch`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：A list of faces which address into the list of points. The class is templated on the face type (e.g. triangle, polygon etc.) and on the list type of faces and points so that it can refer to existing lists using UList and const pointField& or hold the storage using List and pointField.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PrimitivePatch` | 84 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `nPoints` | 311 |
| `nEdges` | 317 |
| `isInternalEdge` | 329 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`edgeList.H`](../../../04-core-runtime/files/04/edgelist.h--04a5bb284762.md)
- [`point.H`](../../../04-core-runtime/files/60/point.h--60b73f2bc052.md)
- `intersection.H`
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`objectHit.H`](../../../04-core-runtime/files/91/objecthit.h--91b7b298ce2c.md)
- [`PrimitivePatch.C`](../../../04-core-runtime/files/fc/primitivepatch.c--fc3fc0cd884c.md)

## 8. 直接上层引用

- [applications/test/primitivePatch/Test-PrimitivePatch.C](../../../17-other-libraries/files/6e/test-primitivepatch.c--6ef97f8ca655.md)
- [src/meshTools/algorithms/PatchEdgeFaceWave/PatchEdgeFaceWave.H](../../../07-mesh-geometry/files/49/patchedgefacewave.h--49b82d3228e0.md)
- [src/meshTools/cutPoly/cutPoly.H](../../../07-mesh-geometry/files/bf/cutpoly.h--bf751bb18490.md)
- [src/meshTools/edgeMesh/extendedEdgeMesh/extendedEdgeMesh.H](../../../07-mesh-geometry/files/df/extendededgemesh.h--dff6875133d3.md)
- [src/meshTools/patchIntersection/primitiveTriPatch.H](../../../07-mesh-geometry/files/61/primitivetripatch.h--61749ad53c94.md)
- [src/meshTools/PrimitiveOldTimePatch/PrimitiveOldTimePatch.H](../../../07-mesh-geometry/files/8e/primitiveoldtimepatch.h--8e41031b1463.md)
- [src/OpenFOAM/meshes/primitiveMesh/PatchTools/PatchTools.H](../../../04-core-runtime/files/d2/patchtools.h--d2cdbb721510.md)
- [src/OpenFOAM/meshes/primitiveMesh/primitivePatch/indirectPrimitivePatch.H](../../../04-core-runtime/files/ab/indirectprimitivepatch.h--ab8f04d3f0d8.md)
- [src/OpenFOAM/meshes/primitiveMesh/primitivePatch/primitiveFacePatch.H](../../../04-core-runtime/files/49/primitivefacepatch.h--496ceb5801f3.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatch.C](../../../04-core-runtime/files/fc/primitivepatch.c--fc3fc0cd884c.md)
- [src/OpenFOAM/meshes/primitiveMesh/primitivePatch/primitivePatch.H](../../../04-core-runtime/files/24/primitivepatch.h--243caf926767.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchAddressing.C](../../../04-core-runtime/files/69/primitivepatchaddressing.c--69458ccbe5a2.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchBdryPoints.C](../../../04-core-runtime/files/8c/primitivepatchbdrypoints.c--8c6287c79d7f.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchCheck.C](../../../04-core-runtime/files/af/primitivepatchcheck.c--af669c5bbac1.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchClear.C](../../../04-core-runtime/files/fb/primitivepatchclear.c--fb0b327c3d93.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchEdgeLoops.C](../../../04-core-runtime/files/a4/primitivepatchedgeloops.c--a43bea167472.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchMeshData.C](../../../04-core-runtime/files/ce/primitivepatchmeshdata.c--ce76b85a9c9e.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchMeshEdges.C](../../../04-core-runtime/files/0e/primitivepatchmeshedges.c--0e7a4908372f.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchName.C](../../../04-core-runtime/files/d3/primitivepatchname.c--d3ce4a7740fe.md)
- [src/OpenFOAM/meshes/primitiveMesh/PrimitivePatch/PrimitivePatchPointAddressing.C](../../../04-core-runtime/files/8d/primitivepatchpointaddressing.c--8d30908b4b49.md)
- [src/OpenFOAM/meshes/primitiveMesh/primitivePatch/uindirectPrimitivePatch.H](../../../04-core-runtime/files/83/uindirectprimitivepatch.h--83d2b2e55ca1.md)
- [src/polyTopoChange/repatchMesh/repatchMesh.H](../../../07-mesh-geometry/files/7d/repatchmesh.h--7dffdfb07b26.md)
- [src/surfMesh/MeshedSurface/MeshedSurface.H](../../../07-mesh-geometry/files/91/meshedsurface.h--9182d0964600.md)
- [src/surfMesh/surfMesh/surfMesh.H](../../../07-mesh-geometry/files/6a/surfmesh.h--6a778bd2d5de.md)
- [src/triSurface/triSurface/triSurface.H](../../../07-mesh-geometry/files/64/trisurface.h--64b575996c2b.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
