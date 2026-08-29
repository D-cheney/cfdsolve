---
template_version: "flowlab-knowledge/1.0"
slug: ode-dae-time-integration
title: ODE/DAE 时间积分：RK、BDF、误差控制与一致初始化
summary: 从积分与插值推导显式 Runge–Kutta、隐式 Euler、BDF 和 DAE Newton 系统，说明局部误差、自适应步长、刚性与一致初值。
category:
  slug: algebraic-solvers
  name: 代数求解器与时间算法
level: 专题
reading_minutes: 35
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [ODE, DAE, Runge-Kutta, BDF, 自适应时间步]
seo:
  title: ODE 与 DAE 时间积分公式推导｜流研工坊
  description: 推导 RK、隐式 Euler、BDF、Newton 线性化、自适应误差控制与一致初始化。
  keywords: [ODE积分, DAE求解, BDF, Runge-Kutta]
---

# ODE/DAE 时间积分：RK、BDF、误差控制与一致初始化

半离散瞬态问题可写为 ODE $\dot y=f(t,y)$，或更一般的 DAE

$$
F(t,y,\dot y)=0.
$$

刚性表示稳定性而非仅变化速度：显式方法为稳定必须取远小于精度要求的步长。

## 1. 从积分式到 Runge–Kutta

$$
y_{n+1}=y_n+\int_{t_n}^{t_{n+1}}f(t,y(t))dt.
$$

左端矩形得到 Forward Euler：$y_{n+1}=y_n+h f_n$，局部截断误差 $O(h^2)$、全局一阶。经典 RK4 用四个斜率

$$
k_1=f(t_n,y_n),\quad k_2=f(t_n+h/2,y_n+hk_1/2),
$$

$$
k_3=f(t_n+h/2,y_n+hk_2/2),\quad k_4=f(t_n+h,y_n+hk_3),
$$

$$
y_{n+1}=y_n+\frac h6(k_1+2k_2+2k_3+k_4).
$$

嵌入式 RK 对以两种阶次共享阶段，差值作为局部误差估计并调整步长。

## 2. 隐式方法与刚性

Backward Euler 为

$$
y_{n+1}=y_n+h f(t_{n+1},y_{n+1}),
$$

每步求 $G(y_{n+1})=0$。其 A 稳定且 L 稳定，能强烈耗散高频刚性模态。Crank–Nicolson/梯形法二阶且 A 稳定，但不是 L 稳定，极刚问题可能出现不衰减振荡。

## 3. BDF 推导与 DAE 系统

用最近 $q+1$ 个解插值并在 $t_n$ 求导：

$$
\sum_{i=0}^{q}\alpha_{n,i}y_{n-i}=h_n\dot y_n.
$$

代入 DAE：

$$
G(y_n)=F\left(t_n,y_n,h_n^{-1}\sum_{i=0}^q\alpha_{n,i}y_{n-i}\right)=0.
$$

Newton Jacobian 为

$$
J=\frac{\partial F}{\partial y}+\frac{\alpha_{n,0}}{h_n}\frac{\partial F}{\partial\dot y}.
$$

BDF1–2 A 稳定；更高阶稳定区域缩小。实际变阶 BDF 通常限制到 5 阶并依据误差和历史平滑度选阶。

## 4. 一致初始化

DAE 初值不能任意指定，必须满足 $F(t_0,y_0,\dot y_0)=0$。例如约束多体系统

$$
M(q)\ddot q+\Phi_q^T\lambda=Q,qquad \Phi(q,t)=0.
$$

初始位置满足 $\Phi=0$，速度满足 $\Phi_q\dot q+\Phi_t=0$，加速度还需二次微分约束。直接投影可修正漂移；Baumgarte 稳定化加入 $2\alpha\dot\Phi+\beta^2\Phi$，参数过大则引入刚性。

## 5. 误差权重与步长

分量误差按

$$
w_i=\frac1{atol_i+rtol|y_i|},\qquad
\|e\|_{WRMS}=\sqrt{\frac1N\sum_i(w_ie_i)^2}
$$

归一化。接受 $\|e\|_{WRMS}\le1$，并按阶次 $p$ 更新 $h_{new}\sim h\|e\|^{-1/(p+1)}$，同时设置安全系数和增长/缩小上下限。不同量纲变量应使用分量绝对容差。

## 6. 参考资料

1. SUNDIALS, *IDA Mathematical Considerations*, https://sundials.readthedocs.io/en/latest/ida/Mathematics_link.html 。
2. Hairer & Wanner, *Solving Ordinary Differential Equations II*.
3. Brenan, Campbell & Petzold, *Numerical Solution of Initial-Value Problems in Differential-Algebraic Equations*.

