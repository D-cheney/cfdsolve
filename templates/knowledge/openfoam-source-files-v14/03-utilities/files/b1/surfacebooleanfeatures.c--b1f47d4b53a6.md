---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b1f47d4b53a6"
title: "OpenFOAM 14 源码解析：surfaceBooleanFeatures.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `surfaceBooleanFeatures` 对应的工作流。"
category: { slug: openfoam-v14-03-utilities, name: OpenFOAM 源码 · 前后处理工具 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/utilities/surface/surfaceBooleanFeatures/surfaceBooleanFeatures.C"
tags: [OpenFOAM14, 源码解析, 前后处理工具]
---

# OpenFOAM 14 源码解析：surfaceBooleanFeatures.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/utilities/surface/surfaceBooleanFeatures/surfaceBooleanFeatures.C`
- 功能分类：前后处理工具
- 文件类型：C/C++ 或词法/语法源文件
- 规模：811 行
- 文件标识：`b1f47d4b53a6`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `surfaceBooleanFeatures` 对应的工作流。

中文导航角色：命令行工具。

上游说明：Generates the extendedFeatureEdgeMesh for the interface between a boolean operation on two surfaces. Assumes that the orientation of the surfaces is correct: - if the operation is union or intersection, that both surface's normals (n) have the same orientation with respect to a point, i.e. surfaces and b are orientated the same with respect to point x: @verbatim _______ | |--> n | ___|___ x |a | | |--> n |___|___| b| | | |_______| @endverbatim - if the operation is a subtraction, the surfaces should be oppositely oriented with respect to a point, i.e. for (a - b), then b's orientation should be such that x is "inside", and a's orientation such that x is "outside" @verbatim _______ | |--> n | ___|___ x |a | | | |___|___| b| | n <--| |_______| @endverbatim When the operation is performed - for union, all of the edges generates where one surfaces cuts another are all "internal" for union, a

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `intersectSurfaces` | 92 |
| `calcNormalDirection` | 290 |
| `calcEdgeCuts` | 313 |
| `calcFeaturePoints` | 361 |
| `main` | 399 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
4. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`triSurface.H`](../../../07-mesh-geometry/files/64/trisurface.h--64b575996c2b.md)
- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`featureEdgeMesh.H`](../../../07-mesh-geometry/files/44/featureedgemesh.h--443991504bdd.md)
- [`extendedFeatureEdgeMesh.H`](../../../07-mesh-geometry/files/df/extendedfeatureedgemesh.h--df811ff315e9.md)
- [`triSurfaceSearch.H`](../../../07-mesh-geometry/files/3d/trisurfacesearch.h--3de7b601fda8.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`booleanSurface.H`](../../../07-mesh-geometry/files/55/booleansurface.h--55297f811b8b.md)
- [`edgeIntersections.H`](../../../07-mesh-geometry/files/82/edgeintersections.h--82a2ef190be3.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)
- [`setRootCase.H`](../../../04-core-runtime/files/95/setrootcase.h--95a4d6ea30cd.md)
- [`createTime.H`](../../../04-core-runtime/files/ff/createtime.h--ff253fee129e.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 main() 追踪输入字典、网格/场操作和写出结果。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
