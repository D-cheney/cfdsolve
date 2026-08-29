---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-273aef43a3a9"
title: "OpenFOAM 14 源码解析：decompositionMethod.H"
summary: "该文件声明或实现 `decompositionMethod`，属于“并行与域分解”模块。"
category: { slug: openfoam-v14-13-parallel, name: OpenFOAM 源码 · 并行与域分解 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.H"
tags: [OpenFOAM14, 源码解析, 并行与域分解]
---

# OpenFOAM 14 源码解析：decompositionMethod.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.H`
- 功能分类：并行与域分解
- 文件类型：C/C++ 或词法/语法源文件
- 规模：360 行
- 文件标识：`273aef43a3a9`

## 2. 功能说明

该文件声明或实现 `decompositionMethod`，属于“并行与域分解”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Abstract base class for decomposition

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `decompositionMethod` | 55 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `nDomains` | 149 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`CompactListList.H`](../../../04-core-runtime/files/00/compactlistlist.h--009109c57c35.md)
- [`decompositionConstraint.H`](../../../13-parallel/files/68/decompositionconstraint.h--689aa2af9dad.md)
- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)

## 8. 直接上层引用

- [applications/utilities/mesh/generation/snappyHexMesh/snappyHexMesh.C](../../../03-utilities/files/18/snappyhexmesh.c--1856be2e0ca1.md)
- [applications/utilities/mesh/manipulation/renumberMesh/renumberMesh.C](../../../03-utilities/files/f3/renumbermesh.c--f30a3a4012f2.md)
- [applications/utilities/parallelProcessing/decomposePar/decomposePar.C](../../../03-utilities/files/f3/decomposepar.c--f319bc3bd2cc.md)
- [applications/utilities/parallelProcessing/redistributePar/redistributePar.C](../../../03-utilities/files/34/redistributepar.c--3437e376b409.md)
- [applications/utilities/preProcessing/mapFields/mapFields.C](../../../03-utilities/files/72/mapfields.c--724ee5a8bd6d.md)
- [src/fvMeshDistributors/distributor/distributor_fvMeshDistributor.C](../../../17-other-libraries/files/ec/distributor_fvmeshdistributor.c--ec9239b703e0.md)
- [src/fvMeshDistributors/loadBalancer/loadBalancer_fvMeshDistributor.C](../../../17-other-libraries/files/27/loadbalancer_fvmeshdistributor.c--2743614737e7.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinement.C](../../../07-mesh-geometry/files/38/meshrefinement.c--3812c4bc1bde.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementRefine.C](../../../07-mesh-geometry/files/31/meshrefinementrefine.c--31acf059fb90.md)
- [src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.C](../../../13-parallel/files/c1/decompositionmethod.c--c1194bcc0467.md)
- [src/parallel/decompose/decompositionMethods/geometric/geometric.H](../../../13-parallel/files/71/geometric.h--71cb1412a9ec.md)
- [src/parallel/decompose/decompositionMethods/manual/manual.H](../../../13-parallel/files/8f/manual.h--8f970d4e1a5f.md)
- [src/parallel/decompose/decompositionMethods/multiLevel/multiLevel.H](../../../13-parallel/files/0f/multilevel.h--0f94f75ae009.md)
- [src/parallel/decompose/decompositionMethods/none/none.H](../../../13-parallel/files/3d/none.h--3d41ecdc10ee.md)
- [src/parallel/decompose/decompositionMethods/random/random.H](../../../13-parallel/files/e6/random.h--e685465d54aa.md)
- [src/parallel/decompose/decompositionMethods/structured/structured.H](../../../13-parallel/files/b2/structured.h--b2d2f30a6140.md)
- [src/parallel/decompose/metis/metis.H](../../../13-parallel/files/9e/metis.h--9e9125c7513a.md)
- [src/parallel/decompose/parMetis/parMetis.H](../../../13-parallel/files/8c/parmetis.h--8ca833f641fa.md)
- [src/parallel/decompose/ptscotch/ptscotch.H](../../../13-parallel/files/dd/ptscotch.h--dd21a3cd67b3.md)
- [src/parallel/decompose/scotch/scotch.H](../../../13-parallel/files/e8/scotch.h--e87cfedbf0fc.md)
- [src/parallel/decompose/zoltan/zoltan.H](../../../13-parallel/files/fd/zoltan.h--fdb4978baee3.md)
- [src/parallel/distributed/distributedTriSurface/distributedTriSurface.C](../../../13-parallel/files/09/distributedtrisurface.c--093e592e90f2.md)
- [src/parallel/parallel/domainDecomposition/domainDecomposition.C](../../../13-parallel/files/5d/domaindecomposition.c--5d422484b2f9.md)
- [src/parallel/parallel/domainDecomposition/domainDecompositionDecompose.C](../../../13-parallel/files/74/domaindecompositiondecompose.c--74995da3bf3c.md)
- [src/parallel/parallel/processorRunTimes/processorRunTimes.C](../../../13-parallel/files/0a/processorruntimes.c--0ae870d9f67d.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
