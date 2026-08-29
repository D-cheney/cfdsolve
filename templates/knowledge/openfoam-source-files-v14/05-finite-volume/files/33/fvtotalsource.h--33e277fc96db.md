---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-33e277fc96db"
title: "OpenFOAM 14 源码解析：fvTotalSource.H"
summary: "该文件声明或实现 `fvTotalSource`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/fvSource/fvTotalSource.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvTotalSource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/fvSource/fvTotalSource.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：185 行
- 文件标识：`33e277fc96db`

## 2. 功能说明

该文件声明或实现 `fvTotalSource`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Base class for sources which are specified as a total value (e.g., volume or mass flow rate), rather than a specific value (e.g., mass flow rate per unit volume).

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvTotalSource` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fvSource.H`](../../../05-finite-volume/files/de/fvsource.h--dea7bbe6bfb1.md)
- [`cellZone.H`](../../../04-core-runtime/files/57/cellzone.h--5790d28e8238.md)
- [`fvTotalSourceI.H`](../../../05-finite-volume/files/2b/fvtotalsourcei.h--2b91c5f47bf4.md)
- [`fvTotalSourceTemplates.C`](../../../05-finite-volume/files/c4/fvtotalsourcetemplates.c--c46a827a12e7.md)

## 8. 直接上层引用

- [src/finiteVolume/cfdTools/general/fvSource/fvTotalSource.C](../../../05-finite-volume/files/42/fvtotalsource.c--42124cd3c6b1.md)
- [src/finiteVolume/cfdTools/general/fvSource/fvTotalSourceI.H](../../../05-finite-volume/files/2b/fvtotalsourcei.h--2b91c5f47bf4.md)
- [src/finiteVolume/cfdTools/general/fvSource/fvTotalSourceTemplates.C](../../../05-finite-volume/files/c4/fvtotalsourcetemplates.c--c46a827a12e7.md)
- [src/fvModels/general/massSource/massSourceBase.H](../../../12-boundaries-sources/files/71/masssourcebase.h--714be527897d.md)
- [src/fvModels/general/volumeSource/volumeSource.H](../../../12-boundaries-sources/files/8b/volumesource.h--8ba61b19115b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
