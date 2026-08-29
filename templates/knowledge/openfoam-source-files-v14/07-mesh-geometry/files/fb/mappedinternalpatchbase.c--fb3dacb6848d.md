---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fb3dacb6848d"
title: "OpenFOAM 14 源码解析：mappedInternalPatchBase.C"
summary: "该文件实现 `mappedInternalPatchBase` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/mappedPatches/mappedInternalPatchBase/mappedInternalPatchBase.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：mappedInternalPatchBase.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/mappedPatches/mappedInternalPatchBase/mappedInternalPatchBase.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：502 行
- 文件标识：`fb3dacb6848d`

## 2. 功能说明

该文件实现 `mappedInternalPatchBase` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::mappedInternalPatchBase::readOffsetMode` | 58 |
| `Foam::mappedInternalPatchBase::calcMapping` | 89 |
| `Foam::mappedInternalPatchBase::mappedInternalPatchBase` | 302 |
| `Foam::mappedInternalPatchBase::nbrMesh` | 376 |
| `Foam::mappedInternalPatchBase::samplePoints` | 384 |
| `Foam::mappedInternalPatchBase::clearOut` | 459 |
| `Foam::mappedInternalPatchBase::specified` | 466 |
| `Foam::mappedInternalPatchBase::write` | 476 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
5. **分布式映射**：依据全局到局部寻址重排和交换数据。
6. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
7. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
8. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
9. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`mappedInternalPatchBase.H`](../../../07-mesh-geometry/files/15/mappedinternalpatchbase.h--15ccf2937d62.md)
- [`SubField.H`](../../../04-core-runtime/files/82/subfield.h--82a0cf10f077.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`triPointRef.H`](../../../04-core-runtime/files/b0/tripointref.h--b095b5632b50.md)
- [`meshSearch.H`](../../../07-mesh-geometry/files/49/meshsearch.h--49ea9d1012c2.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)
- [`RemoteData.H`](../../../04-core-runtime/files/dc/remotedata.h--dc6e94947e1d.md)
- [`OBJstream.H`](../../../17-other-libraries/files/7d/objstream.h--7ddc3b439962.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
