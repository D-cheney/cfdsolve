---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-multiphase-sph-modeling
title: "多相 SPH：SPH 离散原理与适用边界"
summary: "从界面处密度定义的两种写法出发，解释求和式密度为何在密度比 100 以上失效、粒子数密度与 δ-SPH 扩散项如何补回一致性，并用 Weber 数、Bond 数与界面厚度量级给出适用边界判据。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "多相 SPH"
  - "SPH 离散原理与适用边界"
  - "粒子数密度"
  - "δ-SPH"
seo:
  title: "多相 SPH：SPH 离散原理与适用边界"
  description: "从界面处密度定义的两种写法出发，解释求和式密度为何在密度比 100 以上失效、粒子数密度与 δ-SPH 扩散项如何补回一致性，并用 Weber 数、Bond 数与界面厚度量级给出适用边界判据。"
  keywords:
    - "多相 SPH"
    - "SPH 离散原理与适用边界"
    - "粒子数密度"
    - "δ-SPH"
    - "界面厚度"
---

# 多相 SPH：SPH 离散原理与适用边界

多相 SPH 的核心困难不在动量方程，而在界面处"密度到底是什么"。单相里求和式密度与连续性方程几乎等价，因为邻域内质量相同、密度连续；一旦界面两侧密度相差几百倍，这两支就分道扬镳。本文解释这一分歧，给出两种补法，并用三个无量纲量与一个界面厚度判据划出适用边界。

## 求和式密度在界面上到底错在哪

求和式密度把核加权得到的质量除以隐含体积，等价于假设邻域内密度均匀。界面粒子 $i$ 的支持域被另一相占据一半时，求和结果既不是 $\rho_H$ 也不是 $\rho_L$，而是两者的核加权混合值。对水—气界面，若邻域内气相体积占比 $f=0.5$，则 $\rho_i\approx(1-f)\rho_H+f\rho_L=0.5\times998.2+0.5\times1.225=499.7\ \mathrm{kg/m^3}$。这个值本身无害，但它经状态方程反算出的压力是

$$
p(\rho_i)=\frac{\rho_0c_s^2}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right]=1.2834\times10^5\times\left(0.5006^7-1\right)=-1.27\times10^5\ \mathrm{Pa}
$$

即界面粒子凭空获得 $-1.27\times10^5\ \mathrm{Pa}$ 的负压，比真实界面压差大三个数量级。这正是高密度比下界面破裂的直接机理。

## 两条补法：粒子数密度与密度扩散

第一条是改密度的定义。用自身质量乘以核和，得到只反映"邻域内有多少个粒子"的量：

$$
\rho_i=m_i\sum_j W_{ij}
$$

该式不含邻居质量，气相存在不会拉低水粒子密度，两相密度由 $m_i$ 与间距 $\Delta p$ 隐式给定；代价是 $\rho_i$ 不再逐位守恒。

第二条是给密度加扩散项，即 δ-SPH：

$$
\frac{d\rho_i}{dt}=\sum_j m_j\mathbf{v}_{ij}\cdot\nabla_iW_{ij}+\delta hc_s\sum_j V_j\,\psi_{ij}\cdot\nabla_iW_{ij},\qquad \psi_{ij}=\frac{2(\rho_i-\rho_j)\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2}
$$

扩散项把密度场朝局部光滑解推进，抑制界面处的密度台阶，$\delta$ 常取 0.05~0.1。两项可叠加：数密度定义消除系统性偏差，扩散项消除高频噪声。

## 界面厚度决定了可分辨的最小尺度

SPH 的界面天然有厚度，量级是支持半径 $r_c=2h$。取 $\Delta p=2.0\times10^{-3}\ \mathrm{m}$、$h=2.4\times10^{-3}\ \mathrm{m}$，过渡带约 $2h=4.8\times10^{-3}\ \mathrm{m}$；若气泡半径 $R=5.0\times10^{-3}\ \mathrm{m}$，界面厚度已达半径的 96%，内部几乎没有均匀区。要求厚度不超过半径的 10%，需 $h\le0.05R=2.5\times10^{-4}\ \mathrm{m}$，即 $\Delta p\le2.1\times10^{-4}\ \mathrm{m}$，直径上约 48 个粒子。

## 三个无量纲量划出物理边界

表面张力是否需要在模型里出现，由 Weber 数与 Bond 数决定：

$$
We=\frac{\rho_0u^2L}{\sigma},\qquad Bo=\frac{\rho_0gL^2}{\sigma}
$$

取水 $\rho_0=998.2\ \mathrm{kg/m^3}$、$\sigma=0.0728\ \mathrm{N/m}$、$L=0.010\ \mathrm{m}$、$u=1.0\ \mathrm{m/s}$ 得 $We=137.1$、$Bo=13.45$，惯性、重力均强于毛细作用一个量级以上。把 $L$ 缩到毛细长度 $l_c=\sqrt{\sigma/(\rho_0g)}=2.727\times10^{-3}\ \mathrm{m}$ 时 $Bo=1.00$，毛细与重力恰好平衡——这就是表面张力必须进入模型的尺度分界。

## 模型层级与升级判据

| 层级 | 密度与压力离散 | 密度比适用范围 | 必须观察的量 | 升级条件 |
|---|---|---|---|---|
| 一 | 求和式密度 + $p_i+p_j$ 压力项 | $\le10$ | 界面压差、静止液滴形变 | 界面振荡幅度随密度比增大 |
| 二 | 加相间平均密度 $\bar\rho_{ij}$ | $\le100$ | 界面振荡峰谷差、互穿比例 | 振荡不随分辨率收敛 |
| 三 | 粒子数密度 + δ-SPH 扩散 | $\le1000$ | 界面厚度、相间质量预算 | 界面厚度超过目标尺度 10% |

升级不是越复杂越好：若升到层级二后界面振荡只从 150 Pa 降到 130 Pa 而计算量增加 30%，说明主导误差在别处。判据是升级后至少两个独立诊断量同时改善。

## 失效信号与对应机理

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面粒子压力为 $-1.27\times10^5\ \mathrm{Pa}$ | 求和式密度被邻相稀释 | 打印界面带内 $\rho_i/\rho_H$ 与 $f$ 的相关性 |
| 密度比从 10 提到 100 时振荡突变 | 压力项分母失去对称性 | 换用 $\bar\rho_{ij}$ 后比较峰谷差 |
| 界面厚度达到气泡半径的 96% | 支持半径过大，未满足 $2h\le0.1R$ | 按 $h\le0.05R$ 反算 $\Delta p$ 并加密 |
| $Bo=1$ 的算例液滴不振荡 | 毛细尺度上表面张力未启用 | 核对 $l_c=2.727\ \mathrm{mm}$ 与 $L$ 的比值 |
| 扩散项把界面抹平到 $4h$ 宽 | $\delta$ 超过 0.2 | 扫 $\delta=0,\ 0.05,\ 0.1,\ 0.2$ 记录过渡带宽度 |
| 气相密度人为抬高后结果剧变 | 惯性被高估，$We$ 与 $Bo$ 已失真 | 用真实气相密度重算两个无量纲量 |

## 最小验证脚本

```python
import numpy as np

def number_density(m, W):
    return m * np.sum(W, axis=1)          # rho_i = m_i * sum_j W_ij

def delta_sph_rhs(rho, x, v, m, V, gradW, h, cs, delta):
    drho = np.zeros_like(rho)
    for i in range(len(rho)):
        for j in range(len(rho)):
            if i == j:
                continue
            xij = x[i] - x[j]
            psi = 2.0 * (rho[i] - rho[j]) * xij / (xij @ xij + 1e-12)
            drho[i] += m[j] * ((v[i] - v[j]) @ gradW[i][j])
            drho[i] += delta * h * cs * V[j] * (psi @ gradW[i][j])
    return drho

def boundary_numbers(rho0, g, sigma, L, u):
    return dict(We=rho0 * u**2 * L / sigma,        # 137.1 at L = 0.01 m
                Bo=rho0 * g * L**2 / sigma,        # 13.45 at L = 0.01 m
                lc=np.sqrt(sigma / (rho0 * g)),    # 2.727e-3 m
                dp_max=0.05 * L / 1.2)             # 由 2h <= 0.1R 反算
```

`boundary_numbers` 的三个返回值构成建模前的准入检查：$We>100$ 且 $Bo>10$ 时可关表面张力；$l_c$ 与特征长度同量级时必须启用；`dp_max` 直接给出该尺度下的粒子间距上限。

## 参考

1. Hu X.Y., Adams N.A., *A multi-phase SPH method for macroscopic and mesoscopic flows*, Journal of Computational Physics, Vol. 213, 2006.
2. Grenier N., Antuono M., Colagrossi A. et al., *An Hamiltonian interface SPH formulation for multi-fluid and free surface flows*, Journal of Computational Physics, Vol. 228, 2009.
3. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
4. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
5. Solenthaler B., Pajarola R., *Density contrast SPH simulation of interacting multiphase fluids*, Computer Animation and Social Agents, 2008.
6. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
7. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.
