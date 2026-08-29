---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9a25d496f593"
title: "OpenFOAM 14 源码解析：polyDualMesh.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `polyDualMesh` 对应的工作流。"
category: { slug: openfoam-v14-03-utilities, name: OpenFOAM 源码 · 前后处理工具 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/utilities/mesh/manipulation/polyDualMesh/polyDualMesh.C"
tags: [OpenFOAM14, 源码解析, 前后处理工具]
---

# OpenFOAM 14 源码解析：polyDualMesh.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/utilities/mesh/manipulation/polyDualMesh/polyDualMesh.C`
- 功能分类：前后处理工具
- 文件类型：C/C++ 或词法/语法源文件
- 规模：531 行
- 文件标识：`9a25d496f593`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `polyDualMesh` 对应的工作流。

中文导航角色：命令行工具。

上游说明：Calculates the dual of a polyMesh. Adheres to all the feature and patch edges. Usage \b polyDualMesh featureAngle Detects any boundary edge > angle and creates multiple boundary faces for it. Normal behaviour is to have each point become a cell (1.5 behaviour) Options: - \par -concaveMultiCells Creates multiple cells for each point on a concave edge. Might limit the amount of distortion on some meshes. - \par -splitAllFaces Normally only constructs a single face between two cells. This single face might be too distorted. splitAllFaces will create a single face for every original cell the face passes through. The mesh will thus have multiple faces in between two cells! (so is not strictly upper-triangular anymore - checkMesh will complain) - \par -doNotPreserveFaceZones: By default all faceZones are preserved by marking all faces, edges and points on them as features. The -doNotPreserveFa

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `simpleMarkFeatures` | 84 |
| `dumpFeatures` | 304 |
| `main` | 356 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`PackedBoolList.H`](../../../04-core-runtime/files/6e/packedboollist.h--6eaf5d33f077.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`meshDualiser.H`](../../../03-utilities/files/0e/meshdualiser.h--0eadd36a4c88.md)
- [`addNoOverwriteOption.H`](../../../04-core-runtime/files/d0/addnooverwriteoption.h--d0a24e2e4479.md)
- [`addRegionOption.H`](../../../04-core-runtime/files/66/addregionoption.h--664ec312024d.md)
- [`addMeshOption.H`](../../../04-core-runtime/files/48/addmeshoption.h--48b8995f1bc8.md)
- [`setRootCase.H`](../../../04-core-runtime/files/95/setrootcase.h--95a4d6ea30cd.md)
- [`createTime.H`](../../../04-core-runtime/files/ff/createtime.h--ff253fee129e.md)
- [`createSpecifiedMeshNoChangers.H`](../../../04-core-runtime/files/0b/createspecifiedmeshnochangers.h--0b56025f66d4.md)
- [`setNoOverwrite.H`](../../../04-core-runtime/files/f5/setnooverwrite.h--f5704f71f9f2.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 main() 追踪输入字典、网格/场操作和写出结果。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
