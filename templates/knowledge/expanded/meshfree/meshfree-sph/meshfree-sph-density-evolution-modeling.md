---
template_version: flowlab-knowledge/1.0
slug: meshfree-sph-density-evolution-modeling
title: 密度求和与连续方程：原理、设置与验证
summary: >-
  对比求和式密度与连续性方程密度两条更新路径的守恒结构、自由表面亏损机理与 δ-SPH 扩散项构造，给出可核对的虚假负压量级与收敛阶算法，并说明何时必须改用
  ISPH 或 DFSPH。 全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: meshfree-sph
  name: 无网格法 · SPH 理论与实现
level: 进阶
reading_minutes: 25
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - 无网格法
  - 无网格法 · SPH 理论与实现
  - 密度求和与连续方程
  - SPH 离散原理与适用边界
  - δ-SPH
  - 表面密度亏损
  - 工程设置与参数选择
  - δ-SPH 系数
  - CFL 时间步
  - 结果诊断与可信度验证
  - 虚假负压
  - L2 收敛阶
seo:
  title: 密度求和与连续方程：原理、设置与验证
  description: >-
    对比求和式密度与连续性方程密度两条更新路径的守恒结构、自由表面亏损机理与 δ-SPH
    扩散项构造，给出可核对的虚假负压量级与收敛阶算法，并说明何时必须改用 ISPH 或 DFSPH。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 密度求和与连续方程
    - SPH 离散原理与适用边界
    - δ-SPH
    - 表面密度亏损
    - 连续性方程
    - 工程设置与参数选择
    - δ-SPH 系数
    - CFL 时间步
    - 粒子间距
    - 结果诊断与可信度验证
    - 虚假负压
    - L2 收敛阶
    - 质量守恒
---
# 密度求和与连续方程：原理、设置与验证

## 原理与适用范围

密度是 SPH 中唯一同时出现在核求和、状态方程和时间步判据里的场量，它的更新方式决定了整条求解链的误差形态。求和式密度把 $\rho_i$ 写成邻域质量的核加权和，代数上自洽但会在自由表面系统性偏低；连续性方程形式让密度随时间演化，离散总质量严格守恒却会缓慢漂移。本文只讨论这两条路径的适用边界、表面亏损的定量后果，以及 δ-SPH 扩散项把亏损压回可接受范围的条件。

### 两条更新路径的守恒结构差异

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

### 自由表面亏损的定量后果

定义归一化求和 $S_i=\sum_j V_j W_{ij}$，$V_j=m_j/\rho_j$。内部粒子邻域完整时 $S_i\approx1$；处于平面自由表面的粒子只剩半个支持域，二维平面近似给出 $S_i\approx0.5$，三维视核类型在 $0.5\sim0.6$ 之间。若直接用求和式密度，表面粒子密度被低估到 $\rho_i\approx0.5\rho_0$。

取水 $\rho_0=998.2\ \mathrm{kg/m^3}$、$c_s=30\ \mathrm{m/s}$、Tait 指数 $\gamma=7$，状态方程

$$
p_i=\frac{\rho_0 c_s^2}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right]
$$

在 $\rho_i/\rho_0=0.5$ 时给出 $p_i=(998.2\times900/7)\times(0.5^7-1)\approx-1.27\times10^5\ \mathrm{Pa}$。这个量级的虚假负压会在表面产生数值张力，把粒子拉散，是"自由表面飞散"最直接的来源。真实表面粒子的压力应为 $0$，因此必须把 $S_i$ 与密度解耦，或显式施加 $p=0$ 的表面条件。

### δ-SPH 密度扩散项的构造

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

### 用收敛阶核对离散是否进入渐近区

把密度误差定义为对参考解的 $L_2$ 范数 $e=\left(\sum_i(\rho_i-\rho_i^{\mathrm{ref}})^2/N\right)^{1/2}$，在两档粒子间距上各跑一次，收敛阶为

$$
q=\frac{\log(e_1/e_2)}{\log(\Delta p_1/\Delta p_2)}
$$

某静水柱算例在 $\Delta p_1=0.020\ \mathrm{m}$ 上得 $e_1=4.0\times10^{-3}$，在 $\Delta p_2=0.010\ \mathrm{m}$ 上得 $e_2=1.6\times10^{-3}$，则 $q=\log(2.5)/\log(2)=1.32$。SPH 内部区域核近似理论阶为二阶，表面与边界使其退化，实测 $1.3$ 左右属正常；若 $q<0.8$ 或为负，说明尚未进入渐近区，或亏损未随分辨率同步处理。

### 何时必须放弃显式弱可压缩路径

当密度波动超过 $1\%$ 且提高 $c_s$ 已把时间步压到不可接受时，弱可压缩假设失效。$c_s=30\ \mathrm{m/s}$、$h=0.013\ \mathrm{m}$ 时声学 CFL 给出 $\Delta t\le0.25h/c_s=1.08\times10^{-4}\ \mathrm{s}$；若把 $c_s$ 提到 $150\ \mathrm{m/s}$，$\Delta t$ 降到 $2.2\times10^{-5}\ \mathrm{s}$，计算量增加约 $5$ 倍。此时应转向 ISPH 投影法（每步解压力泊松方程，$\Delta t$ 放宽到 $10^{-3}\ \mathrm{s}$ 量级）或 DFSPH 密度不变式迭代。判据是：$\rho_{\max}/\rho_0-1>0.01$ 且提高 $c_s$ 后时间步成本超出预算。

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 自由表面粒子飞散、形成雾状 | 求和式密度表面亏损导致虚假负压 | 绘制表面粒子 $S_i$ 场，检查是否低于 $0.6$ |
| 内部密度波动随时间持续增大 | 连续性方程形式缺少扩散、误差累积 | 统计 $\rho_{\max}/\rho_0-1$ 随时间的漂移斜率 |
| 提高 $\delta$ 后弱激波被抹平 | 密度扩散过强，耗散物理梯度 | 固定分辨率扫 $\delta=0.05,0.1,0.2$，比较激波前后密度跃变 |
| 加密后 $L_2$ 误差不降 | 未进入渐近区，或表面处理未随分辨率调整 | 用两档 $\Delta p$ 算 $q$，检查 $h/\Delta p$ 是否同步保持 |
| 长时间运行总质量缓慢流失 | 密度漂移未被质量预算监控 | 每 $10^4$ 步输出 $\sum_i m_i$，检查相对偏差是否超过 $10^{-6}$ |

### 参考

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
2. Monaghan J.J., *Smoothed Particle Hydrodynamics and Its Diverse Applications*, Annual Review of Fluid Mechanics, Vol. 44, 2012.
3. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
4. Molteni D., Colagrossi A., *A simple procedure to improve the pressure evaluation in hydrodynamic context using the SPH*, Computer Physics Communications, Vol. 180, 2009.
5. Marrone S., Antuono M., Colagrossi A., Colicchio G., Le Touzé D., Graziani G., *δ-SPH model for simulating violent impact flows*, Computer Methods in Applied Mechanics and Engineering, Vol. 200, 2011.
6. Violeau D., Rogers B.D., *Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future*, Journal of Hydraulic Research, Vol. 54, 2016.

## 工程设置与参数选择

在自由表面算例里，密度更新方式的选择排在所有参数调优之前：选错路径，后续的分辨率与时间步设置都在补偿一个本不该存在的误差。本文给出一条从几何尺度反推粒子间距、粒子质量、平滑长度、声速与时间步的取值链，并给出 δ-SPH 扩散强度、初始静水松弛与单因素对照的可复现配置。

### 按自由面占比选定密度更新路径

先统计初始构型中支持域被截断的粒子比例。若自由面与壁面粒子合计低于 $5\%$（如封闭管道内流、齿轮腔内部），求和式 $\rho_i=\sum_j m_j W_{ij}$ 精度足够且实现最简；若该比例超过 $10\%$（溃坝、波浪爬高、液滴冲击），必须改用连续性方程形式并配 δ-SPH 扩散，否则表面虚假负压会主导结果。这条判据比"用哪个求解器"更能决定成败。

### 从几何反推粒子间距与质量

分辨率按特征长度上的粒子数确定，自由面问题至少 $40$ 个粒子跨越特征尺度。某二维溃坝水槽宽 $1.0\ \mathrm{m}$、水深 $0.4\ \mathrm{m}$，取 $\Delta p=0.010\ \mathrm{m}$，则宽向 $100$ 个、深向 $40$ 个粒子，初始总粒子数约 $6000$。二维粒子质量

$$
m=\rho_0\,\Delta p^{\,d}
$$

取水 $\rho_0=998.2\ \mathrm{kg/m^3}$、$d=2$，得 $m=998.2\times(0.010)^2=9.982\times10^{-2}\ \mathrm{kg}$；三维同样式取 $d=3$ 得 $m=9.982\times10^{-4}\ \mathrm{kg}$。平滑长度取 $h=1.2\Delta p=0.012\ \mathrm{m}$，支持半径 $r_c=2h=0.024\ \mathrm{m}$，二维内部邻居数落在 $20\sim30$ 区间。

### 由最大速度定声速，再由声速定时间步

溃坝最大速度量级由水深估计：

$$
u_{\max}\approx\sqrt{2gH}=\sqrt{2\times9.81\times0.4}=2.80\ \mathrm{m/s}
$$

弱可压缩要求 $c_s\ge10\,u_{\max}=28.0\ \mathrm{m/s}$，取 $c_s=30\ \mathrm{m/s}$。此时密度波动 $\Delta\rho/\rho_0\approx(u_{\max}/c_s)^2=(2.80/30)^2=0.87\%$，落在 $1\%$ 目标内。声学 CFL 与综合时间步为

$$
\Delta t\le0.25\,\frac{h}{c_s+u_{\max}}=0.25\times\frac{0.012}{30+2.80}=9.15\times10^{-5}\ \mathrm{s}
$$

取 $\Delta t=9.0\times10^{-5}\ \mathrm{s}$。模拟到 $t=2.0\ \mathrm{s}$ 需约 $2.2\times10^4$ 步。若把 $c_s$ 提到 $60\ \mathrm{m/s}$ 以压制波动，$\Delta t$ 减半，步数翻倍，这是成本与不可压性的直接交换。

### δ-SPH 强度与表面亏损的匹配

δ-SPH 扩散项中 $\delta$ 是唯一新增参数：

$$
\frac{d\rho_i}{dt}=\sum_j m_j\,\mathbf{v}_{ij}\cdot\nabla_i W_{ij}+\delta h c_s\sum_j V_j\,\frac{2(\rho_i-\rho_j)\,\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2}\cdot\nabla_i W_{ij}
$$

工程基线取 $\delta=0.1$，可将表面密度亏损由约 $50\%$ 降到 $3\%$ 上下；$\delta=0$ 时 $\rho_i/\rho_0=0.5$ 会经状态方程 $p=c_s^2\rho_0[(\rho/\rho_0)^\gamma-1]/\gamma$ 产生约 $-1.3\times10^5\ \mathrm{Pa}$ 的虚假负压。$\delta>0.2$ 会开始抹平分层与弱激波，因此不建议作为精度调节手段。人工黏性系数另取 $\alpha=0.05$，与密度扩散分开记录。

### 初始静水松弛与压力验收

初始按格点排布后，先固定重力跑 $0.5\ \mathrm{s}$ 让压力场平衡，再开始统计，否则起步瞬间的格点斥力会造成喷射。验收量是底部静水压力：

$$
p_{\text{bottom}}=\rho_0 g H=998.2\times9.81\times0.4=3917\ \mathrm{Pa}
$$

沿深度的压力剖面应为线性 $p(z)=\rho_0 g(H-z)$，自由面处 $p=0$。若底部实测偏离 $3917\ \mathrm{Pa}$ 超过 $5\%$，先查 $\Delta p$ 与 $h$ 是否匹配、$S_i$ 在表面是否低于 $0.6$。

### 可复现配置清单

| 设置项 | 基线取值 | 依据 |
|---|---|---|
| 密度更新路径 | 连续性方程 + δ-SPH | 自由面粒子占比约 $30\%$ |
| 粒子间距 $\Delta p$ | $0.010\ \mathrm{m}$ | 特征长度上 $100$ 个粒子 |
| 平滑长度 $h$ | $0.012\ \mathrm{m}$ | $h=1.2\Delta p$ |
| 粒子质量 $m$ | $9.982\times10^{-2}\ \mathrm{kg}$ | $\rho_0\Delta p^2$ |
| 声速 $c_s$ | $30\ \mathrm{m/s}$ | $10\,u_{\max}$，波动 $0.87\%$ |
| 时间步 $\Delta t$ | $9.0\times10^{-5}\ \mathrm{s}$ | 声学 CFL |
| 扩散强度 $\delta$ | $0.1$ | 表面亏损 $50\%\to3\%$ |
| 人工黏性 $\alpha$ | $0.05$ | 抑制冲击飞散 |

```
# 参数文件片段（伪 YAML）
particle:
  dp: 0.010          # m
  h:  0.012          # m, = 1.2*dp
  mass: 9.982e-2     # kg, 2D
density:
  update: continuity  # 或 summation
  delta_sph: 0.1
eos:
  rho0: 998.2        # kg/m^3
  cs: 30.0           # m/s
  gamma: 7
time:
  dt: 9.0e-5         # s
  end_time: 2.0      # s
  relax_time: 0.5    # s
```

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 起步阶段粒子整体喷射 | 初始格点斥力未松弛 | 比较松弛 $0$、$0.5$、$1.0\ \mathrm{s}$ 后的速度场幅值 |
| 底部压力偏离 $3917\ \mathrm{Pa}$ 超 $5\%$ | $h/\Delta p$ 不匹配或表面亏损未处理 | 打印 $S_i$ 分布与压力剖面斜率 |
| 时间步反复触发重算 | $\Delta t$ 仅按全局最大速度取，局部更严 | 输出每步局部 $\max(c_s+v_i)$ 与 $\Delta t$ 分解项 |
| 提高 $c_s$ 后结果不变但成本翻倍 | 已过不可压极限，波动非主导误差 | 比较 $c_s=30$ 与 $60\ \mathrm{m/s}$ 的 $\rho_{\max}/\rho_0$ |
| 分层界面被抹平 | $\delta$ 过大，扩散覆盖物理梯度 | 扫 $\delta=0.05,0.1,0.2$ 看界面密度跃变宽度 |

### 参考

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
2. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
3. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
4. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
5. Crespo A.J.C., Domínguez J.M., Rogers B.D. et al., *DualSPHysics: Open-source parallel CFD solver based on SPH*, Computer Physics Communications, Vol. 187, 2015.
6. Marrone S., Antuono M., Colagrossi A. et al., *δ-SPH model for simulating violent impact flows*, Computer Methods in Applied Mechanics and Engineering, Vol. 200, 2011.

## 诊断与可信度验证

密度错误几乎不会停留在密度场上：它先被状态方程放大成压力误差，再经压力梯度项变成速度误差，最后以粒子飞散或界面破裂的形式暴露。诊断时应把密度拆成三个彼此独立的可测量——邻域归一化求和 $S_i$、相对密度极值 $\rho_{\max}/\rho_0-1$、状态方程反算的最小压力 $\min_i p_i$。本文给出三者的阈值、静水压解析对照、收敛阶手算与质量预算核对流程。

### 两种密度写法决定了正常读数

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

### 声速与时间步的一次手算

取水柱高 $H=0.4\ \mathrm{m}$、最大流速 $u_{\max}=2.0\ \mathrm{m/s}$、$\rho_0=998.2\ \mathrm{kg/m^3}$。按 $c_s\ge10u_{\max}$ 取 $c_s=30\ \mathrm{m/s}$。粒子间距 $\Delta p=0.010\ \mathrm{m}$、$h=1.2\Delta p=0.012\ \mathrm{m}$，声学条件给出

$$
\Delta t\le\frac{0.25h}{c_s}=\frac{0.25\times0.012}{30}=1.0\times10^{-4}\ \mathrm{s}
$$

按该步长走完 10 s 需要十万步。这个数必须进诊断记录，因为任何"加密后结果变化"的结论都要先排除 $\Delta t$ 未随 $h$ 同步缩小的可能。

### 由状态方程反算虚假负压

压力不是独立求解量，而是密度的函数：

$$
p_i=\frac{\rho_0c_s^2}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right]
$$

取 $\gamma=7$，则系数 $\rho_0c_s^2/\gamma=998.2\times900/7=1.2834\times10^5\ \mathrm{Pa}$。表面亏损使 $\rho_i/\rho_0=0.5$ 时，$0.5^7=0.0078125$，得 $p_i=1.2834\times10^5\times(-0.99219)=-1.273\times10^5\ \mathrm{Pa}$。真实自由面压力为 0，误差达五个数量级，这正是表面粒子被持续推飞的动力来源。反向检查内部：$\rho_i/\rho_0=1.005$ 时 $1.005^7=1.03553$，$p_i=1.2834\times10^5\times0.03553=4.56\times10^3\ \mathrm{Pa}$——1% 的密度偏差对应 4.6 kPa 压力误差，说明压力场精度完全由密度场决定。

### 静水柱的斜率对照

静水柱底部解析压力为

$$
p_{\text{bottom}}=\rho_0gH=998.2\times9.81\times0.4=3917\ \mathrm{Pa}
$$

沿深度满足 $p(z)=\rho_0g(H-z)$，斜率 $\rho_0g=9793\ \mathrm{Pa/m}$。把数值压力沿深度做最小二乘拟合，检查两件事：斜率是否落在 $9793\pm5\%$，即 9303~10283 Pa/m；表面截距是否接近 0。斜率偏大说明体积元 $V_j$ 被低估或 $h/\Delta p$ 失配；斜率正确而截距为正，说明自由面压力条件没有生效。

### 两档分辨率反算收敛阶

密度误差取 $L_2$ 范数 $e=(\sum_i(\rho_i-\rho_i^{\text{ref}})^2/N)^{1/2}$，收敛阶为

$$
q=\frac{\log(e_1/e_2)}{\log(\Delta p_1/\Delta p_2)}
$$

某溃坝算例 $\Delta p_1=0.020\ \mathrm{m}$ 得 $e_1=4.0\times10^{-3}$，$\Delta p_2=0.010\ \mathrm{m}$ 得 $e_2=1.6\times10^{-3}$，代入得 $q=\log(2.5)/\log(2)=0.916/0.693=1.32$。落在 1~2 之间属正常；若 $q<0.5$，先查扩散系数 $\delta$ 与 $h/\Delta p$ 在两档中是否保持一致，否则两档实际在解不同的方程。

### 质量预算的漂移斜率

对 $M_\rho(t)$ 做线性回归取相对斜率 $\dot M_\rho/M_\rho$。若 2 s 内漂移超过 0.1%，根因通常不是时间步，而是邻居表重建与积分步不同步：重建瞬间邻居集变化，若密度与加速度引用了不同步的邻居集，就会出现系统性质量偏差。把重建阈值从 $0.25h=3.0\times10^{-3}\ \mathrm{m}$ 缩到 $0.15h=1.8\times10^{-3}\ \mathrm{m}$ 复跑，若斜率随之下降，即可确认该机制。

### 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 表面粒子持续外飞 | 求和式密度亏损产生 $-1.3\times10^5\ \mathrm{Pa}$ 级负压 | 打印表面 $S_i$ 与 $\min_i p_i$，切连续方程形式复跑 |
| 压力呈棋盘状高频振荡 | 密度扩散不足 | 固定其余参数扫 $\delta=0,\ 0.05,\ 0.1$，比较振荡幅值 |
| 底部压力偏离 3917 Pa | $V_j$ 或 $h/\Delta p$ 取值错误 | 拟合压力剖面斜率，与 9793 Pa/m 比较 |
| 加密后 $L_2$ 误差不降 | 未进入渐近区或 $\delta$ 未固定 | 用两档 $\Delta p$ 手算 $q$，核对 $\delta$ 与 $h/\Delta p$ |
| $M_\rho$ 单调漂移 | 邻居表重建与积分步不同步 | 输出 $M_\rho$ 斜率，对比重建阈值 0.25h 与 0.15h |
| 内部 $\rho_i/\rho_0$ 达 1.02 | 声速不足，不可压性失守 | 按 $c_s\ge10u_{\max}$ 反算应取声速并复跑 |

### 诊断脚本

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

### 参考

1. Molteni D., Colagrossi A., *A simple procedure to improve the pressure evaluation in hydrodynamic context using the SPH*, Computer Physics Communications, Vol. 180, 2009.
2. Marrone S., Antuono M., Colagrossi A. et al., *δ-SPH model for simulating violent impact flows*, Computer Methods in Applied Mechanics and Engineering, Vol. 200, 2011.
3. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
4. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
