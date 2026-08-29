---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f319bc3bd2cc"
title: "OpenFOAM 14 源码解析：decomposePar.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `decomposePar` 对应的工作流。"
category: { slug: openfoam-v14-03-utilities, name: OpenFOAM 源码 · 前后处理工具 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/utilities/parallelProcessing/decomposePar/decomposePar.C"
tags: [OpenFOAM14, 源码解析, 前后处理工具]
---

# OpenFOAM 14 源码解析：decomposePar.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/utilities/parallelProcessing/decomposePar/decomposePar.C`
- 功能分类：前后处理工具
- 文件类型：C/C++ 或词法/语法源文件
- 规模：876 行
- 文件标识：`f319bc3bd2cc`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `decomposePar` 对应的工作流。

中文导航角色：命令行工具。

上游说明：Automatically decomposes a mesh and fields of a case for parallel execution of OpenFOAM. Usage \b decomposePar [OPTION] Options: - \par -cellProc Write cell processor indices as a volScalarField::Internal for post-processing. - \par -region \<regionName\> \n Decompose named region. Does not check for existence of processor*. - \par -allRegions \n Decompose all regions in regionSolvers. Does not check for existence of processor*. - \par -copyZero \n Copy \a 0 directory to processor* rather than decompose the fields. - \par -copyUniform \n Copy any \a uniform directories too. - \par -constant Decompose mesh and fields in the constant directory. - \par -time xxx:yyy \n Override controlDict settings and decompose selected times. - \par -fields \n Use existing geometry decomposition and convert fields only. - \par -noSets \n Skip decomposing cellSets, faceSets, pointSets. - \par -force \n Rem

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `delayedNewLine` | 200 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `haveUniform` | 93 |
| `decomposeUniform` | 106 |
| `writeDecomposition` | 165 |
| `main` | 224 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
6. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`timeSelector.H`](../../../04-core-runtime/files/92/timeselector.h--928367fb3c5d.md)
- [`IOobjectList.H`](../../../04-core-runtime/files/d8/ioobjectlist.h--d8a0fffbe4c4.md)
- [`processorRunTimes.H`](../../../13-parallel/files/3f/processorruntimes.h--3fea5c9ca7ae.md)
- [`multiDomainDecomposition.H`](../../../13-parallel/files/a4/multidomaindecomposition.h--a403d42751e6.md)
- [`decompositionMethod.H`](../../../13-parallel/files/27/decompositionmethod.h--273aef43a3a9.md)
- [`fvFieldDecomposer.H`](../../../13-parallel/files/8e/fvfielddecomposer.h--8e7ef7350043.md)
- [`pointFieldDecomposer.H`](../../../13-parallel/files/d9/pointfielddecomposer.h--d9d8b7915a07.md)
- [`lagrangianFieldDecomposer.H`](../../../13-parallel/files/38/lagrangianfielddecomposer.h--38d7c8ec06d7.md)
- [`LagrangianFieldDecomposer.H`](../../../13-parallel/files/ba/lagrangianfielddecomposer.h--ba0c9308b3c9.md)
- [`addMeshOption.H`](../../../04-core-runtime/files/48/addmeshoption.h--48b8995f1bc8.md)
- [`addRegionOption.H`](../../../04-core-runtime/files/66/addregionoption.h--664ec312024d.md)
- [`addAllRegionsOption.H`](../../../04-core-runtime/files/bc/addallregionsoption.h--bc51d3632447.md)
- [`setRootCaseNoFunctionObjects.H`](../../../04-core-runtime/files/35/setrootcasenofunctionobjects.h--35560131a2b9.md)
- [`setMeshPath.H`](../../../04-core-runtime/files/5c/setmeshpath.h--5c564c74d1a7.md)
- [`setRegionNames.H`](../../../04-core-runtime/files/04/setregionnames.h--040d56de1962.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 main() 追踪输入字典、网格/场操作和写出结果。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
