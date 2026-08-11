---
template_version: "flowlab-knowledge/1.0"
slug: k-epsilon-model-guide
title: 标准、RNG 与可实现 k-ε 模型使用指南
summary: 解释 k-ε 模型的变量、涡黏假设和常见变体，说明自由剪切流、普通内流、旋流与近壁处理中的适用范围和检查重点。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 进阶
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [k-epsilon, RNG, 可实现模型, 湍流耗散率, 壁函数]
seo:
  title: k-ε 湍流模型使用指南｜流研工坊
  description: 比较标准、RNG 和可实现 k-ε 模型的假设、适用流动和近壁要求。
  keywords: [k-epsilon, RNG k-epsilon, realizable k-epsilon, 湍流模型]
---

# 标准、RNG 与可实现 k-ε 模型使用指南

k-ε 模型求解湍动能 `k` 和耗散率 `ε`，通过湍流黏度表达雷诺应力。它计算成本低、稳健性好，但对强各向异性、强分离和近壁细节存在局限。

## 1. 基本尺度

```text
μt = Cμ ρ k² / ε
```

`k` 表示速度脉动能量尺度，`ε` 表示能量向小尺度耗散的速率。入口值可由湍流强度和长度尺度换算，但估算关系及常数需与求解器一致。

## 2. 变体差异

标准模型是成熟基线；RNG 变体调整耗散方程并常用于较强应变或旋流；可实现模型修改 `Cμ` 和耗散方程，使部分数学约束更合理。不同软件还可能附带浮力、压缩性和旋流修正，应记录开关。

## 3. 近壁处理

k-ε 通常与壁函数配合，首层网格应落入模型适用的 y+ 范围。增强型或两层近壁处理可以覆盖更低 y+，但需要足够法向分辨率和连续的棱柱层。

## 4. 适用与风险

普通管流、混合和自由剪切流常可作为首选基线。强逆压梯度、精确分离位置、旋转曲率或冲击—边界层相互作用应与 SST、雷诺应力模型或实验对比。

## 5. 验证

检查 `k`、`ε`、湍流黏度比和壁面 y+ 是否合理，并比较压降、速度剖面、剪切应力和换热。仅凭残差不能验证湍流闭合。

## 6. 参考资料

1. Launder & Spalding, “The Numerical Computation of Turbulent Flows,” 1974.
2. Pope, *Turbulent Flows*.

