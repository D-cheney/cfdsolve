---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c331343fe38f"
title: "OpenFOAM 14 源码解析：wedgePolyPatch.H"
summary: "该文件声明或实现 `wedgePolyPatch`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/wedge/wedgePolyPatch.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：wedgePolyPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/wedge/wedgePolyPatch.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：229 行
- 文件标识：`c331343fe38f`

## 2. 功能说明

该文件声明或实现 `wedgePolyPatch`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Wedge front and back plane patch.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `wedgePolyPatch` | 54 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `cosAngle` | 196 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`polyPatch.H`](../../../04-core-runtime/files/51/polypatch.h--5133084941b0.md)

## 8. 直接上层引用

- [applications/utilities/mesh/conversion/kivaToFoam/kivaToFoam.C](../../../03-utilities/files/be/kivatofoam.c--bef76c1f25b8.md)
- [applications/utilities/mesh/generation/extrudeMesh/extrudeMesh.C](../../../03-utilities/files/c8/extrudemesh.c--c85ecbc45ccd.md)
- [applications/utilities/mesh/generation/extrudeToRegionMesh/extrudeToRegionMesh.C](../../../03-utilities/files/3d/extrudetoregionmesh.c--3d777298811a.md)
- [applications/utilities/preProcessing/viewFactorsGen/viewFactorsGen.C](../../../03-utilities/files/3f/viewfactorsgen.c--3fe0599b649e.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/wedge/wedgeFvPatch.H](../../../05-finite-volume/files/2c/wedgefvpatch.h--2c6baa534871.md)
- [src/finiteVolume/pointMesh/pointPatches/constraint/wedge/wedgePointPatch.H](../../../05-finite-volume/files/79/wedgepointpatch.h--79190d9dd27f.md)
- [src/functionObjects/field/streamFunction/streamFunction.C](../../../14-postprocessing/files/18/streamfunction.c--188ab400319b.md)
- [src/lagrangian/basic/particle/particleTemplates.C](../../../11-lagrangian/files/73/particletemplates.c--73e94845b546.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/wedge/wedgeLagrangianPatch.H](../../../11-lagrangian/files/7c/wedgelagrangianpatch.h--7c4e8db2944b.md)
- [src/meshCheck/checkGeometry.C](../../../07-mesh-geometry/files/8e/checkgeometry.c--8eea2af78670.md)
- [src/meshCheck/meshCheck.H](../../../07-mesh-geometry/files/f6/meshcheck.h--f6f053d57a2b.md)
- [src/meshTools/cellsToCells/cellsToCells/cellsToCells.C](../../../07-mesh-geometry/files/c8/cellstocells.c--c82a949c0928.md)
- [src/meshTools/meshToMesh/meshToMesh.C](../../../07-mesh-geometry/files/92/meshtomesh.c--925d1dc4c86b.md)
- [src/meshTools/twoDPointCorrector/twoDPointCorrector.C](../../../07-mesh-geometry/files/e3/twodpointcorrector.c--e37ecc32003a.md)
- [src/OpenFOAM/meshes/polyMesh/polyMesh.C](../../../04-core-runtime/files/44/polymesh.c--4420b33f414e.md)
- [src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/wedge/wedgePolyPatch.C](../../../04-core-runtime/files/a8/wedgepolypatch.c--a8fdeebe9d7a.md)
- [src/radiationModels/radiationModels/fvDOM/fvDOM.C](../../../17-other-libraries/files/96/fvdom.c--96aad1ae0959.md)
- [src/tracking/tracking.C](../../../17-other-libraries/files/8a/tracking.c--8ac2f76555f4.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
