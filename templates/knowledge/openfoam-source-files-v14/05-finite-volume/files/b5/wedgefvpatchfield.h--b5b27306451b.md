---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b5b27306451b"
title: "OpenFOAM 14 源码解析：wedgeFvPatchField.H"
summary: "该文件声明或实现 `wedgeFvPatchField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/constraint/wedge/wedgeFvPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：wedgeFvPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/constraint/wedge/wedgeFvPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：178 行
- 文件标识：`b5b27306451b`

## 2. 功能说明

该文件声明或实现 `wedgeFvPatchField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：This boundary condition is similar to the cyclic condition, except that it is applied to 2-D geometries. Usage Example of the boundary condition specification: \verbatim <patchName> { type wedge; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `wedgeFvPatchField` | 68 |

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

- [`transformFvPatchField.H`](../../../05-finite-volume/files/07/transformfvpatchfield.h--077145358b67.md)
- [`wedgeFvPatch.H`](../../../05-finite-volume/files/2c/wedgefvpatch.h--2c6baa534871.md)
- [`wedgeFvPatchField.C`](../../../05-finite-volume/files/85/wedgefvpatchfield.c--8559b1e694bd.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/constraint/wedge/wedgeFvPatchField.C](../../../05-finite-volume/files/85/wedgefvpatchfield.c--8559b1e694bd.md)
- [src/finiteVolume/fields/fvPatchFields/constraint/wedge/wedgeFvPatchFields.H](../../../05-finite-volume/files/db/wedgefvpatchfields.h--dbf6bbff2297.md)
- [src/finiteVolume/fields/fvPatchFields/constraint/wedge/wedgeFvPatchScalarField.C](../../../05-finite-volume/files/e3/wedgefvpatchscalarfield.c--e322e3b6e62c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
