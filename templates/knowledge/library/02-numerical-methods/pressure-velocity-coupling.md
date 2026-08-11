---
template_version: "flowlab-knowledge/1.0"
slug: pressure-velocity-coupling
title: 不可压缩流的压力—速度耦合方法
summary: 解释压力在不可压缩流中的约束作用，梳理 SIMPLE、SIMPLEC、PISO 与耦合求解的基本流程、适用场景和常见收敛问题。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 进阶
reading_minutes: 13
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [SIMPLE, PISO, 压力速度耦合, 不可压缩流, 收敛]
seo:
  title: SIMPLE、PISO 与压力速度耦合｜流研工坊
  description: 理解不可压缩 CFD 中压力修正、连续性约束和常见耦合算法。
  keywords: [SIMPLE 算法, PISO, 压力修正, 压力速度耦合]
---

# 不可压缩流的压力—速度耦合方法

不可压缩连续性方程不直接给出压力演化式。数值方法需要调整压力，使动量方程得到的面质量流量满足每个控制体的质量守恒。

## 1. 压力修正思想

SIMPLE 类方法先用当前压力求预测速度，再由连续性建立压力修正方程，随后修正压力、速度和面通量。重复外迭代直到连续性和动量同时收敛。

## 2. 常见算法

- SIMPLE：稳健、内存需求较低，适合多数稳态问题；
- SIMPLEC：减少部分近似带来的保守性，可能加快稳态收敛；
- PISO：一个时间步内进行多次压力校正，适合瞬态计算；
- 全耦合：同时处理动量与压力变量，迭代次数可能更少，但单步成本和内存较高。

## 3. 棋盘格与面通量

同位网格若直接插值压力和速度，可能产生压力棋盘格。工程求解器通常使用 Rhie–Chow 类面通量插值抑制解耦。自编程序必须验证均匀压力梯度与网格畸变下的行为。

## 4. 参数选择

稳态问题可从保守的压力、动量松弛开始，获得稳定趋势后再提高。瞬态 PISO 更应通过时间步和每步内迭代控制误差，不宜把过小松弛当作长期补救。

## 5. 诊断顺序

连续性残差停滞时，依次检查出口回流、压力基准、网格非正交、质量源项和边界流量是否自洽。不要只增加压力修正次数；如果问题定义不守恒，算法无法制造正确解。

## 6. 参考资料

1. Patankar, *Numerical Heat Transfer and Fluid Flow*.
2. Issa, “Solution of the implicitly discretised fluid flow equations by operator-splitting,” 1986.

