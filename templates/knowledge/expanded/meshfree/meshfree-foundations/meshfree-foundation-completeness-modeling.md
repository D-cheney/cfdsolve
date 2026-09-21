---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-completeness-modeling
title: "完备性与重构：离散原理与适用边界"
summary: "从零阶与一阶矩条件出发定义 C0/C1 完备性，手算一维三次样条核下线性场梯度的 2.24% 偏差，并给出 Shepard 归一化与 MLS/CSPM 矩阵重构的适用边界与条件数门槛。"
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
  - "完备性与重构"
  - "离散原理与适用边界"
  - "矩条件"
  - "CSPM"
seo:
  title: "完备性与重构：离散原理与适用边界"
  description: "从零阶与一阶矩条件出发定义 C0/C1 完备性，手算一维三次样条核下线性场梯度的 2.24% 偏差，并给出 Shepard 归一化与 MLS/CSPM 矩阵重构的适用边界与条件数门槛。"
  keywords:
    - "完备性与重构"
    - "离散原理与适用边界"
    - "矩条件"
    - "CSPM"
    - "MESHFREE"
---

# 完备性与重构：离散原理与适用边界

完备性问的是"离散核能不能把直到某次的多项式原样再现"，重构则是把这件事从"希望它成立"变成"用矩阵求逆强制它成立"。二者的分界很清楚：零阶矩条件不满足只损失常数场的精度，一阶矩条件不满足则连线性场的梯度都算不对，而梯度是动量方程里唯一真正用到核导数的量。下面给出矩条件的写法、一次可手算的偏差量级，以及 Shepard 归一化与 MLS/CSPM 各自能修好什么。

## 完备性用矩条件写成等式

Liu 与 Liu 把完备性按能再现的多项式次数分级。离散核 $W_{ij}=W(|\mathbf{x}_i-\mathbf{x}_j|,h)$ 满足 $C^{0}$ 完备性，指

$$
\sum_j V_j W_{ij} = 1
$$

满足 $C^{1}$ 完备性，指在此基础上还满足

$$
\sum_j V_j \left(\mathbf{x}_j-\mathbf{x}_i\right)^{\alpha} W_{ij} = 0, \qquad \alpha = 1,\dots,d
$$

其中 $V_j=m_j/\rho_j$ 是粒子体积。把 $C^{0}$ 与 $C^{1}$ 合起来看，就是"常数场被精确再现、线性场的加权质心落在粒子自身位置"。这两条一旦成立，任何线性场的核近似都是精确的，误差只剩二阶以上的曲率项。

## 线性场梯度偏差可以手算

动量方程用的是梯度而不是场值。对一维线性场 $f=ax+b$，差值形式的梯度近似给出

$$
\nabla f_i \approx \sum_j V_j \left(f_j-f_i\right)\nabla_i W_{ij} = a\sum_j V_j\left(x_j-x_i\right)\frac{\mathrm{d}W_{ij}}{\mathrm{d}x} \equiv -a\,m_2
$$

理想情况下 $m_2=-1$（连续情形由分部积分得 $\int x W'\,\mathrm{d}x=-1$），实际值由 $h/\Delta x$ 决定。取三次样条核 $W=(2/3h)f(q)$、$q=|x|/h$，在 $h=1.2\Delta x$ 的均匀点阵上，邻居位于 $q=0,0.8333,1.6667$，对应导数 $f'=-0.9375,-0.0833$，于是

$$
m_2 = -2\left[\frac{2}{3}\left(0.8333\right)^{2}(0.9375) + \frac{2}{3}\left(0.8333\right)\left(1.6667\right)(0.0833)\right] = -1.0224
$$

即线性场梯度被放大了 $2.24\%$。把 $h$ 换成 $1.5\Delta x$ 重算：邻居位于 $q=0.6667,1.3333,2.0$，对应 $f'=-1.0,-0.3333,0$，得到 $m_2=-0.98765$，梯度反而偏小 $1.23\%$。两个结果说明 $m_2$ 会穿过 $-1$，本例的零点约在 $h\approx1.39\Delta x$。这个零点不是普适常数，它随核函数、维度和点阵类型变化，所以"梯度偏大还是偏小"必须实测而不能猜。

## Shepard 归一化只修零阶矩

最省事的重构是把核按自身求和归一化：

$$
\tilde{W}_{ij} = \frac{W_{ij}}{\sum_k V_k W_{ik}}, \qquad \tilde{f}_i = \sum_j V_j f_j \tilde{W}_{ij}
$$

它保证 $\sum_j V_j \tilde{W}_{ij}=1$，对常数场精确，对自由面尤其有效——$S_i=0.779$ 的表面粒子会被放大 $1/0.779=1.284$ 倍，表面密度亏损随之消失。代价是它只动零阶矩：线性场梯度仍然偏百分之几，因为 $\sum_j V_j(x_j-x_i)\tilde{W}_{ij}$ 并没有被强制为零。凡是"加了归一化之后压力还是歪的"的算例，问题通常就在这里。

## MLS 与 CSPM 用矩阵求逆补齐一阶矩

要让 $C^{1}$ 完备性对任意粒子分布成立，必须解一个小线性系统。定义修正矩阵

$$
\mathbf{M}_i = -\sum_j V_j \left(\mathbf{x}_j-\mathbf{x}_i\right)\otimes\nabla_i W_{ij}, \qquad \nabla f_i = \mathbf{M}_i^{-1}\sum_j V_j \left(f_j-f_i\right)\nabla_i W_{ij}
$$

只要 $\mathbf{M}_i$ 可逆，上式对线性场精确成立，与粒子是否规则无关——这正是 MLS 与 CSPM 相对 Shepard 的根本差别。代价有三条：每步每粒子要求一次 $d\times d$ 求逆（二维 $2\times2$、三维 $3\times3$，开销约等于多算一次核梯度）；$\mathbf{M}_i$ 在近边界处条件数迅速恶化；求逆后的梯度不再与 $\nabla_j W_{ij}$ 反对称，会破坏动量守恒。第三条最容易被忽略，实践中常用"内部用 CSPM、边界带用 Shepard"的分区策略折中。

判定 $\mathbf{M}_i$ 是否可用，看条件数：规则点阵约 $3.2$，$0.3\Delta x$ 抖动的点阵约 $18$，三点近共线时可达 $2.5\times10^{4}$。工程门槛取 $\mathrm{cond}(\mathbf{M}_i)<10^{3}$，超过就退回差值形式并改做归一化。

```python
import numpy as np

def mls_gradient(x, f, i, nb, gradW, V):
    """x:(N,d) f:(N,) nb:邻居索引 gradW:(len(nb),d) V:(N,)"""
    d = x.shape[1]
    M = np.zeros((d, d))
    rhs = np.zeros(d)
    for k, j in enumerate(nb):
        dx = x[j] - x[i]
        M   -= V[j] * np.outer(dx, gradW[k])
        rhs += V[j] * (f[j] - f[i]) * gradW[k]
    if np.linalg.cond(M) > 1.0e3:        # 退化保护
        return None                      # 退回差值形式 + Shepard 归一化
    return np.linalg.solve(M, rhs)
```

## 适用边界与失效信号

$C^{0}$ 归一化适合自由面、多相界面和几何简单的问题，成本几乎为零。MLS/CSPM 适合近壁高梯度区、非均匀点阵和需要一阶精确梯度的后处理量（涡量、应变率）。两者都不适合：粒子数少于基函数个数时（二维线性基至少需要 6 个非共线邻居，三维至少 10 个；实际取 $N\ge20$ 与 $N\ge30$ 才有余量）；拉伸区粒子稀疏到 $\mathbf{M}_i$ 接近奇异时；以及必须严格守恒的长时间积分，因为求逆破坏了成对反对称。

失效信号很集中：$S_i$ 偏离 1 超过 $2\%$，或 $\mathrm{cond}(\mathbf{M}_i)$ 超过 $10^{3}$，或修正前后目标量差超过 $5\%$。出现任一条，先查邻居表是否把边界粒子算进来了，再查是否在同一个算例里混用了两套重构。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 常数场精确、线性场梯度偏 2% | 只做了 Shepard 归一化，一阶矩未强制 | 构造 $f=ax+b$，比较 $\nabla f$ 与 $a$ |
| 表面压力正常、近壁速度梯度失真 | 边界粒子未纳入求和，$C^{1}$ 矩条件在壁面失效 | 画壁面法向的 $\mathrm{cond}(\mathbf{M}_i)$ 剖面 |
| 修正后总动量缓慢漂移 | 求逆后的梯度不再反对称 | 统计 $\sum_i m_i a_i$ 相对 $\sum_i m_i|a_i|$ 的比值 |
| 某几个粒子速度爆掉 | $\mathbf{M}_i$ 近奇异，解出巨大修正量 | 记录每步 $\mathrm{cond}(\mathbf{M}_i)$ 的最大值 |
| 加密后梯度误差不降 | 点阵规则性差，重构矩阵随分辨率恶化 | 同一分辨率下比较规则点阵与抖动点阵 |

## 参考文献

1. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
2. Chen J.K., Beraun J.E., *A generalized smoothed particle hydrodynamics method for nonlinear dynamic problems*, Computer Methods in Applied Mechanics and Engineering, 190(1-2): 225-239, 2000.
3. Dilts G.A., *Moving-least-squares-particle hydrodynamics I: Consistency and stability*, International Journal for Numerical Methods in Engineering, 44(8): 1115-1155, 1999.
4. Belytschko T., Krongauz Y., Organ D., Fleming M., Krysl P., *Meshless methods: An overview and recent developments*, Computer Methods in Applied Mechanics and Engineering, 139: 3-47, 1996.
5. Randles P.W., Libersky L.D., *Smoothed particle hydrodynamics: some recent improvements and applications*, Computer Methods in Applied Mechanics and Engineering, 139(1-4): 375-408, 1996.
6. Liu M.B., Liu G.R., Lam K.Y., *Constructing smoothing functions in smoothed particle hydrodynamics with applications*, Journal of Computational and Applied Mathematics, 155(2): 263-284, 2003.
