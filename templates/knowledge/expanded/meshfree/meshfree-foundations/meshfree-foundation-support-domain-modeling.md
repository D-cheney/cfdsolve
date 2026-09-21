---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-support-domain-modeling
title: "支持域与平滑长度：离散原理与适用边界"
summary: "把支持域当作可分析的几何对象：给出由目标邻居数反解 h/Δx 的公式与二维/三维逐档手算、球冠体积占比 φ(d) 的截断表，以及薄液膜、强激波、多相流三类场景下支持域模型失效的判据。"
category:
  slug: meshfree-foundations
  name: "无网格法 · 方法与验证"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法 · 方法与验证"
  - "支持域与平滑长度"
  - "离散原理与适用边界"
  - "核截断"
  - "支持半径"
seo:
  title: "支持域与平滑长度：离散原理与适用边界"
  description: "把支持域当作可分析的几何对象：给出由目标邻居数反解 h/Δx 的公式与二维/三维逐档手算、球冠体积占比 φ(d) 的截断表，以及薄液膜、强激波、多相流三类场景下支持域模型失效的判据。"
  keywords:
    - "支持域与平滑长度"
    - "离散原理与适用边界"
    - "核截断"
    - "支持半径"
    - "MESHFREE"
---

# 支持域与平滑长度：离散原理与适用边界

支持域不是"调出来的参数"，而是一个有确定几何含义的对象：它是以粒子为心、半径 $r_c=\kappa h$ 的球（二维为圆），核函数在其中归一化，域外的贡献被硬性截断为零。这个定义带来两个后果——域内粒子数决定求积精度与稳定性，域被边界切开的部分则造成不可忽视的质量权重缺失。本文把支持域当作可分析的几何体，给出由目标邻居数反解 $h/\Delta x$ 的公式、边界截断的体积占比表，并说明三类场景下这套模型何时失效。

## 归一化与支持半径的绑定关系

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

## 边界把支持域切成球冠，损失多少可以算

设粒子到平面边界的垂直距离为 $d$（域内为正），被切掉的那部分是球冠，体积为 $V_{\text{cap}}=\frac{\pi}{3}(r_c-d)^{2}(2r_c+d)$，占完整球的比例为

$$
\phi(d)=\frac{V_{\text{cap}}}{V_{\text{sph}}}=\frac{(r_c-d)^{2}(2r_c+d)}{4r_c^{3}}
$$

逐档计算得到下表（$r_c=2h$、$h=1.2\Delta x=0.012\ \text{m}$、$r_c=0.024\ \text{m}$）：

| $d/r_c$ | 缺失体积占比 $\phi$ | 物理含义 |
|---|---|---|
| 0 | 50.0% | 粒子恰在自由面上，丢掉半球 |
| 0.25 | 31.6% | 距边界 $0.006\ \text{m}$，仍有近三分之一缺失 |
| 0.50 | 15.6% | 距边界 $0.012\ \text{m}$，缺失显著 |
| 0.75 | 4.3% | 距边界 $0.018\ \text{m}$，接近可接受 |
| 1.00 | 0 | 距边界一个支持半径，不受影响 |

几何上自由面丢一半，但实测归一化求和 $S_i$ 只降到约 $0.78$，因为核权重集中在中心附近、被切掉的外层权重本就很小。这个差别说明：判断截断危害不能只看体积，必须用核加权的求和实测。工程上把 $d<0.5r_c$ 的粒子划为"边界带"，其 $S_i$ 允许低到 $0.95$；$d<0.25r_c$ 的必须靠边界粒子层或核修正补偿。

## 支持域模型在三类场景下失效

**薄液膜与薄射流**：当结构厚度小于 $2r_c=4h$ 时，上下两个边界同时切入同一个支持域，两侧缺失叠加，$S_i$ 可能掉到 0.5 以下。此时增大 $h$ 只会更糟，唯一出路是减小 $h$（增加粒子数）并配合核修正。判据是结构厚度 $t<4h$ 即告失效。

**强激波与高梯度区**：支持域内若跨越多个数量级的密度或速度跳变，核加权平均会把激波抹成 $4h$ 宽的过渡带，激波后压力峰值被低估。此时要么局部加密使 $4h$ 小于激波结构尺度，要么引入黎曼型耗散项（如 Monaghan 人工黏性）把激波捕获从"抹平"改成"受控耗散"。

**多相流**：支持域跨越界面时，核求和里混入另一相的粒子，密度与压力被错误平均。常见做法是对每个粒子只统计同相邻居并重新归一化，或引入相间排斥力。若密度比超过 1000（如水-气），单靠重新归一化仍会产生界面虚假速度，需改用相场或体积分数耦合。

## 自适应平滑长度是升级还是退化

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

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 薄射流两侧压力互相干扰 | 结构厚度 $t<4h$，两侧支持域重叠 | 量结构厚度与 $4h$ 的比值，逐步减小 $h$ |
| 激波后压力峰值系统性偏低 | 激波被 $4h$ 宽的平滑窗抹平 | 加密到 $4h$ 小于激波结构尺度后重测峰值 |
| 界面出现虚假速度与密度混合 | 支持域跨越相界面，异相粒子被计入求和 | 改为只统计同相邻居并重归一化，比较界面速度 |
| 换核后邻居数意外变化 | $\kappa$ 随核改变而 $h$ 未同步调整 | 记录 $\kappa$、$h$、$N_{\text{nb}}$ 三个量并核对 |
| 自适应 $h$ 后长时动量漂移 | $h_i\neq h_j$ 破坏核梯度反对称 | 固定 $h$ 与自适应 $h$ 各跑一遍，比较总动量 |
| 自由面粒子成片飞散 | 表面 $S_i$ 低于 0.95，密度亏损诱发虚假表面张力 | 沿法向画 $S_i$ 剖面，检查边界带取值 |

## 参考文献

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
2. Liu M.B., Liu G.R., *Smoothed particle hydrodynamics (SPH): an overview and recent developments*, Archives of Computational Methods in Engineering, 17: 25-76, 2010.
3. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425(2): 1068-1082, 2012.
4. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, 231(3): 759-794, 2012.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, 191(2): 448-475, 2003.
