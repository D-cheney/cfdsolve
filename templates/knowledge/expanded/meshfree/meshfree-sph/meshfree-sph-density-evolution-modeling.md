---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-density-evolution-modeling
title: "密度求和与连续方程：SPH 离散原理与适用边界"
summary: "对比求和式密度与连续性方程密度两条更新路径的守恒结构、自由表面亏损机理与 δ-SPH 扩散项构造，给出可核对的虚假负压量级与收敛阶算法，并说明何时必须改用 ISPH 或 DFSPH。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "密度求和与连续方程"
  - "SPH 离散原理与适用边界"
  - "δ-SPH"
  - "表面密度亏损"
seo:
  title: "密度求和与连续方程：SPH 离散原理与适用边界"
  description: "对比求和式密度与连续性方程密度两条更新路径的守恒结构、自由表面亏损机理与 δ-SPH 扩散项构造，给出可核对的虚假负压量级与收敛阶算法，并说明何时必须改用 ISPH 或 DFSPH。"
  keywords:
    - "密度求和与连续方程"
    - "SPH 离散原理与适用边界"
    - "δ-SPH"
    - "表面密度亏损"
    - "连续性方程"
---

# 密度求和与连续方程：SPH 离散原理与适用边界

密度是 SPH 中唯一同时出现在核求和、状态方程和时间步判据里的场量，它的更新方式决定了整条求解链的误差形态。求和式密度把 $\rho_i$ 写成邻域质量的核加权和，代数上自洽但会在自由表面系统性偏低；连续性方程形式让密度随时间演化，离散总质量严格守恒却会缓慢漂移。本文只讨论这两条路径的适用边界、表面亏损的定量后果，以及 δ-SPH 扩散项把亏损压回可接受范围的条件。

## 两条更新路径的守恒结构差异

求和式密度直接由核近似给出：

$$
\rho_i=\sum_j m_j W_{ij}
$$

其中 $W_{ij}=W(|\mathbf{x}_i-\mathbf{x}_j|,h)$，$m_j$ 为粒子 $j$ 的质量。该式不含时间导数，密度完全由当前构型决定，因此不存在时间积分漂移；代价是它对邻域完整性极其敏感，一旦支持域被自由表面或壁面截断，求和立即缺项。

连续性方程形式把密度演化写成速度散度的核近似：

$$
\frac{d\rho_i}{dt}=\sum_j m_j\,\mathbf{v}_{ij}\cdot\nabla_i W_{ij}
$$

其中 $\mathbf{v}_{ij}=\mathbf{v}_i-\mathbf{v}_j$。因为 $\nabla_i W_{ij}=-\nabla_j W_{ij}$，对所有粒子求和后 $\sum_i m_i\,d\rho_i/dt=0$，离散总质量在任意时刻严格守恒，与邻域是否完整无关。这正是溃坝、射流这类存在大量表面粒子的算例偏好连续性方程形式的根本原因；代价是密度误差不再被构型自动修正，长时间运行会累积。

## 自由表面亏损的定量后果

定义归一化求和 $S_i=\sum_j V_j W_{ij}$，$V_j=m_j/\rho_j$。内部粒子邻域完整时 $S_i\approx1$；处于平面自由表面的粒子只剩半个支持域，二维平面近似给出 $S_i\approx0.5$，三维视核类型在 $0.5\sim0.6$ 之间。若直接用求和式密度，表面粒子密度被低估到 $\rho_i\approx0.5\rho_0$。

取水 $\rho_0=998.2\ \mathrm{kg/m^3}$、$c_s=30\ \mathrm{m/s}$、Tait 指数 $\gamma=7$，状态方程

$$
p_i=\frac{\rho_0 c_s^2}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right]
$$

在 $\rho_i/\rho_0=0.5$ 时给出 $p_i=(998.2\times900/7)\times(0.5^7-1)\approx-1.27\times10^5\ \mathrm{Pa}$。这个量级的虚假负压会在表面产生数值张力，把粒子拉散，是"自由表面飞散"最直接的来源。真实表面粒子的压力应为 $0$，因此必须把 $S_i$ 与密度解耦，或显式施加 $p=0$ 的表面条件。

## δ-SPH 密度扩散项的构造

Molteni 与 Marrone 提出的 δ-SPH 在连续性方程右端增加扩散，使表面密度被邻域向均值拉回：

$$
\frac{d\rho_i}{dt}=\sum_j m_j\,\mathbf{v}_{ij}\cdot\nabla_i W_{ij}+\delta h c_s\sum_j V_j\,\boldsymbol{\psi}_{ij}\cdot\nabla_i W_{ij},\qquad \boldsymbol{\psi}_{ij}=\frac{2(\rho_i-\rho_j)\,\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2}
$$

$\delta$ 是无量纲扩散强度，工程常用 $0.05\sim0.2$，水动力算例中 $\delta=0.1$ 能把表面亏损从约 $50\%$ 压到 $2\%\sim5\%$。扩散项本身引入非物理密度平滑，$\delta$ 过大会抹平弱激波与分层界面，因此它不是精度旋钮。

```
# 每步密度更新（连续性方程 + δ-SPH 扩散）
for i in range(N):
    drho = 0.0
    for j in neighbors[i]:
        gw   = gradW(x[i] - x[j], h)          # 核梯度向量
        drho += m[j] * dot(v[i] - v[j], gw)
        psi   = 2.0 * (rho[i] - rho[j]) * (x[i] - x[j]) / (r_ij**2 + 1e-2*h**2)
        drho += delta * h * cs * V[j] * dot(psi, gw)
    rho_new[i] = rho[i] + dt * drho
```

## 用收敛阶核对离散是否进入渐近区

把密度误差定义为对参考解的 $L_2$ 范数 $e=\left(\sum_i(\rho_i-\rho_i^{\mathrm{ref}})^2/N\right)^{1/2}$，在两档粒子间距上各跑一次，收敛阶为

$$
q=\frac{\log(e_1/e_2)}{\log(\Delta p_1/\Delta p_2)}
$$

某静水柱算例在 $\Delta p_1=0.020\ \mathrm{m}$ 上得 $e_1=4.0\times10^{-3}$，在 $\Delta p_2=0.010\ \mathrm{m}$ 上得 $e_2=1.6\times10^{-3}$，则 $q=\log(2.5)/\log(2)=1.32$。SPH 内部区域核近似理论阶为二阶，表面与边界使其退化，实测 $1.3$ 左右属正常；若 $q<0.8$ 或为负，说明尚未进入渐近区，或亏损未随分辨率同步处理。

## 何时必须放弃显式弱可压缩路径

当密度波动超过 $1\%$ 且提高 $c_s$ 已把时间步压到不可接受时，弱可压缩假设失效。$c_s=30\ \mathrm{m/s}$、$h=0.013\ \mathrm{m}$ 时声学 CFL 给出 $\Delta t\le0.25h/c_s=1.08\times10^{-4}\ \mathrm{s}$；若把 $c_s$ 提到 $150\ \mathrm{m/s}$，$\Delta t$ 降到 $2.2\times10^{-5}\ \mathrm{s}$，计算量增加约 $5$ 倍。此时应转向 ISPH 投影法（每步解压力泊松方程，$\Delta t$ 放宽到 $10^{-3}\ \mathrm{s}$ 量级）或 DFSPH 密度不变式迭代。判据是：$\rho_{\max}/\rho_0-1>0.01$ 且提高 $c_s$ 后时间步成本超出预算。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 自由表面粒子飞散、形成雾状 | 求和式密度表面亏损导致虚假负压 | 绘制表面粒子 $S_i$ 场，检查是否低于 $0.6$ |
| 内部密度波动随时间持续增大 | 连续性方程形式缺少扩散、误差累积 | 统计 $\rho_{\max}/\rho_0-1$ 随时间的漂移斜率 |
| 提高 $\delta$ 后弱激波被抹平 | 密度扩散过强，耗散物理梯度 | 固定分辨率扫 $\delta=0.05,0.1,0.2$，比较激波前后密度跃变 |
| 加密后 $L_2$ 误差不降 | 未进入渐近区，或表面处理未随分辨率调整 | 用两档 $\Delta p$ 算 $q$，检查 $h/\Delta p$ 是否同步保持 |
| 长时间运行总质量缓慢流失 | 密度漂移未被质量预算监控 | 每 $10^4$ 步输出 $\sum_i m_i$，检查相对偏差是否超过 $10^{-6}$ |

## 参考

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
2. Monaghan J.J., *Smoothed Particle Hydrodynamics and Its Diverse Applications*, Annual Review of Fluid Mechanics, Vol. 44, 2012.
3. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
4. Molteni D., Colagrossi A., *A simple procedure to improve the pressure evaluation in hydrodynamic context using the SPH*, Computer Physics Communications, Vol. 180, 2009.
5. Marrone S., Antuono M., Colagrossi A., Colicchio G., Le Touzé D., Graziani G., *δ-SPH model for simulating violent impact flows*, Computer Methods in Applied Mechanics and Engineering, Vol. 200, 2011.
6. Violeau D., Rogers B.D., *Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future*, Journal of Hydraulic Research, Vol. 54, 2016.
