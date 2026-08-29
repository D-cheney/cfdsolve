---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-eb99d93dd128"
title: "OpenFOAM 14 源码解析：mappedExtrudedPatchBase.C"
summary: "该文件实现 `mappedExtrudedPatchBase` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/mappedPatches/mappedExtrudedPatchBase/mappedExtrudedPatchBase.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：mappedExtrudedPatchBase.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/mappedPatches/mappedExtrudedPatchBase/mappedExtrudedPatchBase.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：420 行
- 文件标识：`eb99d93dd128`

## 2. 功能说明

该文件实现 `mappedExtrudedPatchBase` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::mappedExtrudedPatchBase::patchFaceAreas` | 53 |
| `Foam::mappedExtrudedPatchBase::patchFaceCentres` | 180 |
| `Foam::mappedExtrudedPatchBase::patchLocalPoints` | 197 |
| `Foam::mappedExtrudedPatchBase::clearOut` | 349 |
| `Foam::mappedExtrudedPatchBase::mappedExtrudedPatchBase` | 367 |
| `Foam::mappedExtrudedPatchBase::write` | 412 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`mappedExtrudedPatchBase.H`](../../../07-mesh-geometry/files/d2/mappedextrudedpatchbase.h--d2fbfbbec8e7.md)
- [`LayerInfoData.H`](../../../07-mesh-geometry/files/22/layerinfodata.h--2252772f9dd2.md)
- [`PointEdgeLayerInfoData.H`](../../../07-mesh-geometry/files/6d/pointedgelayerinfodata.h--6d6254649786.md)
- [`FaceCellWave.H`](../../../07-mesh-geometry/files/bd/facecellwave.h--bd59a3288282.md)
- [`PointEdgeWave.H`](../../../07-mesh-geometry/files/45/pointedgewave.h--45e0dd02efd6.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
