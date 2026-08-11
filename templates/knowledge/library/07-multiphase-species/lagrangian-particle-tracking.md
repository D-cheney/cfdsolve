---
template_version: "flowlab-knowledge/1.0"
slug: lagrangian-particle-tracking
title: 拉格朗日颗粒追踪与双向耦合
summary: 说明离散颗粒的受力、时间积分、湍流扩散、壁面相互作用和单向/双向耦合，给出颗粒统计收敛与质量平衡检查。
category:
  slug: multiphase-flow
  name: 多相流与组分输运
level: 工程
reading_minutes: 13
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [颗粒追踪, DPM, 双向耦合, 沉积, 湍流扩散]
seo:
  title: CFD 拉格朗日颗粒追踪指南｜流研工坊
  description: 设置颗粒受力、注入、壁面行为与双向耦合，并检查颗粒统计量。
  keywords: [DPM, 拉格朗日颗粒, 颗粒沉积, 双向耦合]
---

# 拉格朗日颗粒追踪与双向耦合

Euler–Lagrange 方法在连续相流场中追踪代表性颗粒包。它适合分散相体积分数较低、粒子轨迹和停留时间重要的问题。

## 1. 运动方程

颗粒受力通常包括阻力、重力/浮力，必要时加入升力、压力梯度、虚质量和布朗力。阻力关联式依赖粒子 Re、形状和局部浓度，非球形颗粒需额外修正。

## 2. 注入定义

定义粒径分布、密度、温度、速度、质量流率、空间分布和释放时间。数值颗粒包数量应足够，使沉积率和停留时间统计不再随样本量显著变化。

## 3. 湍流扩散

RANS 只提供平均流场，颗粒脉动扩散常用随机游走或涡相互作用模型补充。随机模型需要不同随机种子或足够样本评估统计波动。

## 4. 壁面与耦合

壁面可捕集、反弹、滑移、破碎或再悬浮。高质量负载时，颗粒向流体回传动量和能量，需要双向耦合；更高浓度可能超出离散稀相假设。

## 5. 验证

检查注入质量等于逃逸、捕集和域内存量之和。比较终端沉降速度、弯管沉积率或实验粒径分级，并报告样本独立性。

## 6. 参考资料

1. Crowe et al., *Multiphase Flows with Droplets and Particles*.
2. Maxey & Riley, “Equation of Motion for a Small Rigid Sphere in a Nonuniform Flow,” 1983.

