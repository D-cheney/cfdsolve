---
template_version: "flowlab-knowledge/1.0"
slug: navier-stokes
title: "Navier–Stokes 方程：物理建模与适用边界"
summary: "从积分守恒推导不可压 Navier–Stokes，说明本构闭合与 Stokes 假设引入的额外假设，给出五个相似参数的分工，并用 1 m 平板算例把边界层厚度、摩阻系数与 Kolmogorov 尺度算到具体数值。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "Navier–Stokes 方程"
  - "物理建模与适用边界"
  - "本构闭合"
  - "Kolmogorov 尺度"
seo:
  title: "Navier–Stokes 方程：物理建模与适用边界"
  description: "从积分守恒推导不可压 Navier–Stokes，说明本构闭合与 Stokes 假设引入的额外假设，给出五个相似参数的分工，并用 1 m 平板算例把边界层厚度、摩阻系数与 Kolmogorov 尺度算到具体数值。"
  keywords:
    - "Navier–Stokes 方程"
    - "物理建模与适用边界"
    - "本构闭合"
    - "Kolmogorov 尺度"
---

# Navier–Stokes 方程：物理建模与适用边界

Navier–Stokes 方程并不是一条假设，而是三层假设的叠加：质量与动量的积分守恒、应力张量的线性本构、以及流体在特征尺度上连续。前两层决定方程形式，第三层决定方程能不能用。工程上出问题最多的地方不是推导，而是把这三层假设的适用条件当成"永远成立"。本文按推导顺序逐层给出条件，并用 1 m 平板算例把边界层厚度、摩阻系数和湍流最小尺度算到具体数字，说明为什么 DNS 在工程雷诺数下不可行。

## 从积分守恒到微分形式

对任意固定控制体写出动量平衡：动量的变化率等于净对流通量、表面力与体积力之和

$$
\frac{\mathrm{d}}{\mathrm{d}t}\int_V \rho\mathbf{u}\,\mathrm{d}V + \oint_{\partial V}\rho\mathbf{u}(\mathbf{u}\cdot\mathrm{d}\mathbf{A}) = \oint_{\partial V}\boldsymbol{\sigma}\cdot\mathrm{d}\mathbf{A} + \int_V\rho\mathbf{b}\,\mathrm{d}V
$$

对面积分使用高斯散度定理，并令控制体体积趋于零，得到微分形式的柯西动量方程 $\rho D\mathbf{u}/Dt=\nabla\cdot\boldsymbol{\sigma}+\rho\mathbf{b}$。这一步要求被积函数连续可微，等价于要求流场在网格尺度上光滑——这正是后面连续介质假设要单独讨论的原因。

代入牛顿本构 $\boldsymbol{\sigma}=-p\mathbf{I}+\mu(\nabla\mathbf{u}+(\nabla\mathbf{u})^{\mathrm{T}})$，并在不可压条件下令 $\nabla\cdot\mathbf{u}=0$，得到常见的不可压形式

$$
\frac{\partial\mathbf{u}}{\partial t} + (\mathbf{u}\cdot\nabla)\mathbf{u} = -\frac{1}{\rho}\nabla p + \nu\nabla^{2}\mathbf{u} + \mathbf{b}
$$

这里 $\nu=\mu/\rho$ 是运动黏度。不可压形式里压力没有独立的状态方程，只承担维持 $\nabla\cdot\mathbf{u}=0$ 的拉格朗日乘子角色，因此数值上必须用压力—速度耦合算法。

## 本构闭合与 Stokes 假设

柯西方程有 3 个分量方程、6 个独立应力分量，缺口靠本构关系填补。牛顿本构引入两个物性系数：剪切黏度 $\mu$ 与体积黏度 $\lambda_b$。Stokes 假设取

$$
\lambda_b = -\frac{2}{3}\mu
$$

其依据是单原子气体只有平动自由度，能量耗散完全由剪切承担。对氮气、二氧化碳、水蒸气等多原子气体，内自由度弛豫会带来额外的体积耗散，$\lambda_b$ 与 $\mu$ 同量级，因此 Stokes 假设在激波内部结构、声波衰减、强膨胀流动中会低估耗散。判别方法很直接：不可压流动中 $\nabla\cdot\mathbf{u}=0$ 使 $\lambda_b$ 项整体消失，用不用 Stokes 假设结果完全相同；只有可压缩且存在显著体积变化的算例才需要复核这一项。

## 无量纲化：五个相似参数各自的含义

以 $L$、$U$、$\rho U^2$ 为参考量无量纲化，动量方程里出现五个相似参数

$$
Re = \frac{UL}{\nu},\quad
Ma = \frac{U}{a},\quad
Fr = \frac{U}{\sqrt{gL}},\quad
Eu = \frac{\Delta p}{\rho U^2},\quad
St = \frac{fL}{U}
$$

分工是明确的：$Re$ 衡量惯性对黏性，决定层流/湍流与边界层厚度；$Ma$ 衡量可压缩性，$\frac{1}{2}Ma^2$ 给出密度变化量级；$Fr$ 衡量惯性对重力，决定浮力能否忽略；$Eu$ 衡量压力对惯性，是压力边界与压降换算的基准；$St$ 衡量非定常频率，$St\ll1$ 时可用准定常假设。五个参数并不独立，$Eu$ 与 $Fr$ 通过压力场耦合。常见错误是只报 $Re$ 而忽略 $Fr$：同一台设备在重力场与微重力下 $Re$ 相同，流动结构却完全不同。

## 连续介质与湍流分辨率的两道下限

第一道下限来自分子尺度。空气在 20 ℃、1 atm 下平均自由程 $\lambda\approx6.8\times10^{-8}\ \mathrm{m}$，取特征尺度 $L=1\ \mathrm{m}$ 得 $Kn=\lambda/L=6.8\times10^{-8}$，连续介质假设毫无压力；但若通道直径缩到 1 μm，$Kn$ 升到 $6.8\times10^{-2}$，无滑移边界失效，Navier–Stokes 方程本身仍可写但边界条件要改。

第二道下限来自湍流的最小尺度

$$
\frac{\eta}{L} = Re^{-3/4}
$$

$\eta$ 是 Kolmogorov 尺度。取平板算例的 $Re=2.0\times10^6$、积分尺度 $L=1\ \mathrm{m}$，得 $\eta=1\times(2.0\times10^6)^{-0.75}=1.88\times10^{-5}\ \mathrm{m}$，即 18.8 μm。直接数值模拟要求网格间距与 $\eta$ 同量级，三维单元数按 $N\sim Re^{9/4}$ 估计，$Re=2.0\times10^6$ 时 $N\approx(2.0\times10^6)^{2.25}=1.5\times10^{14}$。这说明工程雷诺数下 DNS 不可行，也解释了为什么必须用 RANS 或 LES 引入额外闭合假设。

## 平板算例：δ、C_f 与阻力的手算

取平板长 $L=1\ \mathrm{m}$、宽 $W=0.5\ \mathrm{m}$、来流 $U=30\ \mathrm{m/s}$、空气取 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$ 与 $\rho=1.204\ \mathrm{kg/m^3}$。

雷诺数 $Re=UL/\nu=30\times1/1.5\times10^{-5}=2.0\times10^6$，湍流。$Re^{0.2}=18.20$。湍流边界层厚度按 $\delta=0.37L/Re^{0.2}$ 得 $\delta=0.37/18.20=0.0203\ \mathrm{m}=20.3\ \mathrm{mm}$；平均摩阻系数按 $C_f=0.074/Re^{0.2}$ 得 $C_f=0.074/18.20=4.07\times10^{-3}$。

壁面剪应力 $\tau_w=\frac{1}{2}\rho U^2C_f=0.5\times1.204\times30^2\times4.07\times10^{-3}=541.8\times4.07\times10^{-3}=2.20\ \mathrm{Pa}$。双面浸润面积 $A=2LW=2\times1\times0.5=1.0\ \mathrm{m^2}$，总摩擦阻力 $F=\tau_wA=2.20\ \mathrm{N}$。这个 2.2 N 的量级可以直接与风洞测力对比，是验证网格与湍流模型设置的一个低成本基准。

最后核对两道下限在本题是否成立：$Kn=6.8\times10^{-8}$，连续介质成立；$\delta/\eta=20.3\times10^{-3}/1.88\times10^{-5}=1080$，说明边界层内跨越三个量级，RANS 模型必须对近壁区做专门处理而不能一视同仁。

```python
import math
U, L, W, nu, rho = 30.0, 1.0, 0.5, 1.5e-5, 1.204
Re = U * L / nu
delta = 0.37 * L / Re**0.2
Cf = 0.074 / Re**0.2
tau_w = 0.5 * rho * U**2 * Cf
print(f"Re={Re:.3e}  delta={delta*1e3:.2f} mm  Cf={Cf:.4e}")
print(f"tau_w={tau_w:.3f} Pa  F={tau_w*2*L*W:.3f} N")
# Re=2.000e+06  delta=20.33 mm  Cf=4.0656e-03
# tau_w=2.203 Pa  F=2.203 N
eta = L * Re**-0.75
print(f"eta={eta*1e6:.2f} um  delta/eta={delta/eta:.0f}  N_DNS~{Re**2.25:.2e}")
# eta=18.81 um  delta/eta=1081  N_DNS~1.47e+14
```

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 算例在 $Ma=0.6$ 下用不可压求解器，压比完全错误 | 密度变化 $\frac{1}{2}Ma^2=18\%$，不可压假设失效 | 用 $\frac{1}{2}Ma^2$ 估算密度变化，超 5% 换可压缩形式 |
| 微通道算例阻力偏高、流量偏低 | 特征尺度进入滑移区，无滑移边界不成立 | 算 $Kn=\lambda/L$，超过 0.01 时改用 Maxwell 滑移边界 |
| 平板阻力比 $C_f$ 关联式高 40% | 边界层内网格未解析到对数层，壁面剪应力被高估 | 输出首层 $y^+$，确认落在 30～300 或小于 1 |
| 声波衰减计算值远小于实测 | 使用 Stokes 假设，忽略多原子气体体积黏性 | 对比 $\lambda_b=0$ 与 $\lambda_b=-2\mu/3$ 两组衰减系数 |
| 低 $Re$ 算例中出现非物理惯性振荡 | 惯性项未按 $Re\ll1$ 量级处理，网格分辨率超出需要 | 算 $Re$ 并与 1 比较，$Re<1$ 时可用 Stokes 近似并放大时间步 |
| 自由表面算例在 $Fr$ 接近 1 时结果失真 | 重力项被忽略或时间步未限制到表面波尺度 | 算 $Fr=U/\sqrt{gL}$，接近 1 时必须保留重力并限制 $\Delta t$ |

## 参考文献

1. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.
2. Tennekes H., Lumley J.L., *A First Course in Turbulence*, MIT Press, 1972.
3. Chorin A.J., Marsden J.E., *A Mathematical Introduction to Fluid Mechanics*, 3rd ed., Springer, 1993.
4. Davidson P.A., *Turbulence: An Introduction for Scientists and Engineers*, 2nd ed., Oxford University Press, 2015.
