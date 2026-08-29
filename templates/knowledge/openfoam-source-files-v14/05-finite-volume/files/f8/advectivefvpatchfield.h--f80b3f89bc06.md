---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f80b3f89bc06"
title: "OpenFOAM 14 源码解析：advectiveFvPatchField.H"
summary: "该文件声明或实现 `advectiveFvPatchField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：advectiveFvPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：232 行
- 文件标识：`f80b3f89bc06`

## 2. 功能说明

该文件声明或实现 `advectiveFvPatchField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：This boundary condition provides an advective outflow condition, based on solving DDt(W, field) = 0 at the boundary where \c W is the wave velocity and \c field is the field to which this boundary condition is applied. The standard (Euler, backward, CrankNicolson, localEuler) time schemes are supported. Additionally an optional mechanism to relax the value at the boundary to a specified far-field value is provided which is switched on by specifying the relaxation length-scale \c lInf and the far-field value \c fieldInf. The flow/wave speed \c (w) at the outlet is provided by the virtual function advectionSpeed() the default implementation of which requires the name of the flux field \c (phi) and optionally the density \c (rho) if the mass-flux rather than the volumetric-flux is given. The flow/wave speed at the outlet can be changed by deriving a specialised BC from this class and over-r

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `advectiveFvPatchField` | 95 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `lInf` | 185 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`mixedFvPatchFields.H`](../../../05-finite-volume/files/fd/mixedfvpatchfields.h--fde273d73f26.md)
- [`advectiveFvPatchField.C`](../../../05-finite-volume/files/3f/advectivefvpatchfield.c--3f81b03d3d89.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.C](../../../05-finite-volume/files/3f/advectivefvpatchfield.c--3f81b03d3d89.md)
- [src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchFields.H](../../../05-finite-volume/files/b3/advectivefvpatchfields.h--b3baac502ddf.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
