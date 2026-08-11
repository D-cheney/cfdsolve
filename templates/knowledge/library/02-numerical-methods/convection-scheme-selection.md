---
template_version: "flowlab-knowledge/1.0"
slug: convection-scheme-selection
title: 对流项离散格式选择与有界性检查
summary: 比较一阶迎风、二阶迎风、中心差分和高分辨率格式的耗散、精度与稳定性，说明用网格 Péclet 数和变量有界性选择格式的方法。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 进阶
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [对流离散, 迎风格式, 中心差分, 有界性, 数值耗散]
seo:
  title: CFD 对流项离散格式选择｜流研工坊
  description: 比较迎风、中心与高分辨率格式，兼顾稳定、有界和空间精度。
  keywords: [一阶迎风, 二阶迎风, 中心差分, 数值耗散]
---

# 对流项离散格式选择与有界性检查

对流占优问题最容易在“稳定但过度耗散”和“高阶但出现振荡”之间失衡。格式选择应结合网格质量、局部梯度和目标量，而不是只根据求解器默认值。

## 1. 主要格式特征

一阶迎风使用上游单元值，稳定且通常有界，但会抹平剪切层、涡和温度前沿。二阶迎风通过梯度重构提高精度，对坏网格和初始场更敏感。中心差分耗散小，适合解析充分的光滑流动，但在强对流或激波附近可能产生非物理振荡。

## 2. 网格 Péclet 数

```text
Pe_cell = ρ |u·n| Δ / Γ
```

当单元尺度上的对流远强于扩散，未经限制的中心格式更难保持有界。此时应改善沿流向网格、使用有界高阶格式或限制器，而不是单纯增加迭代次数。

## 3. 推荐切换流程

1. 用一阶格式获得物理合理的初始场；
2. 检查边界、守恒和网格质量；
3. 切换到二阶或高分辨率格式；
4. 重新收敛并比较压降、力、热流和峰值；
5. 将格式差异纳入数值不确定度说明。

## 4. 有界性检查

质量分数应处于 0～1，绝对温度必须为正，被动标量不应越过边界极值（没有源项时）。出现超调时，先定位高梯度区和网格畸变，再选择限制器或细化网格。

## 5. 常见误区

“二阶”只描述名义截断误差，不保证在任意非结构网格上都达到二阶精度。若梯度重构、非正交修正或限制器频繁生效，实际精度会下降。

## 6. 参考资料

1. Versteeg & Malalasekera, *An Introduction to Computational Fluid Dynamics*.
2. Hirsch, *Numerical Computation of Internal and External Flows*.

