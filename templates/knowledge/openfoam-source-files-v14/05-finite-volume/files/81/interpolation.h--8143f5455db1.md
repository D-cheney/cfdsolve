---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8143f5455db1"
title: "OpenFOAM 14 源码解析：interpolation.H"
summary: "该文件声明或实现 `interpolationBase`、`interpolationGradBase`、`interpolation`、`fieldInterpolationBase`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/interpolation/interpolation/interpolation/interpolation.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：interpolation.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/interpolation/interpolation/interpolation/interpolation.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：448 行
- 文件标识：`8143f5455db1`

## 2. 功能说明

该文件声明或实现 `interpolationBase`、`interpolationGradBase`、`interpolation`、`fieldInterpolationBase`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Abstract base class for interpolation

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `interpolationBase` | 65 |
| `interpolationGradBase` | 145 |
| `interpolation` | 235 |
| `fieldInterpolationBase` | 299 |
| `fieldInterpolationGradBase` | 341 |
| `fieldInterpolation` | 399 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`tetIndices.H`](../../../04-core-runtime/files/e2/tetindices.h--e2e4720916dd.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`interpolation.C`](../../../05-finite-volume/files/1a/interpolation.c--1a938168bc5b.md)

## 8. 直接上层引用

- [src/finiteVolume/interpolation/interpolation/cell/cell_interpolation.H](../../../05-finite-volume/files/ef/cell_interpolation.h--ef45a35bc73e.md)
- [src/finiteVolume/interpolation/interpolation/cellPatchConstrained/cellPatchConstrained.H](../../../05-finite-volume/files/73/cellpatchconstrained.h--7362bb42f5c0.md)
- [src/finiteVolume/interpolation/interpolation/cellPoint/cellPoint_interpolation.H](../../../05-finite-volume/files/a7/cellpoint_interpolation.h--a7811801fb5d.md)
- [src/finiteVolume/interpolation/interpolation/interpolation/interpolation.C](../../../05-finite-volume/files/1a/interpolation.c--1a938168bc5b.md)
- [src/finiteVolume/interpolation/interpolation/interpolation/interpolations.C](../../../05-finite-volume/files/57/interpolations.c--572b2ce9845f.md)
- [src/finiteVolume/interpolation/interpolation/volPointInterpolation/volPointInterpolation_interpolation.H](../../../05-finite-volume/files/d1/volpointinterpolation_interpolation.h--d12c48b0cffe.md)
- [src/functionObjects/field/interfaceHeight/interfaceHeight.C](../../../14-postprocessing/files/7c/interfaceheight.c--7cdc0c54c2c7.md)
- [src/functionObjects/field/streamlines/streamlinesParticle.H](../../../14-postprocessing/files/b1/streamlinesparticle.h--b1c9c4491e1a.md)
- [src/Lagrangian/cloud/clouds/carried/CarrierField.H](../../../11-lagrangian/files/ef/carrierfield.h--ef18f8012e4b.md)
- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.C](../../../11-lagrangian/files/8f/momentumcloud.c--8ffc36e4736c.md)
- [src/lagrangian/parcel/parcels/Templates/MomentumParcel/MomentumParcel.H](../../../11-lagrangian/files/ea/momentumparcel.h--ea8015db544c.md)
- [src/lagrangian/parcel/parcels/Templates/ReactingParcel/ReactingParcel.H](../../../11-lagrangian/files/1a/reactingparcel.h--1ae22206ba1f.md)
- [src/lagrangian/parcel/parcels/Templates/ThermoParcel/ThermoParcel.H](../../../11-lagrangian/files/20/thermoparcel.h--2067006a618a.md)
- [src/lagrangian/parcel/submodels/Momentum/InjectionModel/PatchInjection/PatchInjection.H](../../../11-lagrangian/files/e3/patchinjection.h--e30a81f894ad.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Drag/DenseDrag/DenseDragForce.H](../../../11-lagrangian/files/32/densedragforce.h--3296abdce222.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Lift/LiftForce/LiftForce.H](../../../11-lagrangian/files/2a/liftforce.h--2a4885269b60.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/Paramagnetic/ParamagneticForce.H](../../../11-lagrangian/files/50/paramagneticforce.h--505c2e6196e4.md)
- [src/lagrangian/parcel/submodels/Momentum/ParticleForces/PressureGradient/PressureGradientForce.H](../../../11-lagrangian/files/34/pressuregradientforce.h--344de14828aa.md)
- [src/sampling/probes/probesTemplates.C](../../../14-postprocessing/files/eb/probestemplates.c--eb28b134687a.md)
- [src/sampling/sampledSet/sampledSets/sampledSets.H](../../../14-postprocessing/files/50/sampledsets.h--5076692174e1.md)
- [src/sampling/sampledSurface/sampledSurface/sampledSurface.H](../../../14-postprocessing/files/3c/sampledsurface.h--3c2c8f3000d1.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
