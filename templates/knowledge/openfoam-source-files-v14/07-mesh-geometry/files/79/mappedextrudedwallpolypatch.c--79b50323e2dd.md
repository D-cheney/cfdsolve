---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-79b50323e2dd"
title: "OpenFOAM 14 源码解析：mappedExtrudedWallPolyPatch.C"
summary: "该文件实现 `calcGeometry`、`movePoints`、`topoChange`、`mappedExtrudedWallPolyPatch` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/mappedPatches/mappedExtrudedPolyPatch/mappedExtrudedWallPolyPatch.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：mappedExtrudedWallPolyPatch.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/mappedPatches/mappedExtrudedPolyPatch/mappedExtrudedWallPolyPatch.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：189 行
- 文件标识：`79b50323e2dd`

## 2. 功能说明

该文件实现 `calcGeometry`、`movePoints`、`topoChange`、`mappedExtrudedWallPolyPatch` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::mappedExtrudedWallPolyPatch::calcGeometry` | 52 |
| `Foam::mappedExtrudedWallPolyPatch::movePoints` | 58 |
| `Foam::mappedExtrudedWallPolyPatch::topoChange` | 69 |
| `Foam::mappedExtrudedWallPolyPatch::mappedExtrudedWallPolyPatch` | 98 |
| `Foam::mappedExtrudedWallPolyPatch::write` | 181 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`mappedExtrudedWallPolyPatch.H`](../../../07-mesh-geometry/files/2a/mappedextrudedwallpolypatch.h--2ad88790372c.md)
- [`mappedPolyPatch.H`](../../../07-mesh-geometry/files/78/mappedpolypatch.h--788631340ba9.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
