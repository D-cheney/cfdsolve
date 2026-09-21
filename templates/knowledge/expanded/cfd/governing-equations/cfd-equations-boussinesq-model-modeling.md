---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-boussinesq-model-modeling
title: "Boussinesq 浮力近似：物理建模与适用边界"
summary: "从可压缩方程出发说明 Boussinesq 到底删掉了什么、为什么必须把静水压力分离出去、βΔT 与 L/H 这两个小量各自管什么，并用浮力频率与密度标高做一次量级估算。"
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
  - "Boussinesq 浮力近似"
  - "物理建模与适用边界"
  - "浮力频率"
  - "密度标高"
seo:
  title: "Boussinesq 浮力近似：物理建模与适用边界"
  description: "从可压缩方程出发说明 Boussinesq 到底删掉了什么、为什么必须把静水压力分离出去、βΔT 与 L/H 这两个小量各自管什么，并用浮力频率与密度标高做一次量级估算。"
  keywords:
    - "Boussinesq 浮力近似"
    - "物理建模与适用边界"
    - "浮力频率"
    - "密度标高"
    - "静水压力"
---

# Boussinesq 浮力近似：物理建模与适用边界

Boussinesq 近似不是"给动量方程加一项浮力"这么简单，它同时对连续性方程做了一次截断，因此把声波一起滤掉了。理解这一点才能说清它的适用边界：什么时候截断可忽略，什么时候必须换成滞弹性或全可压缩描述。下面从可压缩方程出发逐步交代。

## 两步截断：先滤声波，再滤层结

从可压缩连续性方程出发，把它改写成散度形式：

$$
\nabla\cdot\mathbf{u}=-\frac{1}{\rho}\frac{\mathrm{D}\rho}{\mathrm{D}t}
$$

右侧是密度的物质导数。把密度写成 $T$ 的函数后，它由两部分构成：一部分来自流体微团自身温度变化（热膨胀），另一部分来自微团在层结环境中上下移动（垂直位移）。量级分析给出两者的相对大小分别是 $\beta\Delta T$ 与 $L/H$，$H$ 是密度的垂直标高。

第一步截断（滞弹性）保留位移项、丢掉热膨胀项，得到 $\nabla\cdot(\rho_0\mathbf{u})=0$，声波被滤掉但层结保留；第二步截断（Boussinesq）进一步把 $\rho_0$ 也当作常数，得到

$$
\nabla\cdot\mathbf{u}=0
$$

流体因此在运动学上完全不可压。代价是：任何依赖体积变化的机制——声传播、激波、封闭腔内的压力波——都被整体移除，且无法通过加密网格找回。

## 静水分解是必需的一步

Boussinesq 方程的动量形式常被写成

$$
\frac{\partial\mathbf{u}}{\partial t}+\mathbf{u}\cdot\nabla\mathbf{u}=-\frac{1}{\rho_0}\nabla p_d+\nu\nabla^2\mathbf{u}-\beta(T-T_0)\mathbf{g}
$$

其中 $p_d=p-p_{hyd}$ 是扣掉静水压力后的动力压力。这一步不是形式上的化简：参考态本身满足 $\nabla p_{hyd}=\rho_0\mathbf{g}$，若不做分解，静止的分层流体在离散方程里会残留一个 $\rho_0\mathbf{g}$ 量级的未平衡源项，直接算出虚假流动。判据很直接——把初始温度场设成均匀的 $T_0$，跑一步，速度场应严格保持为零。做不到，说明分解或重力方向写错了。

## 两个小量各管一件事

$\beta\Delta T$ 管的是"密度随温度线性化"的误差，属于热力学截断；$L/H$ 管的是"域内密度可视为常数"的误差，属于几何—重力截断。两者互不替代。

等温大气的密度标高为

$$
H=\frac{RT}{g}
$$

空气 $R=287.05\ \mathrm{J/(kg\cdot K)}$、$T=300\ \mathrm{K}$、$g=9.81\ \mathrm{m/s^2}$：

$$
H=\frac{287.05\times300}{9.81}=8778\ \mathrm{m}\approx8.8\ \mathrm{km}
$$

一个高 $L=3\ \mathrm{m}$ 的实验段，$L/H=3/8778=3.4\times10^{-4}$，密度在域内的真实变化约 $1-e^{-L/H}\approx3.4\times10^{-4}$，即 $0.034\%$，把密度当常数完全合理。反过来，若研究对象是 $100\ \mathrm{m}$ 高的中庭，$L/H=1.1\times10^{-2}$，密度变化 $1.1\%$，仍可接受但已接近需要滞弹性模型的边缘；若研究对象是千米量级的大气边界层，$L/H\sim0.1$，Boussinesq 的层结误差与浮力项同阶，必须升级。

## 分层强度：浮力频率

稳定层结下，温度随高度上升，密度随高度下降。定义浮力频率 $N$ 为

$$
N^2=-\frac{g}{\rho_0}\frac{\mathrm{d}\rho}{\mathrm{d}z}=g\beta\frac{\mathrm{d}T}{\mathrm{d}z}
$$

取 $\mathrm{d}T/\mathrm{d}z=2.0\ \mathrm{K/m}$、$g=9.81\ \mathrm{m/s^2}$、$\beta=3.333\times10^{-3}\ \mathrm{K^{-1}}$：

$$
N^2=9.81\times3.333\times10^{-3}\times2.0=6.54\times10^{-2}\ \mathrm{s^{-2}},\qquad N=0.256\ \mathrm{s^{-1}}
$$

对应振荡周期 $2\pi/N=2\pi/0.256=24.6\ \mathrm{s}$。这个数字有两个直接用途：一是时间步与统计窗口必须远小于它才能分辨内波，否则会把振荡平均掉；二是若算例中出现了周期约 $25\ \mathrm{s}$ 的持续振荡，它很可能是真实的浮力振荡而不是数值不稳定，不应通过加耗散去消除。两项截断误差与浮力频率可以放在同一个脚本里一次算完：

```python
# Boussinesq 准入检查：βΔT、L/H 与浮力频率
import numpy as np

R, g   = 287.05, 9.81          # J/(kg*K), m/s^2
T0     = 300.0                 # 参考温度, K
dT     = 20.0                  # 最大温差, K
dTdz   = 2.0                   # 温度梯度, K/m
L      = 3.0                   # 域高, m
beta   = 1.0 / T0              # 理想气体热膨胀系数, 1/K

print("beta*dT      =", beta * dT)              # 0.0667  < 0.1
H = R * T0 / g                                  # 密度标高, m
print("H            =", H, "m   L/H =", L / H)
print("rho change   =", 1 - np.exp(-L / H))     # 0.034%
N2 = g * beta * dTdz
print("N            =", np.sqrt(N2), "1/s")
print("period       =", 2 * np.pi / np.sqrt(N2), "s")   # 24.6 s
```

脚本的三行输出分别对应三类边界：$\beta\Delta T=0.0667$ 说明线性化可用；$L/H=3.4\times10^{-4}$ 说明域内密度变化可忽略；$N=0.256\ \mathrm{s^{-1}}$ 说明任何短于 $24.6\ \mathrm{s}$ 的统计窗口都可能被内波污染。三者任一越界，就应按前节的升级路径换模型。

## 什么时候必须离开 Boussinesq

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 竖直槽内出现无法解释的低频振荡 | 参考温度梯度与 $T_0$ 不配套，$N^2$ 反号或量级错误 | 由 $\mathrm{d}T/\mathrm{d}z$ 手算 $N^2$，与初始密度剖面对照 |
| 高塔或深水算例的浮力明显偏强 | 忽略 $L/H$，域内密度实际变化超过 1% | 计算 $L/H$ 与 $1-e^{-L/H}$，与 1% 比较 |
| 超临界流体算例结果不可信 | $\beta$ 在临界点附近急剧增大甚至变号 | 查该温压下的 $\beta$ 表并与 $1/T$ 对比 |
| 需要声学耦合时结果完全对不上 | 第二步截断已把声波移除 | 检查马赫数与是否存在声源、封闭腔 |
| 稳定层结在长时间积分后被抹平 | 温度输运格式耗散过强，梯度被数值扩散吃掉 | 对比一阶与二阶格式下 $N^2$ 的保持情况 |
| 热羽流上升速度偏低约 15% | $\Delta T$ 偏大时线性化截断已不可忽略 | 用真实状态方程跑同一工况做对照 |

前两行属于可以事先算出来的边界，后四行需要在运行中发现。判据的统一逻辑是：只要截断误差开始与目标量的工程容差同阶，就该升级模型，而不是继续调网格或松弛。

## 升级路径怎么选

超出 $\beta\Delta T\ll1$ 但层结仍弱时，第一步是把线性化换成真实状态方程，保留不可压运动学；超出 $L/H\ll1$ 时，应换用滞弹性（anelastic）形式，它保留 $\nabla\cdot(\rho_0\mathbf{u})=0$ 的层结效应但仍滤声波；只有在声学、激波或封闭腔压力波本身就是目标量时，才需要回到全可压缩方程。三者的选择依据是目标量是否依赖密度变化，而不是温差本身的大小——温差大但流动完全由外部压差驱动时，Boussinesq 依然可用。

## 参考资料

1. Oberbeck A., "Über die Wärmeleitung der Flüssigkeiten bei Berücksichtigung der Strömungen infolge von Temperaturdifferenzen", Annalen der Physik und Chemie, 243(6), 1879, 271-292.
2. Spiegel E.A., Veronis G., "On the Boussinesq approximation for a compressible fluid", Astrophysical Journal, 131, 1960, 442-447.
3. Gray D.D., Giorgini A., "The validity of the Boussinesq approximation for liquids and gases", International Journal of Heat and Mass Transfer, 19(5), 1976, 545-551.
4. Tritton D.J., Physical Fluid Dynamics, 2nd ed., Oxford University Press, 1988.
5. Boussinesq J. 《Théorie analytique de la chaleur》. Gauthier-Villars, 1901.
6. Turner J.S. 《Buoyancy Effects in Fluids》. Cambridge University Press, 1973.
7. Vallis G.K. 《Atmospheric and Oceanic Fluid Dynamics: Fundamentals and Large-Scale Circulation》. Cambridge University Press, 2006.
