---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-de9a0e0cf733"
title: "OpenFOAM 14 源码解析：FacePatchIntersection.C"
summary: "该文件实现 `inplaceRemove` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/patchIntersection/FacePatchIntersection.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：FacePatchIntersection.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/patchIntersection/FacePatchIntersection.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：565 行
- 文件标识：`de9a0e0cf733`

## 2. 功能说明

该文件实现 `inplaceRemove` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `inplaceRemove` | 45 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`FacePatchIntersection.H`](../../../07-mesh-geometry/files/24/facepatchintersection.h--2402a5059222.md)
- [`cpuTime.H`](../../../17-other-libraries/files/df/cputime.h--df3d0ebfb092.md)
- [`primitiveTriPatch.H`](../../../07-mesh-geometry/files/61/primitivetripatch.h--61749ad53c94.md)
- [`polygonTriangulate.H`](../../../04-core-runtime/files/01/polygontriangulate.h--018fe609d8e0.md)
- [`TriPatchIntersection.H`](../../../07-mesh-geometry/files/63/tripatchintersection.h--63ca4d3b8d5d.md)
- [`vtkWritePolyData.H`](../../../17-other-libraries/files/6a/vtkwritepolydata.h--6a3da474f0d3.md)

## 8. 直接上层引用

- [src/meshTools/patchIntersection/FacePatchIntersection.H](../../../07-mesh-geometry/files/24/facepatchintersection.h--2402a5059222.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
