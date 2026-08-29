---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-61996101b57a"
title: "OpenFOAM 14 源码解析：fvMeshDistribute.H"
summary: "该文件声明或实现 `mapAddedPolyMesh`、`polyDistributionMap`、`fvMeshDistribute`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/fvMeshDistribute/fvMeshDistribute.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：fvMeshDistribute.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/fvMeshDistribute/fvMeshDistribute.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：420 行
- 文件标识：`61996101b57a`

## 2. 功能说明

该文件声明或实现 `mapAddedPolyMesh`、`polyDistributionMap`、`fvMeshDistribute`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Sends/receives parts of mesh+fvfields to neighbouring processors. Used in load balancing. Input is per local cell the processor it should move to. Moves meshes and volFields/surfaceFields and returns map which can be used to distribute other. Notes: - does not handle cyclics. Will probably handle separated proc patches. - if all cells move off processor also all its processor patches will get deleted so comms might be screwed up (since e.g. globalMeshData expects procPatches on all) - initial mesh has to have procPatches last and all normal patches common to all processors and in the same order. This is checked. - faces are matched topologically but points on the faces are not. So expect problems -on separated patches (cyclics?) -on zero sized processor edges.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `mapAddedPolyMesh` | 70 |
| `polyDistributionMap` | 71 |
| `fvMeshDistribute` | 76 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvMeshSubset.H`](../../../07-mesh-geometry/files/b7/fvmeshsubset.h--b7de83bdcd75.md)
- [`FieldField.H`](../../../04-core-runtime/files/d7/fieldfield.h--d75661a0c8b1.md)
- [`fvMeshDistributeTemplates.C`](../../../07-mesh-geometry/files/4a/fvmeshdistributetemplates.c--4ab7e479b463.md)

## 8. 直接上层引用

- [applications/utilities/mesh/generation/snappyHexMesh/snappyHexMesh.C](../../../03-utilities/files/18/snappyhexmesh.c--1856be2e0ca1.md)
- [applications/utilities/parallelProcessing/redistributePar/redistributePar.C](../../../03-utilities/files/34/redistributepar.c--3437e376b409.md)
- [src/fvMeshDistributors/distributor/distributor_fvMeshDistributor.C](../../../17-other-libraries/files/ec/distributor_fvmeshdistributor.c--ec9239b703e0.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C](../../../07-mesh-geometry/files/38/meshrefinement.c--3812c4bc1bde.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementRefine.C](../../../07-mesh-geometry/files/31/meshrefinementrefine.c--31acf059fb90.md)
- [src/polyTopoChange/fvMeshDistribute/fvMeshDistribute.C](../../../07-mesh-geometry/files/e6/fvmeshdistribute.c--e642c27347c1.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
