---
template_version: "flowlab-knowledge/1.0"
slug: partitioned-coupling-stability
title: 分区多物理场耦合的时间同步与稳定性
summary: 说明显式、隐式分区耦合的数据交换、子迭代和松弛策略，以及附加质量效应与守恒传递的检查方法。
category: { slug: multiphysics-coupling, name: "多物理场耦合算法" }
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [多物理场, 分区耦合, 子迭代, Aitken, 附加质量]
---

# 分区多物理场耦合的时间同步与稳定性

## 1. 分区耦合的问题结构

分区耦合保留各物理求解器，在交换时刻传递位移、力、温度或通量。显式耦合每个时间步只交换一次，成本低但可能产生时间滞后；隐式耦合在同一时间步内迭代到界面一致，稳定性更好但成本更高。

## 2. 固定点迭代与松弛

以界面量 $\mathbf{x}$ 为例，固定点迭代可写成：

$$
\mathbf{x}^{k+1}=(1-\omega_k)\mathbf{x}^{k}+\omega_k\mathcal{G}(\mathbf{x}^{k}).
$$

常数松弛适合初步稳定计算，Aitken 动态松弛可依据连续两次残差调整 $\omega_k$。强流固耦合中，轻质结构受到显著附加质量效应，松散显式耦合即使各子求解器单独稳定也可能发散。

## 3. 时间同步与子循环

两个求解器使用不同时间步时，应明确交换窗口、子循环次数和时间插值。零阶保持容易引入相位滞后；高阶插值需要足够历史数据，并防止在不连续载荷处产生过冲。耦合收敛容差应与各子求解器误差处于相容量级。

## 4. 接口守恒检查

- 两侧时间戳、单位、坐标系和法向方向一致；
- 位移映射具有一致性，力映射满足虚功或全局守恒；
- 子循环时明确采用保持、线性插值还是高阶时间插值；
- 接口残差同时包含位移和力，而不只看单侧求解器残差；
- 减小全局时间步和收紧耦合容差后关键量稳定。

## 5. 分层验证流程

先验证静态映射和单向耦合，再增加双向反馈。每个时间步应记录子迭代次数、松弛因子和界面守恒误差，以定位不稳定来自物理刚性还是数据交换。

可用刚体平移检验位移映射，用均匀压力检验合力与力矩，再用具有解析频率或公开实验数据的耦合问题检验时间同步。加密接口网格时应保持相同的积分和坐标约定。

## 6. 参考资料

1. C. A. Felippa, K. C. Park & C. Farhat, Partitioned analysis of coupled mechanical systems, *Computer Methods in Applied Mechanics and Engineering*.
2. J. Degroote, Partitioned simulation of fluid-structure interaction, *Archives of Computational Methods in Engineering*.
