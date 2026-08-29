---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-15ccf2937d62"
title: "OpenFOAM 14 源码解析：mappedInternalPatchBase.H"
summary: "该文件声明或实现 `mappedInternalPatchBase`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/mappedPatches/mappedInternalPatchBase/mappedInternalPatchBase.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：mappedInternalPatchBase.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/mappedPatches/mappedInternalPatchBase/mappedInternalPatchBase.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：235 行
- 文件标识：`15ccf2937d62`

## 2. 功能说明

该文件声明或实现 `mappedInternalPatchBase`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Engine which provides mapping from cells to patch faces Example: \verbatim // The name of the region to map from. Optional. Defaults to the same // region as the patch. neighbourRegion region0; // How to offset the patch face centres to the sampling locations. // Optional. This will be inferred if there is a single entry of either // "distance" or "offset". // - normal : distance along the patch face normals // - direction : specified offset vector offsetMode direction; // If offsetMode is normal : The normal distance to offset distance 1; // If offsetMode is direction : The offset vector offset (1 0 0); \endverbatim Note that patch normals point outward, so if offsetMode is \c normal then a negative distance will be required in order to map values from inside the region.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `mappedInternalPatchBase` | 79 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`polyBoundaryMesh.H`](../../../04-core-runtime/files/55/polyboundarymesh.h--55eed959a136.md)
- [`distributionMap.H`](../../../04-core-runtime/files/2c/distributionmap.h--2c72c12e6e17.md)
- [`mappedInternalPatchBaseI.H`](../../../07-mesh-geometry/files/0a/mappedinternalpatchbasei.h--0a5b000635c7.md)
- [`mappedInternalPatchBaseTemplates.C`](../../../07-mesh-geometry/files/8f/mappedinternalpatchbasetemplates.c--8f1b701354d7.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/derived/mappedInternalValue/mappedInternalValueFvPatchField.H](../../../05-finite-volume/files/b0/mappedinternalvaluefvpatchfield.h--b0a98c0ff813.md)
- [src/meshTools/mappedPatches/mappedInternalPatchBase/mappedInternalPatchBase.C](../../../07-mesh-geometry/files/fb/mappedinternalpatchbase.c--fb3dacb6848d.md)
- [src/meshTools/mappedPatches/mappedInternalPatchBase/mappedInternalPatchBaseI.H](../../../07-mesh-geometry/files/0a/mappedinternalpatchbasei.h--0a5b000635c7.md)
- [src/meshTools/mappedPatches/mappedInternalPatchBase/mappedInternalPatchBaseTemplates.C](../../../07-mesh-geometry/files/8f/mappedinternalpatchbasetemplates.c--8f1b701354d7.md)
- [src/meshTools/mappedPatches/mappedInternalPolyPatch/mappedInternalPolyPatch.H](../../../07-mesh-geometry/files/37/mappedinternalpolypatch.h--37ae69875212.md)
- [src/sampling/sampledSurface/sampledPatchInternalField/sampledPatchInternalField.H](../../../14-postprocessing/files/29/sampledpatchinternalfield.h--295a7b7c8616.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
