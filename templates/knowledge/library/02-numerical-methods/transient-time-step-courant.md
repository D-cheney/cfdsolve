---
template_version: "flowlab-knowledge/1.0"
slug: transient-time-step-courant
title: 瞬态 CFD 的时间步、Courant 数与采样长度
summary: 说明如何依据对流时间尺度、扩散时间尺度、旋转周期和目标频率选择时间步，并区分稳定性限制、时间离散误差和统计采样要求。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 工程
reading_minutes: 13
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [瞬态CFD, 时间步, Courant数, 时间尺度, 频率]
seo:
  title: 瞬态 CFD 时间步与 Courant 数｜流研工坊
  description: 从物理时间尺度、CFL 和目标频率确定瞬态 CFD 的时间步与采样时长。
  keywords: [CFD 时间步, Courant 数, CFL, 瞬态计算]
---

# 瞬态 CFD 的时间步、Courant 数与采样长度

隐式算法即使在较大时间步下不发散，也可能丢失涡脱落、压力脉动或热前沿。时间步必须同时满足物理分辨率、数值误差和求解成本要求。

## 1. 主要尺度

```text
对流时间尺度: tc = L / U
单元 Courant 数: Co = |u| Δt / Δx
目标周期: T = 1 / f
```

旋转机械还需按每步转角控制时间分辨率；扩散主导问题应关注 `Δx²/α` 尺度。多尺度问题由最小且与目标量相关的尺度决定。

## 2. 时间步选择流程

1. 估计目标最高频率和最短物理过程；
2. 用局部最小网格估算最大 Co；
3. 根据离散格式和求解器建议给出初值；
4. 运行多个特征时间使初始瞬态消失；
5. 将时间步减半，比较均值、幅值、相位和主频。

## 3. 稳定与准确的区别

显式格式通常受严格 CFL 稳定上限约束；隐式格式可能允许更大的 Co，但时间精度仍会恶化。LES、VOF 界面和激波等问题常需更严格的局部 Co 控制。

## 4. 每步内迭代

每个时间步都应使方程误差降到不会污染时间离散误差的水平。监控每步质量不平衡和目标量变化；若单步内尚未收敛就推进，结果等价于引入额外数值误差。

## 5. 采样长度

统计量应在初始过程结束后采集，并覆盖足够多的主周期。频谱分辨率约为 `1/Tsample`，因此要识别很低频的波动，需要更长的物理采样时间，而不是更小时间步。

## 6. 参考资料

1. Ferziger, Perić & Street, *Computational Methods for Fluid Dynamics*.
2. Pope, *Turbulent Flows*.

