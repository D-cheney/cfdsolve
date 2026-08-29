---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d3ba6e978f76"
title: "OpenFOAM 14 源码解析：radiationModel.H"
summary: "该文件声明或实现 `basicThermo`、`fvMesh`、`absorptionEmissionModel`、`scatterModel`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/radiationModels/radiationModels/radiationModel/radiationModel.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：radiationModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/radiationModels/radiationModels/radiationModel/radiationModel.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：270 行
- 文件标识：`d3ba6e978f76`

## 2. 功能说明

该文件声明或实现 `basicThermo`、`fvMesh`、`absorptionEmissionModel`、`scatterModel`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Top level model for radiation modelling

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `basicThermo` | 58 |
| `fvMesh` | 59 |
| `absorptionEmissionModel` | 63 |
| `scatterModel` | 64 |
| `sootModel` | 65 |
| `radiationModel` | 71 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`fvMatricesFwd.H`](../../../05-finite-volume/files/c0/fvmatricesfwd.h--c0b6e3525b0b.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)

## 8. 直接上层引用

- [src/radiationModels/derivedFvPatchFields/MarshakRadiation/MarshakRadiationFvPatchScalarField.C](../../../17-other-libraries/files/96/marshakradiationfvpatchscalarfield.c--963371327661.md)
- [src/radiationModels/derivedFvPatchFields/MarshakRadiationFixedTemperature/MarshakRadiationFixedTemperatureFvPatchScalarField.C](../../../17-other-libraries/files/9a/marshakradiationfixedtemperaturefvpatchscalarfield.c--9a037350bea0.md)
- [src/radiationModels/derivedFvPatchFields/radiationCoupledBase/radiationCoupledBase.C](../../../17-other-libraries/files/fa/radiationcoupledbase.c--fac1b1f7c60d.md)
- [src/radiationModels/fvModels/radiation/radiation.H](../../../17-other-libraries/files/43/radiation.h--434f693fcc20.md)
- [src/radiationModels/radiationModels/fvDOM/fvDOM.H](../../../17-other-libraries/files/f6/fvdom.h--f604e7334918.md)
- [src/radiationModels/radiationModels/noRadiation/noRadiation.H](../../../17-other-libraries/files/d7/noradiation.h--d73a627a5b3b.md)
- [src/radiationModels/radiationModels/opaqueSolid/opaqueSolid.H](../../../17-other-libraries/files/8f/opaquesolid.h--8facfb5bf8de.md)
- [src/radiationModels/radiationModels/P1/P1.H](../../../17-other-libraries/files/2c/p1.h--2c6f2c5025f5.md)
- [src/radiationModels/radiationModels/radiationModel/radiationModel.C](../../../17-other-libraries/files/41/radiationmodel.c--41d52fa2aec6.md)
- [src/radiationModels/radiationModels/radiationModel/radiationModelNew.C](../../../17-other-libraries/files/0f/radiationmodelnew.c--0f6284f42b6e.md)
- [src/radiationModels/radiationModels/viewFactor/viewFactor.H](../../../17-other-libraries/files/8e/viewfactor.h--8e8aed80675f.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`addToRadiationRunTimeSelectionTables`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
