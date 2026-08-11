---
template_version: "flowlab-knowledge/1.0"
slug: k-omega-sst-model-guide
title: k-ω SST 模型与分离流计算指南
summary: 介绍 SST 模型在近壁区与自由流区的混合思想、逆压梯度和分离流优势，以及入口 ω、远场敏感性、y+ 与网格分辨率要求。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 工程
reading_minutes: 13
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [k-omega SST, 分离流, 逆压梯度, y+, 湍流]
seo:
  title: k-ω SST 湍流模型指南｜流研工坊
  description: 理解 SST 模型的混合机制，并正确设置近壁网格和自由来流湍流量。
  keywords: [k-omega SST, SST 湍流模型, 分离流, 逆压梯度]
---

# k-ω SST 模型与分离流计算指南

k-ω SST 在近壁区利用 k-ω 的分辨能力，在远离壁面处逐渐混合为对自由流 `ω` 较不敏感的形式，并通过剪切应力限制改善逆压梯度下的预测。

## 1. 为什么常用于分离流

边界层在逆压梯度下减速并可能分离。SST 对近壁剪切和压力梯度的响应通常优于标准 k-ε，因此常用于翼型、扩压器、叶轮机械和外形气动。但模型优势不等于无需解析分离区网格。

## 2. 网格要求

若采用壁面解析策略，通常以首层 y+ 约 1 为目标，并用足够棱柱层覆盖边界层。流向和展向分辨率也要能够描述分离泡、再附和尾迹。

## 3. 自由来流条件

入口 `k` 与 `ω` 由湍流强度和长度尺度决定。远场 `ω` 过大可能使湍流黏度和边界层发展受影响。应记录换算关系，并对外流远场值做敏感性检查。

## 4. 转捩问题

完全湍流 SST 会从入口开始按湍流处理，不能自动预测自然转捩。若转捩位置影响阻力、分离或换热，应使用经过验证的转捩模型或给定转捩位置，并匹配来流湍流度。

## 5. 验证量

比较壁面压力、摩擦系数、分离/再附位置、尾迹剖面和积分力。模型对这些量的误差可能方向不同，工程选择应围绕主要验收量。

## 6. 参考资料

1. Menter, “Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications,” 1994.
2. Wilcox, *Turbulence Modeling for CFD*.

