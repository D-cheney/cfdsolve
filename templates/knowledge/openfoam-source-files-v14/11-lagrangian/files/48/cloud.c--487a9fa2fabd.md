---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-487a9fa2fabd"
title: "OpenFOAM 14 源码解析：cloud.C"
summary: "该文件实现 `cloud` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/cloud/cloud.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：cloud.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/cloud/cloud.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：909 行
- 文件标识：`487a9fa2fabd`

## 2. 功能说明

该文件实现 `cloud` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::cloud::mesh` | 55 |
| `Foam::cloud::clearDerivedFields` | 106 |
| `Foam::cloud::removeFromAverageFields` | 131 |
| `Foam::cloud::addToAverageFields` | 143 |
| `Foam::cloud::correctAverageFields` | 159 |
| `Foam::cloud::clearAverageFields` | 175 |
| `Foam::cloud::resetAverageFields` | 187 |
| `Foam::cloud::stateIo` | 199 |
| `Foam::cloud::readStates` | 213 |
| `Foam::cloud::initialStates` | 231 |
| `Foam::cloud::clearStates` | 260 |
| `Foam::cloud::storeStates` | 266 |
| `Foam::cloud::cellLengthScale` | 338 |
| `Foam::cloud::track` | 354 |
| `Foam::cloud::writeData` | 445 |
| `Foam::cloud::partition` | 455 |
| `Foam::cloud::cloud` | 496 |
| `Foam::cloud::New` | 528 |
| `Foam::cloud::lookup` | 596 |
| `Foam::cloud::LagrangianModels` | 601 |
| `Foam::cloud::solve` | 612 |
| `Foam::cloud::storePosition` | 871 |
| `Foam::cloud::movePoints` | 877 |
| `Foam::cloud::topoChange` | 883 |
| `Foam::cloud::mapMesh` | 891 |
| `Foam::cloud::distribute` | 899 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
4. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
5. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
6. **分布式映射**：依据全局到局部寻址重排和交换数据。
7. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
8. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
9. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
10. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
11. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
12. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- `cloud.H`
- [`cloudFunctionObjectUList.H`](../../../11-lagrangian/files/70/cloudfunctionobjectulist.h--70f152531627.md)
- [`cloudVelocityLagrangianPatch.H`](../../../11-lagrangian/files/df/cloudvelocitylagrangianpatch.h--dfdde1b1d337.md)
- [`processorLagrangianPatch.H`](../../../11-lagrangian/files/cf/processorlagrangianpatch.h--cf8df9b93c54.md)
- [`LagrangianFields.H`](../../../11-lagrangian/files/0e/lagrangianfields.h--0e720ce1f457.md)
- [`LagrangianmDdt.H`](../../../11-lagrangian/files/28/lagrangianmddt.h--282d6ebd5991.md)
- [`LagrangianSubFields.H`](../../../11-lagrangian/files/be/lagrangiansubfields.h--be7d6ffac93f.md)
- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`calculatedLagrangianPatchFields.H`](../../../11-lagrangian/files/be/calculatedlagrangianpatchfields.h--becab16d8aab.md)
- [`noneStateLagrangianLabelFieldSource.H`](../../../11-lagrangian/files/e7/nonestatelagrangianlabelfieldsource.h--e736b2fe4360.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
