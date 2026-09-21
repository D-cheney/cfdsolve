---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-multiphase-sph-engineering-setup
title: "多相 SPH：工程设置与参数选择"
summary: "给出多相 SPH 的选型判据、分相粒子质量与间距的换算、分相声速与时间步取值、CSF 表面张力与接触角设置，以及可直接复制的三维水—气算例配置与单因素对照安排。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "多相 SPH"
  - "工程设置与参数选择"
  - "分相粒子间距"
  - "表面张力 CSF"
seo:
  title: "多相 SPH：工程设置与参数选择"
  description: "给出多相 SPH 的选型判据、分相粒子质量与间距的换算、分相声速与时间步取值、CSF 表面张力与接触角设置，以及可直接复制的三维水—气算例配置与单因素对照安排。"
  keywords:
    - "多相 SPH"
    - "工程设置与参数选择"
    - "分相粒子间距"
    - "表面张力 CSF"
    - "接触角"
---

# 多相 SPH：工程设置与参数选择

多相 SPH 的设置顺序与单相不同：必须先按密度比选离散方案，再定分相粒子质量与间距，最后才能谈声速与时间步——顺序颠倒会让后面所有参数都建在错误的密度定义上。本文以三维水—气算例（密度比 815）为主线，给出每一步的换算关系、取值依据与可复制的配置片段。

## 选型：密度比先于一切

| 密度比 $\rho_H/\rho_L$ | 推荐方案 | 理由 |
|---|---|---|
| 1~10 | 压力求和形式（$p_i+p_j$） | 界面两侧梯度对称，无需额外修正 |
| 10~100 | 压力求和加相间平均密度 | 抑制界面压力振荡 |
| 100~1000 | 粒子数密度形式或分相平滑长度 | 求和式密度在界面处失效 |

水—气比值为 $998.2/1.225=815$，落在第三档。若工况允许，把气相密度提高到 $9.982\ \mathrm{kg/m^3}$（比值为 100）可以显著降低成本并让方案落回第二档，代价是气相的惯性被高估 8 倍——只有在气相惯性对目标量不敏感时才允许。

## 分相粒子质量与间距的换算

三维下粒子质量由间距和相密度直接确定：

$$
m_i=\rho_{\alpha(i)}\,\Delta p^{d},\qquad d=3
$$

取统一间距 $\Delta p=5.0\times10^{-3}\ \mathrm{m}$，则水粒子 $m_w=998.2\times(5.0\times10^{-3})^3=1.248\times10^{-4}\ \mathrm{kg}$，空气粒子 $m_a=1.225\times1.25\times10^{-7}=1.531\times10^{-7}\ \mathrm{kg}$，两者相差 815 倍。若改用统一质量（便于某些算法实现），则间距必须按 $(\rho_\alpha)^{-1/3}$ 缩放，气相间距变为水相的 $815^{1/3}=9.34$ 倍，即 $0.0467\ \mathrm{m}$——这会让界面两侧邻居数严重失配，一般不推荐。

平滑长度取 $h=1.2\Delta p=6.0\times10^{-3}\ \mathrm{m}$，支持半径 $r_c=2h=0.012\ \mathrm{m}$。三维邻居数约 $(4/3)\pi r_c^3/\Delta p^3=58$，两相相同，这是统一间距的主要优点。

## 分相声速与时间步

声速按相分别取，以该相自身的最大速度和重力波速为基准：

$$
c_{s,\alpha}\ge10\max\left(u_{\max},\ \sqrt{gH_\alpha}\right)
$$

水相 $H_w=0.4\ \mathrm{m}$ 时 $\sqrt{gH_w}=\sqrt{9.81\times0.4}=1.981\ \mathrm{m/s}$，$u_{\max}=2.0\ \mathrm{m/s}$，故取 $c_{s,w}=30\ \mathrm{m/s}$。气相若按同一时间步积分，必须取相同量级的 $c_{s,a}$；气相真实声速 343 m/s 会把时间步压到 $1/11$，在多数工程问题中不值得。时间步取

$$
\Delta t\le\min_i\left[0.25\frac{h_i}{c_{s,i}+|\mathbf{v}_i|},\ 0.25\sqrt{\frac{\rho_i h_i^3}{2\pi\sigma}}\right]
$$

代入 $h=6.0\times10^{-3}\ \mathrm{m}$、$c_s=30\ \mathrm{m/s}$，声学项给出 $\Delta t=0.25\times0.006/30=5.0\times10^{-5}\ \mathrm{s}$；毛细项为 $0.25\sqrt{998.2\times2.16\times10^{-7}/(2\pi\times0.0728)}=5.43\times10^{-3}\ \mathrm{s}$，不主导。因此时间步由声学项决定，气相采用与水相同的 $c_s$ 后不会额外收紧。

## 表面张力与接触角

界面法向由颜色函数梯度给出，避免在密度跳变处直接求密度梯度：

$$
\mathbf{n}_i=\frac{\nabla c_i}{|\nabla c_i|},\qquad c_i=\sum_{j\in A}V_jW_{ij}
$$

表面力按 CSF 模型施加：$\mathbf{f}_{s,i}=\sigma\kappa_i\mathbf{n}_i\delta_{s,i}$，其中 $\delta_{s,i}=|\mathbf{n}_i|/\sum_jV_j|\nabla_iW_{ij}|$ 把体力限制在界面带内。取 $\sigma=0.0728\ \mathrm{N/m}$、液滴半径 $R=5.0\times10^{-4}\ \mathrm{m}$，则 Laplace 压力 $\Delta p=2\sigma/R=291.2\ \mathrm{Pa}$，这是校核表面张力实现是否正确的第一组数。壁面接触角 $\theta$ 通过在三相线附近对 $\mathbf{n}_i$ 施加 $\theta$ 的旋转实现：水—玻璃取 $\theta=25°$，水—聚四氟乙烯取 $\theta=110°$。

## 三维水—气算例配置

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

## 单因素对照安排

选型定完后只做三组对照，每组只动一项：把密度比从 815 改成 100（气相密度人为抬高），看界面振荡幅度是否下降；把 $\Delta p$ 从 $5.0\ \mathrm{mm}$ 加密到 $2.5\ \mathrm{mm}$ 并同步把 $\Delta t$ 从 $5.0\times10^{-5}\ \mathrm{s}$ 减半，看 Laplace 压力是否收敛到 291.2 Pa；把 $\sigma$ 设为 0，看液滴是否立即摊平。三组都做完再决定是否引入分相平滑长度。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面处压力剧烈振荡 | 密度比 815 超出压力求和形式适用范围 | 把气相密度抬到 9.982 kg/m³ 使比值降到 100 后复跑 |
| 气相粒子被水相挤穿 | 统一间距下两相质量差 815 倍且缺相间斥力 | 统计互穿比例，并与 $0.2\%$ 阈值比较 |
| 液滴内外压差不是 291.2 Pa | 颜色函数法向未归一化或 $\delta_{s,i}$ 定义有误 | 关表面张力对比，检查 $|\mathbf{n}_i|$ 在界面带内是否接近 1 |
| 时间步被压到 $4.5\times10^{-6}\ \mathrm{s}$ | 气相误用真实声速 343 m/s | 核对 $c_{s,a}$ 是否为 30 m/s |
| 接触角表现为 0° 或 180° | 三相线附近法向未按 $\theta$ 旋转 | 改变壁面 $\theta$ 设置，观察液滴形状是否响应 |
| 加密后界面弥散变宽 | 加密时未同步减半 $\Delta t$ 或未调整 $\delta$ | 记录过渡带宽度与 $2h$ 的比值 |

## 参考

1. Hu X.Y., Adams N.A., *A multi-phase SPH method for macroscopic and mesoscopic flows*, Journal of Computational Physics, Vol. 213, 2006.
2. Grenier N., Antuono M., Colagrossi A. et al., *An Hamiltonian interface SPH formulation for multi-fluid and free surface flows*, Journal of Computational Physics, Vol. 228, 2009.
3. Solenthaler B., Pajarola R., *Density contrast SPH simulation of interacting multiphase fluids*, Computer Animation and Social Agents, 2008.
4. Brackbill J.U., Kothe D.B., Zemach C., *A continuum method for modeling surface tension*, Journal of Computational Physics, Vol. 100, 1992.
5. Adami S., Hu X.Y., Adams N.A., *A generalized wall boundary condition for smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.
6. Crespo A.J.C., Domínguez J.M., Rogers B.D. et al., *DualSPHysics: Open-source parallel CFD solver based on SPH*, Computer Physics Communications, Vol. 187, 2015.
7. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
