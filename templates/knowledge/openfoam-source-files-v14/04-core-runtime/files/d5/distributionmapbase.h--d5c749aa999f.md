---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d5c749aa999f"
title: "OpenFOAM 14 源码解析：distributionMapBase.H"
summary: "该文件声明或实现 `globalIndex`、`PstreamBuffers`、`distributionMapBase`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/polyMesh/polyDistributionMap/distributionMapBase.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：distributionMapBase.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/polyMesh/polyDistributionMap/distributionMapBase.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：491 行
- 文件标识：`d5c749aa999f`

## 2. 功能说明

该文件声明或实现 `globalIndex`、`PstreamBuffers`、`distributionMapBase`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Class containing processor-to-processor mapping information. We store mapping from the bits-to-send to the complete starting list (subXXXMap) and from the received bits to their location in the new list (constructXXXMap). Schedule is a list of processor pairs (one send, one receive. One of them will be myself) which forms a scheduled (i.e. non-buffered) exchange. See distribute on how to use it. Note2: number of items sent on one processor have to equal the number of items received on the other processor. To aid constructing these maps there are the constructors from global numbering, either with or without transforms. Constructors using compact numbering: layout is - all my own elements first (whether used or not) - followed by used-only remote elements sorted by remote processor. So e.g 4 procs and on proc 1 the compact table will first have all globalIndex.localSize() elements from pr

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `globalIndex` | 87 |
| `PstreamBuffers` | 89 |
| `distributionMapBase` | 92 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `constructSize` | 260 |
| `subHasFlip` | 296 |
| `constructHasFlip` | 308 |

## 5. 算法与控制流程

1. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
2. **分布式映射**：依据全局到局部寻址重排和交换数据。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`labelList.H`](../../../04-core-runtime/files/41/labellist.h--41b123186884.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)
- [`Pstream.H`](../../../04-core-runtime/files/2f/pstream.h--2f930fcee072.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`Map.H`](../../../04-core-runtime/files/c2/map.h--c28df8ad8150.md)
- [`distributionMapBaseTemplates.C`](../../../04-core-runtime/files/ed/distributionmapbasetemplates.c--ed998208103c.md)

## 8. 直接上层引用

- [src/OpenFOAM/meshes/polyMesh/polyDistributionMap/distributionMap.H](../../../04-core-runtime/files/2c/distributionmap.h--2c72c12e6e17.md)
- [src/OpenFOAM/meshes/polyMesh/polyDistributionMap/distributionMapBase.C](../../../04-core-runtime/files/c7/distributionmapbase.c--c785509db497.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
