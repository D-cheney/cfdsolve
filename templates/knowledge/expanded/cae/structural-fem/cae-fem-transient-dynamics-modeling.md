---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-transient-dynamics-modeling
title: "结构瞬态动力学：物理建模与适用边界"
summary: "瞬态动力学的适用边界由时间步与频率覆盖决定。本文给出 Newmark 的 $\\gamma=0.5$、$\\beta=0.25$ 无条件稳定条件、显式临界步长 $\\Delta t_{cr}=L_e/c$，并用 $c=5172\\,\\mathrm{m/s}$ 算出 5 mm 单元的 0.967 µs 上限与 Rayleigh 阻尼系数。"
category:
  slug: structural-fem
  name: "结构与有限元算法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "结构与有限元算法"
  - "结构瞬态动力学"
  - "物理建模与适用边界"
  - "Newmark 法"
  - "临界时间步"
seo:
  title: "结构瞬态动力学：物理建模与适用边界"
  description: "瞬态动力学的适用边界由时间步与频率覆盖决定。本文给出 Newmark 的 γ=0.5、β=0.25 无条件稳定条件、显式临界步长 Δtcr=Le/c，并用 c=5172 m/s 算出 5 mm 单元的 0.967 µs 上限与 Rayleigh 阻尼系数。"
  keywords:
    - "结构瞬态动力学"
    - "物理建模与适用边界"
    - "Newmark 法"
    - "临界时间步"
    - "Rayleigh 阻尼"
---

# 结构瞬态动力学：物理建模与适用边界

瞬态分析的边界不在求解器，而在两个数：时间步长与最高关心频率。步长选大了，隐式格式会滤掉高频响应，显式格式会直接发散；阻尼参数选错了，能量耗散位置与实际不符。本文给出 Newmark 族的时间步与稳定性条件、显式临界步长的估算、Rayleigh 阻尼的标定方法，并用钢材波速算出一个可核对的步长上限。

## Newmark 递推与稳定性

Newmark 法用两个参数 $\gamma$、$\beta$ 在加速度插值上做权衡：

$$
u_{n+1}=u_n+\Delta t\,\dot u_n+\Delta t^{2}\left[\left(\tfrac12-\beta\right)\ddot u_n+\beta\,\ddot u_{n+1}\right]
$$

$$
\dot u_{n+1}=\dot u_n+\Delta t\left[(1-\gamma)\ddot u_n+\gamma\,\ddot u_{n+1}\right]
$$

每步代入运动方程 $\mathbf M\ddot{\mathbf u}_{n+1}+\mathbf C\dot{\mathbf u}_{n+1}+\mathbf K\mathbf u_{n+1}=\mathbf f_{n+1}$ 解出 $\ddot{\mathbf u}_{n+1}$。稳定性条件是 $\gamma\ge0.5$ 且 $\beta\ge(\gamma+0.5)^{2}/4$。取 $\gamma=0.5$、$\beta=0.25$（平均加速度法）时无条件稳定，且无数值阻尼；取 $\gamma=0.5$、$\beta=1/6$（线性加速度法）时条件稳定，要求 $\Delta t\le0.551\,T_{\min}$，$T_{\min}$ 是最小周期。要抑制高频振荡，可用 HHT-$\alpha$（$\gamma=0.5-\alpha$，$\beta=(1-\alpha)^{2}/4$，$\alpha\in[-1/3,0]$）引入可控数值阻尼。

## 显式积分的临界步长

中心差分法（显式）的稳定极限由最高单元频率决定，工程上按波速估算：

$$
\Delta t_{cr}=\frac{L_e}{c},\qquad c=\sqrt{\frac{E}{\rho}}
$$

$L_e$ 是最小单元特征尺寸，$c$ 是纵波速。取钢 $E=210\,\mathrm{GPa}$、$\rho=7850\,\mathrm{kg/m^{3}}$，波速

$$
c=\sqrt{\frac{210\times10^{9}}{7850}}=5172\,\mathrm{m/s}
$$

若最小单元尺寸 $L_e=5.0\,\mathrm{mm}$，则 $\Delta t_{cr}=0.005/5172=9.67\times10^{-7}\,\mathrm{s}\approx0.967\,\mathrm{\mu s}$。实际求解常取 $0.9\,\Delta t_{cr}$ 留余量，即约 0.87 µs。这个数说明显式方法的时间步受最小单元支配：网格里出现一个 0.5 mm 的小单元，步长立刻降到 0.097 µs，总步数增加十倍。质量缩放可放宽步长，但必须报告缩放因子对惯性与动能的影响。

## Rayleigh 阻尼的标定

Rayleigh 阻尼 $\mathbf C=\alpha\mathbf M+\beta\mathbf K$ 由两个目标频率的阻尼比确定。若在 $f_1=10\,\mathrm{Hz}$、$f_2=100\,\mathrm{Hz}$ 处都取 $\xi=2\%$，对应 $\omega_1=62.83$、$\omega_2=628.3\,\mathrm{rad/s}$：

$$
\alpha=\frac{2\xi\,\omega_1\omega_2}{\omega_1+\omega_2}=\frac{2\times0.02\times62.83\times628.3}{691.2}=2.28\,\mathrm{s^{-1}}
$$

$$
\beta=\frac{2\xi}{\omega_1+\omega_2}=\frac{0.04}{691.2}=5.79\times10^{-5}\,\mathrm{s}
$$

质量项 $\alpha$ 主要耗散低频，刚度项 $\beta$ 主要耗散高频。若只关心低频，可只保留 $\alpha$；只关心高频冲击，可只保留 $\beta$。需要注意的是 Rayleigh 阻尼在两个目标频率之间的阻尼比低于设定值，区间外则升高，因此目标频率应覆盖分析关心的频段。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 显式分析步长稍大即发散、能量爆炸 | 超过临界步长 $L_e/c$ | 由最小单元尺寸重算 $\Delta t_{cr}$，检查是否用了 0.9 倍 |
| 隐式结果丢失高频响应 | 时间步大于关心的最小周期 | 比较 $\Delta t$ 与 $1/f_{\max}$，通常需 $\Delta t<1/(10f_{\max})$ |
| 响应在若干步后衰减为零 | 数值阻尼过大 | 换 $\beta=0.25$、$\gamma=0.5$ 的无阻尼 Newmark 复算 |
| 阻尼比随频率剧烈变化 | Rayleigh 目标频率选得不合理 | 用两个目标频率重标定 $\alpha$、$\beta$，检查区间外阻尼 |
| 质量缩放后动能异常增大 | 缩放因子过大改变惯性 | 报告缩放后动能与内能之比，应远小于 1 |
| 位移出现高频锯齿 | 时间步接近稳定极限 | 减小步长或引入 HHT-$\alpha$ 阻尼 |

## Newmark 时间积分伪代码

```
gamma, beta = 0.5, 0.25           # 平均加速度，无条件稳定
Keff = K + gamma/(beta*dt)*C + 1/(beta*dt**2)*M
for n in range(nsteps):
    rhs = f[n+1] + M @ (u/(beta*dt**2) + v/(beta*dt) + (0.5/beta-1)*a) \
               + C @ (gamma/(beta*dt)*u + (gamma/beta-1)*v \
                      + dt*(gamma/(2*beta)-1)*a)
    u_new = solve(Keff, rhs)
    a_new = (u_new-u)/(beta*dt**2) - v/(beta*dt) - (0.5/beta-1)*a
    v_new = v + dt*((1-gamma)*a + gamma*a_new)
    u, v, a = u_new, v_new, a_new
```

`Keff` 只需分解一次，后续每步仅做回代，这是隐式 Newmark 比逐步重构矩阵高效的关键。

## 参考文献

1. Newmark, N.M. "A method of computation for structural dynamics." *Journal of the Engineering Mechanics Division, ASCE*, 85(3), 67–94, 1959.
2. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
3. Hughes, T.J.R. *The Finite Element Method: Linear Static and Dynamic Finite Element Analysis*. Dover, 2000.
4. Hilber, H.M., Hughes, T.J.R., Taylor, R.L. "Improved numerical dissipation for time integration algorithms in structural dynamics." *Earthquake Engineering & Structural Dynamics*, 5(3), 283–292, 1977.
5. Chopra, A.K. *Dynamics of Structures: Theory and Applications to Earthquake Engineering*, 4th ed. Prentice Hall, 2011.
6. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
