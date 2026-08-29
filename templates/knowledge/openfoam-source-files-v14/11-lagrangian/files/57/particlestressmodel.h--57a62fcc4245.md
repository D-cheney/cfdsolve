---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-57a62fcc4245"
title: "OpenFOAM 14 源码解析：ParticleStressModel.H"
summary: "该文件声明或实现 `ParticleStressModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/ParticleStressModel/ParticleStressModel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ParticleStressModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/ParticleStressModel/ParticleStressModel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：152 行
- 文件标识：`57a62fcc4245`

## 2. 功能说明

该文件声明或实现 `ParticleStressModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base class for inter-particle stress models.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ParticleStressModel` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Field.H`](../../../04-core-runtime/files/51/field.h--519067424cd8.md)
- [`FieldField.H`](../../../04-core-runtime/files/d7/fieldfield.h--d75661a0c8b1.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/MPPICCloud/MPPICCloud.C](../../../11-lagrangian/files/aa/mppiccloud.c--aa4d523ed052.md)
- [src/lagrangian/parcel/submodels/MPPIC/PackingModels/PackingModel/PackingModel.C](../../../11-lagrangian/files/d9/packingmodel.c--d9e7636f46ef.md)
- [src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/exponential/exponential.H](../../../11-lagrangian/files/03/exponential.h--036a46843374.md)
- [src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/HarrisCrighton/HarrisCrighton.H](../../../11-lagrangian/files/39/harriscrighton.h--39860a5189a1.md)
- [src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/Lun/Lun.H](../../../11-lagrangian/files/e5/lun.h--e5cbc3d90bf6.md)
- [src/lagrangian/parcel/submodels/MPPIC/ParticleStressModels/ParticleStressModel/ParticleStressModel.C](../../../11-lagrangian/files/ca/particlestressmodel.c--ca5fa25d6d59.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
