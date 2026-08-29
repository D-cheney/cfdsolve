---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-699b22124b67"
title: "OpenFOAM 14 源码解析：psiuMulticomponentThermo.H"
summary: "该文件声明或实现 `psiuMulticomponentThermo`、`implementation`、`composite`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermo.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：psiuMulticomponentThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermo.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：375 行
- 文件标识：`699b22124b67`

## 2. 功能说明

该文件声明或实现 `psiuMulticomponentThermo`、`implementation`、`composite`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base-class for combustion fluid thermodynamic properties based on compressibility.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `psiuMulticomponentThermo` | 62 |
| `implementation` | 84 |
| `composite` | 87 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`psiThermo.H`](../../../08-thermophysical/files/e9/psithermo.h--e9e39b22d2d2.md)
- [`PsiuMulticomponentThermo.H`](../../../17-other-libraries/files/0a/psiumulticomponentthermo.h--0aed4917414a.md)
- [`speciesTable.H`](../../../08-thermophysical/files/57/speciestable.h--570bf8e7a949.md)
- [`DimensionedFieldListSlicer.H`](../../../08-thermophysical/files/c2/dimensionedfieldlistslicer.h--c2ae82ec27a9.md)
- [`GeometricFieldListSlicer.H`](../../../08-thermophysical/files/e7/geometricfieldlistslicer.h--e71dc6d11684.md)
- [`psiuMulticomponentThermoI.H`](../../../17-other-libraries/files/d6/psiumulticomponentthermoi.h--d69c17eec0c1.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/laminarFlameSpeed/laminarFlameSpeed/laminarFlameSpeed.H](../../../17-other-libraries/files/af/laminarflamespeed.h--afbb12993f8d.md)
- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)
- [applications/legacy/combustion/PDRFoam/PDRModels/dragModels/PDRDragModel/PDRDragModel.H](../../../17-other-libraries/files/8f/pdrdragmodel.h--8fe618ecfdae.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/derivedFvPatchFields/fixedUnburntEnthalpy/fixedUnburntEnthalpyFvPatchScalarField.C](../../../17-other-libraries/files/bb/fixedunburntenthalpyfvpatchscalarfield.c--bb2725e7affc.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/derivedFvPatchFields/gradientUnburntEnthalpy/gradientUnburntEnthalpyFvPatchScalarField.C](../../../17-other-libraries/files/c8/gradientunburntenthalpyfvpatchscalarfield.c--c8d66a251067.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/derivedFvPatchFields/mixedUnburntEnthalpy/mixedUnburntEnthalpyFvPatchScalarField.C](../../../17-other-libraries/files/7c/mixedunburntenthalpyfvpatchscalarfield.c--7c51bb3d0db0.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermo.C](../../../17-other-libraries/files/c1/psiumulticomponentthermo.c--c1ed7149fa09.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermoI.H](../../../17-other-libraries/files/d6/psiumulticomponentthermoi.h--d69c17eec0c1.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermos.C](../../../17-other-libraries/files/cb/psiumulticomponentthermos.c--cbf50cf75a91.md)
- [applications/legacy/combustion/PDRFoam/XiModels/XiEqModels/XiEqModel/XiEqModel.H](../../../17-other-libraries/files/4b/xieqmodel.h--4b591175636a.md)
- [applications/legacy/combustion/PDRFoam/XiModels/XiGModels/XiGModel/XiGModel.H](../../../17-other-libraries/files/d2/xigmodel.h--d2c02914863d.md)
- [applications/legacy/combustion/PDRFoam/XiModels/XiModel/XiModel.H](../../../17-other-libraries/files/82/ximodel.h--8275b911fce7.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
