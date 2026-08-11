---
template_version: "flowlab-knowledge/1.0"
slug: finite-volume-method
title: 有限体积法：从积分守恒到离散方程
summary: 解释有限体积法如何对控制体积分并计算面通量，说明单元中心变量、面值重构、源项线性化和局部守恒的工程意义。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 进阶
reading_minutes: 14
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [有限体积法, 离散, 通量, 局部守恒, CFD]
seo:
  title: CFD 有限体积法基础｜流研工坊
  description: 从控制体积分、面通量和源项理解有限体积离散及局部守恒性。
  keywords: [有限体积法, 控制体, 面通量, CFD 离散]
---

# 有限体积法：从积分守恒到离散方程

有限体积法把计算域划分为互不重叠的控制体，并在每个控制体上执行守恒平衡。它不要求变量在单元内部精确变化，只要求通过各个面的通量计算一致，因此适合复杂几何和守恒律问题。

## 1. 通用输运方程

```text
∂(ρφ)/∂t + ∇·(ρuφ) = ∇·(Γ∇φ) + Sφ
```

对控制体积分并使用高斯定理后，体积分中的散度转换为各面的通量和。离散问题由“每个面的对流通量、扩散通量和源项怎样近似”决定。

## 2. 单元中心与面值

多数求解器把压力、速度和温度保存在单元中心。计算面通量时需要从相邻单元重构面值。迎风、中心和高分辨率格式的主要差别就在这一重构过程。

## 3. 离散方程结构

每个控制体最终得到：

```text
aP φP = Σ aN φN + b
```

系数应保持合理的对角占优和有界性。强非线性源项通常需要线性化；不正确的源项符号可能破坏稳定性或产生非物理解。

## 4. 局部守恒

共享面的通量对相邻两个控制体符号相反，因此内部面贡献在全局求和时抵消。实现和后处理都应使用与求解一致的面通量，而不是仅用节点插值估算守恒量。

## 5. 工程检查

- 网格面法向和体积必须有效；
- 关注非正交修正与梯度重构；
- 高阶格式需要有界限制器；
- 比较一阶与二阶结果，量化数值耗散；
- 用整体守恒和网格加密验证离散实现。

## 6. 参考资料

1. Patankar, *Numerical Heat Transfer and Fluid Flow*.
2. Moukalled, Mangani & Darwish, *The Finite Volume Method in Computational Fluid Dynamics*.

