---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-788631340ba9"
title: "OpenFOAM 14 源码解析：mappedPolyPatch.H"
summary: "该文件声明或实现 `mappedPolyPatch`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/mappedPatches/mappedPolyPatch/mappedPolyPatch.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：mappedPolyPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/mappedPatches/mappedPolyPatch/mappedPolyPatch.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：165 行
- 文件标识：`788631340ba9`

## 2. 功能说明

该文件声明或实现 `mappedPolyPatch`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Poly patch which can do interpolative mapping of values from another globally conforming poly patch

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `mappedPolyPatch` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`polyPatch.H`](../../../04-core-runtime/files/51/polypatch.h--5133084941b0.md)
- [`mappedPatchBase.H`](../../../07-mesh-geometry/files/ec/mappedpatchbase.h--ec75730251c5.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/patches/mappedFilmSurface/mappedFilmSurfacePolyPatch/mappedFilmSurfacePolyPatch.C](../../../02-solver-modules/files/0b/mappedfilmsurfacepolypatch.c--0b7a70fcc24f.md)
- [applications/modules/isothermalFilm/patches/mappedFilmWall/mappedFilmWallPolyPatch/mappedFilmWallPolyPatch.C](../../../02-solver-modules/files/b5/mappedfilmwallpolypatch.c--b5a3b5e761f5.md)
- [applications/test/mappedPatch/Test-mappedPatch.C](../../../17-other-libraries/files/d0/test-mappedpatch.c--d0f3d30a88d2.md)
- [src/finiteVolume/fields/fvPatchFields/derived/mappedValue/mappedValueFvPatchField.C](../../../05-finite-volume/files/f9/mappedvaluefvpatchfield.c--f90be17b25ed.md)
- [src/finiteVolume/fvMesh/fvPatches/derived/mapped/mappedFvPatch.H](../../../05-finite-volume/files/e4/mappedfvpatch.h--e4c9fb16f540.md)
- [src/finiteVolume/pointMesh/pointPatches/derived/mapped/mappedPointPatch/mappedPointPatch.H](../../../05-finite-volume/files/09/mappedpointpatch.h--09c48147a8f3.md)
- [src/meshTools/mappedPatches/mappedExtrudedPolyPatch/mappedExtrudedWallPolyPatch.C](../../../07-mesh-geometry/files/79/mappedextrudedwallpolypatch.c--79b50323e2dd.md)
- [src/meshTools/mappedPatches/mappedPolyPatch/mappedPolyPatch.C](../../../07-mesh-geometry/files/a1/mappedpolypatch.c--a12d24042462.md)
- [src/meshTools/mappedPatches/mappedPolyPatch/mappedWallPolyPatch.C](../../../07-mesh-geometry/files/60/mappedwallpolypatch.c--6046744acdbd.md)
- [src/meshTools/mappedPatches/nonConformalMappedPolyPatch/nonConformalMappedWallPolyPatch.C](../../../07-mesh-geometry/files/f0/nonconformalmappedwallpolypatch.c--f09624eda29e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
