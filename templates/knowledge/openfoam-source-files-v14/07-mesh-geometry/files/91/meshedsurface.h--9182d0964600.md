---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9182d0964600"
title: "OpenFOAM 14 源码解析：MeshedSurface.H"
summary: "该文件声明或实现 `Time`、`surfMesh`、`polyBoundaryMesh`、`MeshedSurface`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/surfMesh/MeshedSurface/MeshedSurface.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：MeshedSurface.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/surfMesh/MeshedSurface/MeshedSurface.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：496 行
- 文件标识：`9182d0964600`

## 2. 功能说明

该文件声明或实现 `Time`、`surfMesh`、`polyBoundaryMesh`、`MeshedSurface`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：A surface geometry mesh with zone information, not to be confused with the similarly named surfaceMesh, which actually refers to the cell faces of a volume mesh. A MeshedSurface can have zero or more surface zones (roughly equivalent to faceZones for a polyMesh). If surface zones are defined, they must be contiguous and cover all of the faces. The MeshedSurface is intended for surfaces from a variety of sources. - A set of points and faces without any surface zone information. - A set of points and faces with randomly ordered zone information. This could arise, for example, from reading external file formats such as STL, etc.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Time` | 74 |
| `surfMesh` | 76 |
| `polyBoundaryMesh` | 77 |
| `MeshedSurface` | 78 |
| `MeshedSurfaceProxy` | 80 |
| `UnsortedMeshedSurface` | 81 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `size` | 292 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`PrimitivePatch.H`](../../../04-core-runtime/files/42/primitivepatch.h--42f4e9325c61.md)
- [`PatchTools.H`](../../../04-core-runtime/files/d2/patchtools.h--d2cdbb721510.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`face.H`](../../../04-core-runtime/files/bc/face.h--bc0ffa4a6982.md)
- [`triFace.H`](../../../04-core-runtime/files/6a/triface.h--6a1e567bfca7.md)
- [`surfZoneList.H`](../../../07-mesh-geometry/files/87/surfzonelist.h--875ee738fd77.md)
- [`surfaceFormatsCore.H`](../../../07-mesh-geometry/files/08/surfaceformatscore.h--0873f7588bd6.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`memberFunctionSelectionTables.H`](../../../04-core-runtime/files/cb/memberfunctionselectiontables.h--cb536a9cf7d3.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`MeshedSurface.C`](../../../07-mesh-geometry/files/c5/meshedsurface.c--c54f2602584e.md)

## 8. 直接上层引用

- [applications/utilities/mesh/generation/extrude2DMesh/extrude2DMesh.C](../../../03-utilities/files/46/extrude2dmesh.c--46db24f754eb.md)
- [applications/utilities/mesh/generation/extrude2DMesh/extrude2DMesh/patchToPoly2DMesh/patchToPoly2DMesh.H](../../../03-utilities/files/05/patchtopoly2dmesh.h--0502e91f377f.md)
- [applications/utilities/mesh/generation/snappyHexMesh/snappyHexMesh.C](../../../03-utilities/files/18/snappyhexmesh.c--1856be2e0ca1.md)
- [applications/utilities/surface/surfaceMeshTriangulate/surfaceMeshTriangulate.C](../../../03-utilities/files/70/surfacemeshtriangulate.c--7010d3f6111a.md)
- [src/sampling/sampledSurface/sampledPatch/sampledPatch.H](../../../14-postprocessing/files/7f/sampledpatch.h--7f4310b16dd1.md)
- [src/sampling/sampledSurface/sampledThresholdCellFaces/sampledThresholdCellFaces.H](../../../14-postprocessing/files/cb/sampledthresholdcellfaces.h--cb5a6c5035c3.md)
- [src/sampling/sampledSurface/sampledThresholdCellFaces/thresholdCellFaces.H](../../../14-postprocessing/files/2a/thresholdcellfaces.h--2a5ab0c1c732.md)
- [src/sampling/sampledSurface/sampledTriSurface/sampledTriSurface.H](../../../14-postprocessing/files/a9/sampledtrisurface.h--a98919b9aff6.md)
- [src/surfMesh/MeshedSurface/MeshedSurface.C](../../../07-mesh-geometry/files/c5/meshedsurface.c--c54f2602584e.md)
- [src/surfMesh/MeshedSurface/MeshedSurfaceCore.C](../../../07-mesh-geometry/files/73/meshedsurfacecore.c--735bff2a541c.md)
- [src/surfMesh/MeshedSurface/MeshedSurfaceIO.C](../../../07-mesh-geometry/files/64/meshedsurfaceio.c--646a180aa3b6.md)
- [src/surfMesh/MeshedSurface/MeshedSurfaceNew.C](../../../07-mesh-geometry/files/39/meshedsurfacenew.c--390ed13701c0.md)
- [src/surfMesh/MeshedSurface/MeshedSurfaces.H](../../../07-mesh-geometry/files/1a/meshedsurfaces.h--1a8a244a5199.md)
- [src/surfMesh/MeshedSurface/MeshedSurfaceZones.C](../../../07-mesh-geometry/files/ff/meshedsurfacezones.c--ff2abc8fa1ee.md)
- [src/surfMesh/surfaceFormats/ac3d/AC3DsurfaceFormat.H](../../../07-mesh-geometry/files/42/ac3dsurfaceformat.h--42ae622d0da5.md)
- [src/surfMesh/surfaceFormats/ac3d/AC3DsurfaceFormatCore.H](../../../07-mesh-geometry/files/21/ac3dsurfaceformatcore.h--2190d45842fd.md)
- [src/surfMesh/surfaceFormats/gts/GTSsurfaceFormat.H](../../../07-mesh-geometry/files/e9/gtssurfaceformat.h--e9df67e97b83.md)
- [src/surfMesh/surfaceFormats/nas/NASsurfaceFormat.H](../../../07-mesh-geometry/files/fc/nassurfaceformat.h--fc082c874322.md)
- [src/surfMesh/surfaceFormats/obj/OBJsurfaceFormat.H](../../../07-mesh-geometry/files/9e/objsurfaceformat.h--9e5ea97a3a8e.md)
- [src/surfMesh/surfaceFormats/off/OFFsurfaceFormat.H](../../../07-mesh-geometry/files/71/offsurfaceformat.h--7186e1583660.md)
- [src/surfMesh/surfaceFormats/ofs/OFSsurfaceFormat.H](../../../07-mesh-geometry/files/02/ofssurfaceformat.h--02eb4b584a4b.md)
- [src/surfMesh/surfaceFormats/ofs/OFSsurfaceFormatCore.H](../../../07-mesh-geometry/files/2b/ofssurfaceformatcore.h--2b8bd2220de5.md)
- [src/surfMesh/surfaceFormats/smesh/SMESHsurfaceFormat.H](../../../07-mesh-geometry/files/54/smeshsurfaceformat.h--54ed0cb9bbe5.md)
- [src/surfMesh/surfaceFormats/starcd/STARCDsurfaceFormat.H](../../../07-mesh-geometry/files/4b/starcdsurfaceformat.h--4b04b281facd.md)
- [src/surfMesh/surfaceFormats/starcd/STARCDsurfaceFormatCore.H](../../../07-mesh-geometry/files/29/starcdsurfaceformatcore.h--29b84975d4d4.md)

## 9. 运行时机制

`declareRunTimeSelectionTable`、`declareMemberFunctionSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
