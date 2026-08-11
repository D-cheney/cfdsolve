---
template_version: "flowlab-knowledge/1.0"
slug: species-transport-reaction
title: 组分输运、扩散与反应源项建模
summary: 说明质量分数输运、分子与湍流扩散、入口组分归一化、有限速率反应和能量耦合，并给出组分与元素守恒检查。
category:
  slug: multiphase-flow
  name: 多相流与组分输运
level: 进阶
reading_minutes: 13
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [组分输运, 扩散, 化学反应, 质量分数, 元素守恒]
seo:
  title: CFD 组分输运与反应源项｜流研工坊
  description: 设置质量分数、扩散系数和反应源项，并验证组分、元素和能量守恒。
  keywords: [组分输运, 质量分数, CFD 扩散, 反应流]
---

# 组分输运、扩散与反应源项建模

组分输运在对流之外还包含分子扩散、湍流扩散和化学源项。每个入口的组分基准、物性和反应机理必须一致。

## 1. 质量分数

各组分质量分数应满足：

```text
Σ Yi = 1,  0 ≤ Yi ≤ 1
```

软件可能只求解 `N-1` 个组分并由总和得到最后一个。输入前确认质量分数与摩尔分数换算，以及惰性组分的定义。

## 2. 扩散模型

稀混合物可使用 Fick 型扩散，复杂混合物可能需要多组分扩散、热扩散或压力扩散。湍流扩散通常由湍流 Schmidt 数控制，对混合长度和峰值浓度有直接影响。

## 3. 反应与能量

有限速率反应源项可能高度刚性，需要合理时间步和化学求解策略。放热/吸热必须与能量方程耦合，生成焓、比热和温度依赖速率应使用一致热力学数据。

## 4. 边界与初始化

入口组分和温度应对应同一工况；出口回流也需给定组分。初始场若与入口差异过大，会造成强烈瞬态或非物理反应峰。

## 5. 验证

检查各组分质量、元素和总质量守恒，确认质量分数有界。用零维反应器、层流火焰速度、混合分数或无反应标量基准逐级验证。

## 6. 参考资料

1. Poinsot & Veynante, *Theoretical and Numerical Combustion*.
2. Bird, Stewart & Lightfoot, *Transport Phenomena*.

