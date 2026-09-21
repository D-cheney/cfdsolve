---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-density-evolution-diagnosis-validation
title: "密度求和与连续方程：结果诊断与可信度验证"
summary: "把密度场拆成邻域归一化求和、相对密度极值与质量预算三个独立读数，给出状态方程反算虚假负压的手算、静水压斜率 9793 Pa/m 对照与两档分辨率收敛阶计算，附诊断脚本与失败模式表。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "密度求和与连续方程"
  - "结果诊断与可信度验证"
  - "虚假负压"
  - "L2 收敛阶"
seo:
  title: "密度求和与连续方程：结果诊断与可信度验证"
  description: "把密度场拆成邻域归一化求和、相对密度极值与质量预算三个独立读数，给出状态方程反算虚假负压的手算、静水压斜率 9793 Pa/m 对照与两档分辨率收敛阶计算，附诊断脚本与失败模式表。"
  keywords:
    - "密度求和与连续方程"
    - "结果诊断与可信度验证"
    - "虚假负压"
    - "L2 收敛阶"
    - "质量守恒"
---

# 密度求和与连续方程：结果诊断与可信度验证

密度错误几乎不会停留在密度场上：它先被状态方程放大成压力误差，再经压力梯度项变成速度误差，最后以粒子飞散或界面破裂的形式暴露。诊断时应把密度拆成三个彼此独立的可测量——邻域归一化求和 $S_i$、相对密度极值 $\rho_{\max}/\rho_0-1$、状态方程反算的最小压力 $\min_i p_i$。本文给出三者的阈值、静水压解析对照、收敛阶手算与质量预算核对流程。

## 两种密度写法决定了正常读数

求和式密度由邻居质量直接加权：

$$
\rho_i=\sum_j m_j W_{ij}
$$

连续方程形式则对密度做时间积分：

$$
\frac{d\rho_i}{dt}=\rho_i\sum_j V_j\,\mathbf{v}_{ij}\cdot\nabla_i W_{ij}
$$

其中 $\mathbf{v}_{ij}=\mathbf{v}_i-\mathbf{v}_j$，$V_j=m_j/\rho_j$。求和式没有积分累积误差、并行归约友好，但自由面附近核被截断，密度系统性偏低；连续方程形式在自由面不亏损，却会在长时积分中引入守恒漂移。诊断前先确认用的是哪一支，因为两者的正常读数完全不同。

$S_i=\sum_j V_j W_{ij}$ 度量邻域完整性：内部应等于 1.00，平面自由面约 0.50，二维角点可低到 0.25。$\rho_{\max}/\rho_0-1$ 度量不可压性，弱可压缩 SPH 的目标是低于 1%。离散质量 $M_\rho=\sum_i\rho_i V_i$ 的漂移反映预算闭合，2 s 内相对漂移应低于 0.1%。三者独立：$S_i$ 正常不排除整体漂移，质量守恒也不排除表面亏损。

## 声速与时间步的一次手算

取水柱高 $H=0.4\ \mathrm{m}$、最大流速 $u_{\max}=2.0\ \mathrm{m/s}$、$\rho_0=998.2\ \mathrm{kg/m^3}$。按 $c_s\ge10u_{\max}$ 取 $c_s=30\ \mathrm{m/s}$。粒子间距 $\Delta p=0.010\ \mathrm{m}$、$h=1.2\Delta p=0.012\ \mathrm{m}$，声学条件给出

$$
\Delta t\le\frac{0.25h}{c_s}=\frac{0.25\times0.012}{30}=1.0\times10^{-4}\ \mathrm{s}
$$

按该步长走完 10 s 需要十万步。这个数必须进诊断记录，因为任何"加密后结果变化"的结论都要先排除 $\Delta t$ 未随 $h$ 同步缩小的可能。

## 由状态方程反算虚假负压

压力不是独立求解量，而是密度的函数：

$$
p_i=\frac{\rho_0c_s^2}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right]
$$

取 $\gamma=7$，则系数 $\rho_0c_s^2/\gamma=998.2\times900/7=1.2834\times10^5\ \mathrm{Pa}$。表面亏损使 $\rho_i/\rho_0=0.5$ 时，$0.5^7=0.0078125$，得 $p_i=1.2834\times10^5\times(-0.99219)=-1.273\times10^5\ \mathrm{Pa}$。真实自由面压力为 0，误差达五个数量级，这正是表面粒子被持续推飞的动力来源。反向检查内部：$\rho_i/\rho_0=1.005$ 时 $1.005^7=1.03553$，$p_i=1.2834\times10^5\times0.03553=4.56\times10^3\ \mathrm{Pa}$——1% 的密度偏差对应 4.6 kPa 压力误差，说明压力场精度完全由密度场决定。

## 静水柱的斜率对照

静水柱底部解析压力为

$$
p_{\text{bottom}}=\rho_0gH=998.2\times9.81\times0.4=3917\ \mathrm{Pa}
$$

沿深度满足 $p(z)=\rho_0g(H-z)$，斜率 $\rho_0g=9793\ \mathrm{Pa/m}$。把数值压力沿深度做最小二乘拟合，检查两件事：斜率是否落在 $9793\pm5\%$，即 9303~10283 Pa/m；表面截距是否接近 0。斜率偏大说明体积元 $V_j$ 被低估或 $h/\Delta p$ 失配；斜率正确而截距为正，说明自由面压力条件没有生效。

## 两档分辨率反算收敛阶

密度误差取 $L_2$ 范数 $e=(\sum_i(\rho_i-\rho_i^{\text{ref}})^2/N)^{1/2}$，收敛阶为

$$
q=\frac{\log(e_1/e_2)}{\log(\Delta p_1/\Delta p_2)}
$$

某溃坝算例 $\Delta p_1=0.020\ \mathrm{m}$ 得 $e_1=4.0\times10^{-3}$，$\Delta p_2=0.010\ \mathrm{m}$ 得 $e_2=1.6\times10^{-3}$，代入得 $q=\log(2.5)/\log(2)=0.916/0.693=1.32$。落在 1~2 之间属正常；若 $q<0.5$，先查扩散系数 $\delta$ 与 $h/\Delta p$ 在两档中是否保持一致，否则两档实际在解不同的方程。

## 质量预算的漂移斜率

对 $M_\rho(t)$ 做线性回归取相对斜率 $\dot M_\rho/M_\rho$。若 2 s 内漂移超过 0.1%，根因通常不是时间步，而是邻居表重建与积分步不同步：重建瞬间邻居集变化，若密度与加速度引用了不同步的邻居集，就会出现系统性质量偏差。把重建阈值从 $0.25h=3.0\times10^{-3}\ \mathrm{m}$ 缩到 $0.15h=1.8\times10^{-3}\ \mathrm{m}$ 复跑，若斜率随之下降，即可确认该机制。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 表面粒子持续外飞 | 求和式密度亏损产生 $-1.3\times10^5\ \mathrm{Pa}$ 级负压 | 打印表面 $S_i$ 与 $\min_i p_i$，切连续方程形式复跑 |
| 压力呈棋盘状高频振荡 | 密度扩散不足 | 固定其余参数扫 $\delta=0,\ 0.05,\ 0.1$，比较振荡幅值 |
| 底部压力偏离 3917 Pa | $V_j$ 或 $h/\Delta p$ 取值错误 | 拟合压力剖面斜率，与 9793 Pa/m 比较 |
| 加密后 $L_2$ 误差不降 | 未进入渐近区或 $\delta$ 未固定 | 用两档 $\Delta p$ 手算 $q$，核对 $\delta$ 与 $h/\Delta p$ |
| $M_\rho$ 单调漂移 | 邻居表重建与积分步不同步 | 输出 $M_\rho$ 斜率，对比重建阈值 0.25h 与 0.15h |
| 内部 $\rho_i/\rho_0$ 达 1.02 | 声速不足，不可压性失守 | 按 $c_s\ge10u_{\max}$ 反算应取声速并复跑 |

## 诊断脚本

```python
import numpy as np

def diagnose_density(rho, rho0, V, W, m, cs, gamma, H, g, dt, h):
    # 1. 邻域归一化求和 S_i = sum_j V_j W_ij
    S = np.array([np.sum(V * w) for w in W])
    # 2. 状态方程反算压力，定位虚假负压
    p = rho0 * cs**2 / gamma * ((rho / rho0)**gamma - 1.0)
    # 3. 静水压斜率对照
    slope_ref = rho0 * g                      # 9793 Pa/m
    p_bottom_ref = rho0 * g * H               # 3917 Pa
    # 4. 声学 CFL 步长是否与 h 同步
    dt_cfl = 0.25 * h / cs                    # 1.0e-4 s
    return dict(S_inner=S.max(), S_min=S.min(),
                p_min=p.min(), p_bottom_ref=p_bottom_ref,
                slope_ref=slope_ref, dt_cfl=dt_cfl,
                dt_ok=abs(dt - dt_cfl) < 0.2 * dt_cfl)

def l2_order(e1, e2, dp1, dp2):
    return np.log(e1 / e2) / np.log(dp1 / dp2)   # 0.916/0.693 = 1.32
```

脚本输出的判读顺序固定：先看 $S_{\min}$ 是否低于 0.25（低于说明存在角点级亏损），再看 $p_{\min}$ 是否为负（负值即虚假负压），最后看 $dt$ 与 $dt_{\text{cfl}}$ 的相对偏差是否小于 20%。三项中任意一项不通过，收敛阶计算都无意义。

## 参考

1. Molteni D., Colagrossi A., *A simple procedure to improve the pressure evaluation in hydrodynamic context using the SPH*, Computer Physics Communications, Vol. 180, 2009.
2. Marrone S., Antuono M., Colagrossi A. et al., *δ-SPH model for simulating violent impact flows*, Computer Methods in Applied Mechanics and Engineering, Vol. 200, 2011.
3. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
4. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
