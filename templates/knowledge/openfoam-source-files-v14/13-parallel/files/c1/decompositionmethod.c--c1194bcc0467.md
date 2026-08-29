---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c1194bcc0467"
title: "OpenFOAM 14 源码解析：decompositionMethod.C"
summary: "该文件实现 `decompositionMethod` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-13-parallel, name: OpenFOAM 源码 · 并行与域分解 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.C"
tags: [OpenFOAM14, 源码解析, 并行与域分解]
---

# OpenFOAM 14 源码解析：decompositionMethod.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.C`
- 功能分类：并行与域分解
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1294 行
- 文件标识：`c1194bcc0467`

## 2. 功能说明

该文件实现 `decompositionMethod` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::decompositionMethod::nWeights` | 59 |
| `Foam::decompositionMethod::checkWeights` | 81 |
| `Foam::decompositionMethod::NewDecomposer` | 141 |
| `Foam::decompositionMethod::NewDistributor` | 193 |
| `Foam::decompositionMethod::decomposeParDict` | 246 |
| `Foam::decompositionMethod::decompose` | 263 |
| `Foam::decompositionMethod::scaleWeights` | 347 |
| `Foam::decompositionMethod::calcCellCells` | 461 |
| `Foam::decompositionMethod::setConstraints` | 1186 |
| `Foam::decompositionMethod::applyConstraints` | 1215 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`decompositionMethod.H`](../../../13-parallel/files/27/decompositionmethod.h--273aef43a3a9.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`Tuple2.H`](../../../04-core-runtime/files/ab/tuple2.h--ab8ee5c9d4ce.md)
- [`faceSet.H`](../../../07-mesh-geometry/files/f3/faceset.h--f3dc94c0b8ee.md)
- [`regionSplit.H`](../../../07-mesh-geometry/files/ed/regionsplit.h--edd42622f90b.md)
- [`localPointRegion.H`](../../../07-mesh-geometry/files/31/localpointregion.h--312b3d9c79c5.md)
- [`minData.H`](../../../07-mesh-geometry/files/20/mindata.h--2014dc2e136d.md)
- [`FaceCellWave.H`](../../../07-mesh-geometry/files/bd/facecellwave.h--bd59a3288282.md)
- [`preserveBafflesConstraint.H`](../../../13-parallel/files/c1/preservebafflesconstraint.h--c1a04a51fe0b.md)
- [`preservePatchesConstraint.H`](../../../13-parallel/files/31/preservepatchesconstraint.h--312db0a3b263.md)
- [`preserveFaceZonesConstraint.H`](../../../13-parallel/files/db/preservefacezonesconstraint.h--db8427a4e53b.md)
- [`singleProcessorFaceSetsConstraint.H`](../../../13-parallel/files/82/singleprocessorfacesetsconstraint.h--829c9d71b3b1.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
