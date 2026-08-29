---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9ce29ce49493"
title: "OpenFOAM 14 源码解析：facePointPatch.H"
summary: "该文件声明或实现 `processorPointPatch`、`cyclicPointPatch`、`facePointPatch`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/pointMesh/pointPatches/facePointPatch/facePointPatch.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：facePointPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/pointMesh/pointPatches/facePointPatch/facePointPatch.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：212 行
- 文件标识：`9ce29ce49493`

## 2. 功能说明

该文件声明或实现 `processorPointPatch`、`cyclicPointPatch`、`facePointPatch`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：A pointPatch based on a polyPatch

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `processorPointPatch` | 53 |
| `cyclicPointPatch` | 55 |
| `facePointPatch` | 60 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`pointPatch.H`](../../../05-finite-volume/files/10/pointpatch.h--1008303e35de.md)
- [`polyPatch.H`](../../../04-core-runtime/files/51/polypatch.h--5133084941b0.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/patches/filmSurface/filmSurfacePointPatch/filmSurfacePointPatch.H](../../../02-solver-modules/files/64/filmsurfacepointpatch.h--64c93c6ffb2b.md)
- [applications/modules/isothermalFilm/patches/filmWall/filmWallPointPatch/filmWallPointPatch.H](../../../02-solver-modules/files/45/filmwallpointpatch.h--4561e34f493a.md)
- [src/finiteVolume/pointMesh/pointBoundaryMesh/pointBoundaryMesh.C](../../../05-finite-volume/files/dc/pointboundarymesh.c--dc4e14d1f38a.md)
- [src/finiteVolume/pointMesh/pointMesh.C](../../../05-finite-volume/files/47/pointmesh.c--472ce4343416.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/empty/emptyPointPatch.H](../../../05-finite-volume/files/bf/emptypointpatch.h--bf27a52867a4.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/internal/internalPointPatch.H](../../../05-finite-volume/files/15/internalpointpatch.h--15f2a77e7e5b.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/nonConformalError/nonConformalErrorPointPatch.H](../../../05-finite-volume/files/19/nonconformalerrorpointpatch.h--19e86b0eaf18.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/symmetry/symmetryPointPatch.H](../../../05-finite-volume/files/4f/symmetrypointpatch.h--4f5054338b37.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/symmetryPlane/symmetryPlanePointPatch.H](../../../05-finite-volume/files/7a/symmetryplanepointpatch.h--7a125e8b37e9.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/wedge/wedgePointPatch.H](../../../05-finite-volume/files/79/wedgepointpatch.h--79190d9dd27f.md)
- [src/finiteVolume/pointMesh/pointPatches/derived/coupled/coupledFacePointPatch.H](../../../05-finite-volume/files/62/coupledfacepointpatch.h--62a750c9e0c3.md)
- [src/finiteVolume/pointMesh/pointPatches/derived/mapped/mappedInternalPointPatch/mappedInternalPointPatch.H](../../../05-finite-volume/files/7b/mappedinternalpointpatch.h--7b1687c3931c.md)
- [src/finiteVolume/pointMesh/pointPatches/derived/mapped/mappedPointPatch/mappedPointPatch.H](../../../05-finite-volume/files/09/mappedpointpatch.h--09c48147a8f3.md)
- [src/finiteVolume/pointMesh/pointPatches/derived/wall/wallPointPatch.H](../../../05-finite-volume/files/08/wallpointpatch.h--083185da2a3a.md)
- [src/finiteVolume/pointMesh/pointPatches/facePointPatch/facePointPatch.C](../../../05-finite-volume/files/e6/facepointpatch.c--e62b7fd4ff99.md)
- [src/finiteVolume/pointMesh/pointPatches/facePointPatch/facePointPatchNew.C](../../../05-finite-volume/files/4e/facepointpatchnew.c--4e66590a93cd.md)
- [src/generic/genericFvPatches/genericPointPatch/genericPointPatch.H](../../../17-other-libraries/files/d3/genericpointpatch.h--d393ccd1a0ee.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
