---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-679a9e2fd0a8"
title: "OpenFOAM 14 源码解析：pointPatchField.H"
summary: "该文件声明或实现 `objectRegistry`、`dictionary`、`fieldMapper`、`pointMesh`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/pointPatchFields/pointPatchField/pointPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pointPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/pointPatchFields/pointPatchField/pointPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：640 行
- 文件标识：`679a9e2fd0a8`

## 2. 功能说明

该文件声明或实现 `objectRegistry`、`dictionary`、`fieldMapper`、`pointMesh`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Abstract base class for point-mesh patch fields. The base-field does not store values as they are part of the "internal field". There are derived classes to store constraint values e.g. fixedValuePointPatchField derived from the generic valuePointPatchField which ensures the values in the "internal field" are reset to the fixed-values by applying the stored values.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `objectRegistry` | 63 |
| `dictionary` | 65 |
| `fieldMapper` | 66 |
| `pointMesh` | 67 |
| `pointPatchField` | 70 |
| `calculatedPointPatchField` | 73 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `size` | 284 |
| `overridesConstraint` | 302 |
| `updated` | 345 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
4. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`pointPatch.H`](../../../05-finite-volume/files/10/pointpatch.h--1008303e35de.md)
- [`DimensionedField.H`](../../../05-finite-volume/files/5d/dimensionedfield.h--5d3e98805c1c.md)
- [`pointPatchFieldMapperFwd.H`](../../../05-finite-volume/files/9b/pointpatchfieldmapperfwd.h--9b038b7401ab.md)
- [`fieldTypes.H`](../../../04-core-runtime/files/92/fieldtypes.h--927f2e391791.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`pointPatchFieldFunctions.H`](../../../05-finite-volume/files/23/pointpatchfieldfunctions.h--23feeed20f62.md)
- [`pointPatchField.C`](../../../05-finite-volume/files/22/pointpatchfield.c--2234aaa5500d.md)
- [`calculatedPointPatchField.H`](../../../05-finite-volume/files/e0/calculatedpointpatchfield.h--e06f2d8d6f9d.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/pointPatchFields/basic/basicSymmetry/basicSymmetryPointPatchField.H](../../../05-finite-volume/files/e9/basicsymmetrypointpatchfield.h--e94d9533f9ac.md)
- [src/finiteVolume/fields/pointPatchFields/basic/calculated/calculatedPointPatchField.H](../../../05-finite-volume/files/e0/calculatedpointpatchfield.h--e06f2d8d6f9d.md)
- [src/finiteVolume/fields/pointPatchFields/basic/coupled/coupledPointPatchField.H](../../../05-finite-volume/files/25/coupledpointpatchfield.h--251de1b50cc7.md)
- [src/finiteVolume/fields/pointPatchFields/basic/value/valuePointPatchField.H](../../../05-finite-volume/files/2b/valuepointpatchfield.h--2b9b6b63b4c6.md)
- [src/finiteVolume/fields/pointPatchFields/basic/zeroGradient/zeroGradientPointPatchField.H](../../../05-finite-volume/files/47/zerogradientpointpatchfield.h--4788264bc312.md)
- [src/finiteVolume/fields/pointPatchFields/constraint/empty/emptyPointPatchField.H](../../../05-finite-volume/files/95/emptypointpatchfield.h--957c28f237dd.md)
- [src/finiteVolume/fields/pointPatchFields/constraint/internal/internalPointPatchField.H](../../../05-finite-volume/files/aa/internalpointpatchfield.h--aa71084c0951.md)
- [src/finiteVolume/fields/pointPatchFields/constraint/nonConformalCyclic/nonConformalCyclicPointPatchField.H](../../../05-finite-volume/files/61/nonconformalcyclicpointpatchfield.h--61d852a1e397.md)
- [src/finiteVolume/fields/pointPatchFields/constraint/nonConformalError/nonConformalErrorPointPatchField.H](../../../05-finite-volume/files/2b/nonconformalerrorpointpatchfield.h--2bb75dd27676.md)
- [src/finiteVolume/fields/pointPatchFields/constraint/wedge/wedgePointPatchField.H](../../../05-finite-volume/files/c4/wedgepointpatchfield.h--c47c660ae00a.md)
- [src/finiteVolume/fields/pointPatchFields/pointPatchField/pointPatchField.C](../../../05-finite-volume/files/22/pointpatchfield.c--2234aaa5500d.md)
- [src/finiteVolume/fields/pointPatchFields/pointPatchField/pointPatchFields.H](../../../05-finite-volume/files/64/pointpatchfields.h--6452d87f7e6e.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`、`defineTemplateRunTimeSelectionTable`、`addToPointPatchFieldRunTimeSelection`、`addToNullConstructablePointPatchFieldRunTimeSelection`、`defineTypeNameAndDebug`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
