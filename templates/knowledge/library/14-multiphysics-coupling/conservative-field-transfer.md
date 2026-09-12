---
template_version: "flowlab-knowledge/1.0"
slug: conservative-field-transfer
title: 非匹配网格数据传递：插值、投影与守恒映射
summary: 推导点插值、L2 投影、Mortar 与功率共轭映射，说明多物理场中位移、力、温度和热流的不同守恒要求。
category:
  slug: multiphysics-coupling
  name: 多物理场耦合算法
level: 工程
reading_minutes: 25
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [网格映射, L2投影, Mortar, 守恒插值, 多物理耦合]
seo:
  title: 非匹配网格守恒映射算法｜CFD菜鸟
  description: 从 L2 投影和虚功一致性推导场变量与载荷的守恒传递。
  keywords: [网格映射, 守恒插值, Mortar, L2投影]
---

# 非匹配网格数据传递：插值、投影与守恒映射

不同物理场的界面网格通常不一致。点值变量和通量变量不能使用同一套“看起来平滑”的插值而不检查守恒。

## 1. 点插值

目标点 $x_t$ 位于源单元内时

$$
u_t(x_t)=\sum_{a\in e}N_a(x_t)u_a.
$$

它能再现形函数空间中的场，但不保证界面积分守恒；外推点还可能产生负权重和过冲。

## 2. L2 投影

求目标离散场 $u_t$，使

$$
\int_\Gamma v_t(u_t-u_s)d\Gamma=0\quad\forall v_t.
$$

展开后

$$
M_tU_t=CU_s,
$$

$$
(M_t)_{ij}=\int_\Gamma N_i^tN_j^t d\Gamma,
\qquad C_{ia}=\int_\Gamma N_i^tN_a^s d\Gamma.
$$

公共细分/交叠积分必须准确，否则理论投影仍会丢失守恒。

## 3. 功率共轭映射

若运动学映射 $d_t=Hd_s$，界面虚功要求

$$
\delta d_t^Tf_t=\delta d_s^Tf_s.
$$

代入得到 $f_s=H^Tf_t$。这一转置关系比对力再次做点插值更可靠，可保持总功。旋转自由度、壳偏置和面法向必须纳入几何变换。

## 4. Mortar 约束

用拉格朗日乘子 $\lambda$ 弱施加两侧连续性：

$$
\int_\Gamma\lambda\cdot(u_s-u_t)d\Gamma=0.
$$

离散后形成鞍点系统，适用于接触、滑移界面和高阶非匹配网格。乘子空间需满足稳定性条件，否则产生振荡或秩亏。

## 5. 验收测试

映射算子至少通过：常量场再现、线性场再现、总力、总力矩、总热流、虚功/功率相对误差和往返映射误差。可视化连续并不等价于守恒。

## 6. 参考资料

1. Farhat, Lesoinne & LeTallec, “Load and Motion Transfer Algorithms for Fluid/Structure Interaction Problems”, 1998.
2. Bernardi, Maday & Patera, “A New Nonconforming Approach to Domain Decomposition: The Mortar Element Method”, 1994.

