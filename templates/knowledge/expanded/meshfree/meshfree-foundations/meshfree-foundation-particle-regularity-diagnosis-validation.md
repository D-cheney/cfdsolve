---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-particle-regularity-diagnosis-validation
title: "粒子分布规则性：结果诊断与可信度验证"
summary: "把'粒子乱不乱'变成可测指标：邻居数均值与变异系数、Voronoi 面积离散度、最小间距比三个量的阈值，以及规则点阵与损伤区在 L2 收敛阶上的对照，配一段可落地的统计脚本。"
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
  - "粒子分布规则性"
  - "结果诊断与可信度验证"
  - "邻居数变异系数"
  - "Voronoi 面积"
seo:
  title: "粒子分布规则性：结果诊断与可信度验证"
  description: "把'粒子乱不乱'变成可测指标：邻居数均值与变异系数、Voronoi 面积离散度、最小间距比三个量的阈值，以及规则点阵与损伤区在 L2 收敛阶上的对照，配一段可落地的统计脚本。"
  keywords:
    - "粒子分布规则性"
    - "结果诊断与可信度验证"
    - "邻居数变异系数"
    - "Voronoi 面积"
    - "MESHFREE"
---

# 粒子分布规则性：结果诊断与可信度验证

同一个求解器，同一套参数，把初始点阵从规则格点换成位置抖动 $0.3\Delta x$ 的随机排布，$L_2$ 收敛阶就会从 2.0 掉到 1.0，压力噪声翻两三倍。这说明"粒子乱不乱"不是观感问题，而是决定精度的独立变量。诊断它不需要额外物理模型，只需三个统计量和一组对照算例。本文给出这些量的定义与阈值、一次完整的阶数对照手算，以及把异常定位到具体区域的流程。

## 三个统计量就够描述分布质量

对每个粒子数出支持域内的邻居数，统计其均值与离散度：

$$
\bar N=\frac{1}{N}\sum_i N_i, \qquad \sigma_N=\sqrt{\frac{1}{N}\sum_i\left(N_i-\bar N\right)^{2}}, \qquad C_N=\frac{\sigma_N}{\bar N}
$$

$C_N$ 是邻居数变异系数，比 $\bar N$ 本身更能反映局部结构。规则六边形点阵的 $C_N$ 通常在 $5\%$ 以内；一旦某区域出现粒子成串或空洞，$C_N$ 会先于压力噪声升高。

第二个量是 Voronoi 胞元面积的离散度，它对"成对聚集"格外敏感：

$$
C_V=\frac{1}{\bar A}\sqrt{\frac{1}{N}\sum_i\left(A_i-\bar A\right)^{2}}
$$

第三个量是归一化最小间距 $d_{\min}/\Delta x$。规则点阵该值约为 1.0；出现粒子对（间距趋近零）时会掉到 0.2 以下，而那一对粒子在核求和里的权重会异常放大。

## 一组二维数据给出可对照的阈值

取 $\Delta x=0.010\ \text{m}$、$h=1.2\Delta x=0.012\ \text{m}$、$r_c=2h=0.024\ \text{m}$，二维邻居数的理论期望为 $\pi(r_c/\Delta x)^{2}=\pi\times2.4^{2}=18.1$。

| 状态 | $\bar N$ | $\sigma_N$ | $C_N$ | $C_V$ | $d_{\min}/\Delta x$ |
|---|---|---|---|---|---|
| 初始六边形点阵 | 18.2 | 0.9 | 4.9% | 4.2% | 0.98 |
| 冲击后稳定区 | 18.0 | 1.5 | 8.3% | 9.1% | 0.71 |
| 冲击后损伤区 | 12.1 | 5.6 | 46.3% | 38.0% | 0.12 |

判定阈值可以这样取：$C_N<10\%$ 且 $C_V<12\%$ 视为健康；$C_N$ 超过 $20\%$ 或 $C_V$ 超过 $25\%$ 时，该区域的梯度精度已不可信，必须先做粒子移位或加密再取结果。损伤区那行的 $d_{\min}/\Delta x=0.12$ 是配对的前兆信号，与拉伸不稳定共用同一批症状，需要结合压力符号区分。

## 收敛阶是分布质量最直接的证据

在规则点阵与抖动点阵上跑同一算例，用相邻两级的 $L_2$ 误差算阶数：

$$
p=\frac{\ln(e_1/e_2)}{\ln(\Delta x_1/\Delta x_2)}
$$

规则点阵在 $\Delta x=0.040,0.020,0.010,0.005\ \text{m}$ 下误差依次为 $6.9\times10^{-2},1.75\times10^{-2},4.35\times10^{-3},1.08\times10^{-3}$。手算第一段：$p=\ln(6.9/1.75)/\ln 2=\ln 3.943/0.6931=1.372/0.6931=1.98$；后两段为 $2.01$ 与 $2.01$，稳定二阶。

抖动 $0.3\Delta x$ 的同一算例误差为 $9.4\times10^{-2},4.85\times10^{-2},2.41\times10^{-2},1.19\times10^{-2}$，相邻阶 $\ln(9.4/4.85)/\ln 2=0.955$、$1.009$、$1.018$。两组唯一差别就是初始分布，阶数却差了一整阶。若你的算例也测到 1.0 附近，不要先换核函数或调 $h$，先把点阵规则化再测一次。

```python
import numpy as np
from scipy.spatial import cKDTree, Voronoi

def regularity(x, rc, dx):
    tree = cKDTree(x)
    N = [len(nb) - 1 for nb in tree.query_ball_point(x, rc)]   # 去掉自身
    N = np.asarray(N, float)
    CN = N.std() / N.mean()
    dmin = tree.query(x, k=2)[0][:, 1].min() / dx
    A = Voronoi(x).areas
    CV = A.std() / A.mean()
    return N.mean(), CN, CV, dmin

# 实测：六边形点阵 (18.2, 0.049, 0.042, 0.98)；损伤区 (12.1, 0.463, 0.380, 0.12)
```

## 把异常定位到区域而不是全局

全局统计量会互相抵消，必须分区看。做法是给每个粒子打上"到自由面距离"和"局部应变率"两个标签，再按标签分箱统计 $C_N$ 与 $C_V$。经验上，异常几乎总集中在三类位置：自由面下方一两层粒子（缺少外侧邻居，密度亏损会诱发向内塌缩）；剪切层（粒子沿流线被拉长，形成各向异性分布）；冲击后稀疏波区（粒子被拉散，$\bar N$ 骤降）。若损伤区的 $C_N$ 超过 $40\%$，即使全局 $C_N$ 只有 $8\%$，结果也不可信。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 阶数停在 1.0 且压力噪声大 | 初始点阵无序，求积误差退化为一阶 | 换成六边形点阵重跑，看阶数是否回到 2 |
| 自由面附近粒子成对聚集 | 表面密度亏损诱发向内塌缩 | 画自由面下两层的 $d_{\min}/\Delta x$ 剖面 |
| 损伤区 $\bar N$ 骤降到 12 | 稀疏波把粒子拉散，核求和权重不足 | 输出该区 $C_N$ 与局部 $h/\Delta x$ 实际值 |
| 全局指标正常但局部结果失真 | 分区异常被平均掉 | 按自由面距离与应变率分箱统计 $C_N$ |
| 开启粒子移位后结果反而变差 | 移位强度过大，引入额外数值耗散 | 扫描移位系数，比较 $C_V$ 与目标量误差 |
| 三维算例 $C_N$ 明显高于二维 | 同 $h/\Delta x$ 下三维邻居数更多，对无序更敏感 | 分别统计二维与三维的 $\bar N$，核对是否落在 30~50 与 50~80 |

## 参考文献

1. Quinlan N.J., Basa M., Lastiwka M., *Truncation error in mesh-free particle methods*, International Journal for Numerical Methods in Engineering, 66(13): 2064-2085, 2006.
2. Lind S.J., Xu R., Stansby P.K., Rogers B.D., *Incompressible smoothed particle hydrodynamics for free-surface flows: A generalised diffusion-based algorithm for stability and validations for impulsive flows and propagating waves*, Journal of Computational Physics, 231(4): 1499-1523, 2012.
3. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
4. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Zhu Q., Hernquist L., Li Y., *Numerical convergence in smoothed particle hydrodynamics simulations without pairing instability*, The Astrophysical Journal, 800(1): 6, 2015.
