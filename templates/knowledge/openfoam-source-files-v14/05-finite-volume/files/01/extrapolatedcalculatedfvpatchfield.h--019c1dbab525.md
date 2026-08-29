---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-019c1dbab525"
title: "OpenFOAM 14 源码解析：extrapolatedCalculatedFvPatchField.H"
summary: "该文件声明或实现 `extrapolatedCalculatedFvPatchField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/basic/extrapolatedCalculated/extrapolatedCalculatedFvPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：extrapolatedCalculatedFvPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/basic/extrapolatedCalculated/extrapolatedCalculatedFvPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：170 行
- 文件标识：`019c1dbab525`

## 2. 功能说明

该文件声明或实现 `extrapolatedCalculatedFvPatchField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：This boundary condition applies a zero-gradient condition from the patch internal field onto the patch faces when \c evaluated but may also be assigned. \c snGrad returns the patch gradient evaluated from the current internal and patch field values rather than returning zero. Usage Example of the boundary condition specification: \verbatim <patchName> { type extrapolatedCalculated; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `extrapolatedCalculatedFvPatchField` | 66 |

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

- [`calculatedFvPatchField.H`](../../../05-finite-volume/files/6e/calculatedfvpatchfield.h--6e08a0bda567.md)
- [`extrapolatedCalculatedFvPatchField.C`](../../../05-finite-volume/files/5b/extrapolatedcalculatedfvpatchfield.c--5b36bdb64c3e.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/basic/extrapolatedCalculated/extrapolatedCalculatedFvPatchField.C](../../../05-finite-volume/files/5b/extrapolatedcalculatedfvpatchfield.c--5b36bdb64c3e.md)
- [src/finiteVolume/fields/fvPatchFields/basic/extrapolatedCalculated/extrapolatedCalculatedFvPatchFields.H](../../../05-finite-volume/files/27/extrapolatedcalculatedfvpatchfields.h--279c6557ffdc.md)
- [src/finiteVolume/finiteVolume/gradSchemes/gaussGrad/gaussGrad.C](../../../05-finite-volume/files/e7/gaussgrad.c--e74536729fa7.md)
- [src/finiteVolume/finiteVolume/gradSchemes/LeastSquaresGrad/LeastSquaresGrad.C](../../../05-finite-volume/files/9c/leastsquaresgrad.c--9cb874371faa.md)
- [src/finiteVolume/finiteVolume/gradSchemes/leastSquaresGrad/leastSquaresGrad.C](../../../05-finite-volume/files/f5/leastsquaresgrad.c--f569717e54c1.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
