---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-dem-particles-modeling
title: "离散元与颗粒接触：离散原理与适用范围"
summary: "从软球模型的控制方程出发给出 Hertz-Mindlin 接触力与重叠量的解析关系、Rayleigh 波速时间步判据的推导与取值、刚度软化的上限约束，以及硬球与软球模型的切换条件。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "离散元与颗粒接触"
  - "离散原理与适用范围"
  - "Hertz 接触"
  - "Rayleigh 时间步"
seo:
  title: "离散元与颗粒接触：离散原理与适用范围"
  description: "从软球模型的控制方程出发给出 Hertz-Mindlin 接触力与重叠量的解析关系、Rayleigh 波速时间步判据的推导与取值、刚度软化的上限约束，以及硬球与软球模型的切换条件。"
  keywords:
    - "离散元"
    - "离散原理与适用范围"
    - "Hertz 接触"
    - "Rayleigh 时间步"
    - "颗粒接触"
---

# 离散元与颗粒接触：离散原理与适用范围

离散元把颗粒当作刚体、把接触当作可重叠的柔性弹簧，重叠量不是几何误差而是接触力的载体。模型的适用性由两条尺度决定：接触时长与平均自由时间之比决定能否用硬球近似，Rayleigh 表面波在颗粒内的传播时间决定最大稳定步长。下面给出接触力的解析关系、时间步判据的量级估算与刚度软化的合法边界。

## 软球模型的控制方程

对第 $i$ 个颗粒写出平动与转动方程

$$
m_i\frac{d v_i}{dt}=\sum_j F_{ij}+m_i g,
\qquad
I_i\frac{d\omega_i}{dt}=\sum_j T_{ij},
$$

$F_{ij}$ 为接触力（法向与切向之和），$T_{ij}$ 为接触力矩，$I_i$ 为转动惯量。方程本身是显式的常微分方程，时间推进的稳定性完全由接触刚度和质量决定。接触力由重叠量 $\delta$ 与相对速度决定，模型闭合的关键是给出 $F_n(\delta)$ 与 $F_t(\delta_t)$ 的关系式。

## Hertz-Mindlin 接触力与重叠量

两个弹性球体的法向接触力为

$$
F_n=\tfrac{4}{3}E^{*}\sqrt{R^{*}}\,\delta^{3/2},
\qquad
\frac{1}{E^{*}}=\frac{1-\nu_1^{2}}{E_1}+\frac{1-\nu_2^{2}}{E_2},
\qquad
\frac{1}{R^{*}}=\frac{1}{R_1}+\frac{1}{R_2}.
$$

$E^*$ 为等效弹性模量，$R^*$ 为等效半径。取两个钢球（$R=5\,\mathrm{mm}$、$E=210\,\mathrm{GPa}$、$\nu=0.3$）、法向力 $F_n=100\,\mathrm{N}$：$E^*=210\times10^{9}/(2\times0.91)=1.154\times10^{11}\,\mathrm{Pa}$，$R^*=2.5\times10^{-3}\,\mathrm{m}$，于是

$$
\delta=\left(\frac{3F_n}{4E^*\sqrt{R^*}}\right)^{2/3}
=\left(\frac{300}{4\times1.154\times10^{11}\times0.05}\right)^{2/3}
=\big(1.30\times10^{-8}\big)^{2/3}=5.53\,\mu\mathrm{m}.
$$

接触半径 $a=\sqrt{R^*\delta}=1.18\times10^{-4}\,\mathrm{m}$（$0.118\,\mathrm{mm}$），最大接触压力 $p_0=3F_n/(2\pi a^2)=3.45\,\mathrm{GPa}$。该压力超过多数钢材的屈服强度，说明这个算例已经进入塑性区，实际仿真应改用弹塑性接触模型。切向刚度按 Mindlin 解取 $k_t/k_n=2(1-\nu)/(2-\nu)$，$\nu=0.3$ 时为 $0.824$；在 $\delta=5.53\,\mu\mathrm{m}$ 处的法向切线刚度为 $k_n=2E^*\sqrt{R^*\delta}=2.71\times10^{7}\,\mathrm{N/m}$，这是把 Hertz 接触折算成线性弹簧时的基准值。

## Rayleigh 波速时间步判据

显式时间积分的步长不能超过弹性波跨越最小颗粒所需时间的一部分。对半径为 $R$、密度 $\rho$、剪切模量 $G$、泊松比 $\nu$ 的球，Rayleigh 波速判据为

$$
\Delta t_{\mathrm{Ray}}=\frac{\pi R\sqrt{\rho/G}}{0.163\nu+0.876},
\qquad
\Delta t=0.2\,\Delta t_{\mathrm{Ray}}.
$$

取玻璃珠 $R=1\,\mathrm{mm}$、$\rho=2500\,\mathrm{kg/m^3}$、$G=26.2\,\mathrm{GPa}$、$\nu=0.23$：$\sqrt{\rho/G}=3.089\times10^{-4}\,\mathrm{s}$，得 $\Delta t_{\mathrm{Ray}}=1.06\,\mu\mathrm{s}$，实际步长取 $2.1\times10^{-7}\,\mathrm{s}$。

换成钢球 $R=5\,\mathrm{mm}$（$\rho=7850\,\mathrm{kg/m^3}$、$G=79.3\,\mathrm{GPa}$、$\nu=0.3$）：$\sqrt{\rho/G}=3.146\times10^{-4}\,\mathrm{s}$，$\Delta t_{\mathrm{Ray}}=5.34\,\mu\mathrm{s}$，实际步长 $1.07\,\mu\mathrm{s}$。注意 $\Delta t$ 与 $R$ 成正比、与 $\sqrt{G/\rho}$ 成反比：颗粒缩小 10 倍或刚度提高 100 倍，都会让步长缩小 10 倍，而步数按同样比例增加。这就是大规模 DEM 必须做刚度软化的原因。

## 接触刚度的标定与软化界限

软化把真实弹性模量除以系数 $s$，重叠量按 $\delta\propto s^{2/3}$ 放大。合法边界是重叠量不超过粒径的 $1\%$：

$$
\delta/R<0.01\ \Rightarrow\ s<\left(\frac{0.01R}{\delta_0}\right)^{3/2},
$$

$\delta_0$ 为真实模量下的重叠量。对上面的钢球算例，$\delta_0/R=5.53\times10^{-6}/5\times10^{-3}=1.1\times10^{-3}$，故 $s<(0.01/1.1\times10^{-3})^{3/2}=27$，即最多把模量降到 $1/27$，步长放大 $\sqrt{27}=5.2$ 倍。若把模量降到 $1/100$，重叠量放大 $21.5$ 倍达到粒径的 $2.4\%$，堆积孔隙率与力链结构都会明显偏离真实值。

## 硬球与软球的适用边界

硬球模型把碰撞当作瞬时事件，用恢复系数与冲量更新速度，不使用重叠量。它成立的条件是接触时长远小于平均自由时间。Hertz 接触时长可估为

$$
t_c\approx2.87\left(\frac{m^{*2}}{R^*E^{*2}v_n}\right)^{1/5},
\qquad
m^*=\frac{m_1m_2}{m_1+m_2}.
$$

对 $R=5\,\mathrm{mm}$ 的钢球、$v_n=0.1\,\mathrm{m/s}$：$m^*=2.06\times10^{-3}\,\mathrm{kg}$，代入得 $t_c=47.7\,\mu\mathrm{s}$，约为 Rayleigh 步长的 $8.9$ 倍。体积分数 $0.1$ 的稀疏流动中平均自由时间约 $0.5\,\mathrm{ms}$，比值约 $10$，硬球可用；体积分数升到 $0.4$ 后平均自由时间降到约 $60\,\mu\mathrm{s}$，比值降到 $1.3$，必须改用软球模型。

## 失效信号与判据

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 颗粒穿透或弹出计算域 | 时间步超过 Rayleigh 判据 | 把 $\Delta t$ 从 $0.4\Delta t_{\mathrm{Ray}}$ 降到 $0.2\Delta t_{\mathrm{Ray}}$，观察是否恢复 |
| 堆积体异常致密、孔隙率偏低 | 刚度软化过度，重叠量超过粒径 $1\%$ | 统计最大 $\delta/R$，钢球算例应低于 $1.1\times10^{-3}$ |
| 弹性碰撞后总能量持续上升 | 阻尼系数为负或接触检测重复计数 | 关闭阻尼，能量漂移应低于 $0.1\%/1000$ 步 |
| 稀疏流动中颗粒轨迹异常黏滞 | 体积分数低却仍用软球阻尼 | 计算 $t_c$ 与平均自由时间之比，大于 $10$ 时可换硬球 |
| 接触压力远超材料屈服强度 | Hertz 模型超出弹性范围 | 用 $p_0=3F_n/(2\pi a^2)$ 校核，钢球 $100\,\mathrm{N}$ 时达 $3.45\,\mathrm{GPa}$ |
| 恢复系数与设定值不符 | 阻尼系数与恢复系数的换算关系用错 | 用 $e=\exp(-\pi\zeta/\sqrt{1-\zeta^2})$ 反算，$\zeta=0.2$ 应得 $e=0.527$ |

## 可复算的量级脚本

```python
import math
ray = lambda R,rho,G,nu,f=0.2: f*math.pi*R*math.sqrt(rho/G)/(0.163*nu+0.876)
print(f"glass {ray(1e-3,2500,26.2e9,0.23):.3e}s  steel {ray(5e-3,7850,79.3e9,0.30):.3e}s")
Es, Rs, Fn = 210e9/(2*(1-0.3**2)), 2.5e-3, 100.0
d = (3*Fn/(4*Es*math.sqrt(Rs)))**(2/3)
print(f"delta={d*1e6:.2f}um a={math.sqrt(Rs*d)*1e3:.3f}mm "
      f"p0={3*Fn/(2*math.pi*Rs*d)/1e9:.2f}GPa kn={2*Es*math.sqrt(Rs*d):.2e}N/m")
# glass 2.125e-07s  steel 1.069e-06s
# delta=5.53um a=0.118mm p0=3.45GPa kn=2.71e+07N/m
```

## 参考文献

1. Cundall, P. A. & Strack, O. D. L. A discrete numerical model for granular assemblies. *Géotechnique*, 29(1): 47-65, 1979.
2. Mindlin, R. D. Compliance of elastic bodies in contact. *Journal of Applied Mechanics*, 16(3): 259-268, 1949.
3. Johnson, K. L. *Contact Mechanics*. Cambridge University Press, 1985.
4. Li, Y., Xu, Y. & Thornton, C. A comparison of discrete element simulations and experiments for sandpiles composed of spherical particles. *Powder Technology*, 160(3): 219-228, 2005.
5. O'Sullivan, C. *Particulate Discrete Element Modelling: A Geomechanics Perspective*. Spon Press, 2011.
6. Zhu, H. P., Zhou, Z. Y., Yang, R. Y. & Yu, A. B. Discrete particle simulation of particulate systems: theoretical developments. *Chemical Engineering Science*, 62(13): 3378-3396, 2007.