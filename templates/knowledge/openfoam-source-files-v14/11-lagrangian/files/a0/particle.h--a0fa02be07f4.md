---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a0fa02be07f4"
title: "OpenFOAM 14 源码解析：particle.H"
summary: "该文件声明或实现 `particle`、`polyPatch`、`meshSearch`、`cyclicPolyPatch`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/basic/particle/particle.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：particle.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/basic/particle/particle.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：615 行
- 文件标识：`a0fa02be07f4`

## 2. 功能说明

该文件声明或实现 `particle`、`polyPatch`、`meshSearch`、`cyclicPolyPatch`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base particle class

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `particle` | 60 |
| `polyPatch` | 61 |
| `meshSearch` | 63 |
| `cyclicPolyPatch` | 65 |
| `processorPolyPatch` | 67 |
| `symmetryPlanePolyPatch` | 68 |
| `symmetryPolyPatch` | 69 |
| `wallPolyPatch` | 70 |
| `wedgePolyPatch` | 71 |
| `trackingData` | 103 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`vector.H`](../../../04-core-runtime/files/64/vector.h--64124691b98b.md)
- [`barycentric.H`](../../../04-core-runtime/files/73/barycentric.h--73a3eee32d92.md)
- [`barycentricTensor.H`](../../../04-core-runtime/files/f5/barycentrictensor.h--f54ca07506de.md)
- [`IDLList.H`](../../../04-core-runtime/files/38/idllist.h--38575faace5d.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`faceList.H`](../../../04-core-runtime/files/bc/facelist.h--bc39a0876345.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`tetPointRef.H`](../../../04-core-runtime/files/07/tetpointref.h--0775a6ebfe8f.md)
- [`FixedList.H`](../../../04-core-runtime/files/56/fixedlist.h--5633be515ee5.md)
- [`polyMeshTetDecomposition.H`](../../../04-core-runtime/files/35/polymeshtetdecomposition.h--3533db67d602.md)
- [`particleMacros.H`](../../../11-lagrangian/files/d8/particlemacros.h--d88e0ee1680e.md)
- [`transformer.H`](../../../04-core-runtime/files/a9/transformer.h--a93fc1ec30f1.md)
- [`particleI.H`](../../../11-lagrangian/files/3c/particlei.h--3c6a9350785d.md)
- [`particleTemplates.C`](../../../11-lagrangian/files/73/particletemplates.c--73e94845b546.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
