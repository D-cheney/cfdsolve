---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-foundations
title: SPH 核近似、守恒离散与时间步
summary: 介绍 SPH 的核积分、粒子求和、对称压力项和显式时间步限制，并解释一致性、人工耗散与邻居不足的常见误区。
category: { slug: meshfree-sph, name: "无网格法 · SPH 理论与实现" }
level: 进阶
reading_minutes: 10
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [无网格法, SPH, 核函数, 守恒, CFL]
---

# SPH 核近似、守恒离散与时间步

## 从核积分到粒子求和

对标量场 $A(\mathbf{x})$，核近似和粒子离散通常写为：

$$
A(\mathbf{x}_i)\approx\int_\Omega A(\mathbf{x}')W(\mathbf{x}_i-\mathbf{x}',h)\,d\mathbf{x}'
\approx\sum_j\frac{m_j}{\rho_j}A_jW_{ij}.
$$

核函数应满足归一化、紧支撑和随 $h\to0$ 收敛到狄拉克函数等条件。连续核积分满足这些条件，并不保证无序粒子上的离散求和自动具有同样精度。边界截断、粒子团聚和邻居过少都会破坏零阶或一阶一致性。

## 密度与动量方程

密度可由求和式 $\rho_i=\sum_jm_jW_{ij}$ 计算，也可积分连续性方程。常见的成对对称压力加速度为：

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_jm_j\left(\frac{p_i}{\rho_i^2}+\frac{p_j}{\rho_j^2}\right)\nabla_iW_{ij}+\mathbf{g}+\mathbf{a}_{\nu,i}.
$$

当核梯度满足反对称关系时，成对内力有利于离散动量守恒。黏性项、人工黏性、密度扩散和粒子移位承担不同作用，应分别记录系数和启用条件，避免把数值稳定化误认为材料黏度。

弱可压缩 SPH 常通过状态方程把压力与密度关联。声速需使密度波动处于目标范围，同时不能忽略其对时间步的影响。显式积分常受以下量级约束：

$$
\Delta t\leq\min\left(C_c\frac{h}{c+|\mathbf{v}|_{\max}},\ C_a\sqrt{\frac{h}{|\mathbf{a}|_{\max}}},\ C_\nu\frac{h^2}{\nu_{\max}}\right).
$$

系数取值和黏性限制形式应以具体离散方案为准。只满足声学 CFL 仍可能违反加速度或黏性时间尺度。

## 实现检查

- 用常数场和线性场检查核求和与梯度误差。
- 用粒子对检查内力是否大小相等、方向相反。
- 分别统计内部、自由表面和壁面附近的邻居数。
- 监测密度范围、最小粒子间距和最大加速度。
- 加密粒子时同步检查 $h/\Delta p$、时间步与边界粒子层数。

核函数、边界与邻域搜索应作为一套离散系统一起验证，而不是独立调参。
