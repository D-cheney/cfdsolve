---
template_version: flowlab-knowledge/1.0
slug: meshfree-sph-multiphase-sph-modeling
title: 多相 SPH：原理、设置与验证
summary: >-
  从界面处密度定义的两种写法出发，解释求和式密度为何在密度比 100 以上失效、粒子数密度与 δ-SPH 扩散项如何补回一致性，并用 Weber 数、Bond
  数与界面厚度量级给出适用边界判据。
  全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: meshfree-sph
  name: 无网格法 · SPH 理论与实现
level: 进阶
reading_minutes: 27
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - 无网格法
  - 无网格法 · SPH 理论与实现
  - 多相 SPH
  - SPH 离散原理与适用边界
  - 粒子数密度
  - δ-SPH
  - 工程设置与参数选择
  - 分相粒子间距
  - 表面张力 CSF
  - 结果诊断与可信度验证
  - Laplace 压力
  - 密度比
seo:
  title: 多相 SPH：原理、设置与验证
  description: >-
    从界面处密度定义的两种写法出发，解释求和式密度为何在密度比 100 以上失效、粒子数密度与 δ-SPH 扩散项如何补回一致性，并用 Weber
    数、Bond 数与界面厚度量级给出适用边界判据。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 多相 SPH
    - SPH 离散原理与适用边界
    - 粒子数密度
    - δ-SPH
    - 界面厚度
    - 工程设置与参数选择
    - 分相粒子间距
    - 表面张力 CSF
    - 接触角
    - 结果诊断与可信度验证
    - Laplace 压力
    - 密度比
    - 虚假流动
---
# 多相 SPH：原理、设置与验证

## 原理与适用范围

多相 SPH 的核心困难不在动量方程，而在界面处"密度到底是什么"。单相里求和式密度与连续性方程几乎等价，因为邻域内质量相同、密度连续；一旦界面两侧密度相差几百倍，这两支就分道扬镳。本文解释这一分歧，给出两种补法，并用三个无量纲量与一个界面厚度判据划出适用边界。

### 求和式密度在界面上到底错在哪

求和式密度把核加权得到的质量除以隐含体积，等价于假设邻域内密度均匀。界面粒子 $i$ 的支持域被另一相占据一半时，求和结果既不是 $\rho_H$ 也不是 $\rho_L$，而是两者的核加权混合值。对水—气界面，若邻域内气相体积占比 $f=0.5$，则 $\rho_i\approx(1-f)\rho_H+f\rho_L=0.5\times998.2+0.5\times1.225=499.7\ \mathrm{kg/m^3}$。这个值本身无害，但它经状态方程反算出的压力是

$$
p(\rho_i)=\frac{\rho_0c_s^2}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right]=1.2834\times10^5\times\left(0.5006^7-1\right)=-1.27\times10^5\ \mathrm{Pa}
$$

即界面粒子凭空获得 $-1.27\times10^5\ \mathrm{Pa}$ 的负压，比真实界面压差大三个数量级。这正是高密度比下界面破裂的直接机理。

### 两条补法：粒子数密度与密度扩散

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

### 界面厚度决定了可分辨的最小尺度

SPH 的界面天然有厚度，量级是支持半径 $r_c=2h$。取 $\Delta p=2.0\times10^{-3}\ \mathrm{m}$、$h=2.4\times10^{-3}\ \mathrm{m}$，过渡带约 $2h=4.8\times10^{-3}\ \mathrm{m}$；若气泡半径 $R=5.0\times10^{-3}\ \mathrm{m}$，界面厚度已达半径的 96%，内部几乎没有均匀区。要求厚度不超过半径的 10%，需 $h\le0.05R=2.5\times10^{-4}\ \mathrm{m}$，即 $\Delta p\le2.1\times10^{-4}\ \mathrm{m}$，直径上约 48 个粒子。

### 三个无量纲量划出物理边界

表面张力是否需要在模型里出现，由 Weber 数与 Bond 数决定：

$$
We=\frac{\rho_0u^2L}{\sigma},\qquad Bo=\frac{\rho_0gL^2}{\sigma}
$$

取水 $\rho_0=998.2\ \mathrm{kg/m^3}$、$\sigma=0.0728\ \mathrm{N/m}$、$L=0.010\ \mathrm{m}$、$u=1.0\ \mathrm{m/s}$ 得 $We=137.1$、$Bo=13.45$，惯性、重力均强于毛细作用一个量级以上。把 $L$ 缩到毛细长度 $l_c=\sqrt{\sigma/(\rho_0g)}=2.727\times10^{-3}\ \mathrm{m}$ 时 $Bo=1.00$，毛细与重力恰好平衡——这就是表面张力必须进入模型的尺度分界。

### 模型层级与升级判据

| 层级 | 密度与压力离散 | 密度比适用范围 | 必须观察的量 | 升级条件 |
|---|---|---|---|---|
| 一 | 求和式密度 + $p_i+p_j$ 压力项 | $\le10$ | 界面压差、静止液滴形变 | 界面振荡幅度随密度比增大 |
| 二 | 加相间平均密度 $\bar\rho_{ij}$ | $\le100$ | 界面振荡峰谷差、互穿比例 | 振荡不随分辨率收敛 |
| 三 | 粒子数密度 + δ-SPH 扩散 | $\le1000$ | 界面厚度、相间质量预算 | 界面厚度超过目标尺度 10% |

升级不是越复杂越好：若升到层级二后界面振荡只从 150 Pa 降到 130 Pa 而计算量增加 30%，说明主导误差在别处。判据是升级后至少两个独立诊断量同时改善。

### 失效信号与对应机理

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面粒子压力为 $-1.27\times10^5\ \mathrm{Pa}$ | 求和式密度被邻相稀释 | 打印界面带内 $\rho_i/\rho_H$ 与 $f$ 的相关性 |
| 密度比从 10 提到 100 时振荡突变 | 压力项分母失去对称性 | 换用 $\bar\rho_{ij}$ 后比较峰谷差 |
| 界面厚度达到气泡半径的 96% | 支持半径过大，未满足 $2h\le0.1R$ | 按 $h\le0.05R$ 反算 $\Delta p$ 并加密 |
| $Bo=1$ 的算例液滴不振荡 | 毛细尺度上表面张力未启用 | 核对 $l_c=2.727\ \mathrm{mm}$ 与 $L$ 的比值 |
| 扩散项把界面抹平到 $4h$ 宽 | $\delta$ 超过 0.2 | 扫 $\delta=0,\ 0.05,\ 0.1,\ 0.2$ 记录过渡带宽度 |
| 气相密度人为抬高后结果剧变 | 惯性被高估，$We$ 与 $Bo$ 已失真 | 用真实气相密度重算两个无量纲量 |

### 最小验证脚本

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

### 参考

1. Hu X.Y., Adams N.A., *A multi-phase SPH method for macroscopic and mesoscopic flows*, Journal of Computational Physics, Vol. 213, 2006.
2. Grenier N., Antuono M., Colagrossi A. et al., *An Hamiltonian interface SPH formulation for multi-fluid and free surface flows*, Journal of Computational Physics, Vol. 228, 2009.
3. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
4. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
5. Solenthaler B., Pajarola R., *Density contrast SPH simulation of interacting multiphase fluids*, Computer Animation and Social Agents, 2008.
6. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
7. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.

## 工程设置与参数选择

多相 SPH 的设置顺序与单相不同：必须先按密度比选离散方案，再定分相粒子质量与间距，最后才能谈声速与时间步——顺序颠倒会让后面所有参数都建在错误的密度定义上。本文以三维水—气算例（密度比 815）为主线，给出每一步的换算关系、取值依据与可复制的配置片段。

### 选型：密度比先于一切

| 密度比 $\rho_H/\rho_L$ | 推荐方案 | 理由 |
|---|---|---|
| 1~10 | 压力求和形式（$p_i+p_j$） | 界面两侧梯度对称，无需额外修正 |
| 10~100 | 压力求和加相间平均密度 | 抑制界面压力振荡 |
| 100~1000 | 粒子数密度形式或分相平滑长度 | 求和式密度在界面处失效 |

水—气比值为 $998.2/1.225=815$，落在第三档。若工况允许，把气相密度提高到 $9.982\ \mathrm{kg/m^3}$（比值为 100）可以显著降低成本并让方案落回第二档，代价是气相的惯性被高估 8 倍——只有在气相惯性对目标量不敏感时才允许。

### 分相粒子质量与间距的换算

三维下粒子质量由间距和相密度直接确定：

$$
m_i=\rho_{\alpha(i)}\,\Delta p^{d},\qquad d=3
$$

取统一间距 $\Delta p=5.0\times10^{-3}\ \mathrm{m}$，则水粒子 $m_w=998.2\times(5.0\times10^{-3})^3=1.248\times10^{-4}\ \mathrm{kg}$，空气粒子 $m_a=1.225\times1.25\times10^{-7}=1.531\times10^{-7}\ \mathrm{kg}$，两者相差 815 倍。若改用统一质量（便于某些算法实现），则间距必须按 $(\rho_\alpha)^{-1/3}$ 缩放，气相间距变为水相的 $815^{1/3}=9.34$ 倍，即 $0.0467\ \mathrm{m}$——这会让界面两侧邻居数严重失配，一般不推荐。

平滑长度取 $h=1.2\Delta p=6.0\times10^{-3}\ \mathrm{m}$，支持半径 $r_c=2h=0.012\ \mathrm{m}$。三维邻居数约 $(4/3)\pi r_c^3/\Delta p^3=58$，两相相同，这是统一间距的主要优点。

### 分相声速与时间步

声速按相分别取，以该相自身的最大速度和重力波速为基准：

$$
c_{s,\alpha}\ge10\max\left(u_{\max},\ \sqrt{gH_\alpha}\right)
$$

水相 $H_w=0.4\ \mathrm{m}$ 时 $\sqrt{gH_w}=\sqrt{9.81\times0.4}=1.981\ \mathrm{m/s}$，$u_{\max}=2.0\ \mathrm{m/s}$，故取 $c_{s,w}=30\ \mathrm{m/s}$。气相若按同一时间步积分，必须取相同量级的 $c_{s,a}$；气相真实声速 343 m/s 会把时间步压到 $1/11$，在多数工程问题中不值得。时间步取

$$
\Delta t\le\min_i\left[0.25\frac{h_i}{c_{s,i}+|\mathbf{v}_i|},\ 0.25\sqrt{\frac{\rho_i h_i^3}{2\pi\sigma}}\right]
$$

代入 $h=6.0\times10^{-3}\ \mathrm{m}$、$c_s=30\ \mathrm{m/s}$，声学项给出 $\Delta t=0.25\times0.006/30=5.0\times10^{-5}\ \mathrm{s}$；毛细项为 $0.25\sqrt{998.2\times2.16\times10^{-7}/(2\pi\times0.0728)}=5.43\times10^{-3}\ \mathrm{s}$，不主导。因此时间步由声学项决定，气相采用与水相同的 $c_s$ 后不会额外收紧。

### 表面张力与接触角

界面法向由颜色函数梯度给出，避免在密度跳变处直接求密度梯度：

$$
\mathbf{n}_i=\frac{\nabla c_i}{|\nabla c_i|},\qquad c_i=\sum_{j\in A}V_jW_{ij}
$$

表面力按 CSF 模型施加：$\mathbf{f}_{s,i}=\sigma\kappa_i\mathbf{n}_i\delta_{s,i}$，其中 $\delta_{s,i}=|\mathbf{n}_i|/\sum_jV_j|\nabla_iW_{ij}|$ 把体力限制在界面带内。取 $\sigma=0.0728\ \mathrm{N/m}$、液滴半径 $R=5.0\times10^{-4}\ \mathrm{m}$，则 Laplace 压力 $\Delta p=2\sigma/R=291.2\ \mathrm{Pa}$，这是校核表面张力实现是否正确的第一组数。壁面接触角 $\theta$ 通过在三相线附近对 $\mathbf{n}_i$ 施加 $\theta$ 的旋转实现：水—玻璃取 $\theta=25°$，水—聚四氟乙烯取 $\theta=110°$。

### 三维水—气算例配置

```yaml
# 三维水—气算例 (dp = 5.0 mm, h = 6.0 mm)
domain: [0.0, 0.0, 0.0, 0.4, 0.4, 0.6]      # m
particle_spacing: 0.005
smoothing_length: 0.006
phases:
  - name: water
    rho: 998.2            # kg/m^3
    mu: 1.004e-3          # Pa.s
    mass: 1.248e-4        # kg = rho * dp^3
    sound_speed: 30.0     # m/s, >= 10*max(2.0, 1.981)
  - name: air
    rho: 1.225
    mu: 1.81e-5
    mass: 1.531e-7
    sound_speed: 30.0     # 与液相取同量级以共用时间步
scheme:
  density: number_density            # 密度比 815 -> 必须用粒子数密度
  pressure_term: p_i_plus_p_j_over_rhoi_rhoj
surface_tension:
  model: csf
  sigma: 0.0728           # N/m
  color_function_normal: true
  contact_angle_deg: 25.0 # 水-玻璃; PTFE 用 110.0
time_stepping:
  dt_acoustic: 5.0e-5     # s = 0.25*h/cs
  dt_capillary: 5.43e-3   # s, 非主导
  dt: 5.0e-5
diagnostics:
  expect_neighbors_3d: 58
  expect_laplace_dp: 291.2   # Pa at R = 0.5 mm
```

### 单因素对照安排

选型定完后只做三组对照，每组只动一项：把密度比从 815 改成 100（气相密度人为抬高），看界面振荡幅度是否下降；把 $\Delta p$ 从 $5.0\ \mathrm{mm}$ 加密到 $2.5\ \mathrm{mm}$ 并同步把 $\Delta t$ 从 $5.0\times10^{-5}\ \mathrm{s}$ 减半，看 Laplace 压力是否收敛到 291.2 Pa；把 $\sigma$ 设为 0，看液滴是否立即摊平。三组都做完再决定是否引入分相平滑长度。

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面处压力剧烈振荡 | 密度比 815 超出压力求和形式适用范围 | 把气相密度抬到 9.982 kg/m³ 使比值降到 100 后复跑 |
| 气相粒子被水相挤穿 | 统一间距下两相质量差 815 倍且缺相间斥力 | 统计互穿比例，并与 $0.2\%$ 阈值比较 |
| 液滴内外压差不是 291.2 Pa | 颜色函数法向未归一化或 $\delta_{s,i}$ 定义有误 | 关表面张力对比，检查 $|\mathbf{n}_i|$ 在界面带内是否接近 1 |
| 时间步被压到 $4.5\times10^{-6}\ \mathrm{s}$ | 气相误用真实声速 343 m/s | 核对 $c_{s,a}$ 是否为 30 m/s |
| 接触角表现为 0° 或 180° | 三相线附近法向未按 $\theta$ 旋转 | 改变壁面 $\theta$ 设置，观察液滴形状是否响应 |
| 加密后界面弥散变宽 | 加密时未同步减半 $\Delta t$ 或未调整 $\delta$ | 记录过渡带宽度与 $2h$ 的比值 |

### 参考

1. Hu X.Y., Adams N.A., *A multi-phase SPH method for macroscopic and mesoscopic flows*, Journal of Computational Physics, Vol. 213, 2006.
2. Grenier N., Antuono M., Colagrossi A. et al., *An Hamiltonian interface SPH formulation for multi-fluid and free surface flows*, Journal of Computational Physics, Vol. 228, 2009.
3. Solenthaler B., Pajarola R., *Density contrast SPH simulation of interacting multiphase fluids*, Computer Animation and Social Agents, 2008.
4. Brackbill J.U., Kothe D.B., Zemach C., *A continuum method for modeling surface tension*, Journal of Computational Physics, Vol. 100, 1992.
5. Adami S., Hu X.Y., Adams N.A., *A generalized wall boundary condition for smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.
6. Crespo A.J.C., Domínguez J.M., Rogers B.D. et al., *DualSPHysics: Open-source parallel CFD solver based on SPH*, Computer Physics Communications, Vol. 187, 2015.
7. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.

## 诊断与可信度验证

多相 SPH 的失败很少表现为"算不出来"，而是界面附近出现局部压力振荡、两相粒子互相穿透、静止液滴里自发产生流动，或界面在几百步内弥散到看不出位置。这四类信号各有独立的判定量，也各有不同的根因。本文给出每类的阈值、一次可核对的 Laplace 压力手算，以及密度比与虚假流的定量判据。

### 界面压力振荡：先确认方程是否成对

多相动量方程应写成压力求和成对形式：

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_j m_j\frac{p_i+p_j}{\rho_i\rho_j}\nabla_i W_{ij}+\mathbf{g}+\frac{\mathbf{f}_{s,i}}{\rho_i}
$$

分子用 $p_i+p_j$ 而不是 $p_i/\rho_i+p_j/\rho_j$，是因为在密度跳变处后者会产生非对称的压力梯度，表现为界面两侧的振荡。判定量是界面带内压力的峰谷差 $\Delta p_{\text{osc}}=\max p-\min p$，在静置分层算例中应低于 $2\rho_0g\Delta p=2\times998.2\times9.81\times0.005=97.9\ \mathrm{Pa}$。若振荡幅度随 $\Delta p$ 加密反而增大，说明方程形式本身有问题，而不是分辨率问题。

### 用 Laplace 压力核对表面张力项

表面张力是否被正确施加，可以用一个静止液滴直接检验。Young–Laplace 关系给出内外压差

$$
\Delta p=\sigma\left(\frac{1}{R_1}+\frac{1}{R_2}\right)=\frac{2\sigma}{R}\quad(\text{球形})
$$

取 $\sigma=0.0728\ \mathrm{N/m}$、液滴半径 $R=1.0\times10^{-3}\ \mathrm{m}$，得 $\Delta p=2\times0.0728/1.0\times10^{-3}=145.6\ \mathrm{Pa}$。同一液滴直径上的静水压差只有 $\rho_0g(2R)=998.2\times9.81\times2.0\times10^{-3}=19.6\ \mathrm{Pa}$，即 Laplace 压力是它的 7.4 倍——液滴尺寸在毫米量级时表面张力绝不能关闭。数值解算出的液滴内外压差若偏离 $145.6\ \mathrm{Pa}$ 超过 10%，先查曲率 $\kappa$ 的离散精度，再查界面法向是否用 $\mathbf{n}_i=\sum_j V_j\nabla_iW_{ij}$ 的归一化形式。

### 密度比决定可用性上限

两相密度比是选择离散方案的首要参数。水—空气为 $998.2/1.225=815$，这个比值下朴素求和密度在界面处会给出介于两相之间的中间值，被状态方程放大成虚假压力。经验上限：压力求和形式（$p_i+p_j$ 型）在密度比 10 以内表现良好；比值到 100 需要引入密度加权的相间平均值

$$
\bar\rho_{ij}=\frac{2\rho_i\rho_j}{\rho_i+\rho_j}
$$

并把它用于压力项分母；比值超过 100（如 815）必须改用粒子数密度形式，或按相分别设定平滑长度与粒子质量。诊断方式很直接：把密度比从 10 依次提到 100、800，记录界面振荡幅度与静止液滴的形变量；若在某一比值处指标突然恶化一个数量级，那就是该方案的适用上限。

### 虚假流动与粒子互穿

静置液滴在无外力时应保持静止。虚假流强度取 $u_{sp}=\max_i|\mathbf{v}_i|/u_{\text{ref}}$，$u_{\text{ref}}$ 为工况特征速度；合格阈值是 $u_{sp}<0.01$。若 $u_{sp}$ 达到 0.05 并在液滴内形成环流，根因通常是表面张力与压力梯度在离散上不同步，而不是时间步不足。粒子互穿则用另一个量度量：统计相 A 粒子中最近邻为相 B 且距离小于 $0.5\Delta p$ 的比例 $f_{\text{cross}}$，正常应低于 0.2%；轻相粒子被压入重相时该值会跳到 2% 以上，且与密度比成正比。

界面弥散宽度也要记录。支持半径为 $r_c=2h$，取 $\Delta p=0.005\ \mathrm{m}$、$h=1.2\Delta p=0.006\ \mathrm{m}$，界面过渡带在 $t=0.5\ \mathrm{s}$ 内的合理宽度是 $2h=0.012\ \mathrm{m}$；若扩到 0.05 m 以上，说明密度扩散系数过大，物理界面已被抹平。

### 相间质量泄漏的核对

按相分别累计质量 $M_A=\sum_{i\in A}m_i$ 与 $M_B=\sum_{i\in B}m_i$。由于相标签不随时间改变，两者应逐位守恒；若 $M_A$ 在 1.0 s 内漂移超过 0.01%，说明存在把粒子在相间搬移的后处理或重采样操作。同时核对界面两侧的体积：$\sum_{i\in A}V_i$ 应与初始值一致，这一项能捕捉到密度被状态方程压偏但质量仍守恒的情形。

### 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面压力峰谷差超过 97.9 Pa | 压力项非成对，密度跳变处梯度不对称 | 把压力项改为 $p_i+p_j$ 形式后复跑 |
| 静止液滴内外压差偏离 145.6 Pa | 曲率或界面法向离散不准 | 关表面张力对比，检查 $\mathbf{n}_i$ 是否归一化 |
| 密度比提到 800 后界面破裂 | 超出压力求和形式的适用上限 | 依次跑 10、100、800，记录振荡幅度拐点 |
| 静止液滴内出现环流 | 表面张力与压力梯度不同步 | 测 $u_{sp}$，阈值 0.01，并检查是否同步施加 |
| 轻相粒子压入重相 | 密度比过大或缺少相间斥力 | 统计 $f_{\text{cross}}$，正常低于 0.2% |
| 界面弥散到 0.05 m 以上 | 密度扩散系数过大 | 对比过渡带宽度与 $2h=0.012\ \mathrm{m}$ |
| 单相质量在 1 s 内漂移 0.01% | 存在跨相重采样或粒子搬移 | 按相分别累计 $M_A$、$M_B$ 并画时间序列 |

### 诊断脚本

```python
import numpy as np

def interface_diagnostics(x, v, rho, phase, sigma, R, dp, u_ref):
    n = len(x)
    # 1. 相间互穿比例: 最近邻为异相且距离 < 0.5*dp
    cross = 0
    for i in range(n):
        d = np.linalg.norm(x - x[i], axis=1)
        d[i] = np.inf
        j = int(np.argmin(d))
        if phase[j] != phase[i] and d[j] < 0.5 * dp:
            cross += 1
    f_cross = cross / n
    # 2. 虚假流强度
    u_sp = np.max(np.linalg.norm(v, axis=1)) / u_ref
    # 3. Laplace 压力基准
    dp_laplace = 2.0 * sigma / R            # 145.6 Pa at R = 1 mm
    # 4. 按相质量预算
    M = {p: np.sum(rho[phase == p]) for p in np.unique(phase)}
    return dict(f_cross=f_cross,          # 目标 < 0.002
                u_sp=u_sp,                # 目标 < 0.01
                dp_laplace=dp_laplace,
                mass=M)

def density_ratio_sweep(ratios, run_case):
    # 依次跑 10 / 100 / 800, 记录界面振荡幅度拐点
    return {r: run_case(r)["p_osc"] for r in ratios}
```

判读顺序：先看 `dp_laplace` 是否为 145.6 Pa 量级（确认表面张力项已生效），再看 `u_sp` 是否低于 0.01，然后看 `f_cross` 是否低于 0.002。三者都通过而结果仍不合理时，才去跑 `density_ratio_sweep`，用拐点定位方案的密度比上限。

### 参考

1. Hu X.Y., Adams N.A., *A multi-phase SPH method for macroscopic and mesoscopic flows*, Journal of Computational Physics, Vol. 213, 2006.
2. Solenthaler B., Pajarola R., *Density contrast SPH simulation of interacting multiphase fluids*, Computer Animation and Social Agents, 2008.
3. Grenier N., Antuono M., Colagrossi A. et al., *An Hamiltonian interface SPH formulation for multi-fluid and free surface flows*, Journal of Computational Physics, Vol. 228, 2009.
4. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
5. Adami S., Hu X.Y., Adams N.A., *A generalized wall boundary condition for smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.
6. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
7. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
