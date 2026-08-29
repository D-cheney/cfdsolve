---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-33ef2f4d04bd"
title: "OpenFOAM 14 源码解析：mixedFvPatchField.H"
summary: "该文件声明或实现 `mixedFvPatchField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/basic/mixed/mixedFvPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：mixedFvPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/basic/mixed/mixedFvPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：299 行
- 文件标识：`33ef2f4d04bd`

## 2. 功能说明

该文件声明或实现 `mixedFvPatchField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：This boundary condition provides a base class for 'mixed' type boundary conditions, i.e. conditions that mix fixed value and patch-normal gradient conditions. The respective contributions from each is determined by a weight field: \f[ x_p = w x_p + (1-w) \left(x_c + \frac{\nabla_\perp x}{\Delta}\right) \f] where \vartable x_p | patch values x_c | patch internal cell values w | weight field (0-1) \Delta | inverse distance from face centre to internal cell centre \endvartable Usage \table Property | Description | Required | Default value refValue | reference value | yes | refGradient | reference normal gradient | yes | valueFraction | weight field | yes | \endtable Note: This condition is not usually applied directly; instead, use a derived mixed condition such as \c inletOutlet

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `mixedFvPatchField` | 85 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvPatchField.H`](../../../05-finite-volume/files/3b/fvpatchfield.h--3b2a4d55daa2.md)
- [`mixedFvPatchField.C`](../../../05-finite-volume/files/b8/mixedfvpatchfield.c--b85b39c724a4.md)

## 8. 直接上层引用

- [applications/utilities/preProcessing/mapFields/meshToMesh0Templates.C](../../../03-utilities/files/1a/meshtomesh0templates.c--1a18fd08a743.md)
- [src/finiteVolume/fields/fvPatchFields/basic/mixed/mixedFvPatchField.C](../../../05-finite-volume/files/b8/mixedfvpatchfield.c--b85b39c724a4.md)
- [src/finiteVolume/fields/fvPatchFields/basic/mixed/mixedFvPatchFields.H](../../../05-finite-volume/files/fd/mixedfvpatchfields.h--fde273d73f26.md)
- [src/finiteVolume/fields/fvPatchFields/derived/inletOutlet/inletOutletFvPatchField.H](../../../05-finite-volume/files/38/inletoutletfvpatchfield.h--380fc321aa4d.md)
- [src/finiteVolume/fields/fvPatchFields/derived/outletInlet/outletInletFvPatchField.H](../../../05-finite-volume/files/c6/outletinletfvpatchfield.h--c6141d847786.md)
- [src/finiteVolume/fields/fvPatchFields/derived/uniformInletOutlet/uniformInletOutletFvPatchField.H](../../../05-finite-volume/files/ae/uniforminletoutletfvpatchfield.h--aef0914794f1.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/schemes/outletStabilised/outletStabilised.C](../../../05-finite-volume/files/e1/outletstabilised.c--e12e6b6845f9.md)
- [src/waves/derivedFvPatchFields/waveInletOutlet/waveInletOutletFvPatchField.H](../../../17-other-libraries/files/b8/waveinletoutletfvpatchfield.h--b881ac4f956e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
