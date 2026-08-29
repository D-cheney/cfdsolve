---
template_version: "flowlab-knowledge/1.0"
slug: acoustic-helmholtz-fem-bem
title: 计算声学：波动方程、Helmholtz FEM、BEM 与吸收边界
summary: 从线化质量和动量方程推导声波与 Helmholtz 方程，给出有限元弱式、边界积分表示、阻抗边界、PML 和波数分辨率要求。
category:
  slug: physics-discretization
  name: 跨物理场离散算法
level: 专题
reading_minutes: 31
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [声学, Helmholtz方程, 声学有限元, 边界元, PML]
seo:
  title: 声学 Helmholtz 有限元与边界元推导｜流研工坊
  description: 从线化守恒方程推导声波、Helmholtz 弱式、BEM 和开放边界算法。
  keywords: [计算声学, Helmholtz, 声学FEM, 声学BEM]
---

# 计算声学：波动方程、Helmholtz FEM、BEM 与吸收边界

在静止均匀介质上令 $p=p_0+p'$、$\rho=\rho_0+\rho'$、速度扰动为 $v'$。忽略二阶扰动，线化连续性和动量为

$$
\frac{\partial\rho'}{\partial t}+\rho_0\nabla\cdot v'=0,
\qquad
\rho_0\frac{\partial v'}{\partial t}=-\nabla p'.
$$

等熵关系 $p'=c^2\rho'$。对连续性求时间导数并消去 $v',\rho'$：

$$
\frac1{c^2}\frac{\partial^2p'}{\partial t^2}-\nabla^2p'=0.
$$

## 1. Helmholtz 方程

令 $p'(x,t)=\mathrm{Re}\{\hat p(x)e^{i\omega t}\}$，得到

$$
\nabla^2\hat p+k^2\hat p=0,
\qquad k=\frac\omega c.
$$

有源问题写为 $-\nabla^2p-k^2p=s$。刚壁 $\partial p/\partial n=0$，给定法向速度有 $\partial p/\partial n=-i\omega\rho_0v_n$。

## 2. 有限元弱式

乘测试函数 $q$ 并分部积分：

$$
\int_\Omega\nabla q\cdot\nabla p\,d\Omega
-k^2\int_\Omega qp\,d\Omega
=\int_\Omega qs\,d\Omega+\int_\Gamma q\frac{\partial p}{\partial n}d\Gamma.
$$

离散为 $(K-k^2M)p=f$。该矩阵在共振附近病态或奇异；加入损耗、辐射边界或使用合适的复数求解器。低阶 FEM 的相位误差随 $kh$ 增大，经验“每波长若干单元”不能替代实际色散收敛研究。

## 3. 阻抗与辐射边界

局部阻抗 $Z=p/v_n$，结合动量方程得

$$
\frac{\partial p}{\partial n}=-\frac{i\omega\rho_0}{Z}p.
$$

代入弱式形成复数边界矩阵。一阶 Sommerfeld 条件 $\partial_np-ikp=0$ 只对近法向出射和平面/远场波近似；PML 或 BEM 更适合一般开放域。

## 4. 边界积分与 BEM

Helmholtz 基本解 $G$ 满足 $(\nabla^2+k^2)G=-\delta$。Green 第二恒等式给出边界表示

$$
c(\xi)p(\xi)+\int_\Gamma p\frac{\partial G}{\partial n}d\Gamma
=\int_\Gamma G\frac{\partial p}{\partial n}d\Gamma.
$$

BEM 只离散边界并自动满足无限域辐射条件，但矩阵稠密；快速多极子和 $\mathcal H$ 矩阵用于加速。外声场在某些内共振频率会出现非唯一性，常用 Burton–Miller 组合方程处理。

## 5. 声结构耦合

界面满足法向速度连续和作用反作用：

$$
\frac{\partial p}{\partial n}=-\rho_0\ddot u\cdot n,
\qquad t_s=-pn.
$$

离散后形成非对称或频率相关块系统。必须保证法向方向、功率符号和界面积分一致。

## 6. 验证

- 一维管驻波、刚壁腔体固有频率、脉动球辐射；
- 检查声功率、反射/透射系数和网格/阶次收敛；
- 区分 SPL 的参考声压，空气通常为 $20\,\mu Pa$；
- 有平均流时普通 Helmholtz 方程失效，应使用对流波动或线化 Euler 方程。

## 7. 参考资料

1. Ihlenburg, *Finite Element Analysis of Acoustic Scattering*.
2. Wu, *Boundary Element Acoustics*.
3. NASA, *Aeroacoustics Research* technical publications, https://ntrs.nasa.gov/ 。

