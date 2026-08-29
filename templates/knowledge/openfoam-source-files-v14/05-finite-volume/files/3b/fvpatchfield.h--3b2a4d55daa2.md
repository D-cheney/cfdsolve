---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3b2a4d55daa2"
title: "OpenFOAM 14 源码解析：fvPatchField.H"
summary: "该文件声明或实现 `objectRegistry`、`dictionary`、`fieldMapper`、`fvMesh`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/fvPatchField/fvPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/fvPatchField/fvPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：746 行
- 文件标识：`3b2a4d55daa2`

## 2. 功能说明

该文件声明或实现 `objectRegistry`、`dictionary`、`fieldMapper`、`fvMesh`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Abstract base class with a fat-interface to all derived classes covering all possible ways in which they might be used. The first level of derivation is to basic patchFields which cover zero-gradient, fixed-gradient, fixed-value and mixed conditions. The next level of derivation covers all the specialised types with specific evaluation procedures, particularly with respect to specific fields.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `objectRegistry` | 65 |
| `dictionary` | 67 |
| `fieldMapper` | 68 |
| `fvMesh` | 69 |
| `fvPatchField` | 72 |
| `calculatedFvPatchField` | 75 |
| `slicedFvPatchField` | 78 |
| `fvMatrix` | 81 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `overridesConstraint` | 352 |
| `updated` | 395 |
| `manipulatedMatrix` | 401 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvPatch.H`](../../../05-finite-volume/files/c6/fvpatch.h--c645cd2545f4.md)
- [`DimensionedField.H`](../../../05-finite-volume/files/5d/dimensionedfield.h--5d3e98805c1c.md)
- [`fvPatchFieldMapperFwd.H`](../../../05-finite-volume/files/8f/fvpatchfieldmapperfwd.h--8f818cbde073.md)
- [`fileNameList.H`](../../../04-core-runtime/files/a9/filenamelist.h--a9e6a3147598.md)
- [`fieldTypes.H`](../../../04-core-runtime/files/92/fieldtypes.h--927f2e391791.md)
- [`fvPatchField.C`](../../../05-finite-volume/files/98/fvpatchfield.c--98b5292d7b1d.md)
- [`calculatedFvPatchField.H`](../../../05-finite-volume/files/6e/calculatedfvpatchfield.h--6e08a0bda567.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/basic/calculated/calculatedFvPatchField.H](../../../05-finite-volume/files/6e/calculatedfvpatchfield.h--6e08a0bda567.md)
- [src/finiteVolume/fields/fvPatchFields/basic/coupled/coupledFvPatchField.H](../../../05-finite-volume/files/54/coupledfvpatchfield.h--546fc2fa114e.md)
- [src/finiteVolume/fields/fvPatchFields/basic/fixedGradient/fixedGradientFvPatchField.H](../../../05-finite-volume/files/ba/fixedgradientfvpatchfield.h--badad56c647c.md)
- [src/finiteVolume/fields/fvPatchFields/basic/fixedValue/fixedValueFvPatchField.H](../../../05-finite-volume/files/58/fixedvaluefvpatchfield.h--589fa1c7e03a.md)
- [src/finiteVolume/fields/fvPatchFields/basic/mixed/mixedFvPatchField.H](../../../05-finite-volume/files/33/mixedfvpatchfield.h--33ef2f4d04bd.md)
- [src/finiteVolume/fields/fvPatchFields/basic/sliced/slicedFvPatchField.H](../../../05-finite-volume/files/87/slicedfvpatchfield.h--87c5bd744516.md)
- [src/finiteVolume/fields/fvPatchFields/basic/transform/transformFvPatchField.H](../../../05-finite-volume/files/07/transformfvpatchfield.h--077145358b67.md)
- [src/finiteVolume/fields/fvPatchFields/basic/zeroGradient/zeroGradientFvPatchField.H](../../../05-finite-volume/files/f4/zerogradientfvpatchfield.h--f4010bab0960.md)
- [src/finiteVolume/fields/fvPatchFields/constraint/empty/emptyFvPatchField.H](../../../05-finite-volume/files/d6/emptyfvpatchfield.h--d646ca9168e9.md)
- [src/finiteVolume/fields/fvPatchFields/constraint/internal/internalFvPatchField.H](../../../05-finite-volume/files/93/internalfvpatchfield.h--9392ab2ea87c.md)
- [src/finiteVolume/fields/fvPatchFields/derived/PrghPressure/PrghPressureFvPatchScalarField.H](../../../05-finite-volume/files/c6/prghpressurefvpatchscalarfield.h--c6cc921568c6.md)
- [src/finiteVolume/fields/fvPatchFields/derived/timeVaryingMappedFixedValue/timeVaryingMappedFvPatchField.H](../../../05-finite-volume/files/a7/timevaryingmappedfvpatchfield.h--a70258cce73a.md)
- [src/finiteVolume/fields/fvPatchFields/derived/zeroFixedValue/zeroFixedValueFvPatchFieldsFwd.H](../../../05-finite-volume/files/0a/zerofixedvaluefvpatchfieldsfwd.h--0a60351d8e3d.md)
- [src/finiteVolume/fields/fvPatchFields/DimensionedFvPatchFieldFunctions/makeDimensionedFvPatchFieldFunctions.C](../../../05-finite-volume/files/22/makedimensionedfvpatchfieldfunctions.c--2217a4ce5519.md)
- [src/finiteVolume/fields/fvPatchFields/fvPatchField/fvPatchFields.H](../../../05-finite-volume/files/aa/fvpatchfields.h--aad5a99ecf68.md)
- [src/finiteVolume/fields/GeometricFields/volFields/volFields.H](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [src/finiteVolume/fvMesh/fvMeshStitchers/fvMeshStitcher/conformedFvPatchField.H](../../../05-finite-volume/files/a0/conformedfvpatchfield.h--a091ae57c0a6.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`、`defineTemplateRunTimeSelectionTable`、`addToPatchFieldRunTimeSelection`、`addToNullConstructablePatchFieldRunTimeSelection`、`addRemovableToPatchFieldRunTimeSelection`、`defineTypeNameAndDebug`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
