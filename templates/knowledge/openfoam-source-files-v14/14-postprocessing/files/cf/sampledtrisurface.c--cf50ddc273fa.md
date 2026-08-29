---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cf50ddc273fa"
title: "OpenFOAM 14 源码解析：sampledTriSurface.C"
summary: "该文件实现 `sampledTriSurface` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/sampling/sampledSurface/sampledTriSurface/sampledTriSurface.C"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：sampledTriSurface.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/sampling/sampledSurface/sampledTriSurface/sampledTriSurface.C`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：706 行
- 文件标识：`cf50ddc273fa`

## 2. 功能说明

该文件实现 `sampledTriSurface` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `nearestEqOp` | 68 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `operator` | 73 |
| `Foam::sampledSurfaces::triSurface::nonCoupledboundaryTree` | 99 |
| `Foam::sampledSurfaces::triSurface::triSurface` | 181 |
| `Foam::sampledSurfaces::triSurface::needsUpdate` | 248 |
| `Foam::sampledSurfaces::triSurface::update` | 253 |
| `Foam::sampledSurfaces::triSurface::movePoints` | 664 |
| `Foam::sampledSurfaces::triSurface::topoChange` | 677 |
| `Foam::sampledSurfaces::triSurface::mapMesh` | 683 |
| `Foam::sampledSurfaces::triSurface::distribute` | 689 |
| `Foam::sampledSurfaces::triSurface::print` | 695 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
5. **分布式映射**：依据全局到局部寻址重排和交换数据。
6. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
7. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
8. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
9. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
10. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`sampledTriSurface.H`](../../../14-postprocessing/files/a9/sampledtrisurface.h--a98919b9aff6.md)
- [`meshSearch.H`](../../../07-mesh-geometry/files/49/meshsearch.h--49ea9d1012c2.md)
- [`treeDataFace.H`](../../../07-mesh-geometry/files/f2/treedataface.h--f251014e6a64.md)
- [`pointInCell.H`](../../../04-core-runtime/files/d9/pointincell.h--d9affa609114.md)
- [`OBJstream.H`](../../../17-other-libraries/files/7d/objstream.h--7ddc3b439962.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`、`addBackwardCompatibleToRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
