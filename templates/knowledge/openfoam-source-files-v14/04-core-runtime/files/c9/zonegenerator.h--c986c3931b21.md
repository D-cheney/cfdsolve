---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c986c3931b21"
title: "OpenFOAM 14 源码解析：zoneGenerator.H"
summary: "该文件声明或实现 `polyMesh`、`zoneGenerator`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/zoneGeneration/zoneGenerator/zoneGenerator.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：zoneGenerator.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/zoneGeneration/zoneGenerator/zoneGenerator.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：207 行
- 文件标识：`c986c3931b21`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`zoneGenerator`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Abstract base class for all zoneGenerators, providing runtime selection

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 57 |
| `zoneGenerator` | 62 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `moveUpdate` | 180 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`zoneSet.H`](../../../04-core-runtime/files/52/zoneset.h--52a0c7c91354.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/utilities/mesh/manipulation/createPatch/createPatch.C](../../../03-utilities/files/14/createpatch.c--140367ac7497.md)
- [applications/utilities/mesh/manipulation/refineMesh/refineMesh.C](../../../03-utilities/files/1f/refinemesh.c--1f4ab1528bf7.md)
- [applications/utilities/mesh/manipulation/subsetMesh/subsetMesh.C](../../../03-utilities/files/05/subsetmesh.c--05905647986f.md)
- [applications/utilities/preProcessing/setFields/setFields.C](../../../03-utilities/files/12/setfields.c--12b6d848c9dd.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/Zonal/Zonal_DimensionedFieldFunction.C](../../../05-finite-volume/files/68/zonal_dimensionedfieldfunction.c--68d5b24be46a.md)
- [src/finiteVolume/fields/fvPatchFields/DimensionedFvPatchFieldFunctions/Zonal/Zonal_DimensionedFvPatchFieldFunction.C](../../../05-finite-volume/files/85/zonal_dimensionedfvpatchfieldfunction.c--851c19c82c04.md)
- [src/functionObjects/utilities/generateZone/generateZone.H](../../../14-postprocessing/files/c3/generatezone.h--c360b77b556f.md)
- [src/meshTools/zoneGenerators/coded/coded_zoneGenerator.H](../../../07-mesh-geometry/files/5f/coded_zonegenerator.h--5f154a9bc032.md)
- [src/meshTools/zoneGenerators/set/set.H](../../../07-mesh-geometry/files/cf/set.h--cf7f17557129.md)
- [src/OpenFOAM/meshes/zoneGeneration/generatedZoneSet/generatedZoneSet.H](../../../04-core-runtime/files/f5/generatedzoneset.h--f5e80032abc4.md)
- [src/OpenFOAM/meshes/zoneGeneration/zoneGenerator/zoneGenerator.C](../../../04-core-runtime/files/77/zonegenerator.c--77fae105ff24.md)
- [src/OpenFOAM/meshes/zoneGeneration/zoneGeneratorList/zoneGeneratorList.H](../../../04-core-runtime/files/bd/zonegeneratorlist.h--bd64ff9f8c01.md)
- [src/parallel/parallel/domainDecomposition/domainDecompositionReconstruct.C](../../../13-parallel/files/13/domaindecompositionreconstruct.c--136ad4cfc719.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
