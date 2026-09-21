---
template_version: flowlab-knowledge/1.0
slug: meshfree-foundation-tensile-instability-modeling
title: 拉伸不稳定与配对：原理与诊断验证
summary: >-
  用核的二阶导数符号解释拉伸不稳定的起源：手算三次样条核在 h=1.2Δx 时最近邻落在 W''>0 区间，给出 Monaghan 人工应力 f^n 项在
  r=2Δp 处衰减到 3.1e-7 的推导，以及核傅里叶变换正负性与配对的关联。
  全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: meshfree-foundations
  name: 无网格法 · 方法与验证
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - MESHFREE
  - 无网格法 · 方法与验证
  - 拉伸不稳定与配对
  - 离散原理与适用边界
  - 人工应力
  - 核傅里叶变换
  - 结果诊断与可信度验证
  - 负压判据
  - 粒子配对
seo:
  title: 拉伸不稳定与配对：原理与诊断验证
  description: >-
    用核的二阶导数符号解释拉伸不稳定的起源：手算三次样条核在 h=1.2Δx 时最近邻落在 W''>0 区间，给出 Monaghan 人工应力 f^n 项在
    r=2Δp 处衰减到 3.1e-7 的推导，以及核傅里叶变换正负性与配对的关联。
    全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 拉伸不稳定与配对
    - 离散原理与适用边界
    - 人工应力
    - 核傅里叶变换
    - MESHFREE
    - 结果诊断与可信度验证
    - 负压判据
    - 粒子配对
---
# 拉伸不稳定与配对：原理与诊断验证

## 原理与适用范围

拉伸不稳定不是数值 bug，而是核近似在吸引区固有的性质：当材料处于拉应力状态、且粒子对间距落在核二阶导数为正的区间时，微小的间距扰动会被放大，粒子互相吸引直到重叠。这条判据由 Swegle 等在 1995 年用 Von Neumann 分析给出，它把"什么时候会失稳"变成核形状与分辨率的算术。本文推导该判据，手算三次样条核在常用参数下的失稳区间，给出 Monaghan 人工应力项的衰减量级，并说明配对现象与核傅里叶变换符号的关系。

### 失稳判据来自核二阶导数的符号

对 SPH 动量方程做线性扰动分析，设粒子对沿连线方向的位移扰动为 $\delta$，其增长率由核在平衡间距处的曲率决定。稳定性条件可写为

$$
\sigma_{ij}\,W''\left(r_{ij}\right)\le 0
$$

其中 $\sigma_{ij}$ 为粒子对之间的应力（拉为正），$W''$ 为核沿径向的二阶导数。压缩状态（$\sigma<0$）时判据自动满足；只有在拉伸（$\sigma>0$）且 $W''>0$ 的区间才会失稳。因此拉伸不稳定总是与"拉应力 + 核外段"同时出现，这也是它偏爱自由面、稀疏波区和固体受拉区的原因。

### 三次样条核的失稳区间可以手算

三次样条核写成 $W(q)=\frac{2}{3h}f(q)$、$q=r/h$，在 $0\le q\le1$ 段有 $f(q)=1-1.5q^{2}+0.75q^{3}$，于是

$$
f''(q)=-3+4.5q=0\ \Longrightarrow\ q=\frac{2}{3}\approx0.6667
$$

即 $q>0.6667$ 时 $W''>0$，进入失稳区间。现在代入常用参数：取 $\Delta x=0.010\ \text{m}$、$h=1.2\Delta x=0.012\ \text{m}$，最近邻位于 $r=\Delta x$，对应 $q=\Delta x/h=1/1.2=0.8333>0.6667$。结论很直接——**在 $h=1.2\Delta x$ 的默认设置下，最近邻就落在失稳区间内**，只要出现拉应力就会触发。

要把它推出去，需满足 $\Delta x/h<2/3$，即 $h/\Delta x>1.5$。取 $h=1.5\Delta x=0.015\ \text{m}$ 时 $q=0.6667$ 恰在拐点；取 $h=2.0\Delta x=0.020\ \text{m}$ 时 $q=0.5$、$f''=-0.75<0$，稳定。这解释了为什么许多自由面与固体算例宁愿用 $h/\Delta x=1.5\sim2.0$ 并承担更大的平滑误差——它换来的是不靠任何修正项就稳定的拉应力区。

### 人工应力把拉应力区的排斥力补回来

Monaghan 的做法是在动量方程里叠加一个只在拉伸区生效的排斥项：

$$
\frac{\mathrm{d}\mathbf{v}_i}{\mathrm{d}t}=-\sum_j m_j\left(\frac{p_i}{\rho_i^{2}}+\frac{p_j}{\rho_j^{2}}+R_{ij}\right)\nabla_i W_{ij}, \qquad R_{ij}=f^{n}\left(R_i+R_j\right),\quad f=\frac{W\left(r_{ij}\right)}{W\left(\Delta p\right)}
$$

其中 $R_i=-\epsilon\,p_i/\rho_i^{2}$ 仅在 $p_i>0$（拉应力）时取非零值，$\epsilon$ 常取 $0.1\sim0.3$，指数 $n$ 常取 4。$f$ 以最近邻间距为基准归一，使修正项在 $r=\Delta p$ 处达到最大、随后快速衰减。$n=4$ 的必要性可以手算：对 $h=1.2\Delta x$ 的三次样条核，$q=\Delta p/h=0.8333$ 时 $f=0.3924$；$r=2\Delta p$ 时 $q=1.6667$、$f=0.009259$，比值 $0.0236$。取 4 次幂得

$$
f^{4}=0.0236^{4}=3.1\times10^{-7}
$$

即在两倍最近邻距离处，人工应力已被压低七个数量级，几乎完全局部化在紧邻粒子对上。若改成 $n=1$，该处仍有 $2.4\%$ 的残余，会把物理上无关的远处粒子也推开，造成虚假膨胀。$\epsilon$ 过大会在拉应力区引入非物理的体积膨胀，通常需要从 $0.1$ 起做敏感性扫描。

### 配对与核傅里叶变换的符号

配对现象与人工应力是两件事：前者是核本身的吸引倾向，即使应力为零也可能发生。判据来自核的傅里叶变换

$$
\hat W(k)=\int W(r)\,e^{-ikr}\,\mathrm{d}r\ \ge0\quad\forall k
$$

$\hat W$ 出现负值意味着核在某些波数上表现为吸引，等间距点阵会自发分裂成粒子对，这正是三次样条核在高 $h/\Delta x$ 下的行为。Wendland 系列核（C2、C4、C6）的傅里叶变换恒非负，因此在同样参数下不出现配对，代价是形状更"尖"、中心峰值更高。实际选择时两条判据要同时看：用三次样条核靠增大 $h/\Delta x$ 避开拉伸不稳定，却可能落入配对区；用 Wendland 核避开配对，却要重新标定邻居数与支持半径系数。

### 模型层级与升级判据

| 层级 | 处理方式 | 适用情形 | 升级触发条件 |
|---|---|---|---|
| 一级 | 不修正，仅靠增大 $h/\Delta x>1.5$ | 压缩主导、拉应力区很小 | 自由面出现丝状或锯齿 |
| 二级 | 加 Monaghan 人工应力（$\epsilon=0.1$、$n=4$） | 自由面流动、冲击波后稀疏区 | 拉应力区仍出现配对 |
| 三级 | 换用傅里叶变换非负的核（Wendland C2/C4） | 长时积分、点阵易退化的算例 | 核变尖导致邻居不足或噪声上升 |
| 四级 | 用 CSPM/MLS 重构应力（全拉格朗日固体） | 弹性/塑性大变形固体 | 重构矩阵条件数超过 $10^{3}$ |

升级的经济性判据很直接：若某层级能把配对指标压到 0.5 以上且目标量变化小于 $2\%$，就没有必要再往上加复杂度。固体算例几乎必然需要四级，因为拉应力是加载工况的主体；自由面流体通常二级足够；天体物理算例因点阵长期演化，多数直接跳到三级。

```python
import numpy as np

def cubic_spline_f2(q):
    """三次样条核形状函数 f(q) 的二阶导；q = r/h，仅对 q<=1 有效"""
    return -3.0 + 4.5 * q

def artificial_stress_factor(r, dp, h, n=4):
    """f^n，f = W(r)/W(dp)，用三次样条核形状函数比值"""
    f = lambda q: (1 - 1.5*q**2 + 0.75*q**3) if q <= 1 else \
                  (0.25 * (2 - q)**3 if q <= 2 else 0.0)
    return (f(r / h) / f(dp / h)) ** n

print(cubic_spline_f2(0.8333))            # 0.75 > 0  → 失稳区间
print(cubic_spline_f2(0.5))               # -0.75 < 0 → 稳定区间
print(artificial_stress_factor(2*0.010, 0.010, 0.012))   # 3.1e-07
```

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 自由面拉丝、粒子成对粘连 | 拉应力区落在 $W''>0$ 区间 | 按 $h/\Delta x$ 算 $q=\Delta x/h$，检查是否大于 0.6667 |
| 加了人工应力仍配对 | $\hat W$ 出现负值，核本身有吸引倾向 | 换 Wendland C2 核重跑，比较配对指标 |
| 拉应力区体积异常膨胀 | $\epsilon$ 过大，排斥项超出了物理量级 | 从 0.1 起做 $\epsilon$ 扫描，记录体积变化 |
| 远处粒子被无端推开 | 指数 $n$ 太小，修正项衰减不足 | 把 $n$ 从 1 提到 4，比较两倍近邻距离处的残值 |
| 换核后邻居数不足、噪声上升 | 核变尖，同样 $h/\Delta x$ 下有效邻居减少 | 重新标定 $\kappa$ 与 $h/\Delta x$，核对 $N_{\text{nb}}$ |
| 固体算例拉应力区持续失稳 | 人工应力不足以补偿，需重构应力 | 改用 CSPM/MLS 应力重构，检查条件数是否低于 $10^{3}$ |

### 参考文献

1. Swegle J.W., Hicks D.L., Attaway S.W., *Smoothed particle hydrodynamics stability analysis*, Journal of Computational Physics, 116(1): 123-134, 1995.
2. Monaghan J.J., *SPH without a tensile instability*, Journal of Computational Physics, 159(2): 290-311, 2000.
3. Gray J.P., Monaghan J.J., Swift R.P., *SPH elastic dynamics*, Computer Methods in Applied Mechanics and Engineering, 190(49-50): 6641-6662, 2001.
4. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425(2): 1068-1082, 2012.
5. Belytschko T., Guo Y., Liu W.K., Xiao S.P., *A unified stability analysis of meshless particle methods*, International Journal for Numerical Methods in Engineering, 48(9): 1359-1400, 2000.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.

## 诊断与可信度验证

拉伸不稳定在云图上和"物理破碎"极其相似：粒子聚成丝状或成对粘连、局部出现空洞、自由面变成锯齿状。它和真实的表面张力驱动破碎、真实的空化，用肉眼几乎分不开，但三组量化信号可以把它们切开——负压粒子的占比、最小粒子间距比、以及总能量在无外力做功时的异常增长。本文给出这三个信号的阈值与测量方法、一次由 Tait 状态方程手算负压值的过程，以及把拉伸不稳定与单纯分布不良区分开的对照试验。

### 负压是拉伸不稳定最直接的前兆

弱可压缩 SPH 的压力由 Tait 状态方程给出，$\rho_i<\rho_0$ 时压力为负：

$$
p_i=\frac{\rho_0 c_s^{2}}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right]<0\iff\rho_i<\rho_0
$$

负压意味着粒子间吸引力，而 SPH 的核近似在吸引区恰好是反稳定的。取 $\rho_0=1000\ \text{kg/m}^{3}$、$c_s=30\ \text{m/s}$、$\gamma=7$，则 $\rho_0c_s^{2}/\gamma=1000\times900/7=1.286\times10^{5}\ \text{Pa}$。若某区域因自由面截断使 $\rho_i/\rho_0=0.97$，代入得 $p=1.286\times10^{5}\times(0.97^{7}-1)=1.286\times10^{5}\times(0.8080-1)=-2.47\times10^{4}\ \text{Pa}$。即 $3\%$ 的密度亏损就能造出约 $-24.7\ \text{kPa}$ 的负压，足以启动不稳定性。

诊断阈值可以这样定：正常算例中 $p<0$ 的粒子占比应低于 $1\%$，且只出现在自由面最外层；若某个区域有超过 $5\%$ 的粒子处于负压、且 $p_{\min}$ 低于 $-0.05\rho_0c_s^{2}$（本例为 $-4.5\times10^{4}\ \text{Pa}$），就应判定为拉伸不稳定而不是物理现象。

### 配对用最小间距比和邻居数突变来识别

配对（pairing）是拉伸不稳定最剧烈的表现形式：两个粒子互相吸引到间距趋近零，核权重被放大，局部密度虚高。定义配对指标

$$
\mathcal{P}=\min_{i\neq j}\frac{|\mathbf{x}_i-\mathbf{x}_j|}{\Delta x}
$$

健康算例中 $\mathcal{P}$ 通常维持在 $0.5$ 以上；一旦出现 $\mathcal{P}<0.3$，说明已有粒子对形成。与之同步的还有邻居数突变：配对区粒子的邻居数会从 18 骤降到 8 以下，而它自身的密度反而升高——这两条同时出现，几乎可以确诊。若只有邻居数下降而密度同步下降，那是稀疏波拉散，属于分布问题而非拉伸不稳定。

### 1D 拉伸杆试验是最干净的判据

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

### 与粒子分布问题分开的对照设计

拉伸不稳定和分布不良都会让局部邻居数下降，必须用一组对照把两者分开：同一算例跑三遍——基线（不处理）、只开粒子移位（修分布，不修负压）、只开人工应力（修负压，不修分布）。若只有"只开人工应力"能压下 $\mathcal{P}$，根因是负压；若只有"只开移位"有效，根因是分布；若两者都无效，检查是不是时间步过大导致的不稳定（把 $\Delta t$ 减半再试）。经验上，自由面附近的锯齿多由负压引起，而内部剪切层的成串多由分布引起。

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 自由面出现丝状拉丝 | 表面密度亏损产生负压，吸引力把粒子拉回 | 统计表面两层 $p<0$ 的占比，看是否超过 5% |
| 粒子成对粘连、间距趋近零 | 核在吸引区反稳定，配对发生 | 量 $\mathcal{P}$ 与配对区邻居数是否同步突变 |
| 局部密度虚高伴随空洞 | 配对粒子核权重放大，邻近区被抽空 | 画密度场与 $\mathcal{P}$ 的联合分布 |
| 无外力时总能量持续增长 | 负压做功，数值能量注入 | 关闭重力与边界，单独监控总能量曲线 |
| 加密后失稳反而更早出现 | 分辨率提高使更多粒子落入吸引区 | 固定 $h/\Delta x$ 加密，记录失稳起始时间 |
| 减半时间步后症状消失 | 根因是时间积分不稳定而非拉伸不稳定 | 只减 $\Delta t$ 不动空间参数，重跑同一算例 |

### 参考文献

1. Swegle J.W., Hicks D.L., Attaway S.W., *Smoothed particle hydrodynamics stability analysis*, Journal of Computational Physics, 116(1): 123-134, 1995.
2. Monaghan J.J., *SPH without a tensile instability*, Journal of Computational Physics, 159(2): 290-311, 2000.
3. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425(2): 1068-1082, 2012.
4. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
5. Belytschko T., Guo Y., Liu W.K., Xiao S.P., *A unified stability analysis of meshless particle methods*, International Journal for Numerical Methods in Engineering, 48(9): 1359-1400, 2000.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
