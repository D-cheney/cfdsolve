---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-66b5d5583c14"
title: "OpenFOAM 14 源码解析：zeroDimensionalMassSource.H"
summary: "该文件声明或实现 `zeroDimensionalMassSource`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/zeroDimensionalMassSource/zeroDimensionalMassSource.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：zeroDimensionalMassSource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/zeroDimensionalMassSource/zeroDimensionalMassSource.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：139 行
- 文件标识：`66b5d5583c14`

## 2. 功能说明

该文件声明或实现 `zeroDimensionalMassSource`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：This fvModel applies a mass source to the continuity equation and to all field equations, in a zero-dimensional case. Correction is made to account for the mass that exits the domain due to expansion in space, so that the model correctly applies a total mass flow rate. This model requires a corresponding field source to be specified for all solved-for fields. This model will write out additional fields, zeroDimensionalMassSource:m and zeroDimensionalMassSource:factor. The zeroDimensionalMassSource:m field is the total accumulated mass; the sum of the starting mass, plus all mass added by models of this type. This may differ from the actual current mass (= rho*V) within the zero-dimensional cell if pressure or density constraints are being used. The zeroDimensionalMassSource:factor field is the ratio between the current mass or volume and the total accumulated mass or volume. Usage Exampl

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `zeroDimensionalMassSource` | 83 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`zeroDimensionalMassSourceBase.H`](../../../12-boundaries-sources/files/f5/zerodimensionalmasssourcebase.h--f5f54b4375b4.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [src/fvModels/general/zeroDimensionalMassSource/zeroDimensionalMassSource.C](../../../12-boundaries-sources/files/a2/zerodimensionalmasssource.c--a28b1bdd357f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
