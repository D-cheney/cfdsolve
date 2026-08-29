---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a2f6ceb60544"
title: "OpenFOAM 14 源码解析：singleStepReaction.H"
summary: "该文件声明或实现 `singleStepReaction`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/reactionModels/singleStepReaction/singleStepReaction.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：singleStepReaction.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/reactionModels/singleStepReaction/singleStepReaction.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：201 行
- 文件标识：`a2f6ceb60544`

## 2. 功能说明

该文件声明或实现 `singleStepReaction`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base class for single-step reaction models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `singleStepReaction` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`reactionModel.H`](../../../08-thermophysical/files/cf/reactionmodel.h--cf0e29c1fdfe.md)
- [`reaction.H`](../../../08-thermophysical/files/95/reaction.h--959fe5a22284.md)
- [`singleStepReactionI.H`](../../../08-thermophysical/files/4b/singlestepreactioni.h--4babe74eaf6b.md)

## 8. 直接上层引用

- [src/reactionModels/diffusion/diffusion.H](../../../08-thermophysical/files/79/diffusion.h--793783c89799.md)
- [src/reactionModels/FSD/FSD.H](../../../08-thermophysical/files/59/fsd.h--5976eef5139c.md)
- [src/reactionModels/infinitelyFastChemistry/infinitelyFastChemistry.H](../../../08-thermophysical/files/e3/infinitelyfastchemistry.h--e39677bc8219.md)
- [src/reactionModels/radiationModels/sootModels/mixtureFraction/mixtureFraction.C](../../../08-thermophysical/files/b8/mixturefraction.c--b8b257544927.md)
- [src/reactionModels/singleStepReaction/singleStepReaction.C](../../../08-thermophysical/files/68/singlestepreaction.c--68542a740971.md)
- [src/reactionModels/singleStepReaction/singleStepReactionI.H](../../../08-thermophysical/files/4b/singlestepreactioni.h--4babe74eaf6b.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
