---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8abbb58f95c6"
title: "OpenFOAM 14 源码解析：patchToPatch.C"
summary: "该文件实现 `patchToPatch` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/patchToPatch/patchToPatch/patchToPatch.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：patchToPatch.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/patchToPatch/patchToPatch/patchToPatch.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1116 行
- 文件标识：`8abbb58f95c6`

## 2. 功能说明

该文件实现 `patchToPatch` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `findNotIndex` | 66 |
| `Foam::patchToPatch::srcBox` | 101 |
| `Foam::patchToPatch::tgtBox` | 147 |
| `Foam::patchToPatch::findOrIntersectFaces` | 185 |
| `Foam::patchToPatch::intersectPatchQueue` | 235 |
| `Foam::patchToPatch::intersectPatches` | 377 |
| `Foam::patchToPatch::initialise` | 643 |
| `Foam::patchToPatch::finaliseLocal` | 665 |
| `Foam::patchToPatch::distributeSrc` | 713 |
| `Foam::patchToPatch::rDistributeTgt` | 728 |
| `Foam::patchToPatch::finalise` | 740 |
| `Foam::patchToPatch::New` | 790 |
| `Foam::patchToPatch::srcCoupled` | 815 |
| `Foam::patchToPatch::tgtCoupled` | 825 |
| `Foam::patchToPatch::srcTgtProcFaces` | 836 |
| `Foam::patchToPatch::tgtSrcProcFaces` | 850 |
| `Foam::patchToPatch::update` | 864 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`patchToPatch.H`](../../../07-mesh-geometry/files/08/patchtopatch.h--08d6ca742155.md)
- [`patchToPatchTools.H`](../../../07-mesh-geometry/files/84/patchtopatchtools.h--84e4c229c681.md)
- [`cpuTime.H`](../../../17-other-libraries/files/df/cputime.h--df3d0ebfb092.md)
- [`distributionMap.H`](../../../04-core-runtime/files/2c/distributionmap.h--2c72c12e6e17.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)
- [`indexedOctree.H`](../../../04-core-runtime/files/9d/indexedoctree.h--9dbfd26d8444.md)
- [`treeDataPrimitivePatch.H`](../../../07-mesh-geometry/files/5b/treedataprimitivepatch.h--5bdd9b7eadd0.md)
- [`vtkWritePolyData.H`](../../../17-other-libraries/files/6a/vtkwritepolydata.h--6a3da474f0d3.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
