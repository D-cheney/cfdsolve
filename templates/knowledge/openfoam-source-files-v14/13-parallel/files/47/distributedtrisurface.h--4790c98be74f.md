---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4790c98be74f"
title: "OpenFOAM 14 源码解析：distributedTriSurface.H"
summary: "该文件声明或实现 `distributionMap`、`decompositionMethod`、`distributedTriSurface`、`typeGlobal`，属于“并行与域分解”模块。"
category: { slug: openfoam-v14-13-parallel, name: OpenFOAM 源码 · 并行与域分解 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/parallel/distributed/distributedTriSurface/distributedTriSurface.H"
tags: [OpenFOAM14, 源码解析, 并行与域分解]
---

# OpenFOAM 14 源码解析：distributedTriSurface.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/parallel/distributed/distributedTriSurface/distributedTriSurface.H`
- 功能分类：并行与域分解
- 文件类型：C/C++ 或词法/语法源文件
- 规模：506 行
- 文件标识：`4790c98be74f`

## 2. 功能说明

该文件声明或实现 `distributionMap`、`decompositionMethod`、`distributedTriSurface`、`typeGlobal`，属于“并行与域分解”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：IOoject and searching on distributed triSurface. All processor hold (possibly overlapping) part of the overall surface. All queries are distributed to the processor that can answer it and the result sent back. Can work in three modes: - follow : makes sure each processor has all the triangles inside the externally provided bounding box (usually the mesh bounding box). Guarantees minimum amount of communication since mesh-local queries should be answerable without any comms. - independent : surface is decomposed according to the triangle centres so the decomposition might be radically different from the mesh decomposition. Guarantees best memory balance but at the expense of more communication. - frozen : no change

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `distributionMap` | 66 |
| `decompositionMethod` | 68 |
| `distributedTriSurface` | 81 |
| `typeGlobal` | 489 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`triSurface_searchableSurface.H`](../../../07-mesh-geometry/files/ca/trisurface_searchablesurface.h--ca970ec6510f.md)
- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`Pair.H`](../../../04-core-runtime/files/38/pair.h--38986855df5f.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)
- [`distributedTriSurfaceTemplates.C`](../../../13-parallel/files/95/distributedtrisurfacetemplates.c--95c6e38297a0.md)

## 8. 直接上层引用

- [applications/utilities/preProcessing/viewFactorsGen/viewFactorsGen.C](../../../03-utilities/files/3f/viewfactorsgen.c--3fe0599b649e.md)
- [applications/utilities/surface/surfaceRedistributePar/surfaceRedistributePar.C](../../../03-utilities/files/5c/surfaceredistributepar.c--5c7950ca913c.md)
- [src/parallel/distributed/distributedTriSurface/distributedTriSurface.C](../../../13-parallel/files/09/distributedtrisurface.c--093e592e90f2.md)
- [src/parallel/distributed/distributedTriSurface/distributedTriSurfaceTemplates.C](../../../13-parallel/files/95/distributedtrisurfacetemplates.c--95c6e38297a0.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
