---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6feefa26df19"
title: "OpenFOAM 14 源码解析：solidificationMelting.H"
summary: "该文件声明或实现 `solidificationMelting`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/solidificationMelting/solidificationMelting.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：solidificationMelting.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/solidificationMelting/solidificationMelting.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：350 行
- 文件标识：`6feefa26df19`

## 2. 功能说明

该文件声明或实现 `solidificationMelting`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：This source is designed to model the effect of solidification and melting processes, e.g. windshield defrosting. The isotherm phase change occurs at the melting temperature, \c Tsol (= \c Tliq). The not isotherm phase change occurs between solidus and liquidus temperature, \c Tsol < \c Tliq respectively, as long as the melt fraction is greater than the max eutectic melt fraction, \c alpha1e (0 = pure_substance, 1 = eutectic_mixture is not permitted), where a linear eutectic melt fraction to temperature relation is considered; e.g. given a specific quantity of a binary system, \c alpha1 is its melt fraction and \c alpha0 is its solid fraction, such that \c alpha0 = 1 - \c alpha1 therefore, assuming infinite solute diffusion, the quantity of a component in solid phase is (1 - \c alpha1) * \c CS where \c CS is the solid concentration of the considered component and the quantity of a compone

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `solidificationMelting` | 144 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)
- [`fvCellZone.H`](../../../05-finite-volume/files/be/fvcellzone.h--bee09cd009b8.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`NamedEnum.H`](../../../04-core-runtime/files/34/namedenum.h--3437c5255062.md)

## 8. 直接上层引用

- [src/fvModels/general/solidificationMelting/solidificationMelting.C](../../../12-boundaries-sources/files/28/solidificationmelting.c--28dbbd9ceabf.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
