---
template_version: flowlab-knowledge/1.0
slug: meshfree-sph-free-surface-modeling
title: 自由表面识别：原理、设置与验证
summary: >-
  讲清自由表面在 SPH 中为何只能由邻域完整性推断，给出归一化求和 γ_i 与位置散度 ∇·r 两类判据的阈值、Shepard 修正密度的构造，以及 p=0
  边界条件的施加逻辑。 全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: meshfree-sph
  name: 无网格法 · SPH 理论与实现
level: 进阶
reading_minutes: 26
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - 无网格法
  - 无网格法 · SPH 理论与实现
  - 自由表面识别
  - SPH 离散原理与适用边界
  - 位置散度判据
  - Shepard 修正
  - 工程设置与参数选择
  - 表面张力 CSF
  - 毛细长度
  - 结果诊断与可信度验证
  - 溃坝基准
  - 连通分量
seo:
  title: 自由表面识别：原理、设置与验证
  description: >-
    讲清自由表面在 SPH 中为何只能由邻域完整性推断，给出归一化求和 γ_i 与位置散度 ∇·r 两类判据的阈值、Shepard 修正密度的构造，以及
    p=0 边界条件的施加逻辑。 全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 自由表面识别
    - SPH 离散原理与适用边界
    - 位置散度判据
    - Shepard 修正
    - 归一化求和
    - 工程设置与参数选择
    - 表面张力 CSF
    - 毛细长度
    - 表面压力条件
    - 结果诊断与可信度验证
    - 溃坝基准
    - 连通分量
    - 假阳性
---
# 自由表面识别：原理、设置与验证

## 原理与适用范围

SPH 没有显式界面几何，自由表面只能从"邻域被截断"这一事实反推。识别错误会同时污染三个环节：密度求和缺项、状态方程反算出虚假负压、表面张力施加在错误位置。本文给出两类主流判据的构造与阈值、Shepard 修正密度的作用，以及 $p=0$ 边界条件在弱可压缩框架下的施加逻辑。

### 自由表面为何必须显式标记

自由表面粒子的支持域只覆盖半个球（或圆），其核求和天然缺项。若不加区分地按内部粒子处理，$\rho_i=\sum_j m_j W_{ij}$ 会低估密度，经 Tait 状态方程 $p=c_s^2\rho_0[(\rho/\rho_0)^\gamma-1]/\gamma$ 反算出负压。取 $\rho_0=998.2\ \mathrm{kg/m^3}$、$c_s=30\ \mathrm{m/s}$、$\gamma=7$，表面亏损使 $\rho_i/\rho_0=0.5$ 时 $p_i\approx-1.27\times10^5\ \mathrm{Pa}$，而真实表面压力应为 $0$。因此识别不是后处理，而是求解循环内的必要步骤。

### 归一化求和判据

定义归一化核求和

$$
\gamma_i=\sum_j V_j W_{ij},\qquad V_j=\frac{m_j}{\rho_j}
$$

内部粒子邻域完整时 $\gamma_i\approx1.0$；平面自由表面粒子只剩半个支持域，二维给出 $\gamma_i\approx0.5$，三维在 $0.5\sim0.6$ 之间。工程阈值取 $\gamma_i<0.75$ 判为表面粒子，该值在 $h=0.012\ \mathrm{m}$、$\Delta p=0.010\ \mathrm{m}$ 下对曲率半径大于 $5h=0.06\ \mathrm{m}$ 的表面识别稳定；曲率更大的液滴尖端需要把阈值放宽到 $0.65$，否则会把内部粒子误判为表面。

### 位置散度判据

Marrone 等提出用位置矢量的散度作为几何判据：

$$
\left(\nabla\cdot\mathbf{r}\right)_i=\sum_j V_j\left(\mathbf{r}_j-\mathbf{r}_i\right)\cdot\nabla_i W_{ij}
$$

该量在连续极限下等于空间维度 $d$，与密度分布无关，因此比 $\gamma_i$ 更稳健。内部 $\left(\nabla\cdot\mathbf{r}\right)_i\approx d$，即二维 $2.0$、三维 $3.0$；自由表面处因缺一半邻居降到约 $d/2$。阈值取二维 $1.5$、三维 $2.4$，介于两者之间且留有容差。它的优点是对非均匀粒子分布不敏感，缺点是每个粒子需要额外一次向量求和，代价约为密度求和的 $1.3$ 倍。

### Shepard 修正密度把亏损拉回

识别出表面后，用 Shepard 归一化修正密度：

$$
\tilde\rho_i=\frac{\sum_j m_j W_{ij}}{\sum_j V_j W_{ij}}
$$

内部 $\gamma_i=1$ 时 $\tilde\rho_i=\rho_i$，不改变结果；表面 $\gamma_i=0.5$ 时分子约为 $0.5\rho_0$、分母约为 $0.5$，相除恢复到 $\rho_0$，把虚假负压从 $-1.27\times10^5\ \mathrm{Pa}$ 拉回到 $0$ 附近。代价是修正后的密度不再严格对应质量守恒，因此只能用于状态方程与表面压力，不能用于替代连续性方程中的密度更新。

```
# 自由表面识别与修正密度
for i in range(N):
    gamma = 0.0; divr = 0.0; m_sum = 0.0
    for j in neighbors[i]:
        Vj = m[j]/rho[j]
        gamma += Vj * W(i, j)
        divr  += Vj * dot(x[j]-x[i], gradW(x[i]-x[j], h))
        m_sum += m[j] * W(i, j)
    is_surface[i] = (gamma < 0.75) or (divr < 1.5)   # 2D
    rho_corr[i]   = m_sum / max(gamma, 1e-6)          # Shepard 修正
    if is_surface[i]:
        p[i] = 0.0                                     # 表面压力条件
```

### 适用边界与误判来源

两类判据都在粒子分布严重非均匀时失效：拉伸区的粒子稀疏会让内部粒子 $\gamma_i$ 降到 $0.7$ 以下，被误判为表面并强制 $p=0$，造成局部虚假空腔。反之，破碎后的孤立液滴若邻域完整，判据无法识别其表面，需要补充基于拓扑连通性的检测。曲率半径小于 $3\Delta p=0.03\ \mathrm{m}$ 的尖角处，两类判据都会给出模糊结果，此时应结合体积守恒而非单纯几何阈值。

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 表面粒子持续飞散 | 未识别表面、未施加 $p=0$ | 统计被标记表面粒子数，检查是否接近几何表面粒子数 |
| 内部出现孤立空腔 | 拉伸区被误判为表面并强制 $p=0$ | 输出 $\gamma_i$ 与 $\nabla\cdot\mathbf{r}$ 的联合分布 |
| 液滴破碎后表面消失 | 判据只依赖邻域完整性 | 补充连通分量分析，检查孤立团簇数 |
| 尖端处表面抖动 | 曲率小于 $3\Delta p$，判据模糊 | 加密到 $\Delta p=0.005\ \mathrm{m}$ 后复跑 |
| 修正密度后质量不守恒 | Shepard 修正未与连续性方程分离 | 比较 $\sum m_i$ 与修正前后密度积分 |

### 参考

1. Marrone S., Colagrossi A., Le Touzé D., Graziani G., *Fast free-surface detection and level-set definition in SPH*, Computer Physics Communications, Vol. 181, 2010.
2. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
3. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
4. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
5. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
6. Violeau D., Rogers B.D., *Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future*, Journal of Hydraulic Research, Vol. 54, 2016.

## 工程设置与参数选择

自由面处理在建模阶段只有四个决定：用哪类判据、阈值取多少、压力条件走哪条路径、表面张力是否开启。这四项必须在写出第一版配置时定死，因为阈值一旦进入求解循环，改动等于改方程，事后调参无法解释结果差异。下面以二维溃坝为基线工况，给出可复制的取值链与配置片段。

### 判据组合与阈值取值

单一判据都有盲区，工程上采用"与"逻辑：$\gamma_i<0.75$ 且 $(\nabla\cdot\mathbf{r})_i<1.5$（二维）才标记为表面。取 $\Delta p=0.010\ \mathrm{m}$、$h=0.012\ \mathrm{m}$，内部粒子两读数分别为 1.00 与 2.00，平面表面降到 0.50 与 1.00，判据一致。拉伸区 $\gamma_i$ 可能先降到 0.70 而 $(\nabla\cdot\mathbf{r})_i$ 仍为 1.85，此时"与"逻辑会拒绝标记，避免假阳性。三维把阈值放宽到 $\gamma_i<0.80$ 与 $(\nabla\cdot\mathbf{r})_i<2.40$，因为三维表面邻居损失比例更小。

阈值不能任意收紧：压到 0.55 时只有平面表面粒子被标记，过渡层全部漏掉，压力条件覆盖不全，仍会出现负压。合理区间为 0.70~0.80，低于 0.65 视为过紧。

### 表面压力条件的三条施加路径

第一条是硬置零：标记后直接令 $p_i=0$。实现最简，但 $h$ 较大时压力剖面在表面处出现台阶，台阶幅度可达 $\rho_0 g\Delta p=998.2\times9.81\times0.010=97.9\ \mathrm{Pa}$。

第二条是 Shepard 修正密度后由状态方程反算：

$$
\tilde\rho_i=\frac{\sum_j m_j W_{ij}}{\sum_j V_j W_{ij}}
$$

修正后压力连续，但归一化改动了密度的守恒性质，长时间运行会让总质量缓慢漂移。

第三条是只在 $\gamma_i<1$ 的粒子上施加局部修正（$\delta^+$ 型），兼顾连续性与守恒。二维溃坝推荐第三条；三维大变形且 $h$ 偏小时，第一条配更小的 $h$ 反而更稳。

### 表面张力的启用判据

表面张力只在毛细效应与重力可比时才需要。判据用毛细长度

$$
l_c=\sqrt{\frac{\sigma}{\rho_0 g}}=\sqrt{\frac{0.0728}{998.2\times9.81}}=\sqrt{7.434\times10^{-6}}=2.727\times10^{-3}\ \mathrm{m}
$$

20 °C 水的毛细长度约 2.73 mm。把工况特征长度 $L$ 与它相比：二维溃坝 $L=0.2\ \mathrm{m}$，$L/l_c=73.3$，表面张力相对重力可忽略，应关闭。若模拟液滴振荡（$R=1\ \mathrm{mm}$）或毛细爬升，$L\sim l_c$ 甚至更小，必须启用。启用时用连续表面力（CSF）模型：

$$
\mathbf{f}_{s,i}=\sigma\kappa_i\mathbf{n}_i\delta_{s,i},\qquad \mathbf{n}_i=\sum_j V_j\nabla_i W_{ij},\qquad \kappa_i=-\nabla\cdot\hat{\mathbf{n}}_i
$$

其中 $\delta_{s,i}$ 是表面指示函数，只对 $|\mathbf{n}_i|$ 超过阈值的粒子非零，从而把体力局限在界面带上。$\sigma=0.0728\ \mathrm{N/m}$ 为水—空气界面张力。

### 启用表面张力后必须补的两项设置

第一项是时间步约束。CSF 引入的毛细波最快相速度由 $\sqrt{2\pi\sigma/(\rho_0 h)}$ 控制，对应

$$
\Delta t\le0.25\sqrt{\frac{\rho_0 h^3}{2\pi\sigma}}=0.25\sqrt{\frac{998.2\times1.728\times10^{-6}}{2\pi\times0.0728}}=1.54\times10^{-2}\ \mathrm{s}
$$

在 $\Delta p=0.010\ \mathrm{m}$ 下该约束不主导（声学步长仅 $1.0\times10^{-4}\ \mathrm{s}$），但 $\Delta p$ 细到 $1\ \mathrm{mm}$ 时毛细项就会与声学项同量级，必须同步纳入步长取小。

第二项是分辨率校核。液滴的 $n=2$ 振荡模态角频率 $\omega=\sqrt{8\sigma/(\rho_0R^3)}$，取 $R=1\ \mathrm{mm}$ 得 $\omega=\sqrt{8\times0.0728/(998.2\times10^{-9})}=764\ \mathrm{rad/s}$，对应周期 8.2 ms。要分辨该振荡，时间步应小于周期的 1/100，即 $8.2\times10^{-5}\ \mathrm{s}$；同时液滴直径 $2R=2\ \mathrm{mm}$ 至少要 20 个粒子跨过，即 $\Delta p\le1.0\times10^{-4}\ \mathrm{m}$。这两条比"关掉表面张力"更值得先算。

### 溃坝算例的表面粒子计数校核

二维水柱 $0.2\ \mathrm{m}\times0.4\ \mathrm{m}$、$\Delta p=0.010\ \mathrm{m}$ 共 800 个粒子。初始只有上表面 $0.2\ \mathrm{m}$ 参与自由面，几何估算约 $0.2/0.010=20$ 个；计入一圈过渡层后，判据应标记 40~60 个。若标记数超过 120，阈值过松，内部粒子被误判；少于 20，阈值过紧，压力条件实际未生效。

### 配置清单与配置片段

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

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 标记粒子数超过 120 | 阈值过松，拉伸区被误判 | 打印标记数并与 40~60 比较 |
| 标记粒子数为零 | 阈值过紧或 $(\nabla\cdot\mathbf{r})$ 未归一化 | 统计标记数并核对内部读数是否为 2.00 |
| 表面压力出现 97.9 Pa 台阶 | 硬置零且 $h$ 偏大 | 换局部修正路径，比较表面压力剖面 |
| 毛细算例液滴不振荡 | 漏开表面张力 | 计算 $l_c=2.727\ \mathrm{mm}$ 与 $R$ 的比值 |
| 启用表面张力后立即发散 | 未加毛细时间步约束 | 加入 $\Delta t\le0.25\sqrt{\rho_0h^3/(2\pi\sigma)}$ 复跑 |
| 液滴振荡周期偏离 8.2 ms | 分辨率不足，$\Delta p$ 超过 $1.0\times10^{-4}\ \mathrm{m}$ | 加密至液滴直径 20 个粒子后复测周期 |
| 长时间运行总质量缓慢下降 | 采用 Shepard 修正但未限幅 | 检查修正密度是否超过 $1.05\rho_0$ |

### 参考

1. Marrone S., Colagrossi A., Le Touzé D., Graziani G., *Fast free-surface detection and level-set definition in SPH*, Computer Physics Communications, Vol. 181, 2010.
2. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
3. Brackbill J.U., Kothe D.B., Zemach C., *A continuum method for modeling surface tension*, Journal of Computational Physics, Vol. 100, 1992.
4. Crespo A.J.C., Domínguez J.M., Rogers B.D. et al., *DualSPHysics: Open-source parallel CFD solver based on SPH*, Computer Physics Communications, Vol. 187, 2015.
5. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.

## 诊断与可信度验证

自由表面判据会朝两个相反方向失效：把内部粒子误标为表面（假阳性）会强制该处 $p=0$，在流体内部撕出虚假空腔；漏掉真实表面粒子（假阴性）则让核截断造成的密度亏损与负压继续存在。两者的宏观表现都是粒子飞散，但修正方向相反，所以必须先分开。本文用溃坝前沿的解析极限、表面标记数区间与连通分量统计三项独立证据完成区分。

### 判据本身给出的两个读数

二维常用归一化位置散度作为表面指标：

$$
\gamma_i=\frac{1}{d}\sum_j V_j\,\mathbf{r}_{ij}\cdot\nabla_i W_{ij}
$$

其中 $d=2$ 为空间维数，$\mathbf{r}_{ij}=\mathbf{x}_i-\mathbf{x}_j$。$\gamma_i$ 等价于对常数场做差值近似的散度，内部粒子邻域完整时为 1.00，平面自由面上约 0.50，孤立粒子趋近 0。取 $\Delta p=0.010\ \mathrm{m}$、$h=1.2\Delta p=0.012\ \mathrm{m}$、$r_c=2h=0.024\ \mathrm{m}$，则二维内部邻居数约 $\pi r_c^2/\Delta p^2=18$，表面粒子只剩约一半，因此 $\gamma_i\approx0.5$ 的判据是几何必然而非经验值。

第二个读数是散度判据本身：$(\nabla\cdot\mathbf{r})_i$ 在二维内部为 2.00，在平面表面为 1.00。两个读数应当在多数粒子上一致；若 $\gamma_i$ 已降到 0.70 而 $(\nabla\cdot\mathbf{r})_i$ 仍为 1.85，说明该处处于拉伸区，粒子间距已被拉大——这是区分"真表面"与"拉伸稀疏"的关键。

### 溃坝前沿的自由落体解析极限

水柱在初期尚未受到底部反压显著影响时，前沿近似自由落体。用无量纲时间 $\tau=t\sqrt{2g/a}$，前沿位置满足

$$
\frac{x}{a}=\frac{\tau^2}{4},\qquad \tau=t\sqrt{\frac{2g}{a}}
$$

取水柱宽 $a=0.2\ \mathrm{m}$、高 $H=0.4\ \mathrm{m}$、$g=9.81\ \mathrm{m/s^2}$。在 $t=0.1\ \mathrm{s}$ 时 $\tau=0.1\times\sqrt{2\times9.81/0.2}=0.1\times9.9045=0.990$，于是 $x/a=0.990^2/4=0.2452$，即前沿推进 $x=0.0491\ \mathrm{m}$。对同一时刻求导得前沿速度 $\dot x=0.2\times0.990\times9.9045/2=0.980\ \mathrm{m/s}$，与自由落体速度 $gt=0.981\ \mathrm{m/s}$ 在三位有效数字内一致——这正是该极限自洽的证据。

数值前沿若慢于 0.049 m，说明表面被误判为固壁或耗散过强；若快于该值，说明有非物理斥力在推粒子。这是不需要实验数据就能执行的第一步检查。

### 表面标记数与几何预期

二维水柱 $0.2\ \mathrm{m}\times0.4\ \mathrm{m}$、$\Delta p=0.010\ \mathrm{m}$ 共 $20\times40=800$ 个粒子。单粒子质量 $m_i=\rho_0\Delta p^2=998.2\times1.0\times10^{-4}=0.09982\ \mathrm{kg/m}$，总质量 $800\times0.09982=79.856\ \mathrm{kg/m}$，与解析值 $\rho_0 aH=998.2\times0.2\times0.4=79.856\ \mathrm{kg/m}$ 逐位相符，可作为初始化的独立校核。

自由表面粒子数按几何估算：初始只有上表面 $0.2\ \mathrm{m}$ 参与，故约 $0.2/0.010=20$ 个，加一圈过渡层后应标记 40~60 个。判据是标记数始终落在几何表面粒子数的 1.5~3 倍之间。若在 $t=0.2\ \mathrm{s}$ 就跳到 200 以上，即为假阳性爆发，通常同时伴随拉伸区 $\gamma_i$ 骤降到 0.4 以下。

### 连通分量统计

按 $r_c$ 邻域连通性给粒子分组，统计团簇数与最大团簇占比。健康溃坝在 $t<1.0\ \mathrm{s}$ 内应保持单连通，最大团簇占比超过 99%。若在 $t=0.3\ \mathrm{s}$ 出现 5 个以上团簇、最大团簇占比掉到 80%，说明表面识别或压力条件在制造断裂。区分试验：关闭表面张力后复跑，碎片消失则根因是表面张力施加位置错误；碎片依旧则根因是假阳性 $p=0$。

### 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 前沿慢于 0.049 m | 表面被误判为固壁或耗散过强 | 比较 $t=0.1\ \mathrm{s}$ 的 $x/a$ 与 0.245 |
| 前沿快于 0.049 m | 非物理斥力推动粒子 | 关闭人工黏性后复跑，看前沿是否回落 |
| 表面标记数超过 200 | 拉伸区假阳性 | 联合输出 $\gamma_i$ 与 $(\nabla\cdot\mathbf{r})_i$ 分布 |
| 0.3 s 内出现 5 个以上团簇 | 表面张力位置错误或假阳性 $p=0$ | 关表面张力复跑，观察碎片是否消失 |
| 孤立液滴被标为内部 | 判据只看邻域完整性，不看连通性 | 做连通分量分析，检查最大团簇占比 |
| 表面压力恒为 0 但密度正常 | 判据阈值过紧，标记数为零 | 统计标记粒子数，与 40~60 区间比较 |
| 初始即出现负压 | 初始化后未做松弛 | 先跑 0.05 s 稳定化再开始统计前沿位置 |

### 诊断脚本

```python
import numpy as np
from collections import deque

def gamma_i(rij, gradW, V, d=2):
    # gamma_i = (1/d) * sum_j V_j (r_j - r_i) . grad_i W_ij
    return sum(V[j] * np.dot(rij[j], gradW[j]) for j in range(len(V))) / d

def clusters(x, rc):
    n = len(x)
    seen = [False] * n
    groups = []
    for s in range(n):
        if seen[s]:
            continue
        q, comp = deque([s]), []
        seen[s] = True
        while q:
            i = q.popleft()
            comp.append(i)
            for j in range(n):
                if not seen[j] and np.linalg.norm(x[i] - x[j]) < rc:
                    seen[j] = True
                    q.append(j)
        groups.append(comp)
    sizes = sorted((len(c) for c in groups), reverse=True)
    return len(groups), sizes[0] / n      # 目标: 1 个团簇, 占比 > 0.99

def front_check(a, H, g, t, x_num):
    tau = t * np.sqrt(2 * g / a)          # 0.990 at t = 0.1 s
    x_ref = a * tau**2 / 4                # 0.0491 m
    return dict(x_ref=x_ref, x_num=x_num,
                slow=x_num < 0.9 * x_ref, fast=x_num > 1.1 * x_ref)
```

脚本的三个输出对应三项证据：`clusters` 返回团簇数应为 1、最大占比应大于 0.99；`front_check` 的 `x_ref` 应为 0.0491 m；标记粒子数用 `gamma_i` 逐粒子算完后计数，应落在 40~60。任何一项越界，先用另外两项判断是假阳性还是假阴性，再决定收紧还是放松阈值。

### 参考

1. Martin J.C., Moyce W.J., *An experimental study of the collapse of liquid columns on a rigid horizontal plane*, Philosophical Transactions of the Royal Society A, Vol. 244, 1952.
2. Marrone S., Colagrossi A., Le Touzé D., Graziani G., *Fast free-surface detection and level-set definition in SPH*, Computer Physics Communications, Vol. 181, 2010.
3. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
4. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
5. Violeau D., Rogers B.D., *Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future*, Journal of Hydraulic Research, Vol. 54, 2016.
6. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, Vol. 17, 2010.
