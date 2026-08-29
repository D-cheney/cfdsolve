---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8fe618ecfdae"
title: "OpenFOAM 14 源码解析：PDRDragModel.H"
summary: "该文件实现 `PDRDragModel` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/legacy/combustion/PDRFoam/PDRModels/dragModels/PDRDragModel/PDRDragModel.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：PDRDragModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/legacy/combustion/PDRFoam/PDRModels/dragModels/PDRDragModel/PDRDragModel.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：188 行
- 文件标识：`8fe618ecfdae`

## 2. 功能说明

该文件实现 `PDRDragModel` 相关对象的读取、写出或流序列化。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base-class for sub-grid obstacle drag models. The available drag model is at \link basic.H \endlink.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PDRDragModel` | 59 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `on` | 145 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`psiuMulticomponentThermo.H`](../../../17-other-libraries/files/69/psiumulticomponentthermo.h--699b22124b67.md)
- [`compressibleMomentumTransportModels.H`](../../../09-turbulence-transport/files/07/compressiblemomentumtransportmodels.h--0745b4a591f5.md)
- [`multivariateSurfaceInterpolationScheme.H`](../../../05-finite-volume/files/a6/multivariatesurfaceinterpolationscheme.h--a602383e2fd2.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)
- [applications/legacy/combustion/PDRFoam/PDRModels/dragModels/basic/basic.H](../../../17-other-libraries/files/19/basic.h--19d60f4964db.md)
- [applications/legacy/combustion/PDRFoam/PDRModels/dragModels/PDRDragModel/PDRDragModel.C](../../../17-other-libraries/files/9d/pdrdragmodel.c--9db746c8c9c8.md)
- [applications/legacy/combustion/PDRFoam/PDRModels/dragModels/PDRDragModel/PDRDragModelNew.C](../../../17-other-libraries/files/44/pdrdragmodelnew.c--449e273d712b.md)
- [applications/legacy/combustion/PDRFoam/PDRModels/turbulence/PDRkEpsilon/PDRkEpsilon.C](../../../17-other-libraries/files/7f/pdrkepsilon.c--7f69dc0dff26.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
