---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-216068724d05"
title: "OpenFOAM 14 源码解析：LagrangianModels.H"
summary: "该文件实现 `LagrangianModels` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModels/LagrangianModels.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianModels.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModels/LagrangianModels.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：356 行
- 文件标识：`216068724d05`

## 2. 功能说明

该文件实现 `LagrangianModels` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：List of Lagrangian models, constructed as a (Lagrangian) mesh object. Provides similar functions to the models themselves and forwards them to each model in turn. This is the high level model interface used by clouds when constructing their injections and transport equations.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LagrangianModels` | 60 |
| `modelTypeFieldSourceType` | 89 |
| `PrimitiveField` | 96 |
| `PrimitiveEqnField` | 172 |
| `typeGlobal` | 336 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`LagrangianModel.H`](../../../11-lagrangian/files/76/lagrangianmodel.h--763630f98c15.md)
- [`PtrListDictionary.H`](../../../04-core-runtime/files/2b/ptrlistdictionary.h--2b4aa9e279df.md)
- [`DemandDrivenMeshObject.H`](../../../04-core-runtime/files/0c/demanddrivenmeshobject.h--0c78b4372cd3.md)
- [`LagrangianModelsTemplates.C`](../../../11-lagrangian/files/1a/lagrangianmodelstemplates.c--1a6575aed1b3.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/cloud/cloud.H](../../../11-lagrangian/files/9d/cloud.h--9d1ee2cfc1df.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/CrankNicolson/CrankNicolson_LagrangianDdtScheme.C](../../../11-lagrangian/files/a6/cranknicolson_lagrangianddtscheme.c--a68124ccce97.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMesh.C](../../../11-lagrangian/files/ea/lagrangianmesh.c--eafb2e318052.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModels/LagrangianModels.C](../../../11-lagrangian/files/0d/lagrangianmodels.c--0d055da4e1fc.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModels/LagrangianModelsTemplates.C](../../../11-lagrangian/files/1a/lagrangianmodelstemplates.c--1a6575aed1b3.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
