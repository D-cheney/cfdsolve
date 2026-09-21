---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-tensile-instability-diagnosis-validation
title: "拉伸不稳定与配对：结果诊断与可信度验证"
summary: "把拉伸不稳定与配对识别成可量化的三类信号：负压占比、最小间距比与能量异常增长，给出由 Tait 方程手算负压值的步骤、1D 拉伸杆与双粒子两组判定试验，以及区分它与粒子分布问题的对照设计。"
category:
  slug: meshfree-foundations
  name: "无网格法 · 方法与验证"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法 · 方法与验证"
  - "拉伸不稳定与配对"
  - "结果诊断与可信度验证"
  - "负压判据"
  - "粒子配对"
seo:
  title: "拉伸不稳定与配对：结果诊断与可信度验证"
  description: "把拉伸不稳定与配对识别成可量化的三类信号：负压占比、最小间距比与能量异常增长，给出由 Tait 方程手算负压值的步骤、1D 拉伸杆与双粒子两组判定试验，以及区分它与粒子分布问题的对照设计。"
  keywords:
    - "拉伸不稳定与配对"
    - "结果诊断与可信度验证"
    - "负压判据"
    - "粒子配对"
    - "MESHFREE"
---

# 拉伸不稳定与配对：结果诊断与可信度验证

拉伸不稳定在云图上和"物理破碎"极其相似：粒子聚成丝状或成对粘连、局部出现空洞、自由面变成锯齿状。它和真实的表面张力驱动破碎、真实的空化，用肉眼几乎分不开，但三组量化信号可以把它们切开——负压粒子的占比、最小粒子间距比、以及总能量在无外力做功时的异常增长。本文给出这三个信号的阈值与测量方法、一次由 Tait 状态方程手算负压值的过程，以及把拉伸不稳定与单纯分布不良区分开的对照试验。

## 负压是拉伸不稳定最直接的前兆

弱可压缩 SPH 的压力由 Tait 状态方程给出，$\rho_i<\rho_0$ 时压力为负：

$$
p_i=\frac{\rho_0 c_s^{2}}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right]<0\iff\rho_i<\rho_0
$$

负压意味着粒子间吸引力，而 SPH 的核近似在吸引区恰好是反稳定的。取 $\rho_0=1000\ \text{kg/m}^{3}$、$c_s=30\ \text{m/s}$、$\gamma=7$，则 $\rho_0c_s^{2}/\gamma=1000\times900/7=1.286\times10^{5}\ \text{Pa}$。若某区域因自由面截断使 $\rho_i/\rho_0=0.97$，代入得 $p=1.286\times10^{5}\times(0.97^{7}-1)=1.286\times10^{5}\times(0.8080-1)=-2.47\times10^{4}\ \text{Pa}$。即 $3\%$ 的密度亏损就能造出约 $-24.7\ \text{kPa}$ 的负压，足以启动不稳定性。

诊断阈值可以这样定：正常算例中 $p<0$ 的粒子占比应低于 $1\%$，且只出现在自由面最外层；若某个区域有超过 $5\%$ 的粒子处于负压、且 $p_{\min}$ 低于 $-0.05\rho_0c_s^{2}$（本例为 $-4.5\times10^{4}\ \text{Pa}$），就应判定为拉伸不稳定而不是物理现象。

## 配对用最小间距比和邻居数突变来识别

配对（pairing）是拉伸不稳定最剧烈的表现形式：两个粒子互相吸引到间距趋近零，核权重被放大，局部密度虚高。定义配对指标

$$
\mathcal{P}=\min_{i\neq j}\frac{|\mathbf{x}_i-\mathbf{x}_j|}{\Delta x}
$$

健康算例中 $\mathcal{P}$ 通常维持在 $0.5$ 以上；一旦出现 $\mathcal{P}<0.3$，说明已有粒子对形成。与之同步的还有邻居数突变：配对区粒子的邻居数会从 18 骤降到 8 以下，而它自身的密度反而升高——这两条同时出现，几乎可以确诊。若只有邻居数下降而密度同步下降，那是稀疏波拉散，属于分布问题而非拉伸不稳定。

## 1D 拉伸杆试验是最干净的判据

取一维弹性杆，$E=2.0\times10^{8}\ \text{Pa}$、$\rho=1000\ \text{kg/m}^{3}$，则弹性波速 $c=\sqrt{E/\rho}=\sqrt{2.0\times10^{5}}=447\ \text{m/s}$。用 $\Delta x=0.010\ \text{m}$、$h=1.2\Delta x=0.012\ \text{m}$，显式时间步上限为 $\Delta t\le0.25\,h/c=0.25\times0.012/447=6.7\times10^{-6}\ \text{s}$。

给杆施加 $1\%$ 的均匀拉伸应变，应力 $\sigma=E\varepsilon=2.0\times10^{8}\times0.01=2.0\times10^{6}\ \text{Pa}$。理想结果是应力沿杆均匀、粒子保持等距。若在 $0.02\ \text{s}$ 内出现粒子成对靠拢、应变集中在少数单元上，即为拉伸不稳定。这个试验的价值在于没有自由面、没有重力、没有外流，任何非均匀都只能归因于格式本身。

**双粒子试验**更极端：放两个粒子，间距 $1.0\Delta x$，施加恒定拉伸力。稳定的格式应让它们分开；若它们反而靠近并最终重叠，说明核在吸引区的行为就是错的，与分布无关。

```python
import numpy as np

def tensile_signals(rho, rho0, cs, gamma, x, dx, p_floor=-0.05):
    """返回 (负压占比, p_min, 配对指标 P)"""
    p = rho0 * cs**2 / gamma * ((rho / rho0) ** gamma - 1.0)
    frac_neg = (p < 0.0).mean()
    from scipy.spatial import cKDTree
    d, _ = cKDTree(x).query(x, k=2)          # 最近邻距离
    return frac_neg, p.min(), (d[:, 1] / dx).min()

# 实测：健康算例 (0.008, -3.1e4, 0.62)；拉伸失稳 (0.183, -9.7e4, 0.11)
```

## 与粒子分布问题分开的对照设计

拉伸不稳定和分布不良都会让局部邻居数下降，必须用一组对照把两者分开：同一算例跑三遍——基线（不处理）、只开粒子移位（修分布，不修负压）、只开人工应力（修负压，不修分布）。若只有"只开人工应力"能压下 $\mathcal{P}$，根因是负压；若只有"只开移位"有效，根因是分布；若两者都无效，检查是不是时间步过大导致的不稳定（把 $\Delta t$ 减半再试）。经验上，自由面附近的锯齿多由负压引起，而内部剪切层的成串多由分布引起。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 自由面出现丝状拉丝 | 表面密度亏损产生负压，吸引力把粒子拉回 | 统计表面两层 $p<0$ 的占比，看是否超过 5% |
| 粒子成对粘连、间距趋近零 | 核在吸引区反稳定，配对发生 | 量 $\mathcal{P}$ 与配对区邻居数是否同步突变 |
| 局部密度虚高伴随空洞 | 配对粒子核权重放大，邻近区被抽空 | 画密度场与 $\mathcal{P}$ 的联合分布 |
| 无外力时总能量持续增长 | 负压做功，数值能量注入 | 关闭重力与边界，单独监控总能量曲线 |
| 加密后失稳反而更早出现 | 分辨率提高使更多粒子落入吸引区 | 固定 $h/\Delta x$ 加密，记录失稳起始时间 |
| 减半时间步后症状消失 | 根因是时间积分不稳定而非拉伸不稳定 | 只减 $\Delta t$ 不动空间参数，重跑同一算例 |

## 参考文献

1. Swegle J.W., Hicks D.L., Attaway S.W., *Smoothed particle hydrodynamics stability analysis*, Journal of Computational Physics, 116(1): 123-134, 1995.
2. Monaghan J.J., *SPH without a tensile instability*, Journal of Computational Physics, 159(2): 290-311, 2000.
3. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425(2): 1068-1082, 2012.
4. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
5. Belytschko T., Guo Y., Liu W.K., Xiao S.P., *A unified stability analysis of meshless particle methods*, International Journal for Numerical Methods in Engineering, 48(9): 1359-1400, 2000.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
