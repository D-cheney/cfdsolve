---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-density-evolution-engineering-setup
title: "密度求和与连续方程：工程设置与参数选择"
summary: "给出从自由面占比选定密度更新路径、再由几何反推粒子间距与质量、由最大速度定声速、由声速定 CFL 时间步的完整取值链，附 δ-SPH 强度、初始松弛与可复现配置清单。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "密度求和与连续方程"
  - "工程设置与参数选择"
  - "δ-SPH 系数"
  - "CFL 时间步"
seo:
  title: "密度求和与连续方程：工程设置与参数选择"
  description: "给出从自由面占比选定密度更新路径、再由几何反推粒子间距与质量、由最大速度定声速、由声速定 CFL 时间步的完整取值链，附 δ-SPH 强度、初始松弛与可复现配置清单。"
  keywords:
    - "密度求和与连续方程"
    - "工程设置与参数选择"
    - "δ-SPH 系数"
    - "CFL 时间步"
    - "粒子间距"
---

# 密度求和与连续方程：工程设置与参数选择

在自由表面算例里，密度更新方式的选择排在所有参数调优之前：选错路径，后续的分辨率与时间步设置都在补偿一个本不该存在的误差。本文给出一条从几何尺度反推粒子间距、粒子质量、平滑长度、声速与时间步的取值链，并给出 δ-SPH 扩散强度、初始静水松弛与单因素对照的可复现配置。

## 按自由面占比选定密度更新路径

先统计初始构型中支持域被截断的粒子比例。若自由面与壁面粒子合计低于 $5\%$（如封闭管道内流、齿轮腔内部），求和式 $\rho_i=\sum_j m_j W_{ij}$ 精度足够且实现最简；若该比例超过 $10\%$（溃坝、波浪爬高、液滴冲击），必须改用连续性方程形式并配 δ-SPH 扩散，否则表面虚假负压会主导结果。这条判据比"用哪个求解器"更能决定成败。

## 从几何反推粒子间距与质量

分辨率按特征长度上的粒子数确定，自由面问题至少 $40$ 个粒子跨越特征尺度。某二维溃坝水槽宽 $1.0\ \mathrm{m}$、水深 $0.4\ \mathrm{m}$，取 $\Delta p=0.010\ \mathrm{m}$，则宽向 $100$ 个、深向 $40$ 个粒子，初始总粒子数约 $6000$。二维粒子质量

$$
m=\rho_0\,\Delta p^{\,d}
$$

取水 $\rho_0=998.2\ \mathrm{kg/m^3}$、$d=2$，得 $m=998.2\times(0.010)^2=9.982\times10^{-2}\ \mathrm{kg}$；三维同样式取 $d=3$ 得 $m=9.982\times10^{-4}\ \mathrm{kg}$。平滑长度取 $h=1.2\Delta p=0.012\ \mathrm{m}$，支持半径 $r_c=2h=0.024\ \mathrm{m}$，二维内部邻居数落在 $20\sim30$ 区间。

## 由最大速度定声速，再由声速定时间步

溃坝最大速度量级由水深估计：

$$
u_{\max}\approx\sqrt{2gH}=\sqrt{2\times9.81\times0.4}=2.80\ \mathrm{m/s}
$$

弱可压缩要求 $c_s\ge10\,u_{\max}=28.0\ \mathrm{m/s}$，取 $c_s=30\ \mathrm{m/s}$。此时密度波动 $\Delta\rho/\rho_0\approx(u_{\max}/c_s)^2=(2.80/30)^2=0.87\%$，落在 $1\%$ 目标内。声学 CFL 与综合时间步为

$$
\Delta t\le0.25\,\frac{h}{c_s+u_{\max}}=0.25\times\frac{0.012}{30+2.80}=9.15\times10^{-5}\ \mathrm{s}
$$

取 $\Delta t=9.0\times10^{-5}\ \mathrm{s}$。模拟到 $t=2.0\ \mathrm{s}$ 需约 $2.2\times10^4$ 步。若把 $c_s$ 提到 $60\ \mathrm{m/s}$ 以压制波动，$\Delta t$ 减半，步数翻倍，这是成本与不可压性的直接交换。

## δ-SPH 强度与表面亏损的匹配

δ-SPH 扩散项中 $\delta$ 是唯一新增参数：

$$
\frac{d\rho_i}{dt}=\sum_j m_j\,\mathbf{v}_{ij}\cdot\nabla_i W_{ij}+\delta h c_s\sum_j V_j\,\frac{2(\rho_i-\rho_j)\,\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2}\cdot\nabla_i W_{ij}
$$

工程基线取 $\delta=0.1$，可将表面密度亏损由约 $50\%$ 降到 $3\%$ 上下；$\delta=0$ 时 $\rho_i/\rho_0=0.5$ 会经状态方程 $p=c_s^2\rho_0[(\rho/\rho_0)^\gamma-1]/\gamma$ 产生约 $-1.3\times10^5\ \mathrm{Pa}$ 的虚假负压。$\delta>0.2$ 会开始抹平分层与弱激波，因此不建议作为精度调节手段。人工黏性系数另取 $\alpha=0.05$，与密度扩散分开记录。

## 初始静水松弛与压力验收

初始按格点排布后，先固定重力跑 $0.5\ \mathrm{s}$ 让压力场平衡，再开始统计，否则起步瞬间的格点斥力会造成喷射。验收量是底部静水压力：

$$
p_{\text{bottom}}=\rho_0 g H=998.2\times9.81\times0.4=3917\ \mathrm{Pa}
$$

沿深度的压力剖面应为线性 $p(z)=\rho_0 g(H-z)$，自由面处 $p=0$。若底部实测偏离 $3917\ \mathrm{Pa}$ 超过 $5\%$，先查 $\Delta p$ 与 $h$ 是否匹配、$S_i$ 在表面是否低于 $0.6$。

## 可复现配置清单

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

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 起步阶段粒子整体喷射 | 初始格点斥力未松弛 | 比较松弛 $0$、$0.5$、$1.0\ \mathrm{s}$ 后的速度场幅值 |
| 底部压力偏离 $3917\ \mathrm{Pa}$ 超 $5\%$ | $h/\Delta p$ 不匹配或表面亏损未处理 | 打印 $S_i$ 分布与压力剖面斜率 |
| 时间步反复触发重算 | $\Delta t$ 仅按全局最大速度取，局部更严 | 输出每步局部 $\max(c_s+v_i)$ 与 $\Delta t$ 分解项 |
| 提高 $c_s$ 后结果不变但成本翻倍 | 已过不可压极限，波动非主导误差 | 比较 $c_s=30$ 与 $60\ \mathrm{m/s}$ 的 $\rho_{\max}/\rho_0$ |
| 分层界面被抹平 | $\delta$ 过大，扩散覆盖物理梯度 | 扫 $\delta=0.05,0.1,0.2$ 看界面密度跃变宽度 |

## 参考

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
2. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
3. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
4. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
5. Crespo A.J.C., Domínguez J.M., Rogers B.D. et al., *DualSPHysics: Open-source parallel CFD solver based on SPH*, Computer Physics Communications, Vol. 187, 2015.
6. Marrone S., Antuono M., Colagrossi A. et al., *δ-SPH model for simulating violent impact flows*, Computer Methods in Applied Mechanics and Engineering, Vol. 200, 2011.
