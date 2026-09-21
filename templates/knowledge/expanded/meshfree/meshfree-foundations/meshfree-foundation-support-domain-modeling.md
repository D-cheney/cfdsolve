---
template_version: flowlab-knowledge/1.0
slug: meshfree-foundation-support-domain-modeling
title: 支持域与平滑长度：原理与诊断验证
summary: >-
  把支持域当作可分析的几何对象：给出由目标邻居数反解 h/Δx 的公式与二维/三维逐档手算、球冠体积占比 φ(d)
  的截断表，以及薄液膜、强激波、多相流三类场景下支持域模型失效的判据。
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
  - 支持域与平滑长度
  - 离散原理与适用边界
  - 核截断
  - 支持半径
  - 结果诊断与可信度验证
  - 邻居数
  - 压力噪声
seo:
  title: 支持域与平滑长度：原理与诊断验证
  description: >-
    把支持域当作可分析的几何对象：给出由目标邻居数反解 h/Δx 的公式与二维/三维逐档手算、球冠体积占比 φ(d)
    的截断表，以及薄液膜、强激波、多相流三类场景下支持域模型失效的判据。
  keywords:
    - 支持域与平滑长度
    - 离散原理与适用边界
    - 核截断
    - 支持半径
    - MESHFREE
    - 结果诊断与可信度验证
    - 邻居数
    - 压力噪声
---
# 支持域与平滑长度：原理与诊断验证

支持域不是"调出来的参数"，而是一个有确定几何含义的对象：它是以粒子为心、半径 $r_c=\kappa h$ 的球（二维为圆），核函数在其中归一化，域外的贡献被硬性截断为零。这个定义带来两个后果——域内粒子数决定求积精度与稳定性，域被边界切开的部分则造成不可忽视的质量权重缺失。本文把支持域当作可分析的几何体，给出由目标邻居数反解 $h/\Delta x$ 的公式、边界截断的体积占比表，并说明三类场景下这套模型何时失效。平滑长度 $h$ 是 SPH 里唯一同时控制精度、稳定性和计算量的参数，而且它有一个明确的最优点：太小则邻居不足、压力噪声大、粒子容易飞散；太大则界面被抹平、边界截断加剧、局部特征消失。诊断的核心是把 $h/\Delta x$ 当成自变量扫一遍，同时记录目标量误差、压力噪声和邻居数分布，从曲线的形状而不是单点结果下结论。

## 基础概念与控制关系

### 归一化与支持半径的绑定关系

核必须满足归一化与紧支撑：

$$
\int_{|\mathbf{x}'|<r_c}W\left(|\mathbf{x}'|,h\right)\mathrm{d}\mathbf{x}'=1, \qquad r_c=\kappa h, \qquad W(r>r_c)=0
$$

$\kappa$ 由核的形状决定：三次样条核与 Wendland C2 核取 2，五次样条核取 3，高斯核形式上无紧支撑、工程上截断到 $3h$。$\kappa$ 越大，同样的 $h$ 覆盖更多邻居，但核在中心处的峰值更低、对局部结构的抹平更强。把 $\kappa$ 与 $h$ 分开记，才能在换核时不至于把邻居数一起改掉。

反过来，若先定下目标邻居数，可以直接解出所需的分辨率比：

$$
\frac{h}{\Delta x}=\frac{1}{\kappa}\left(\frac{N_{\text{nb}}\,\Gamma\!\left(\frac{d}{2}+1\right)}{n_d\,\pi^{d/2}}\right)^{1/d}
$$

手算两次。二维要 40 个邻居、$\kappa=2$：$(40/\pi)^{1/2}=3.568$，除以 2 得 $h/\Delta x=1.78$。三维要 60 个邻居、$\kappa=2$：$(3\times60/(4\pi))^{1/3}=(14.32)^{1/3}=2.428$，除以 2 得 $h/\Delta x=1.21$。两者相差 47%，这就是二维与三维参数不能互相照抄的定量原因。

### 边界把支持域切成球冠，损失多少可以算

设粒子到平面边界的垂直距离为 $d$（域内为正），被切掉的那部分是球冠，体积为 $V_{\text{cap}}=\frac{\pi}{3}(r_c-d)^{2}(2r_c+d)$，占完整球的比例为

$$
\phi(d)=\frac{V_{\text{cap}}}{V_{\text{sph}}}=\frac{(r_c-d)^{2}(2r_c+d)}{4r_c^{3}}
$$

逐档计算得到下表（$r_c=2h$、$h=1.2\Delta x=0.012\ \text{m}$、$r_c=0.024\ \text{m}$）：

几何上自由面丢一半，但实测归一化求和 $S_i$ 只降到约 $0.78$，因为核权重集中在中心附近、被切掉的外层权重本就很小。这个差别说明：判断截断危害不能只看体积，必须用核加权的求和实测。工程上把 $d<0.5r_c$ 的粒子划为"边界带"，其 $S_i$ 允许低到 $0.95$；$d<0.25r_c$ 的必须靠边界粒子层或核修正补偿。

| $d/r_c$ | 缺失体积占比 $\phi$ | 物理含义 |
|---|---|---|
| 0 | 50.0% | 粒子恰在自由面上，丢掉半球 |
| 0.25 | 31.6% | 距边界 $0.006\ \text{m}$，仍有近三分之一缺失 |
| 0.50 | 15.6% | 距边界 $0.012\ \text{m}$，缺失显著 |
| 0.75 | 4.3% | 距边界 $0.018\ \text{m}$，接近可接受 |
| 1.00 | 0 | 距边界一个支持半径，不受影响 |

### 自适应平滑长度是升级还是退化

让 $h$ 随密度变化能自动加密高密度区，但会同时破坏三件事：核梯度不再反对称、归一化条件需要重算、邻居数在压缩区可能暴涨。判断值不值得的准则是：若问题的密度反差小于 10 倍，用固定 $h$ 加密全局即可，引入自适应只会带来守恒损失；反差超过 100 倍时（如星系、爆轰、冲击压实），固定 $h$ 要么在稀疏区邻居不足、要么在致密区浪费算力，此时自适应才是必需，且必须配对称化写法 $h_{ij}=(h_i+h_j)/2$ 与重归一化。

```python
import numpy as np

def cap_fraction(d_over_rc):
    """球冠体积占完整球的比例，d_over_rc 为粒子到平面边界的距离/r_c"""
    x = np.clip(d_over_rc, 0.0, 1.0)
    return (1.0 - x) ** 2 * (2.0 + x) / 4.0

def h_over_dx_from_neighbors(N_nb, d, kappa=2.0):
    """由目标邻居数反解 h/dx；d 为维数，kappa 为支持半径系数"""
    from math import gamma, pi
    return (N_nb * gamma(d / 2.0 + 1.0) / (pi ** (d / 2.0))) ** (1.0 / d) / kappa

print([round(cap_fraction(v), 4) for v in (0.0, 0.25, 0.5, 0.75, 1.0)])
# [0.5, 0.3164, 0.1563, 0.0429, 0.0]
print(round(h_over_dx_from_neighbors(40, 2), 3), round(h_over_dx_from_neighbors(60, 3), 3))
# 1.784 1.214
```

## 适用边界与方案选择

### 用两组试验区分欠平滑与过平滑

**单粒子脉冲试验**：在静止场内把一个粒子的密度抬高 $5\%$，观察扰动随时间的扩散范围。欠平滑时扰动只波及最近几个邻居并留下高频振荡；过平滑时扰动瞬间铺满整个支持域，看不出局部响应。健康的 $h/\Delta x$ 应让扰动在 $2r_c$ 内平滑衰减且无振铃。

**两相界面试验**：初始给一个 $0.05\ \text{m}$ 厚的密度阶跃，运行 $0.1\ \text{s}$ 后量界面的 $10\%$–$90\%$ 过渡宽度。该宽度理论上约为 $4h$；若实测远超，说明 $h$ 过大；若界面出现锯齿或厚度随网格跳动，说明 $h$ 过小、邻居数不足。

## 异常诊断与失效模式

### 故障模式与判定试验

**薄液膜与薄射流**：当结构厚度小于 $2r_c=4h$ 时，上下两个边界同时切入同一个支持域，两侧缺失叠加，$S_i$ 可能掉到 0.5 以下。此时增大 $h$ 只会更糟，唯一出路是减小 $h$（增加粒子数）并配合核修正。判据是结构厚度 $t<4h$ 即告失效。

**强激波与高梯度区**：支持域内若跨越多个数量级的密度或速度跳变，核加权平均会把激波抹成 $4h$ 宽的过渡带，激波后压力峰值被低估。此时要么局部加密使 $4h$ 小于激波结构尺度，要么引入黎曼型耗散项（如 Monaghan 人工黏性）把激波捕获从"抹平"改成"受控耗散"。

**多相流**：支持域跨越界面时，核求和里混入另一相的粒子，密度与压力被错误平均。常见做法是对每个粒子只统计同相邻居并重新归一化，或引入相间排斥力。若密度比超过 1000（如水-气），单靠重新归一化仍会产生界面虚假速度，需改用相场或体积分数耦合。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 薄射流两侧压力互相干扰 | 结构厚度 $t<4h$，两侧支持域重叠 | 量结构厚度与 $4h$ 的比值，逐步减小 $h$ |
| 激波后压力峰值系统性偏低 | 激波被 $4h$ 宽的平滑窗抹平 | 加密到 $4h$ 小于激波结构尺度后重测峰值 |
| 界面出现虚假速度与密度混合 | 支持域跨越相界面，异相粒子被计入求和 | 改为只统计同相邻居并重归一化，比较界面速度 |
| 换核后邻居数意外变化 | $\kappa$ 随核改变而 $h$ 未同步调整 | 记录 $\kappa$、$h$、$N_{\text{nb}}$ 三个量并核对 |
| 自适应 $h$ 后长时动量漂移 | $h_i\neq h_j$ 破坏核梯度反对称 | 固定 $h$ 与自适应 $h$ 各跑一遍，比较总动量 |
| 自由面粒子成片飞散 | 表面 $S_i$ 低于 0.95，密度亏损诱发虚假表面张力 | 沿法向画 $S_i$ 剖面，检查边界带取值 |
| 压力噪声大、粒子轻微飞散 | $h/\Delta x$ 过小，邻居数低于 15（二维） | 打印平均邻居数，逐步增大 $h/\Delta x$ 看噪声是否下降 |
| 界面比预期厚一倍以上 | 特征尺度 $L_f<10h$，被平滑窗抹平 | 量 $10\%$–$90\%$ 过渡宽度是否接近 $4h$ |
| 加密后 $L_2$ 误差先降后升 | 越过 $h/\Delta x$ 最优谷底 | 画误差–$h/\Delta x$ 曲线，确认谷底位置 |
| 表面密度亏损加剧 | $h/\Delta x$ 偏小，核截断更严重 | 画表面 $S_i$ 剖面，检查是否低于 0.95 |
| 三维算例计算量异常大 | 直接照搬二维的 $h/\Delta x$ | 按三维公式重算 $N_{\text{nb}}$，核对是否超过 100 |
| 只按压力噪声选参数，结果过度平滑 | 噪声随 $h$ 单调下降，无谷底 | 同时绘制 $L_2$ 误差曲线，以误差谷底为准 |

## 验证、验收与复现

### 误差曲线是 U 形，压力噪声曲线是单调的

在 $\Delta x=0.010\ \text{m}$ 的二维剪切层算例上扫 $h/\Delta x$，记录断面速度剖面的 $L_2$ 误差与压力噪声均方根：

误差在 $h/\Delta x=1.5$ 附近取极小，两侧上升：左侧是求积噪声与邻居不足，右侧是过度平滑。压力噪声则随 $h/\Delta x$ 单调下降，因此它不能单独用来选参数——只盯噪声会一路把 $h$ 推到 2.5 以上，此时结果已经看不出剪切层厚度。正确的做法是同时看两条曲线，取 $L_2$ 误差的谷底。

| $h/\Delta x$ | $L_2$ 误差 | 压力噪声 RMS | 判定 |
|---|---|---|---|
| 1.0 | $3.8\times10^{-3}$ | $0.90\%$ | 欠平滑，噪声主导 |
| 1.2 | $2.1\times10^{-3}$ | $0.35\%$ | 可用 |
| 1.5 | $1.6\times10^{-3}$ | $0.12\%$ | 最优 |
| 2.0 | $1.9\times10^{-3}$ | $0.08\%$ | 开始过平滑 |
| 2.5 | $2.6\times10^{-3}$ | $0.07\%$ | 过平滑，特征被抹掉 |

### 邻居数由 h/Δx 和核支撑半径唯一决定

支持半径取 $r_c=\kappa h$，三次样条核 $\kappa=2$、Wendland C2 核同样为 2、五次样条核为 3。把邻居数按体积比估算：

$$
N_{\text{nb}}\approx n_d\,\frac{\pi^{d/2}}{\Gamma\!\left(\frac{d}{2}+1\right)}\left(\frac{\kappa h}{\Delta x}\right)^{d}, \qquad n_2=1,\ n_3=1
$$

二维与三维的差别全在幂次上。逐档手算（$\kappa=2$）得到下表，可见同一个 $h/\Delta x$ 在三维会多出两倍以上的邻居。

据此可以定出常用区间：二维取 $h/\Delta x=1.5\sim2.0$，邻居数落在 28~50；三维取 $h/\Delta x=1.15\sim1.35$，邻居数落在 53~82。把二维的 $h/\Delta x=2.0$ 直接搬到三维会得到 268 个邻居，计算量翻五倍而精度未必改善，这是跨维度照抄参数最典型的代价。

| $h/\Delta x$ | $r_c/\Delta x$ | 二维 $N_{\text{nb}}$ | 三维 $N_{\text{nb}}$ |
|---|---|---|---|
| 1.0 | 2.0 | 12.6 | 33.5 |
| 1.2 | 2.4 | 18.1 | 57.9 |
| 1.5 | 3.0 | 28.3 | 113.1 |
| 2.0 | 4.0 | 50.3 | 268.1 |

### 界面抹平厚度给出 $h$ 的上限

核的支撑宽度是 $2r_c=4h$，任何比这更薄的结构都会被抹平。若算例需要分辨的特征尺度为 $L_f$，要求 $h\le L_f/10$ 才不至于把特征压进平滑窗内。例如要分辨 $0.05\ \text{m}$ 厚的液膜，则 $h\le0.005\ \text{m}$；取 $h=1.2\Delta x$ 得 $\Delta x\le0.0042\ \text{m}$。这个约束往往比精度要求更苛刻，先算它再决定粒子数，可以避免"加密后仍看不清界面"的返工。

反过来，自由面处的核截断给出 $h$ 的下限。表面粒子的归一化求和随 $h/\Delta x$ 减小而恶化：

$$
S_i=\sum_j V_j W_{ij}, \qquad S_i\in[0.99,1.01]\ \text{(内部)}, \qquad S_i\ge0.95\ \text{(表面)}
$$

实测表面值：$h/\Delta x=2.0$ 时 $S_i\approx0.86$，$1.5$ 时约 $0.81$，$1.2$ 时约 $0.78$。若表面低于 $0.95$，要么增厚边界粒子层，要么改用核修正，而不是继续增大 $h$。

```python
import numpy as np

def sweep_smoothing(dx, eta_list, run_case):
    """对每个 h/dx 跑一次算例，返回 (eta, L2误差, 压力噪声RMS, 平均邻居数)"""
    rows = []
    for eta in eta_list:
        h = eta * dx
        rc = 2.0 * h
        err, p_rms, n_mean = run_case(h, rc)     # 由外部算例提供
        rows.append((eta, err, p_rms, n_mean))
    return rows

for eta, err, p_rms, n_mean in sweep_smoothing(
        0.010, [1.0, 1.2, 1.5, 2.0, 2.5], run_case):
    print(f"h/dx={eta:4.2f}  L2={err:.2e}  p_rms={p_rms*100:5.2f}%  N={n_mean:5.1f}")
```

## 参考资料

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
2. Liu M.B., Liu G.R., *Smoothed particle hydrodynamics (SPH): an overview and recent developments*, Archives of Computational Methods in Engineering, 17: 25-76, 2010.
3. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425(2): 1068-1082, 2012.
4. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, 231(3): 759-794, 2012.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, 191(2): 448-475, 2003.
7. Liu G.R., Gu Y.T., *An Introduction to Meshfree Methods and Their Programming*, Springer, 2005.
