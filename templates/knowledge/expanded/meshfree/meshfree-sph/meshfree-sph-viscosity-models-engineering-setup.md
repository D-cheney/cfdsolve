---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-viscosity-models-engineering-setup
title: "物理与人工黏性：工程设置与参数选择"
summary: "给出由目标等效黏度反算 α 的取值链、β 的启用条件、Balsara 开关的奇异性项量级、层流系数的单位换算，以及一套可直接填写的黏性配置与单因素对照表。"
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
  - "物理与人工黏性"
  - "工程设置与参数选择"
  - "α 反算"
  - "动力黏度"
seo:
  title: "物理与人工黏性：工程设置与参数选择"
  description: "给出由目标等效黏度反算 α 的取值链、β 的启用条件、Balsara 开关的奇异性项量级、层流系数的单位换算，以及一套可直接填写的黏性配置与单因素对照表。"
  keywords:
    - "物理与人工黏性"
    - "工程设置与参数选择"
    - "α 反算"
    - "动力黏度"
    - "Balsara 开关"
---

# 物理与人工黏性：工程设置与参数选择

黏性设置之所以容易出错，是因为 $\alpha_\Pi$ 这类系数看上去只是"稳定性参数"，实际却等价于一个可换算的运动黏度。落地时只有四步：先由流体物性填层流黏度，再由目标等效黏度反算 $\alpha_\Pi$，按马赫数决定 $\beta_\Pi$，最后用 Balsara 开关把数值耗散限制在激波处。本文给出每一步的数值依据与配置模板。

## 先由流体物性填层流黏度

层流项的两个系数必须是物理量，不能调节。20 °C 水的动力黏度 $\mu=1.004\times10^{-3}\ \mathrm{Pa\cdot s}$，密度 $\rho_0=998.2\ \mathrm{kg/m^3}$，运动黏度

$$
\nu=\frac{\mu}{\rho_0}=\frac{1.004\times10^{-3}}{998.2}=1.006\times10^{-6}\ \mathrm{m^2/s}
$$

空气 20 °C 为 $\mu=1.825\times10^{-5}\ \mathrm{Pa\cdot s}$、$\rho=1.204\ \mathrm{kg/m^3}$，$\nu=1.516\times10^{-5}\ \mathrm{m^2/s}$。这两个值填错会让整个算例的雷诺数错一个量级，且症状隐蔽——流场依然"看起来像流体"。

## 由目标等效黏度反算 α

若希望数值黏度不超过物理黏度的某一比例，可用二维近似式反算：

$$
\alpha_\Pi=\frac{8\nu_{\mathrm{target}}}{c_s h}
$$

取 $c_s=30\ \mathrm{m/s}$、$h=0.012\ \mathrm{m}$。若目标是让 $\nu_{\mathrm{art}}$ 不超过水的 $\nu$（即 $\nu_{\mathrm{target}}=1.006\times10^{-6}\ \mathrm{m^2/s}$），则 $\alpha_\Pi=8\times1.006\times10^{-6}/(30\times0.012)=2.24\times10^{-5}$，远低于稳定所需的 $0.01$。这解释了一个常见现象：想同时兼顾高雷诺数与稳定性，唯一出路是提高分辨率（增大 $c_s h$ 的乘积会降低 $\nu_{\mathrm{art}}$）而非把 $\alpha_\Pi$ 压到零。实践中取 $\alpha_\Pi=0.01$ 作为稳定性下限，此时 $\nu_{\mathrm{art}}=0.01\times30\times0.012/8=4.5\times10^{-4}\ \mathrm{m^2/s}$，仍比水高 $447$ 倍。

## β 的启用条件

二次项系数 $\beta_\Pi$ 只在压缩主导的强冲击中起作用。判据是当地马赫数：$Ma<0.3$ 时取 $\beta_\Pi=0$；$Ma>1$ 的冲击（如高速射流撞击、爆炸波）取 $\beta_\Pi=1.0\sim2.0$。溃坝算例 $u_{\max}=2.80\ \mathrm{m/s}$、$c_s=30\ \mathrm{m/s}$，$Ma=0.093$，二次项比线性项小约 $0.093$ 倍，启用 $\beta_\Pi$ 只会增加无谓耗散。

## Balsara 开关的参数

开关本身没有自由参数，但分母的奇异性保护项需要与分辨率匹配：

$$
f_i=\frac{\left|\nabla\cdot\mathbf{v}\right|_i}{\left|\nabla\cdot\mathbf{v}\right|_i+\left|\nabla\times\mathbf{v}\right|_i+0.0001\,c_i/h_i}
$$

保护项量级 $0.0001c/h=0.0001\times30/0.012=0.25\ \mathrm{s^{-1}}$。在纯剪切区该值使 $f_i$ 略大于零但接近 $0$，足以避免 $\alpha_i$ 突变为零导致的不连续。启用后应验证：剪切层内 $f_i<0.1$，激波面 $f_i>0.8$。

## 单因素对照设计

黏性系数不能与其他参数同时改。建议固定 $\Delta p=0.010\ \mathrm{m}$、$h=0.012\ \mathrm{m}$、$c_s=30\ \mathrm{m/s}$，只扫 $\alpha_\Pi=0.01,0.05,0.1$ 三档，每档记录涡量峰值与动能衰减率。若 $\alpha_\Pi$ 从 $0.01$ 增到 $0.1$ 使涡量峰值下降超过 $20\%$，说明数值黏性已主导，需先加密再谈物理黏性。

## 配置清单

| 设置项 | 基线取值 | 依据 |
|---|---|---|
| 动力黏度 $\mu$ | $1.004\times10^{-3}\ \mathrm{Pa\cdot s}$ | 20 °C 水物性 |
| 运动黏度 $\nu$ | $1.006\times10^{-6}\ \mathrm{m^2/s}$ | $\mu/\rho_0$ |
| 人工黏性 $\alpha_\Pi$ | $0.01$ | 稳定性下限，$\nu_{\mathrm{art}}=4.5\times10^{-4}$ |
| 二次项 $\beta_\Pi$ | $0$ | $Ma=0.093<0.3$ |
| Balsara 开关 | 启用 | 剪切区 $f_i<0.1$ |
| 正则化 $\epsilon$ | $0.01$ | 防止近距离除零 |

```
# 黏性参数片段（伪 YAML）
viscosity:
  model: laminar_plus_artificial
  mu: 1.004e-3        # Pa.s, water @20C
  rho0: 998.2         # kg/m^3
  nu: 1.006e-6        # m^2/s
artificial:
  alpha: 0.01         # -> nu_art = 4.5e-4 m^2/s
  beta: 0.0           # Ma = 0.093
  balsara: true
  eps_h2: 0.01
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 低雷诺数算例结果与解析解偏差大 | 层流 $\mu$ 填成了运动黏度或单位错 | 核对 $\nu=\mu/\rho_0$ 是否为 $1.006\times10^{-6}$ |
| 剪切层被抹平 | $\alpha_\Pi$ 远大于目标等效黏度 | 用 $\alpha_\Pi c_s h/8$ 算 $\nu_{\mathrm{art}}$ 与 $\nu$ 比较 |
| 剪切区也在耗散 | Balsara 未启用或 $f_i$ 恒为 $1$ | 输出剪切层 $f_i$ 分布，检查是否低于 $0.1$ |
| 提高 $\alpha_\Pi$ 后结果不变 | 该算例的耗散不由人工黏性主导 | 分解能量预算，看数值耗散占比 |
| 冲击后振荡不收敛 | $\beta_\Pi=0$ 但 $Ma>1$ | 计算当地 $Ma$，若超 $1$ 则启用 $\beta_\Pi=1.0$ |

## 参考

1. Monaghan J.J., Gingold R.A., *Shock simulation by the particle method SPH*, Journal of Computational Physics, Vol. 52, 1983.
2. Balsara D.S., *von Neumann stability analysis of smoothed particle hydrodynamics—suggestions for optimal algorithms*, Journal of Computational Physics, Vol. 121, 1995.
3. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
4. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
5. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
