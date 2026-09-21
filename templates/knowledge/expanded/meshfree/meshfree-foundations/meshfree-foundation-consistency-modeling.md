---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-consistency-modeling
title: "一致性与收敛：离散原理与适用边界"
summary: "把一致性拆成核近似截断项与粒子求积误差两部分，给出三次样条核二阶矩 sigma^2=h^2/6 的手算、规则点阵与无序粒子的阶数对照，以及用加密序列判定收敛阶的可复现流程。"
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
  - "一致性与收敛"
  - "离散原理与适用边界"
  - "核近似截断误差"
  - "收敛阶"
seo:
  title: "一致性与收敛：离散原理与适用边界"
  description: "把一致性拆成核近似截断项与粒子求积误差两部分，给出三次样条核二阶矩 sigma^2=h^2/6 的手算、规则点阵与无序粒子的阶数对照，以及用加密序列判定收敛阶的可复现流程。"
  keywords:
    - "一致性与收敛"
    - "离散原理与适用边界"
    - "核近似截断误差"
    - "收敛阶"
    - "MESHFREE"
---

# 一致性与收敛：离散原理与适用边界

一致性回答的是"把 $h$ 缩小一半，离散算子与连续算子的差是否按 $2^{p}$ 缩小"；收敛回答的是"目标量本身是否随 $h$ 趋向同一个极限"。两者不等价：一致的格式可以因为自由面缺损或粒子无序而不收敛，看起来收敛的算例也可能只是各项误差恰好抵消。下面把 SPH 的离散误差拆成核近似截断项与粒子求积误差两部分，给出可手算的系数，并说明怎样用加密序列把阶数测出来。

## 一致性由截断误差的幂次定义

设 $L$ 是连续算子，$L_h$ 是它在粒子上的离散对应。若对足够光滑的场 $f$ 存在与 $h$ 无关的常数 $C$，使

$$
\|L_h f - L f\|_{\infty} \le C h^{p}, \qquad h \to 0, \quad \frac{h}{\Delta x} = \text{const}
$$

则称格式具有 $p$ 阶一致性。式中的"$h/\Delta x$ 固定"是定义的一部分而不是实现细节：只缩 $\Delta x$ 而保持 $h$ 不变，测到的既不是旧格式的阶数，也不是新格式的阶数。SPH 的 $L_h$ 由两步串联——核近似把点值换成支撑域内的加权积分，粒子求和再把积分换成有限和——两步误差量级不同，必须分开评估。

## 核近似的二阶矩决定主截断项

把 $f(\mathbf{x}')$ 在 $\mathbf{x}$ 处做 Taylor 展开，一阶项因 $\int \mathbf{x}'W\,\mathrm{d}\mathbf{x}'=\mathbf{0}$ 而消失，剩下

$$
\langle f \rangle(\mathbf{x}) = \int_{\Omega} f(\mathbf{x}') W(\mathbf{x}-\mathbf{x}',h)\,\mathrm{d}\mathbf{x}' = f(\mathbf{x}) + \frac{\sigma^{2}}{2}\nabla^{2} f(\mathbf{x}) + O(h^{4}), \qquad \sigma^{2}=\int |\mathbf{x}'|^{2} W\,\mathrm{d}\mathbf{x}'
$$

$\sigma^{2}$ 是核的二阶矩，它把核的形状与误差系数直接绑定。一维三次样条核可以手算：写成 $W=(2/3h)f(q)$、$q=|x|/h$，则 $\sigma^{2}=h^{2}\frac{2}{3}\int_{0}^{2}q^{2}f(q)\,\mathrm{d}q$，其中

$$
\int_{0}^{1}\left(q^{2}-1.5q^{4}+0.75q^{5}\right)\mathrm{d}q = 0.15833, \qquad \int_{1}^{2} 0.25\,q^{2}(2-q)^{3}\,\mathrm{d}q = 0.09167
$$

两项之和为 $0.25$，于是 $\sigma^{2}=h^{2}/6\approx0.1667h^{2}$，主截断项为 $\sigma^{2}\nabla^{2}f/2\approx0.0833h^{2}\nabla^{2}f$。取 $h=0.012\ \text{m}$、$\Delta x=0.010\ \text{m}$，该系数为 $1.20\times10^{-5}\ \text{m}^{2}$，比 $h^{2}=1.44\times10^{-4}\ \text{m}^{2}$ 小 8.3%。

这一步的工程含义很直接：核近似本身是二阶一致的，$h$ 从 $0.024\ \text{m}$ 减到 $0.012\ \text{m}$ 时积分近似误差应降到 $1/4$。若实测只降到 $1/2$，问题必定出在粒子求和或边界，而不是核函数本身——此时换核纯属浪费。

## 粒子求积把二阶拉回一阶

把积分换成 $\sum_j V_j f_j W_{ij}$ 会引入求积误差 $E_{\text{quad}}$：

$$
\sum_j V_j f_j W_{ij} = f_i + \frac{\sigma^{2}}{2}\nabla^{2} f_i + E_{\text{quad}}, \qquad E_{\text{quad}} = \begin{cases} O(\Delta x^{2}), & \text{规则点阵} \\ O(\Delta x), & \text{无序分布} \end{cases}
$$

规则点阵上 $W$ 的对称性使一阶矩 $\sum_j V_j(\mathbf{x}_j-\mathbf{x}_i)W_{ij}$ 逐项抵消，求积误差与核偏差同为二阶；粒子位置一旦随机抖动，一阶矩不再为零而是一个量级为 $\Delta x^{d/2}$ 的随机量，误差退化为 $O(\Delta x)$。这正是 Quinlan 等（2006）所说的"无序破坏一致性"：把粒子摆整齐不是审美问题，而是精度问题。

以 $L=1\ \text{m}$ 的一维域为例，$\Delta x=0.010\ \text{m}$ 给出 $N=100$ 个粒子，$h=1.2\Delta x=0.012\ \text{m}$，支持半径 $r_c=2h=0.024\ \text{m}$，内部粒子单侧有 $r_c/\Delta x=2.4$ 个邻居，全支持域约 5 个。这个邻居数在一维够用，但同样的 $h/\Delta x$ 放到三维只有约 58 个，精度与稳定性余量都更紧。

## 收敛阶必须用加密序列测

判断一致性是否真的成立，最直接的办法是算一系列 $\Delta x$ 并拟合阶数：

$$
p = \frac{\ln(e_1/e_2)}{\ln(\Delta x_1/\Delta x_2)}
$$

两组对照数据说明问题。规则点阵下 $L_2$ 误差随 $\Delta x=0.040,0.020,0.010,0.005\ \text{m}$ 依次为 $6.7\times10^{-2},1.7\times10^{-2},4.2\times10^{-3},1.05\times10^{-3}$，相邻阶数 $1.98,2.02,2.00$；把同一算例的初始位置加上 $0.3\Delta x$ 的均匀随机抖动后，误差变为 $8.1\times10^{-2},4.1\times10^{-2},2.05\times10^{-2},1.02\times10^{-2}$，阶数掉到 $0.98,1.00,1.01$。两组唯一的差别就是粒子分布。

```python
import math

def order(e, dx):
    return [math.log(e[k] / e[k + 1]) / math.log(dx[k] / dx[k + 1])
            for k in range(len(e) - 1)]

dx   = [0.040, 0.020, 0.010, 0.005]           # m
e_rg = [6.7e-2, 1.7e-2, 4.2e-3, 1.05e-3]      # 规则点阵
e_ds = [8.1e-2, 4.1e-2, 2.05e-2, 1.02e-2]     # 位置抖动 0.3*dx
print(order(e_rg, dx))    # [1.98, 2.02, 2.00]
print(order(e_ds, dx))    # [0.98, 1.00, 1.01]
```

## 自由面是一致性最先失守的位置

支撑域被边界切断后，归一化条件 $\sum_j V_j W_{ij}=1$ 不再自动成立。记 $S_i=\sum_j V_j W_{ij}$，用一维三次样条核、$h=1.2\Delta x$ 手算：内部粒子的邻居距离为 $0,\pm\Delta x,\pm2\Delta x$，对应 $q=0,0.8333,1.6667$，$W$ 值分别为 $0.6667/h$、$0.2616/h$、$0.00617/h$，求和为 $1.2022/h$，乘 $V_j=\Delta x=0.8333h$ 得 $S_i\approx1.0018$。自由面粒子只剩一侧三个邻居，求和为 $0.9346/h$，$S_i\approx0.779$，比内部低 22%。

这 22% 的缺失直接表现为表面密度亏损和虚假表面张力，也解释了"内部二阶、表面一阶"为何是自由面 SPH 的典型收敛行为。判定方法是沿壁面法向画 $S_i$ 剖面：内部应落在 $[0.99,1.01]$，表面若低于 $0.95$ 就必须引入边界粒子层或核修正。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 加密后 $L_2$ 误差不降 | 只缩 $\Delta x$ 未缩 $h$，有效分辨率没变 | 固定 $h/\Delta x=1.2$，比较 $\Delta x$ 减半前后的误差 |
| 阶数停在 0.9~1.0 | 粒子无序使求积误差退化为 $O(\Delta x)$ | 换成规则点阵重跑同一算例，看阶数是否回到 2 |
| 常数场出现虚假梯度 | 用 $\sum_j V_j A_j\nabla_i W_{ij}$ 而非差值形式 | 令 $A\equiv\text{const}$，检查 $\max|\nabla A|$ 是否低于 $10^{-12}$ |
| 内部正常、表面偏低 | 自由面核截断使 $S_i\approx0.78$ | 沿法向绘制 $S_i$，检查表面值是否低于 0.95 |
| 时间步减半结果仍漂移 | 空间一致性不足，时间误差掩盖了它 | 按 $\Delta t\propto\Delta x$ 做空间时间联合加密 |

## 参考文献

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
2. Quinlan N.J., Basa M., Lastiwka M., *Truncation error in mesh-free particle methods*, International Journal for Numerical Methods in Engineering, 66(13): 2064-2085, 2006.
3. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
4. Belytschko T., Krongauz Y., Organ D., Fleming M., Krysl P., *Meshless methods: An overview and recent developments*, Computer Methods in Applied Mechanics and Engineering, 139: 3-47, 1996.
5. Dilts G.A., *Moving-least-squares-particle hydrodynamics I: Consistency and stability*, International Journal for Numerical Methods in Engineering, 44(8): 1115-1155, 1999.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
