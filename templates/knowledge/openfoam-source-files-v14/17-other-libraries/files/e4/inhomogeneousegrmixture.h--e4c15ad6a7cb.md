---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e4c15ad6a7cb"
title: "OpenFOAM 14 源码解析：inhomogeneousEGRMixture.H"
summary: "该文件声明或实现 `inhomogeneousEGRMixture`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/mixtures/inhomogeneousEGRMixture/inhomogeneousEGRMixture.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：inhomogeneousEGRMixture.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/mixtures/inhomogeneousEGRMixture/inhomogeneousEGRMixture.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：198 行
- 文件标识：`e4c15ad6a7cb`

## 2. 功能说明

该文件声明或实现 `inhomogeneousEGRMixture`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Combustion mixture for inhomogeneous lean, stoichiometric or rich conditions with exhaust gas recirculation in which the mixture-fraction \c ft, fuel mass-fraction \c fu and exhaust gas recirculation mass-fraction \c egr define the composition.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `inhomogeneousEGRMixture` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`FieldListSlice.H`](../../../08-thermophysical/files/24/fieldlistslice.h--24d64925b760.md)
- [`inhomogeneousEGRMixture.C`](../../../17-other-libraries/files/ab/inhomogeneousegrmixture.c--abb96c75750c.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/mixtures/inhomogeneousEGRMixture/inhomogeneousEGRMixture.C](../../../17-other-libraries/files/ab/inhomogeneousegrmixture.c--abb96c75750c.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermos.C](../../../17-other-libraries/files/cb/psiumulticomponentthermos.c--cbf50cf75a91.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
