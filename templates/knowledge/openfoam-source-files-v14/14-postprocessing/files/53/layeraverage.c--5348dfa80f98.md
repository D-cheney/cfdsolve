---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5348dfa80f98"
title: "OpenFOAM 14 源码解析：layerAverage.C"
summary: "该文件实现 `layerAverage` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/layerAverage/layerAverage.C"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：layerAverage.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/layerAverage/layerAverage.C`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：445 行
- 文件标识：`5348dfa80f98`

## 2. 功能说明

该文件实现 `layerAverage` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：运行时后处理功能对象。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::functionObjects::layerAverage::calcLayers` | 58 |
| `Foam::functionObjects::layerAverage::weight` | 146 |
| `Foam::functionObjects::layerAverage::read` | 244 |
| `Foam::functionObjects::layerAverage::fields` | 289 |
| `Foam::functionObjects::layerAverage::execute` | 297 |
| `Foam::functionObjects::layerAverage::write` | 303 |
| `Foam::functionObjects::layerAverage::movePoints` | 401 |
| `Foam::functionObjects::layerAverage::topoChange` | 410 |
| `Foam::functionObjects::layerAverage::mapMesh` | 422 |
| `Foam::functionObjects::layerAverage::distribute` | 431 |

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

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`layerAverage.H`](../../../14-postprocessing/files/37/layeraverage.h--372c4b588e61.md)
- [`FaceCellWave.H`](../../../07-mesh-geometry/files/bd/facecellwave.h--bd59a3288282.md)
- [`layerInfo.H`](../../../07-mesh-geometry/files/86/layerinfo.h--86ae9a73dd4a.md)
- [`regionSplit.H`](../../../07-mesh-geometry/files/ed/regionsplit.h--edd42622f90b.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`writeFile.H`](../../../04-core-runtime/files/d7/writefile.h--d7223fd9462f.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`polyMeshMap.H`](../../../04-core-runtime/files/6a/polymeshmap.h--6a11015fe40b.md)
- [`polyDistributionMap.H`](../../../04-core-runtime/files/1d/polydistributionmap.h--1d3a143688db.md)
- [`OSspecific.H`](../../../04-core-runtime/files/da/osspecific.h--da601f5103a9.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
