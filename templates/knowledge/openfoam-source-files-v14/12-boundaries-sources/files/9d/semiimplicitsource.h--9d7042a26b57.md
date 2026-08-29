---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9d7042a26b57"
title: "OpenFOAM 14 源码解析：semiImplicitSource.H"
summary: "该文件声明或实现 `semiImplicitSource`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/semiImplicitSource/semiImplicitSource.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：semiImplicitSource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/semiImplicitSource/semiImplicitSource.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：263 行
- 文件标识：`9d7042a26b57`

## 2. 功能说明

该文件声明或实现 `semiImplicitSource`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Semi-implicit source, described using an input dictionary. The injection rate coefficients are specified as pairs of Su-Sp coefficients, i.e. \f[ S(x) = S_u + S_p x \f] where \vartable S(x) | net source for field 'x' S_u | explicit source contribution S_p | linearised implicit contribution \endvartable Example tabulated heat source specification for internal energy: \verbatim volumeMode absolute; // specific sources { e { explicit table ((0 0) (1.5 \&#36;power)); implicit 0; } } \endverbatim Example coded heat source specification for enthalpy: \verbatim volumeMode absolute; // specific sources { h { explicit { type coded; name heatInjection; code #{ // Power amplitude const scalar powerAmplitude = 1000; // x is the current time return mag(powerAmplitude*sin(x)); #}; } implicit 0; } } \endverbatim Valid fvModels for the \c volumeMode entry include: - absolute: values are given as \<quantity\>

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `semiImplicitSource` | 116 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)
- [`fvCellZone.H`](../../../05-finite-volume/files/be/fvcellzone.h--bee09cd009b8.md)
- [`HashPtrTable.H`](../../../04-core-runtime/files/4a/hashptrtable.h--4ab8e1bdb8c9.md)
- [`unknownTypeFunction1.H`](../../../04-core-runtime/files/dc/unknowntypefunction1.h--dcb44a115638.md)

## 8. 直接上层引用

- [src/fvModels/general/semiImplicitSource/semiImplicitSource.C](../../../12-boundaries-sources/files/e1/semiimplicitsource.c--e173b994ccc9.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
