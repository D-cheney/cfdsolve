---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7c9a3fafaf91"
title: "OpenFOAM 14 源码解析：polyMeshFilter.H"
summary: "该文件声明或实现 `polyMesh`、`fvMesh`、`PackedBoolList`、`faceSet`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyMeshFilter/polyMeshFilter.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：polyMeshFilter.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyMeshFilter/polyMeshFilter.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：284 行
- 文件标识：`7c9a3fafaf91`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`fvMesh`、`PackedBoolList`、`faceSet`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Remove the edges and faces of a polyMesh whilst satisfying the given mesh quality criteria. Works on a copy of the mesh.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 59 |
| `fvMesh` | 61 |
| `PackedBoolList` | 62 |
| `faceSet` | 63 |
| `polyMeshFilter` | 68 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`List.H`](../../../04-core-runtime/files/af/list.h--af8268cb7768.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`polyMeshFilterSettings.H`](../../../07-mesh-geometry/files/e4/polymeshfiltersettings.h--e49f0cadddf6.md)
- [`polyMeshFilterTemplates.C`](../../../07-mesh-geometry/files/ae/polymeshfiltertemplates.c--aebb614d7cdb.md)

## 8. 直接上层引用

- [applications/utilities/mesh/advanced/collapseEdges/collapseEdges.C](../../../03-utilities/files/48/collapseedges.c--485ee63a7a94.md)
- [src/polyTopoChange/polyMeshFilter/polyMeshFilter.C](../../../07-mesh-geometry/files/24/polymeshfilter.c--2463bb1c6022.md)
- [src/polyTopoChange/polyMeshFilter/polyMeshFilterTemplates.C](../../../07-mesh-geometry/files/ae/polymeshfiltertemplates.c--aebb614d7cdb.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
