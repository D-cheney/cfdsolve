---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2c6baa534871"
title: "OpenFOAM 14 源码解析：wedgeFvPatch.H"
summary: "该文件声明或实现 `wedgeFvPatch`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/fvPatches/constraint/wedge/wedgeFvPatch.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：wedgeFvPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/fvPatches/constraint/wedge/wedgeFvPatch.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：103 行
- 文件标识：`2c6baa534871`

## 2. 功能说明

该文件声明或实现 `wedgeFvPatch`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Wedge front and back plane patch.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `wedgeFvPatch` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvPatch.H`](../../../05-finite-volume/files/c6/fvpatch.h--c645cd2545f4.md)
- [`wedgePolyPatch.H`](../../../04-core-runtime/files/c3/wedgepolypatch.h--c331343fe38f.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/constraint/wedge/wedgeFvPatchField.C](../../../05-finite-volume/files/85/wedgefvpatchfield.c--8559b1e694bd.md)
- [src/finiteVolume/fields/fvPatchFields/constraint/wedge/wedgeFvPatchField.H](../../../05-finite-volume/files/b5/wedgefvpatchfield.h--b5b27306451b.md)
- [src/finiteVolume/fields/fvsPatchFields/constraint/wedge/wedgeFvsPatchField.H](../../../05-finite-volume/files/64/wedgefvspatchfield.h--643954a134ae.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/MULESlimiter.C](../../../05-finite-volume/files/d9/muleslimiter.c--d9d0373c961c.md)
- [src/finiteVolume/fvMatrices/solvers/MULES/MULESTemplates.C](../../../05-finite-volume/files/9d/mulestemplates.c--9d1fa1509f79.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/wedge/wedgeFvPatch.C](../../../05-finite-volume/files/e4/wedgefvpatch.c--e45181761856.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
