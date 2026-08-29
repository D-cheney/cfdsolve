---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-372c4b588e61"
title: "OpenFOAM 14 源码解析：layerAverage.H"
summary: "该文件声明或实现 `layerAverage`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/layerAverage/layerAverage.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：layerAverage.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/layerAverage/layerAverage.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：288 行
- 文件标识：`372c4b588e61`

## 2. 功能说明

该文件声明或实现 `layerAverage`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：This function object writes graphs of cell values, volume-averaged in the layers of cells in the mesh. The layers are defined by a set of patches or zones. Between these patches and/or zones the mesh must be perfectly layered; i.e., every cell must be a prism for which the base polygon is topologically similar to the corresponding face on the patch or zone. If the mesh is not layered in this way, then consider using the \c cutLayerAverage function instead. Patches can be used to define the start of the layers and hence the beginning of the graph. E.g.: \verbatim Patch <--|| 1 | 2 | 3 | ... ||---------+---------+---------+---- <--|| 1 | 2 | 3 | ... ||---------+---------+---------+---- <--|| 1 | 2 | 3 | ... \endverbatim Zones can define either the start or the end of the layers, depending on the zones' orientations. Layers will be enumerated in the same way as for a patch; i.e., they will 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `layerAverage` | 137 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`setWriter.H`](../../../14-postprocessing/files/3e/setwriter.h--3e6489c3a3dd.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`layerAverageTemplates.C`](../../../14-postprocessing/files/bd/layeraveragetemplates.c--bde5ee68a36b.md)

## 8. 直接上层引用

- [src/functionObjects/field/layerAverage/layerAverage.C](../../../14-postprocessing/files/53/layeraverage.c--5348dfa80f98.md)
- [src/functionObjects/field/layerAverage/layerAverageTemplates.C](../../../14-postprocessing/files/bd/layeraveragetemplates.c--bde5ee68a36b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
