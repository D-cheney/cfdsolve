---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-623c78073185"
title: "OpenFOAM 14 源码解析：units.H"
summary: "该文件为“核心运行时”提供 `units` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/unitSet/units.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：units.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/unitSet/units.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：104 行
- 文件标识：`623c78073185`

## 2. 功能说明

该文件为“核心运行时”提供 `units` 相关接口、模板实例或支撑定义。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Useful unit conversions

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
2. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`unitSet.H`](../../../04-core-runtime/files/77/unitset.h--77f7e224a598.md)
- [`dimensions.H`](../../../04-core-runtime/files/d1/dimensions.h--d19970332f34.md)

## 8. 直接上层引用

- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/shapeToCell/shapeToCell.C](../../../03-utilities/files/f2/shapetocell.c--f2e52511ef7c.md)
- [applications/utilities/mesh/conversion/star3ToFoam/createCoupleMatches.C](../../../03-utilities/files/5e/createcouplematches.c--5e6ac1aeff35.md)
- [applications/utilities/miscellaneous/foamUnits/foamUnits.C](../../../03-utilities/files/7a/foamunits.c--7aac5f6a65c9.md)
- [etc/codeTemplates/dynamicCode/codeBlockTemplate.C](../../../15-build-config/files/b9/codeblocktemplate.c--b9323c83281c.md)
- [etc/codeTemplates/dynamicCode/codeDictTemplate.C](../../../15-build-config/files/c4/codedicttemplate.c--c40ee504164b.md)
- [etc/codeTemplates/dynamicCode/codeStreamTemplate.C](../../../15-build-config/files/89/codestreamtemplate.c--896b82f52767.md)
- [src/conversion/mergedCyclic/polyMeshUnMergeCyclics.C](../../../17-other-libraries/files/ae/polymeshunmergecyclics.c--ae0858b59589.md)
- [src/conversion/mergedCyclic/polyMeshUnMergeCyclics.H](../../../17-other-libraries/files/e5/polymeshunmergecyclics.h--e51b53a417d6.md)
- [src/fvAgglomerationMethods/pairPatchAgglomeration/pairPatchAgglomeration.C](../../../17-other-libraries/files/f7/pairpatchagglomeration.c--f724f340d622.md)
- [src/fvMeshMovers/multiValveEngine/crankConnectingRodMotion/crankConnectingRodMotionI.H](../../../07-mesh-geometry/files/f0/crankconnectingrodmotioni.h--f041fe1f8869.md)
- [src/fvModels/rotorDisk/bladeModel/bladeModel.C](../../../12-boundaries-sources/files/4a/blademodel.c--4a2ca24f2f85.md)
- [src/fvModels/rotorDisk/profileModel/lookup/lookupProfile.C](../../../12-boundaries-sources/files/40/lookupprofile.c--402be03b03bb.md)
- [src/mesh/blockMesh/blockEdges/arcEdge/arcEdge.C](../../../07-mesh-geometry/files/7b/arcedge.c--7bd2a06f38fc.md)
- [src/mesh/extrudeModel/sector/sector.C](../../../07-mesh-geometry/files/d4/sector.c--d4a13a6453d1.md)
- [src/mesh/snappyHexMesh/snappyHexMeshDriver/refinementParameters/refinementParameters.C](../../../07-mesh-geometry/files/58/refinementparameters.c--584a7b4d8398.md)
- [src/meshCheck/checkMesh.C](../../../07-mesh-geometry/files/0e/checkmesh.c--0e479bed3dde.md)
- [src/meshCheck/polyMeshCheck/polyMeshCheck.C](../../../07-mesh-geometry/files/2f/polymeshcheck.c--2fa821308a75.md)
- [src/meshCheck/primitiveMeshCheck/primitiveMeshCheck.C](../../../07-mesh-geometry/files/a8/primitivemeshcheck.c--a878a4281bd5.md)
- [src/meshTools/coordinateSystems/coordinateRotation/EulerCoordinateRotation.C](../../../07-mesh-geometry/files/b5/eulercoordinaterotation.c--b52ae1495055.md)
- [src/meshTools/coordinateSystems/coordinateRotation/STARCDCoordinateRotation.C](../../../07-mesh-geometry/files/6b/starcdcoordinaterotation.c--6b3a39baacb0.md)
- [src/meshTools/patchToPatch/intersection/intersectionPatchToPatch.C](../../../07-mesh-geometry/files/20/intersectionpatchtopatch.c--2064c5b95444.md)
- [src/meshTools/searchableSurfaces/triSurface/triSurface_searchableSurface.H](../../../07-mesh-geometry/files/ca/trisurface_searchablesurface.h--ca970ec6510f.md)
- [src/meshTools/triIntersect/triIntersect.C](../../../07-mesh-geometry/files/3b/triintersect.c--3b14a506a7d4.md)
- [src/meshTools/triSurface/booleanOps/surfaceIntersection/edgeIntersections.C](../../../07-mesh-geometry/files/3f/edgeintersections.c--3f68c996b844.md)
- [src/meshTools/triSurface/surfaceFeatures/surfaceFeatures.C](../../../07-mesh-geometry/files/40/surfacefeatures.c--409c4c20d58e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
