---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-08f523f11680"
title: "OpenFOAM 14 源码解析：repatchMesh.C"
summary: "该文件实现 `nFeatureEdges`、`nextFeatureEdge`、`collectSegment`、`faceToEdge` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/repatchMesh/repatchMesh.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：repatchMesh.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/repatchMesh/repatchMesh.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1328 行
- 文件标识：`08f523f11680`

## 2. 功能说明

该文件实现 `nFeatureEdges`、`nextFeatureEdge`、`collectSegment`、`faceToEdge` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::repatchMesh::nFeatureEdges` | 61 |
| `Foam::repatchMesh::nextFeatureEdge` | 81 |
| `Foam::repatchMesh::collectSegment` | 111 |
| `Foam::repatchMesh::faceToEdge` | 200 |
| `Foam::repatchMesh::edgeToFace` | 237 |
| `Foam::repatchMesh::markZone` | 273 |
| `Foam::repatchMesh::read` | 353 |
| `Foam::repatchMesh::readTriSurface` | 478 |
| `Foam::repatchMesh::getNearest` | 656 |
| `Foam::repatchMesh::setFeatureEdges` | 909 |
| `Foam::repatchMesh::whichPatch` | 1110 |
| `Foam::repatchMesh::findIndex` | 1131 |
| `Foam::repatchMesh::addPatch` | 1145 |
| `Foam::repatchMesh::deletePatch` | 1182 |
| `Foam::repatchMesh::changePatchType` | 1237 |
| `Foam::repatchMesh::markFaces` | 1288 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`repatchMesh.H`](../../../07-mesh-geometry/files/7d/repatchmesh.h--7dffdfb07b26.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`repatcher.H`](../../../07-mesh-geometry/files/97/repatcher.h--97a5e6eacba2.md)
- [`faceList.H`](../../../04-core-runtime/files/bc/facelist.h--bc39a0876345.md)
- [`indexedOctree.H`](../../../04-core-runtime/files/9d/indexedoctree.h--9dbfd26d8444.md)
- [`treeDataPrimitivePatch.H`](../../../07-mesh-geometry/files/5b/treedataprimitivepatch.h--5bdd9b7eadd0.md)
- [`triSurface.H`](../../../07-mesh-geometry/files/64/trisurface.h--64b575996c2b.md)
- [`SortableList.H`](../../../04-core-runtime/files/67/sortablelist.h--6730cee0ba96.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`uindirectPrimitivePatch.H`](../../../04-core-runtime/files/83/uindirectprimitivepatch.h--83d2b2e55ca1.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
