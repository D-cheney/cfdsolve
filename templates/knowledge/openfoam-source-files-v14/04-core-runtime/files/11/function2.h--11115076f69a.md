---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-11115076f69a"
title: "OpenFOAM 14 源码解析：Function2.H"
summary: "该文件声明或实现 `Function2`、`FieldFunction2`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/functions/Function2/Function2/Function2.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：Function2.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/functions/Function2/Function2/Function2.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：330 行
- 文件标识：`11115076f69a`

## 2. 功能说明

该文件声明或实现 `Function2`、`FieldFunction2`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Run-time selectable function of two variables with many options provided from simple constant values to complex functions, interpolated tabulated data etc. etc.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Function2` | 58 |
| `FieldFunction2` | 239 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Function2UnitSets.H`](../../../04-core-runtime/files/20/function2unitsets.h--20dec92f89ed.md)
- [`Field.H`](../../../04-core-runtime/files/51/field.h--519067424cd8.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`Function2.C`](../../../04-core-runtime/files/ff/function2.c--ffdaafaef6df.md)
- [`Constant2.H`](../../../04-core-runtime/files/b3/constant2.h--b349a627f81a.md)

## 8. 直接上层引用

- [etc/codeTemplates/dynamicCode/codedFunction2Template.H](../../../15-build-config/files/f1/codedfunction2template.h--f1463e0b3bb4.md)
- [src/atmosphericModels/atmosphericBoundaryLayer/atmosphericBoundaryLayer.H](../../../17-other-libraries/files/02/atmosphericboundarylayer.h--02cd93f8c1d0.md)
- [src/finiteVolume/fields/fvPatchFields/derived/swirlFlowRateInletVelocity/swirlFlowRateInletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/99/swirlflowrateinletvelocityfvpatchvectorfield.h--99b3504426a5.md)
- [src/finiteVolume/fields/fvPatchFields/derived/swirlInletVelocity/swirlInletVelocityFvPatchVectorField.H](../../../05-finite-volume/files/ee/swirlinletvelocityfvpatchvectorfield.h--eea1a14207d9.md)
- [src/finiteVolume/fields/GeometricFields/Function2/Function2Evaluate.H](../../../05-finite-volume/files/1f/function2evaluate.h--1fb2f08fe7f8.md)
- [src/fvModels/general/effectivenessHeatExchanger/effectivenessHeatExchanger.H](../../../12-boundaries-sources/files/82/effectivenessheatexchanger.h--827b3031ff13.md)
- [src/fvModels/interRegion/heatTransferCoefficientModels/function2/function2.H](../../../12-boundaries-sources/files/7a/function2.h--7a9a1769df7a.md)
- [src/OpenFOAM/primitives/functions/Function2/Coded/CodedFunction2.H](../../../04-core-runtime/files/58/codedfunction2.h--584fe593c898.md)
- [src/OpenFOAM/primitives/functions/Function2/Constant/Constant2.H](../../../04-core-runtime/files/b3/constant2.h--b349a627f81a.md)
- [src/OpenFOAM/primitives/functions/Function2/Function1/Function12.H](../../../04-core-runtime/files/12/function12.h--1271ad0f6c17.md)
- [src/OpenFOAM/primitives/functions/Function2/Function2/Function2.C](../../../04-core-runtime/files/ff/function2.c--ffdaafaef6df.md)
- [src/OpenFOAM/primitives/functions/Function2/Function2/Function2Fwd.H](../../../04-core-runtime/files/5c/function2fwd.h--5cf1225e30e0.md)
- [src/OpenFOAM/primitives/functions/Function2/None/None2.H](../../../04-core-runtime/files/7e/none2.h--7eeb46a75c39.md)
- [src/OpenFOAM/primitives/functions/Function2/One/OneConstant2.H](../../../04-core-runtime/files/dd/oneconstant2.h--dd70bf392e2e.md)
- [src/OpenFOAM/primitives/functions/Function2/Product/Product2.H](../../../04-core-runtime/files/14/product2.h--14709bc3b804.md)
- [src/OpenFOAM/primitives/functions/Function2/Radial/Radial2.H](../../../04-core-runtime/files/0f/radial2.h--0fdc6f1dedb7.md)
- [src/OpenFOAM/primitives/functions/Function2/Scale/Scale2.H](../../../04-core-runtime/files/db/scale2.h--dbd4522840c2.md)
- [src/OpenFOAM/primitives/functions/Function2/UniformTable2/UniformTable2.H](../../../04-core-runtime/files/25/uniformtable2.h--254fd36e56f1.md)
- [src/OpenFOAM/primitives/functions/Function2/Zero/ZeroConstant2.H](../../../04-core-runtime/files/48/zeroconstant2.h--489541d4dfbd.md)
- [src/thermophysicalModels/specie/thermophysicalFunctions/APIdiffusionCoefficient/APIdiffusionCoefficient.H](../../../08-thermophysical/files/ae/apidiffusioncoefficient.h--ae7406d4f7ba.md)
- [src/thermophysicalModels/specie/thermophysicalFunctions/binaryDiffusionCoefficient/binaryDiffusionCoefficient.H](../../../08-thermophysical/files/1d/binarydiffusioncoefficient.h--1d47a0677600.md)
- [src/thermophysicalModels/specie/thermophysicalFunctions/FullerDiffusionCoefficient/FullerDiffusionCoefficient.H](../../../08-thermophysical/files/80/fullerdiffusioncoefficient.h--80975f18cc7c.md)
- [src/ThermophysicalTransportModels/fluid/laminar/Fickian/Fickian.H](../../../09-turbulence-transport/files/3e/fickian.h--3ed49b7efdf0.md)
- [src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefan/MaxwellStefan.H](../../../09-turbulence-transport/files/fb/maxwellstefan.h--fb966fa1f415.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`、`defineTemplateRunTimeSelectionTable`、`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
