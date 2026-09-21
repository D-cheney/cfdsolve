---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-free-surface-engineering-setup
title: "自由表面识别：工程设置与参数选择"
summary: "给出自由面判据的阈值组合、三条表面压力条件施加路径的取舍、CSF 表面张力与毛细长度判据的启用流程，以及二维溃坝的表面粒子计数校核与可直接复制的配置片段。"
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
  - "自由表面识别"
  - "工程设置与参数选择"
  - "表面张力 CSF"
  - "毛细长度"
seo:
  title: "自由表面识别：工程设置与参数选择"
  description: "给出自由面判据的阈值组合、三条表面压力条件施加路径的取舍、CSF 表面张力与毛细长度判据的启用流程，以及二维溃坝的表面粒子计数校核与可直接复制的配置片段。"
  keywords:
    - "自由表面识别"
    - "工程设置与参数选择"
    - "表面张力 CSF"
    - "毛细长度"
    - "表面压力条件"
---

# 自由表面识别：工程设置与参数选择

自由面处理在建模阶段只有四个决定：用哪类判据、阈值取多少、压力条件走哪条路径、表面张力是否开启。这四项必须在写出第一版配置时定死，因为阈值一旦进入求解循环，改动等于改方程，事后调参无法解释结果差异。下面以二维溃坝为基线工况，给出可复制的取值链与配置片段。

## 判据组合与阈值取值

单一判据都有盲区，工程上采用"与"逻辑：$\gamma_i<0.75$ 且 $(\nabla\cdot\mathbf{r})_i<1.5$（二维）才标记为表面。取 $\Delta p=0.010\ \mathrm{m}$、$h=0.012\ \mathrm{m}$，内部粒子两读数分别为 1.00 与 2.00，平面表面降到 0.50 与 1.00，判据一致。拉伸区 $\gamma_i$ 可能先降到 0.70 而 $(\nabla\cdot\mathbf{r})_i$ 仍为 1.85，此时"与"逻辑会拒绝标记，避免假阳性。三维把阈值放宽到 $\gamma_i<0.80$ 与 $(\nabla\cdot\mathbf{r})_i<2.40$，因为三维表面邻居损失比例更小。

阈值不能任意收紧：压到 0.55 时只有平面表面粒子被标记，过渡层全部漏掉，压力条件覆盖不全，仍会出现负压。合理区间为 0.70~0.80，低于 0.65 视为过紧。

## 表面压力条件的三条施加路径

第一条是硬置零：标记后直接令 $p_i=0$。实现最简，但 $h$ 较大时压力剖面在表面处出现台阶，台阶幅度可达 $\rho_0 g\Delta p=998.2\times9.81\times0.010=97.9\ \mathrm{Pa}$。

第二条是 Shepard 修正密度后由状态方程反算：

$$
\tilde\rho_i=\frac{\sum_j m_j W_{ij}}{\sum_j V_j W_{ij}}
$$

修正后压力连续，但归一化改动了密度的守恒性质，长时间运行会让总质量缓慢漂移。

第三条是只在 $\gamma_i<1$ 的粒子上施加局部修正（$\delta^+$ 型），兼顾连续性与守恒。二维溃坝推荐第三条；三维大变形且 $h$ 偏小时，第一条配更小的 $h$ 反而更稳。

## 表面张力的启用判据

表面张力只在毛细效应与重力可比时才需要。判据用毛细长度

$$
l_c=\sqrt{\frac{\sigma}{\rho_0 g}}=\sqrt{\frac{0.0728}{998.2\times9.81}}=\sqrt{7.434\times10^{-6}}=2.727\times10^{-3}\ \mathrm{m}
$$

20 °C 水的毛细长度约 2.73 mm。把工况特征长度 $L$ 与它相比：二维溃坝 $L=0.2\ \mathrm{m}$，$L/l_c=73.3$，表面张力相对重力可忽略，应关闭。若模拟液滴振荡（$R=1\ \mathrm{mm}$）或毛细爬升，$L\sim l_c$ 甚至更小，必须启用。启用时用连续表面力（CSF）模型：

$$
\mathbf{f}_{s,i}=\sigma\kappa_i\mathbf{n}_i\delta_{s,i},\qquad \mathbf{n}_i=\sum_j V_j\nabla_i W_{ij},\qquad \kappa_i=-\nabla\cdot\hat{\mathbf{n}}_i
$$

其中 $\delta_{s,i}$ 是表面指示函数，只对 $|\mathbf{n}_i|$ 超过阈值的粒子非零，从而把体力局限在界面带上。$\sigma=0.0728\ \mathrm{N/m}$ 为水—空气界面张力。

## 启用表面张力后必须补的两项设置

第一项是时间步约束。CSF 引入的毛细波最快相速度由 $\sqrt{2\pi\sigma/(\rho_0 h)}$ 控制，对应

$$
\Delta t\le0.25\sqrt{\frac{\rho_0 h^3}{2\pi\sigma}}=0.25\sqrt{\frac{998.2\times1.728\times10^{-6}}{2\pi\times0.0728}}=1.54\times10^{-2}\ \mathrm{s}
$$

在 $\Delta p=0.010\ \mathrm{m}$ 下该约束不主导（声学步长仅 $1.0\times10^{-4}\ \mathrm{s}$），但 $\Delta p$ 细到 $1\ \mathrm{mm}$ 时毛细项就会与声学项同量级，必须同步纳入步长取小。

第二项是分辨率校核。液滴的 $n=2$ 振荡模态角频率 $\omega=\sqrt{8\sigma/(\rho_0R^3)}$，取 $R=1\ \mathrm{mm}$ 得 $\omega=\sqrt{8\times0.0728/(998.2\times10^{-9})}=764\ \mathrm{rad/s}$，对应周期 8.2 ms。要分辨该振荡，时间步应小于周期的 1/100，即 $8.2\times10^{-5}\ \mathrm{s}$；同时液滴直径 $2R=2\ \mathrm{mm}$ 至少要 20 个粒子跨过，即 $\Delta p\le1.0\times10^{-4}\ \mathrm{m}$。这两条比"关掉表面张力"更值得先算。

## 溃坝算例的表面粒子计数校核

二维水柱 $0.2\ \mathrm{m}\times0.4\ \mathrm{m}$、$\Delta p=0.010\ \mathrm{m}$ 共 800 个粒子。初始只有上表面 $0.2\ \mathrm{m}$ 参与自由面，几何估算约 $0.2/0.010=20$ 个；计入一圈过渡层后，判据应标记 40~60 个。若标记数超过 120，阈值过松，内部粒子被误判；少于 20，阈值过紧，压力条件实际未生效。

## 配置清单与配置片段

| 设置项 | 基线取值 | 依据 |
|---|---|---|
| 判据组合 | $\gamma_i$ 与 $(\nabla\cdot\mathbf{r})_i$ 取"与" | 抑制拉伸区假阳性 |
| $\gamma$ 阈值 | 0.75（三维 0.80） | 内部 1.00 与表面 0.50 的中点 |
| $(\nabla\cdot\mathbf{r})$ 阈值 | 1.5（三维 2.40） | 二维内部值 2.00 的 3/4 |
| 压力条件 | 局部修正路径 | 兼顾剖面连续与质量守恒 |
| 表面张力 | 关闭 | $L/l_c=73.3\gg1$ |
| 预期标记粒子数 | 40~60 | 上表面 20 个加过渡层 |

```yaml
# 自由表面配置片段（基线: 二维溃坝, dp = 0.010 m, h = 0.012 m）
particle_spacing: 0.010        # m
smoothing_length: 0.012        # m, h/dp = 1.2
free_surface:
  detection:
    criterion: gamma_and_divr
    gamma_threshold: 0.75      # 3D: 0.80
    divr_threshold: 1.5        # 3D: 2.40
  pressure_bc: delta_plus      # zero | shepard | delta_plus
  shepard:
    clamp_rho_max_factor: 1.05 # 修正后密度上限
surface_tension:
  enabled: false               # L/lc = 73.3 >> 1
  model: csf
  sigma: 0.0728                # N/m, 启用时生效
  surface_indicator_threshold: 0.5
  dt_capillary: 0.0154         # s, 0.25*sqrt(rho*h^3/(2*pi*sigma))
diagnostics:
  expect_surface_particles: [40, 60]
  expect_surface_pressure_step: 97.9   # Pa, 硬置零时的台阶幅度
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 标记粒子数超过 120 | 阈值过松，拉伸区被误判 | 打印标记数并与 40~60 比较 |
| 标记粒子数为零 | 阈值过紧或 $(\nabla\cdot\mathbf{r})$ 未归一化 | 统计标记数并核对内部读数是否为 2.00 |
| 表面压力出现 97.9 Pa 台阶 | 硬置零且 $h$ 偏大 | 换局部修正路径，比较表面压力剖面 |
| 毛细算例液滴不振荡 | 漏开表面张力 | 计算 $l_c=2.727\ \mathrm{mm}$ 与 $R$ 的比值 |
| 启用表面张力后立即发散 | 未加毛细时间步约束 | 加入 $\Delta t\le0.25\sqrt{\rho_0h^3/(2\pi\sigma)}$ 复跑 |
| 液滴振荡周期偏离 8.2 ms | 分辨率不足，$\Delta p$ 超过 $1.0\times10^{-4}\ \mathrm{m}$ | 加密至液滴直径 20 个粒子后复测周期 |
| 长时间运行总质量缓慢下降 | 采用 Shepard 修正但未限幅 | 检查修正密度是否超过 $1.05\rho_0$ |

## 参考

1. Marrone S., Colagrossi A., Le Touzé D., Graziani G., *Fast free-surface detection and level-set definition in SPH*, Computer Physics Communications, Vol. 181, 2010.
2. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
3. Brackbill J.U., Kothe D.B., Zemach C., *A continuum method for modeling surface tension*, Journal of Computational Physics, Vol. 100, 1992.
4. Crespo A.J.C., Domínguez J.M., Rogers B.D. et al., *DualSPHysics: Open-source parallel CFD solver based on SPH*, Computer Physics Communications, Vol. 187, 2015.
5. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
