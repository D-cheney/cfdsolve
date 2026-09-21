---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-momentum-transport-modeling
title: "动量输运与应力张量：物理建模与适用边界"
summary: "应力张量把动量方程闭合起来，但牛顿本构、Stokes 假设与连续介质假设各有失效门槛。本文用 Knudsen 数、幂律黏度与 Weissenberg 数给出三类升级判据，并算出 10 μm 通道的滑移流量增量。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "动量输运与应力张量"
  - "物理建模与适用边界"
  - "Knudsen 数"
  - "非牛顿本构"
seo:
  title: "动量输运与应力张量：物理建模与适用边界"
  description: "应力张量把动量方程闭合起来，但牛顿本构、Stokes 假设与连续介质假设各有失效门槛。本文用 Knudsen 数、幂律黏度与 Weissenberg 数给出三类升级判据，并算出 10 μm 通道的滑移流量增量。"
  keywords:
    - "动量输运与应力张量"
    - "物理建模与适用边界"
    - "Knudsen 数"
    - "非牛顿本构"
---

# 动量输运与应力张量：物理建模与适用边界

动量方程本身只是牛顿第二定律的连续形式，真正决定它能算什么的，是应力张量的闭合关系。牛顿本构、Stokes 假设、连续介质假设这三层假设各自有独立的失效门槛：第一层被高剪切下的非牛顿流体打破，第二层被多原子气体的体积黏性打破，第三层被稀薄气体打破。下面把三层判据写成可计算的无量纲数，并用 10 μm 空气通道与聚合物溶液两个算例给出具体数值。

## 应力张量的分解与本构闭合缺口

柯西动量方程把应力张量的散度作为唯一未知

$$
\rho\frac{D\mathbf{u}}{Dt} = \nabla\cdot\boldsymbol{\sigma} + \rho\mathbf{b},\qquad
\boldsymbol{\sigma} = -p\mathbf{I} + \boldsymbol{\tau}
$$

$\boldsymbol{\sigma}$ 有 9 个分量、由对称性降为 6 个，而动量方程只有 3 个，缺口必须用本构关系补上。牛顿流体的线性本构写成

$$
\tau_{ij} = 2\mu S_{ij} + \lambda_b\frac{\partial u_k}{\partial x_k}\delta_{ij},\qquad
S_{ij} = \frac{1}{2}\left(\frac{\partial u_i}{\partial x_j} + \frac{\partial u_j}{\partial x_i}\right)
$$

$\lambda_b$ 是体积黏度。不可压条件下 $\nabla\cdot\mathbf{u}=0$，第二项消失，这是"不可压流动里看不到体积黏性"的原因；但对可压缩流动、声波衰减与激波结构，$\lambda_b$ 直接进入耗散项。

## Stokes 假设对单原子气体成立，对多原子气体只是近似

Stokes 假设取 $\lambda_b=-2\mu/3$，其物理含义是流体在无黏性耗散下不产生体积黏性阻力，等价于假定分子只有平动自由度。氦、氩这类单原子气体在常温下满足得很好；氮气、二氧化碳、甲烷有转动和振动自由度，能量在平动与内自由度之间的弛豫会产生额外耗散，$\lambda_b$ 与 $\mu$ 同量级。后果出现在两类问题上：一是激波厚度与激波后松弛区，二是声波在管道中的衰减系数。工程做法是：定常亚声速可压缩流动可以放心用 $\lambda_b=-2\mu/3$；涉及声吸收、超声速激波结构、强膨胀（如喷嘴内凝结）时，要么使用带体积黏性的本构，要么用考虑内自由度弛豫的模型替代单纯的 Navier–Stokes。

## 连续介质假设的边界：从平均自由程算 Knudsen 数

Navier–Stokes 方程要求流体在比分子间距大得多的尺度上连续，判据是

$$
Kn = \frac{\lambda}{L}
$$

$\lambda$ 是分子平均自由程，$L$ 是流动特征尺度。20 ℃、1 atm 空气中 $\lambda\approx6.8\times10^{-8}\ \mathrm{m}$，对应黏度 $\mu=1.825\times10^{-5}\ \mathrm{Pa\cdot s}$、密度 $\rho=1.204\ \mathrm{kg/m^3}$，运动黏度

$$
\nu = \frac{\mu}{\rho} = \frac{1.825\times10^{-5}}{1.204} = 1.516\times10^{-5}\ \mathrm{m^2/s}
$$

分级标准是：$Kn<0.01$ 连续介质、无滑移边界成立；$0.01<Kn<0.1$ 滑移区，Navier–Stokes 仍可用但必须换成 Maxwell 滑移边界；$0.1<Kn<10$ 过渡区，需要 Burnett 方程或直接模拟（DSMC）；$Kn>10$ 自由分子流。把 $\lambda$ 代入：通道当量直径 10 μm 时 $Kn=6.8\times10^{-3}$，仍在连续介质区内，只是已经用了允许值的三分之二；直径 1 μm 时 $Kn=0.068$，进入滑移区；直径 0.1 μm 时 $Kn=0.68$，Navier–Stokes 失效。

滑移区的流量修正是可以手算的。平行板通道中一阶 Maxwell 滑移给出

$$
\frac{Q}{Q_0} = 1 + 6\,Kn
$$

$Q_0$ 为无滑移 Poiseuille 流量。$Kn=0.068$ 时 $Q/Q_0=1+6\times0.068=1.408$，滑移贡献了 40.8% 的流量——这个量级远大于常规离散误差，因此微通道计算中把壁面设成无滑移会直接给出错误的流量特性曲线。

同一通道取空气流速 $U=1\ \mathrm{m/s}$，雷诺数 $Re=\rho U D/\mu=1.204\times1\times10^{-5}/1.825\times10^{-5}=0.66$，层流、惯性可忽略，此时唯一的物理复杂度就来自稀薄效应，这也解释了微通道研究的注意力为什么集中在 $Kn$ 而不是 $Re$ 上。

## 广义牛顿与黏弹性：当应力不再瞬时跟随应变率

高剪切下的悬浮液、聚合物熔体、血液表现出剪切变稀，最简单的描述是幂律模型

$$
\mu_{\mathrm{eff}} = K\dot\gamma^{\,n-1}
$$

黄原胶水溶液取 $K=1.2\ \mathrm{Pa\cdot s^{\,n}}$、$n=0.45$，则 $\dot\gamma=1\ \mathrm{s^{-1}}$ 时 $\mu_{\mathrm{eff}}=1.2\ \mathrm{Pa\cdot s}$，$\dot\gamma=100\ \mathrm{s^{-1}}$ 时 $\mu_{\mathrm{eff}}=1.2\times100^{-0.55}=1.2\times0.0794=0.0953\ \mathrm{Pa\cdot s}$，两个数量级的剪切率带来 12.6 倍的黏度下降。幂律模型只改黏度的大小、不改应力的方向，属于"广义牛顿"范畴，把它塞进现有求解器只需替换 $\mu$ 场。

真正的分岔出现在弹性不可忽略时。判据是 Weissenberg 数

$$
Wi = \lambda_{\mathrm{relax}}\dot\gamma
$$

$\lambda_{\mathrm{relax}}$ 是流体的应力松弛时间。取典型聚丙烯酰胺溶液 $\lambda_{\mathrm{relax}}=0.01\ \mathrm{s}$、$\dot\gamma=1000\ \mathrm{s^{-1}}$，得 $Wi=10$，此时弹性应力与黏性应力同量级，会出现爬杆、挤出胀大、二次流这些牛顿流体中不存在的现象。判断是否需要上黏弹性本构（Oldroyd-B、Giesekus、PTT）的经验界线是 $Wi>1$；$Wi<0.1$ 时用广义牛顿足够。模型每升一级，都要新增一个独立可测参数（$\lambda_{\mathrm{relax}}$、第二法向应力差系数），这些参数难以从常规流变实验唯一确定，也是黏弹性 CFD 结果分散度大的根本原因。

```python
import math
lam, mu, rho = 6.8e-8, 1.825e-5, 1.204      # m, Pa.s, kg/m3
nu = mu / rho
for D in (10e-6, 1e-6, 0.1e-6):             # m
    Kn = lam / D
    print(f"D={D*1e6:5.1f} um  Kn={Kn:.3e}  Q/Q0={1+6*Kn:.3f}")
# D= 10.0 um  Kn=6.800e-03  Q/Q0=1.041
# D=  1.0 um  Kn=6.800e-02  Q/Q0=1.408
# D=  0.1 um  Kn=6.800e-01  Q/Q0=5.080   <- 一阶滑移已不适用
print(f"nu={nu:.3e} m2/s")                  # 1.516e-05
K, n, gdot = 1.2, 0.45, 100.0
print(f"mu_eff={K*gdot**(n-1):.4f} Pa.s")   # 0.0953
```

注意 0.1 μm 那行的 $Q/Q_0=5.08$ 是一阶滑移外推的产物，超出滑移区后这个公式本身已经失效，把结果当真会得到荒谬的结论——这也是把判据数值和公式适用范围一起记录的意义。

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 微通道压降比理论值低 30%，流速偏高 | 壁面无滑移边界在 $Kn>0.01$ 时高估了阻力 | 算 $Kn=\lambda/D$，超过 0.01 就换 Maxwell 滑移边界重算 |
| 聚合物溶液算出的压降与实验相差一个量级 | 用常黏度代替剪切变稀，高剪切区黏度虚高 | 用流变仪给出 $\mu_{\mathrm{eff}}(\dot\gamma)$ 曲线，与幂律拟合对比 $R^2$ |
| 收敛解中出现非物理的二次流或爬杆 | 弹性应力未建模，$Wi>1$ | 由松弛时间与剪切率算 $Wi$，超过 1 时改用 Oldroyd-B 类本构 |
| 可压缩算例的声波衰减比实测弱 | 用了 Stokes 假设，忽略了多原子气体的体积黏性 | 对比 $\lambda_b=0$、$-2\mu/3$ 两组算例的衰减系数 |
| 高 $Kn$ 算例残差能收敛但结果无物理意义 | 方程形式超出连续介质假设，收敛只是代数收敛 | 输出 $Kn$ 分布，若最大值超过 0.1 则改用 DSMC 或 Burnett |
| 应力张量散度出现网格相关幅值 | 应变率张量在畸变网格上重构误差大 | 把梯度格式从 Gauss linear 换成 leastSquares，看散度场是否收敛 |

## 参考文献

1. Bird R.B., Armstrong R.C., Hassager O., *Dynamics of Polymeric Liquids, Vol. 1: Fluid Mechanics*, 2nd ed., Wiley, 1987.
2. Karniadakis G., Beskok A., Aluru N., *Microflows and Nanoflows: Fundamentals and Simulation*, Springer, 2005.
3. Stokes G.G., "On the theories of the internal friction of fluids in motion", *Transactions of the Cambridge Philosophical Society*, 8:287–305, 1845.
4. Truesdell C., Noll W., *The Non-Linear Field Theories of Mechanics*, 3rd ed., Springer, 2004.
5. Oldroyd J.G. 《On the formulation of rheological equations of state》. Proceedings of the Royal Society A, 1950.
6. Bird G.A. 《Molecular Gas Dynamics and the Direct Simulation of Gas Flows》. Oxford University Press, 1994.
7. Schowalter W.R. 《Mechanics of Non-Newtonian Fluids》. Pergamon Press, 1978.
