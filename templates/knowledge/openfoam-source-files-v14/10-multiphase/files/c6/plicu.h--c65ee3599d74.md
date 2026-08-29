---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c65ee3599d74"
title: "OpenFOAM 14 源码解析：PLICU.H"
summary: "该文件声明或实现 `PLICU`，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceCompression/PLIC/PLICU.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：PLICU.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceCompression/PLIC/PLICU.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：136 行
- 文件标识：`c65ee3599d74`

## 2. 功能说明

该文件声明或实现 `PLICU`，属于“多相与界面”模块。

中文导航角色：两相流与界面模型。

上游说明：Velocity-weighted Piecewise-Linear Interface Calculation (PLICU) corrected scheme is a surface interpolation scheme for flux calculation in advection of a bounded variable, e.g. phase fraction and for interface capturing in the volume of fluid (VoF) method. The interface is represented by single cuts which split each cell to match the volume fraction of the phase in the cell. The cut planes are oriented according to the point field of the local phase fraction. The phase fraction at each cell face - the interpolated value - is then calculated from the face area on either side of the cut. For cases where the single-cut does not accurately represent the cell volume fraction the specified default scheme is used, e.g. interfaceCompression. Additionally the face point velocity values are used to calculate the face flux which is likely to be more accurate in the presence of high shear. Example:

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PLICU` | 86 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`PLIC.H`](../../../10-multiphase/files/ab/plic.h--ab8a039dcc43.md)

## 8. 直接上层引用

- [src/twoPhaseModels/interfaceCompression/PLIC/PLICU.C](../../../10-multiphase/files/17/plicu.c--17a53f583bae.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
