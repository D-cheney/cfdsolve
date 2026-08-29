---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fb57e8a46cc8"
title: "OpenFOAM 14 源码解析：meshDualiser.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `meshDualiser` 对应的工作流。"
category: { slug: openfoam-v14-03-utilities, name: OpenFOAM 源码 · 前后处理工具 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/utilities/mesh/manipulation/polyDualMesh/meshDualiser.C"
tags: [OpenFOAM14, 源码解析, 前后处理工具]
---

# OpenFOAM 14 源码解析：meshDualiser.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/utilities/mesh/manipulation/polyDualMesh/meshDualiser.C`
- 功能分类：前后处理工具
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1322 行
- 文件标识：`fb57e8a46cc8`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `meshDualiser` 对应的工作流。

中文导航角色：命令行工具。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::meshDualiser::dumpPolyTopoChange` | 51 |
| `Foam::meshDualiser::findDualCell` | 92 |
| `Foam::meshDualiser::generateDualBoundaryEdges` | 113 |
| `Foam::meshDualiser::sameDualCell` | 145 |
| `Foam::meshDualiser::addInternalFace` | 163 |
| `Foam::meshDualiser::addBoundaryFace` | 235 |
| `Foam::meshDualiser::createFacesAroundEdge` | 278 |
| `Foam::meshDualiser::createFaceFromInternalFace` | 447 |
| `Foam::meshDualiser::createFacesAroundBoundaryPoint` | 545 |
| `Foam::meshDualiser::setRefinement` | 775 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`meshDualiser.H`](../../../03-utilities/files/0e/meshdualiser.h--0eadd36a4c88.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`edgeFaceCirculator.H`](../../../07-mesh-geometry/files/68/edgefacecirculator.h--68c600e08b69.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

从 main() 追踪输入字典、网格/场操作和写出结果。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
