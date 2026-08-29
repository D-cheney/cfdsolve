---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f00ad546206b"
title: "OpenFOAM 14 源码解析：MRFFreestreamVelocityFvPatchVectorField.H"
summary: "该文件声明或实现 `MRFFreestreamVelocityFvPatchVectorField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/MRF/derivedFvPatchFields/MRFFreestreamVelocity/MRFFreestreamVelocityFvPatchVectorField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：MRFFreestreamVelocityFvPatchVectorField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/MRF/derivedFvPatchFields/MRFFreestreamVelocity/MRFFreestreamVelocityFvPatchVectorField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：173 行
- 文件标识：`f00ad546206b`

## 2. 功能说明

该文件声明或实现 `MRFFreestreamVelocityFvPatchVectorField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Freestream velocity condition to be used for a wall rotating with the moving frame in an MRF (multi-reference frame) or SRF (single reference frame) case. Given the free stream velocity in the absolute frame at time 0, the condition applies the appropriate rotation transformation in time and space to determine the current freestream velocity. Usage \table Property | Description | Required | Default value freestreamValue0 | freestream velocity at t=0 | yes | freestreamValue | freestream velocity at t | yes | \endtable Example of the boundary condition specification: \verbatim <patchName> { type MRFFreestreamVelocity; freestreamValue0 (1 0 0); freestreamValue uniform (1 0 0); } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `MRFFreestreamVelocityFvPatchVectorField` | 82 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`freestreamVelocityFvPatchVectorField.H`](../../../05-finite-volume/files/70/freestreamvelocityfvpatchvectorfield.h--703994b9c322.md)
- [`MRFPatchField.H`](../../../05-finite-volume/files/9e/mrfpatchfield.h--9e8714f81310.md)

## 8. 直接上层引用

- [src/finiteVolume/cfdTools/general/MRF/derivedFvPatchFields/MRFFreestreamVelocity/MRFFreestreamVelocityFvPatchVectorField.C](../../../05-finite-volume/files/5e/mrffreestreamvelocityfvpatchvectorfield.c--5e111e36a65e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
