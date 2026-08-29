---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d5508fcccff5"
title: "OpenFOAM 14 源码解析：waveTransmissiveFvPatchField.H"
summary: "该文件声明或实现 `waveTransmissiveFvPatchField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/derived/waveTransmissive/waveTransmissiveFvPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：waveTransmissiveFvPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/derived/waveTransmissive/waveTransmissiveFvPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：211 行
- 文件标识：`d5508fcccff5`

## 2. 功能说明

该文件声明或实现 `waveTransmissiveFvPatchField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：This boundary condition provides a wave transmissive outflow condition, based on solving DDt(W, field) = 0 at the boundary \c W is the wave velocity and \c field is the field to which this boundary condition is applied. The wave speed is calculated using: \f[ w_p = \frac{\phi_p}{|Sf|} + \sqrt{\frac{\gamma}{\psi_p}} \f] where \vartable w_p | patch wave speed \phi_p | patch face flux \psi_p | patch compressibility Sf | patch face area vector \gamma | ratio of specific heats \endvartable Usage \table Property | Description | Required | Default value phi | flux field name | no | phi rho | density field name | no | rho psi | compressibility field name | no | psi gamma | ratio of specific heats (Cp/Cv) | yes | \endtable Example of the boundary condition specification: \verbatim <patchName> { type waveTransmissive; phi phi; psi psi; gamma 1.4; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `waveTransmissiveFvPatchField` | 95 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `gamma` | 168 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`advectiveFvPatchFields.H`](../../../05-finite-volume/files/b3/advectivefvpatchfields.h--b3baac502ddf.md)
- [`waveTransmissiveFvPatchField.C`](../../../05-finite-volume/files/3f/wavetransmissivefvpatchfield.c--3f79e0a3fac8.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/derived/waveTransmissive/waveTransmissiveFvPatchField.C](../../../05-finite-volume/files/3f/wavetransmissivefvpatchfield.c--3f79e0a3fac8.md)
- [src/finiteVolume/fields/fvPatchFields/derived/waveTransmissive/waveTransmissiveFvPatchFields.H](../../../05-finite-volume/files/93/wavetransmissivefvpatchfields.h--93b58c548f8c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
