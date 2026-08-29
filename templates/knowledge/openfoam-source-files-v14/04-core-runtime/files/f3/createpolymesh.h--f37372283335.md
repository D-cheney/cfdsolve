---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f37372283335"
title: "OpenFOAM 14 源码解析：createPolyMesh.H"
summary: "该文件为“核心运行时”提供 `createPolyMesh` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/include/createPolyMesh.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：createPolyMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/include/createPolyMesh.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：20 行
- 文件标识：`f37372283335`

## 2. 功能说明

该文件为“核心运行时”提供 `createPolyMesh` 相关接口、模板实例或支撑定义。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- 未检测到直接 `#include`；脚本/清单或自包含实现可能通过环境和命令产生依赖。

## 8. 直接上层引用

- [applications/test/globalIndex/Test-globalIndex.C](../../../17-other-libraries/files/ff/test-globalindex.c--ffcf3fa16899.md)
- [applications/test/globalMeshData/Test-globalMeshData.C](../../../17-other-libraries/files/58/test-globalmeshdata.c--58e9c0f472e3.md)
- [applications/test/IOField/Test-IOField.C](../../../17-other-libraries/files/03/test-iofield.c--039ecd3d306d.md)
- [applications/test/momentOfInertia/Test-momentOfInertia.C](../../../17-other-libraries/files/d8/test-momentofinertia.c--d85164ec9181.md)
- [applications/test/patchIntersection/Test-patchIntersection.C](../../../17-other-libraries/files/fb/test-patchintersection.c--fb833ec12328.md)
- [applications/test/patchRegion/Test-patchRegion.C](../../../17-other-libraries/files/aa/test-patchregion.c--aa21ce819eaf.md)
- [applications/test/PointEdgeWave/Test-PointEdgeWave.C](../../../17-other-libraries/files/74/test-pointedgewave.c--74af733b923f.md)
- [applications/test/primitivePatch/Test-PrimitivePatch.C](../../../17-other-libraries/files/6e/test-primitivepatch.c--6ef97f8ca655.md)
- [applications/test/syncTools/Test-syncTools.C](../../../17-other-libraries/files/ba/test-synctools.c--ba97f85aa4b8.md)
- [applications/utilities/mesh/advanced/combinePatchFaces/combinePatchFaces.C](../../../03-utilities/files/b5/combinepatchfaces.c--b574ad8fad04.md)
- [applications/utilities/mesh/advanced/refinementLevel/refinementLevel.C](../../../03-utilities/files/35/refinementlevel.c--35272bfd7625.md)
- [applications/utilities/mesh/advanced/selectCells/selectCells.C](../../../03-utilities/files/2d/selectcells.c--2d96d40d84b3.md)
- [applications/utilities/mesh/advanced/splitCells/splitCells.C](../../../03-utilities/files/2f/splitcells.c--2f7c73e3ee10.md)
- [applications/utilities/mesh/conversion/foamToStarMesh/foamToStarMesh.C](../../../03-utilities/files/5b/foamtostarmesh.c--5bfe13a3aae9.md)
- [applications/utilities/mesh/conversion/foamToSurface/foamToSurface.C](../../../03-utilities/files/20/foamtosurface.c--2031c32d7bf6.md)
- [applications/utilities/mesh/manipulation/autoPatch/autoPatch.C](../../../03-utilities/files/93/autopatch.c--93ed3396d158.md)
- [applications/utilities/mesh/manipulation/insideCells/insideCells.C](../../../03-utilities/files/b6/insidecells.c--b6207b6e1d03.md)
- [applications/utilities/surface/surfaceRedistributePar/surfaceRedistributePar.C](../../../03-utilities/files/5c/surfaceredistributepar.c--5c7950ca913c.md)
- [applications/utilities/surface/surfaceToPatch/surfaceToPatch.C](../../../03-utilities/files/ed/surfacetopatch.c--edf5bace5e40.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
