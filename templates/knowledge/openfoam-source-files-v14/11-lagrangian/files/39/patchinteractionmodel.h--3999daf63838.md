---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3999daf63838"
title: "OpenFOAM 14 源码解析：PatchInteractionModel.H"
summary: "该文件声明或实现 `PatchInteractionModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/PatchInteractionModel/PatchInteractionModel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：PatchInteractionModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/PatchInteractionModel/PatchInteractionModel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：225 行
- 文件标识：`3999daf63838`

## 2. 功能说明

该文件声明或实现 `PatchInteractionModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated patch interaction model class

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PatchInteractionModel` | 61 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`polyPatch.H`](../../../04-core-runtime/files/51/polypatch.h--5133084941b0.md)
- [`wallPolyPatch.H`](../../../04-core-runtime/files/db/wallpolypatch.h--db96caab5170.md)
- [`tetIndices.H`](../../../04-core-runtime/files/e2/tetindices.h--e2e4720916dd.md)
- [`CloudSubModelBase.H`](../../../11-lagrangian/files/6a/cloudsubmodelbase.h--6a933e89d200.md)
- [`PatchInteractionModel.C`](../../../11-lagrangian/files/98/patchinteractionmodel.c--9861375e2999.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.C](../../../11-lagrangian/files/8f/momentumcloud.c--8ffc36e4736c.md)
- [src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/LocalInteraction/LocalInteraction.H](../../../11-lagrangian/files/c8/localinteraction.h--c82844045dce.md)
- [src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/NoInteraction/NoInteraction.H](../../../11-lagrangian/files/d4/nointeraction.h--d4f604563439.md)
- [src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/PatchInteractionModel/PatchInteractionModel.C](../../../11-lagrangian/files/98/patchinteractionmodel.c--9861375e2999.md)
- [src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/PatchInteractionModel/PatchInteractionModelNew.C](../../../11-lagrangian/files/49/patchinteractionmodelnew.c--49479bd3bda4.md)
- [src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/Rebound/Rebound.H](../../../11-lagrangian/files/5b/rebound.h--5bd834d5710d.md)
- [src/lagrangian/parcel/submodels/Momentum/PatchInteractionModel/StandardWallInteraction/StandardWallInteraction.H](../../../11-lagrangian/files/07/standardwallinteraction.h--076c3498fc43.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
