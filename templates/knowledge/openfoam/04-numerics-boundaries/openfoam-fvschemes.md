---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-fvschemes
title: OpenFOAM fvSchemes 离散格式与有界性
summary: 按时间、梯度、对流、扩散和插值项解释 fvSchemes 的选择原则，给出从稳健一阶基线到高阶格式的升级路线及有界性验证方法。
category: { slug: openfoam-numerics-boundaries, name: OpenFOAM 边界与数值设置 }
level: 进阶
reading_minutes: 15
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, fvSchemes, 离散格式, 有界性, 对流项]
seo:
  title: OpenFOAM fvSchemes 离散格式选择
  description: 为时间、对流和扩散项选择稳健且准确的格式，并检查有界性与数值扩散。
  keywords: [fvSchemes, divSchemes, OpenFOAM discretization]
---

# OpenFOAM fvSchemes 离散格式与有界性

格式选择是在精度、耗散、有界性和网格适应性之间权衡。一个“稳定”的低阶结果可能因数值扩散而偏差很大。

## 1. 按算子理解

- `ddtSchemes`：时间精度与历史时间层；
- `gradSchemes`：梯度重构，影响压力、黏性和限制器；
- `divSchemes`：对流与应力散度，是有界性风险核心；
- `laplacianSchemes`：扩散项及非正交修正；
- `interpolationSchemes` 与法向梯度：面值和面法向导数。

具体关键字和可用格式以当前版本为准。

## 2. 升级路线

1. 使用官方同类教程的保守配置建立可收敛基线；
2. 检查网格和边界，而不是用一阶格式掩盖错误；
3. 对目标变量逐项升级到限制高阶格式；
4. 比较压降、力、热流和极值，而非只比较残差；
5. 做网格与格式联合敏感性分析。

## 3. 有界性

速度、压力可出现物理超调，但相分数、质量分数、湍流尺度和绝对温度有明确可实现范围。出现越界时检查时间步、格式、边界回流、源项和网格质量；裁剪只能作为受控保护，并记录其对守恒的影响。

## 4. 非正交修正

修正项能减小非正交误差，但过多修正会增加成本且不能挽救严重坏网格。应定位坏单元，并比较修正次数对目标量的影响。

## 5. 参考资料

1. 当前 OpenFOAM 版本的 Numerical Schemes 文档。
2. Greenshields & Weller, *Notes on Computational Fluid Dynamics*。

