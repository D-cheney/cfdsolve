---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ec75730251c5"
title: "OpenFOAM 14 源码解析：mappedPatchBase.H"
summary: "该文件声明或实现 `mappedPatchBase`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/mappedPatches/mappedPatchBase/mappedPatchBase.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：mappedPatchBase.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/mappedPatches/mappedPatchBase/mappedPatchBase.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：259 行
- 文件标识：`ec75730251c5`

## 2. 功能说明

该文件声明或实现 `mappedPatchBase`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Engine and base class for poly patches which provides interpolative mapping between two globally conforming poly patches Example: \verbatim // (Settings inherited from mappedPatchBaseBase to identify the // neighbouring region and patch) ... // Patch-to-patch mapping method. How the interpolation addressing and // weights are constructed. Likely to be "matching" if the patches are // conformal, or "intersection" if they are not. Optional. If omitted, // then it will be assumed that the patches are conformal, and an // octree-based method will be used to construct the connections. method matching; // nearest, intersection, inverseDistance // Tolerance used to check the patches' global conformance (i.e., the // conformance of the patches' entire surfaces, not of each pair of // faces). Optional. Defaults to a small value. matchTol 1e-4; \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `mappedPatchBase` | 78 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`mappedPatchBaseBase.H`](../../../07-mesh-geometry/files/c4/mappedpatchbasebase.h--c48652abe0f8.md)
- [`patchToPatch.H`](../../../07-mesh-geometry/files/08/patchtopatch.h--08d6ca742155.md)
- [`mappedPatchBaseI.H`](../../../07-mesh-geometry/files/0a/mappedpatchbasei.h--0a6f1eb65f41.md)
- [`mappedPatchBaseTemplates.C`](../../../07-mesh-geometry/files/d2/mappedpatchbasetemplates.c--d2cf33c42917.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/patches/mappedFilmWall/mappedFilmWallPolyPatch/mappedFilmWallPolyPatch.H](../../../02-solver-modules/files/67/mappedfilmwallpolypatch.h--67b0706bae2d.md)
- [src/finiteVolume/fields/fvPatchFields/derived/mappedValue/mappedValueFvPatchField.H](../../../05-finite-volume/files/e8/mappedvaluefvpatchfield.h--e820cc28dc94.md)
- [src/finiteVolume/fvMesh/fvPatches/derived/mapped/mappedFvPatchBase.H](../../../05-finite-volume/files/2e/mappedfvpatchbase.h--2e95acbd755e.md)
- [src/meshTools/mappedPatches/mappedExtrudedPatchBase/mappedExtrudedPatchBase.H](../../../07-mesh-geometry/files/d2/mappedextrudedpatchbase.h--d2fbfbbec8e7.md)
- [src/meshTools/mappedPatches/mappedPatchBase/mappedPatchBase.C](../../../07-mesh-geometry/files/af/mappedpatchbase.c--af9fa797905e.md)
- [src/meshTools/mappedPatches/mappedPatchBase/mappedPatchBaseI.H](../../../07-mesh-geometry/files/0a/mappedpatchbasei.h--0a6f1eb65f41.md)
- [src/meshTools/mappedPatches/mappedPatchBase/mappedPatchBaseTemplates.C](../../../07-mesh-geometry/files/d2/mappedpatchbasetemplates.c--d2cf33c42917.md)
- [src/meshTools/mappedPatches/mappedPolyPatch/mappedPolyPatch.H](../../../07-mesh-geometry/files/78/mappedpolypatch.h--788631340ba9.md)
- [src/meshTools/mappedPatches/mappedPolyPatch/mappedWallPolyPatch.H](../../../07-mesh-geometry/files/09/mappedwallpolypatch.h--099c37d7f2c3.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
