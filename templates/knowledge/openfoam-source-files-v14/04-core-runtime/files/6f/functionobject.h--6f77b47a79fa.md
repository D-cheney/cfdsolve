---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6f77b47a79fa"
title: "OpenFOAM 14 源码解析：functionObject.H"
summary: "该文件声明或实现 `Time`、`polyMesh`、`polyTopoChangeMap`、`polyMeshMap`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/db/functionObjects/functionObject/functionObject.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：functionObject.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/db/functionObjects/functionObject/functionObject.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：292 行
- 文件标识：`6f77b47a79fa`

## 2. 功能说明

该文件声明或实现 `Time`、`polyMesh`、`polyTopoChangeMap`、`polyMeshMap`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Namespace for functionObjects. OpenFOAM includes a collection of functionObjects selected by the user at run-time to manipulate the simulation and provide mechanisms to extract field and derived quantities. Alternatively, the same actions can be executed after the simulation using the \c -postProcess command-line option. functionObjects are selected by entries in the \&#36;FOAM_CASE/system/functions dictionary e.g. to select the \c functionObjectType functionObject the following entry would be specified: \verbatim <functionObjectName> { type functionObjectType; libs ("libMyFunctionObjectlib.so"); region defaultRegion; enabled yes; startTime 0; endTime 10; writeControl writeTime; writeInterval 1; ... } \endverbatim Where: \table Property | Description | Required | Default value type | Type of functionObject | yes | libs | Shared libraries | no | region | Name of region | no | enabled | On/off 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Time` | 137 |
| `polyMesh` | 138 |
| `polyTopoChangeMap` | 139 |
| `polyMeshMap` | 140 |
| `polyDistributionMap` | 141 |
| `functionObject` | 146 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [src/functionObjects/utilities/codedFunctionObject/codedFunctionObject.H](../../../14-postprocessing/files/fa/codedfunctionobject.h--fa3074bd94a7.md)
- [src/functionObjects/utilities/removeObjects/removeObjects.H](../../../14-postprocessing/files/cd/removeobjects.h--cdbca783a283.md)
- [src/functionObjects/utilities/setTimeStep/setTimeStepFunctionObject.H](../../../14-postprocessing/files/12/settimestepfunctionobject.h--121071fdf8e0.md)
- [src/functionObjects/utilities/setWriteInterval/setWriteIntervalFunctionObject.H](../../../14-postprocessing/files/fe/setwriteintervalfunctionobject.h--fe6e5731322f.md)
- [src/functionObjects/utilities/stopAt/stopAt.H](../../../14-postprocessing/files/b0/stopat.h--b0a945f045ce.md)
- [src/functionObjects/utilities/systemCall/systemCall.H](../../../14-postprocessing/files/12/systemcall.h--125e47f0e151.md)
- [src/functionObjects/utilities/timeActivatedFileUpdate/timeActivatedFileUpdate.H](../../../14-postprocessing/files/6f/timeactivatedfileupdate.h--6f9989e582e1.md)
- [src/functionObjects/utilities/writeDictionary/writeDictionary.H](../../../14-postprocessing/files/0b/writedictionary.h--0b63b9bc0cde.md)
- [src/functionObjects/utilities/writeObjects/writeObjects.H](../../../14-postprocessing/files/d5/writeobjects.h--d5a0dd36cd0c.md)
- [src/Lagrangian/cloudFunctionObjects/cloudBoundaryCollisionFlux/cloudBoundaryCollisionFlux.C](../../../11-lagrangian/files/c5/cloudboundarycollisionflux.c--c5cf38f6d719.md)
- [src/Lagrangian/cloudFunctionObjects/cloudSurfaceDistribution/cloudSurfaceDistribution.C](../../../11-lagrangian/files/91/cloudsurfacedistribution.c--91bc7c79fdda.md)
- [src/lagrangian/parcel/submodels/CloudFunctionObjects/CloudFunctionObjectList/CloudFunctionObjectList.C](../../../11-lagrangian/files/a0/cloudfunctionobjectlist.c--a0c41eff6798.md)
- [src/OpenFOAM/db/functionObjects/functionObject/functionObject.C](../../../04-core-runtime/files/aa/functionobject.c--aa44523a9f93.md)
- [src/OpenFOAM/db/functionObjects/functionObjectList/functionObjectList.H](../../../04-core-runtime/files/b3/functionobjectlist.h--b3f12fc1a44c.md)
- [src/OpenFOAM/db/functionObjects/objectRegistryFunctionObject/objectRegistryFunctionObject.H](../../../04-core-runtime/files/d8/objectregistryfunctionobject.h--d8f24b4a7833.md)
- [src/OpenFOAM/db/functionObjects/timeControl/timeControlFunctionObject.H](../../../04-core-runtime/files/55/timecontrolfunctionobject.h--55d967f2048b.md)
- [src/sampling/probes/probes.H](../../../14-postprocessing/files/25/probes.h--25febaa2eebc.md)

## 9. 运行时机制

`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
