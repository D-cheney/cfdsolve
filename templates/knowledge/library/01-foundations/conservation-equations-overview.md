---
template_version: "flowlab-knowledge/1.0"
slug: conservation-equations-overview
title: 质量、动量与能量守恒方程概览
summary: 从控制体观点梳理连续性、Navier–Stokes 和总能量方程，解释守恒通量、源项、闭合关系以及方程形式与边界条件之间的联系。
category:
  slug: governing-equations
  name: 控制方程与物理建模
level: 进阶
reading_minutes: 14
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [控制方程, 质量守恒, 动量守恒, 能量守恒, Navier-Stokes]
seo:
  title: CFD 质量、动量与能量守恒方程｜流研工坊
  description: 从控制体和通量观点理解 CFD 求解的质量、动量与能量方程及闭合关系。
  keywords: [连续性方程, Navier-Stokes, 能量方程, 守恒形式]
---

# 质量、动量与能量守恒方程概览

CFD 的核心是让每个控制体满足守恒。守恒形式直接描述某个量在控制体内的积累、穿过表面的净通量和体源项之间的平衡，也是有限体积法具有局部守恒性的基础。

## 1. 质量守恒

```text
∂ρ/∂t + ∇·(ρu) = 0
```

不可压缩且密度恒定时化为 `∇·u = 0`。这并不表示压力不重要；压力通过动量方程与连续性约束共同决定速度场。

## 2. 动量守恒

```text
∂(ρu)/∂t + ∇·(ρu⊗u) = -∇p + ∇·τ + ρg + S_m
```

左侧是动量积累与对流，右侧包含压力、黏性应力、重力和其他源项。牛顿流体的应力需要黏度和速度梯度关系。湍流平均后还会出现雷诺应力，必须通过湍流模型闭合。

## 3. 能量守恒

可压缩流常求总能量，低速传热也可使用焓或温度形式。能量通量包含对流、导热、压力功和黏性功；辐射、反应和相变通过额外源项耦合。省略能量方程前，应确认温度不会反过来影响密度、物性或浮力。

## 4. 闭合关系

方程组还需要状态方程、物性关系、湍流闭合、组分扩散和相间交换模型。每增加一个输运变量，都必须检查相应的初始条件、边界条件和物性输入是否完整。

## 5. 控制体检查

对任意稳定控制体，应验证：

```text
净流出通量 - 体源项 = 0
```

如果局部残差很小但全局质量或能量不平衡较大，说明离散、边界或收敛仍有问题。守恒报表应成为计算验收的一部分。

## 6. 参考资料

1. Ferziger, Perić & Street, *Computational Methods for Fluid Dynamics*.
2. Moukalled, Mangani & Darwish, *The Finite Volume Method in Computational Fluid Dynamics*.

