---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-21174970bfb6"
title: "OpenFOAM 14 源码解析：polyMeshAdder.C"
summary: "该文件实现 `patchIndex`、`zoneIndex`、`mergePatchNames`、`getPatchStarts` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/polyTopoChange/polyMeshAdder/polyMeshAdder.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：polyMeshAdder.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/polyTopoChange/polyMeshAdder/polyMeshAdder.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1557 行
- 文件标识：`21174970bfb6`

## 2. 功能说明

该文件实现 `patchIndex`、`zoneIndex`、`mergePatchNames`、`getPatchStarts` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::polyMeshAdder::patchIndex` | 41 |
| `Foam::polyMeshAdder::zoneIndex` | 92 |
| `Foam::polyMeshAdder::mergePatchNames` | 112 |
| `Foam::polyMeshAdder::getPatchStarts` | 161 |
| `Foam::polyMeshAdder::getPatchSizes` | 175 |
| `Foam::polyMeshAdder::getFaceOrder` | 189 |
| `Foam::polyMeshAdder::mergePrimitives` | 288 |
| `Foam::polyMeshAdder::mergePointZones` | 566 |
| `Foam::polyMeshAdder::mergeFaceZones` | 701 |
| `Foam::polyMeshAdder::mergeCellZones` | 969 |
| `Foam::polyMeshAdder::mergeZones` | 1099 |
| `Foam::polyMeshAdder::addZones` | 1172 |
| `Foam::polyMeshAdder::add` | 1246 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`polyMeshAdder.H`](../../../07-mesh-geometry/files/60/polymeshadder.h--608adcc819e3.md)
- [`mapAddedPolyMesh.H`](../../../04-core-runtime/files/d5/mapaddedpolymesh.h--d59e480f86b3.md)
- [`faceCoupleInfo.H`](../../../07-mesh-geometry/files/df/facecoupleinfo.h--df292cd099f2.md)
- [`processorPolyPatch.H`](../../../04-core-runtime/files/42/processorpolypatch.h--42c8af29a130.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
