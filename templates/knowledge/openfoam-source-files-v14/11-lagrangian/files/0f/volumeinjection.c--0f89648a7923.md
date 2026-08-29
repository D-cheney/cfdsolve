---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0f89648a7923"
title: "OpenFOAM 14 源码解析：volumeInjection.C"
summary: "该文件实现 `readCoeffs`、`correct`、`modify`、`topoChange` 等过程，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/volumeInjection/volumeInjection.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：volumeInjection.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/volumeInjection/volumeInjection.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：371 行
- 文件标识：`0f89648a7923`

## 2. 功能说明

该文件实现 `readCoeffs`、`correct`、`modify`、`topoChange` 等过程，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::Lagrangian::volumeInjection::readCoeffs` | 51 |
| `Foam::Lagrangian::volumeInjection::correct` | 107 |
| `Foam::Lagrangian::volumeInjection::modify` | 126 |
| `Foam::Lagrangian::volumeInjection::topoChange` | 318 |
| `Foam::Lagrangian::volumeInjection::mapMesh` | 324 |
| `Foam::Lagrangian::volumeInjection::distribute` | 330 |
| `Foam::Lagrangian::volumeInjection::read` | 339 |
| `Foam::Lagrangian::volumeInjection::writeState` | 353 |
| `Foam::Lagrangian::volumeInjection::writeProcessorState` | 361 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **分布式映射**：依据全局到局部寻址重排和交换数据。
5. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
6. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`volumeInjection.H`](../../../11-lagrangian/files/90/volumeinjection.h--90774d0310b7.md)
- [`CompactListList.H`](../../../04-core-runtime/files/00/compactlistlist.h--009109c57c35.md)
- [`LagrangianFields.H`](../../../11-lagrangian/files/0e/lagrangianfields.h--0e720ce1f457.md)
- [`tetIndices.H`](../../../04-core-runtime/files/e2/tetindices.h--e2e4720916dd.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
