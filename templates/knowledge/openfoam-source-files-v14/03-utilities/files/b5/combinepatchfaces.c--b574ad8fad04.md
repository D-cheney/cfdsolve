---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b574ad8fad04"
title: "OpenFOAM 14 源码解析：combinePatchFaces.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `combinePatchFaces` 对应的工作流。"
category: { slug: openfoam-v14-03-utilities, name: OpenFOAM 源码 · 前后处理工具 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/utilities/mesh/advanced/combinePatchFaces/combinePatchFaces.C"
tags: [OpenFOAM14, 源码解析, 前后处理工具]
---

# OpenFOAM 14 源码解析：combinePatchFaces.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/utilities/mesh/advanced/combinePatchFaces/combinePatchFaces.C`
- 功能分类：前后处理工具
- 文件类型：C/C++ 或词法/语法源文件
- 规模：410 行
- 文件标识：`b574ad8fad04`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `combinePatchFaces` 对应的工作流。

中文导航角色：命令行工具。

上游说明：Checks for multiple patch faces on same cell and combines them. Multiple patch faces can result from e.g. removal of refined neighbouring cells, leaving 4 exposed faces with same owner. Rules for merging: - only boundary faces (since multiple internal faces between two cells not allowed anyway) - faces have to have same owner - faces have to be connected via edge which are not features (so angle between them < feature angle) - outside of faces has to be single loop - outside of face should not be (or just slightly) concave (so angle between consecutive edges < concaveangle E.g. to allow all faces on same patch to be merged: combinePatchFaces 180 -concaveAngle 90

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `mergePatchFaces` | 69 |
| `mergeEdges` | 251 |
| `main` | 288 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
7. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
8. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`PstreamReduceOps.H`](../../../04-core-runtime/files/ca/pstreamreduceops.h--ca44c1f2f0ec.md)
- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`polyTopoChange.H`](../../../07-mesh-geometry/files/7e/polytopochange.h--7e1293697b62.md)
- [`combineFaces.H`](../../../07-mesh-geometry/files/09/combinefaces.h--0959404597ee.md)
- [`removePoints.H`](../../../07-mesh-geometry/files/db/removepoints.h--db2e62bb9c83.md)
- [`meshCheck.H`](../../../07-mesh-geometry/files/f6/meshcheck.h--f6f053d57a2b.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`addNoOverwriteOption.H`](../../../04-core-runtime/files/d0/addnooverwriteoption.h--d0a24e2e4479.md)
- [`setRootCaseNoFunctionObjects.H`](../../../04-core-runtime/files/35/setrootcasenofunctionobjects.h--35560131a2b9.md)
- [`createTimeNoFunctionObjects.H`](../../../04-core-runtime/files/d6/createtimenofunctionobjects.h--d6a6b5bb62ad.md)
- [`createPolyMesh.H`](../../../04-core-runtime/files/f3/createpolymesh.h--f37372283335.md)
- [`setNoOverwrite.H`](../../../04-core-runtime/files/f5/setnooverwrite.h--f5704f71f9f2.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 main() 追踪输入字典、网格/场操作和写出结果。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
