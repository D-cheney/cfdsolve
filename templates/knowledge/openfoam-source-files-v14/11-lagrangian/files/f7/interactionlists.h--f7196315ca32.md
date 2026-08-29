---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f7196315ca32"
title: "OpenFOAM 14 源码解析：InteractionLists.H"
summary: "该文件声明或实现 `globalIndexAndTransform`、`distributionMap`、`InteractionLists`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/basic/InteractionLists/InteractionLists.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：InteractionLists.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/basic/InteractionLists/InteractionLists.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：332 行
- 文件标识：`f7196315ca32`

## 2. 功能说明

该文件声明或实现 `globalIndexAndTransform`、`distributionMap`、`InteractionLists`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Builds direct interaction list, specifying which local (real) cells are potentially in range of each other. Builds referred interaction list, specifying which cells are required to provide interactions across coupled patches (cyclic or processor). Generates referred cells, and refers particles to the correct processor, applying the appropriate transform. Simultaneous communication and computation is possible using: \verbatim PstreamBuffers pBufs(Pstream::commsTypes::nonBlocking); label startOfRequests = Pstream::nRequests(); il_.sendReferredData(cellOccupancy_, pBufs); // Do other things il_.receiveReferredData(pBufs, startOfRequests); \endverbatim Requiring data: \verbatim List<DynamicList<typename CloudType::parcelType*>> cellOccupancy_; \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `globalIndexAndTransform` | 77 |
| `distributionMap` | 79 |
| `InteractionLists` | 84 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`referredWallFace.H`](../../../11-lagrangian/files/d3/referredwallface.h--d309a890a048.md)
- [`InteractionListsI.H`](../../../11-lagrangian/files/5d/interactionlistsi.h--5d1f5ae4bbf7.md)
- [`InteractionLists.C`](../../../11-lagrangian/files/87/interactionlists.c--874f365d76ac.md)

## 8. 直接上层引用

- [src/lagrangian/basic/InteractionLists/InteractionLists.C](../../../11-lagrangian/files/87/interactionlists.c--874f365d76ac.md)
- [src/lagrangian/molecularDynamics/moleculeCloud/moleculeCloud.H](../../../11-lagrangian/files/45/moleculecloud.h--4594a6062d01.md)
- [src/lagrangian/parcel/submodels/Momentum/CollisionModel/PairCollision/PairCollision.H](../../../11-lagrangian/files/14/paircollision.h--14b01160923e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
