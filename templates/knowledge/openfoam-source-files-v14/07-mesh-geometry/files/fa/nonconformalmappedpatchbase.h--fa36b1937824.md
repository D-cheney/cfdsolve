---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fa36b1937824"
title: "OpenFOAM 14 源码解析：nonConformalMappedPatchBase.H"
summary: "该文件声明或实现 `nonConformalMappedPatchBase`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/mappedPatches/nonConformalMappedPatchBase/nonConformalMappedPatchBase.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：nonConformalMappedPatchBase.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/mappedPatches/nonConformalMappedPatchBase/nonConformalMappedPatchBase.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：159 行
- 文件标识：`fa36b1937824`

## 2. 功能说明

该文件声明或实现 `nonConformalMappedPatchBase`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base class for poly patches which provides non-conformal mapping between two potentially non-globally conforming poly patches

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `nonConformalMappedPatchBase` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`nonConformalPolyPatch.H`](../../../07-mesh-geometry/files/50/nonconformalpolypatch.h--50e688b5a483.md)
- [`mappedPatchBaseBase.H`](../../../07-mesh-geometry/files/c4/mappedpatchbasebase.h--c48652abe0f8.md)
- [`intersectionPatchToPatch.H`](../../../07-mesh-geometry/files/90/intersectionpatchtopatch.h--9042a418eb9f.md)
- [`nonConformalMappedPatchBaseI.H`](../../../07-mesh-geometry/files/da/nonconformalmappedpatchbasei.h--da0c3132156d.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/fvPatches/derived/nonConformalMapped/nonConformalMappedFvPatchBase.H](../../../05-finite-volume/files/82/nonconformalmappedfvpatchbase.h--829dc642f81f.md)
- [src/meshTools/mappedPatches/nonConformalMappedPatchBase/nonConformalMappedPatchBase.C](../../../07-mesh-geometry/files/93/nonconformalmappedpatchbase.c--936962021374.md)
- [src/meshTools/mappedPatches/nonConformalMappedPatchBase/nonConformalMappedPatchBaseI.H](../../../07-mesh-geometry/files/da/nonconformalmappedpatchbasei.h--da0c3132156d.md)
- [src/meshTools/mappedPatches/nonConformalMappedPolyPatch/nonConformalMappedWallPolyPatch.H](../../../07-mesh-geometry/files/d5/nonconformalmappedwallpolypatch.h--d5607ab7b676.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
