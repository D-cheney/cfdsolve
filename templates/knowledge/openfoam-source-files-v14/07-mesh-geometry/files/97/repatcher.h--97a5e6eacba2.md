---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-97a5e6eacba2"
title: "OpenFOAM 14 源码解析：repatcher.H"
summary: "该文件声明或实现 `polyTopoChange`、`repatcher`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/repatcher/repatcher.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：repatcher.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/repatcher/repatcher.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：130 行
- 文件标识：`97a5e6eacba2`

## 2. 功能说明

该文件声明或实现 `polyTopoChange`、`repatcher`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：A mesh which allows changes in the patch distribution of the boundary faces. The change in patching is set using changePatchID. For a boundary face, a new patch ID is given.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyTopoChange` | 52 |
| `repatcher` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)

## 8. 直接上层引用

- [applications/utilities/mesh/conversion/fluentMeshToFoam/fluentMeshToFoam.L](../../../03-utilities/files/f9/fluentmeshtofoam.l--f90afb563c29.md)
- [applications/utilities/mesh/conversion/gmshToFoam/gmshToFoam.C](../../../03-utilities/files/91/gmshtofoam.c--91b485a68f20.md)
- [applications/utilities/mesh/manipulation/autoPatch/autoPatch.C](../../../03-utilities/files/93/autopatch.c--93ed3396d158.md)
- [src/polyTopoChange/repatcher/repatcher.C](../../../07-mesh-geometry/files/f5/repatcher.c--f5c8d3744600.md)
- [src/polyTopoChange/repatchMesh/repatchMesh.C](../../../07-mesh-geometry/files/08/repatchmesh.c--08f523f11680.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
