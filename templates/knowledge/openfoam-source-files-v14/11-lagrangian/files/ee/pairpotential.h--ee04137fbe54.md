---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ee04137fbe54"
title: "OpenFOAM 14 源码解析：pairPotential.H"
summary: "该文件声明或实现 `energyScalingFunction`、`pairPotential`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/molecularDynamics/potential/pairPotential/basic/pairPotential.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：pairPotential.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/molecularDynamics/potential/pairPotential/basic/pairPotential.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：204 行
- 文件标识：`ee04137fbe54`

## 2. 功能说明

该文件声明或实现 `energyScalingFunction`、`pairPotential`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：SourceFiles pairPotential.C pairPotentialNew.C

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `energyScalingFunction` | 58 |
| `pairPotential` | 63 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`List.H`](../../../04-core-runtime/files/af/list.h--af8268cb7768.md)
- [`Pair.H`](../../../04-core-runtime/files/38/pair.h--38986855df5f.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)
- [`pairPotentialI.H`](../../../11-lagrangian/files/83/pairpotentiali.h--83b7ceebf9ee.md)

## 8. 直接上层引用

- [src/lagrangian/molecularDynamics/potential/energyScalingFunction/basic/energyScalingFunction.H](../../../11-lagrangian/files/01/energyscalingfunction.h--0176dc05cf5f.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/basic/pairPotential.C](../../../11-lagrangian/files/5b/pairpotential.c--5beabed477e4.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/basic/pairPotentialIO.C](../../../11-lagrangian/files/90/pairpotentialio.c--908cf1ecfcae.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/basic/pairPotentialNew.C](../../../11-lagrangian/files/a9/pairpotentialnew.c--a95e4d5542d3.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/derived/azizChen/azizChen.H](../../../11-lagrangian/files/0e/azizchen.h--0ef41f2e9f58.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/derived/coulomb/coulomb.H](../../../11-lagrangian/files/da/coulomb.h--da3955142c12.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/derived/dampedCoulomb/dampedCoulomb.H](../../../11-lagrangian/files/72/dampedcoulomb.h--72fee2c1000d.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/derived/exponentialRepulsion/exponentialRepulsion.H](../../../11-lagrangian/files/61/exponentialrepulsion.h--61a944c93f5d.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/derived/lennardJones/lennardJones.H](../../../11-lagrangian/files/27/lennardjones.h--27728998d370.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/derived/maitlandSmith/maitlandSmith.H](../../../11-lagrangian/files/93/maitlandsmith.h--93b618e87c68.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/derived/noInteraction/noInteraction.H](../../../11-lagrangian/files/78/nointeraction.h--78c9e35118d6.md)
- [src/lagrangian/molecularDynamics/potential/pairPotential/pairPotentialList/pairPotentialList.H](../../../11-lagrangian/files/ef/pairpotentiallist.h--efaa16889115.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
