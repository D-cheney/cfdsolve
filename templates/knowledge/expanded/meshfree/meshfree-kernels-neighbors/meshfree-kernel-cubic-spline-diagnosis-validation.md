---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-kernel-cubic-spline-diagnosis-validation
title: "三次样条核：结果诊断与可信度验证"
summary: "用二阶矩、离散归一化量、梯度一致性量与粒子对计数四把尺子诊断三次样条核，给出核光滑阶数的跳变证据、配对不稳定的可测信号和一次可直接复算的重构误差验算。"
category:
  slug: meshfree-kernels-neighbors
  name: "无网格法核函数与邻域搜索"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法核函数与邻域搜索"
  - "三次样条核"
  - "结果诊断与可信度验证"
  - "配对不稳定"
  - "二阶矩"
seo:
  title: "三次样条核：结果诊断与可信度验证"
  description: "用二阶矩、离散归一化量、梯度一致性量与粒子对计数四把尺子诊断三次样条核，给出核光滑阶数的跳变证据、配对不稳定的可测信号和一次可直接复算的重构误差验算。"
  keywords:
    - "三次样条核"
    - "结果诊断与可信度验证"
    - "配对不稳定"
    - "离散归一化"
    - "二阶矩"
    - "重构误差"
---

# 三次样条核：结果诊断与可信度验证

三次样条核的多数"数值噪声"抱怨其实可以归到三个可测量上：核的二阶矩给出的有效平滑宽度、离散归一化量 $S_i$ 的分布、以及拉伸区里 $r<0.5\Delta p$ 的粒子对数量。本文给出这四个量的解析值与实测口径，并用一次可核对的重构误差验算说明三次样条核在什么条件下才开始退化。

## 核的形状函数及其光滑阶数

三次样条核的分段形状函数在 $q=1$ 处拼接，工程上真正需要知道的是它在哪一阶导数上失去连续性：

$$w(q)=\begin{cases}1-\dfrac{3}{2}q^{2}+\dfrac{3}{4}q^{3}, & 0\le q<1\\[4pt]\dfrac{1}{4}(2-q)^{3}, & 1\le q<2\end{cases}$$

逐阶求导可验证 $w$、$w'$、$w''$ 在 $q=1$ 处两侧都等于 $0.25$、$-0.75$、$1.5$，因此该核是 $C^{2}$ 的。但三阶导数不连续：

$$w'''(q)=\begin{cases}4.5, & 0<q<1\\[4pt]-1.5, & 1<q<2\end{cases}$$

跳变幅度 6.0。核在三维中的三阶径向导数携带 $6\sigma_3/h^{6}=6\times0.31831/h^{6}=1.910/h^{6}$ 的阶跃，这一项会以 $O(\Delta p^{3})$ 的形式进入压力噪声。若仿真中压力场出现与粒子间距同尺度的高频振铃，而 $S_i$ 与邻居数都正常，应当怀疑的就是这个跳变，而不是时间步。

## 二阶矩给出的有效平滑宽度

诊断"结果被抹平了多少"，最直接的工具是核的二阶矩。三维中

$$\int_{\mathbb{R}^{3}}r^{2}W\,d\mathbf{r}=4\pi\sigma_3h^{4}\int_{0}^{2}q^{4}w(q)\,dq$$

分段积分给出 $\int_0^2q^4w\,dq=0.225$，代入 $\sigma_3=1/\pi$ 得 $\int r^2W\,d\mathbf{r}=4\pi\times0.31831\times0.225h^{2}=0.900h^{2}$。按每方向折算，等效方差为 $0.900h^{2}/3=0.300h^{2}$，等效标准差 $0.5477h$。取 $h=5.5$ mm，等效平滑宽度 $0.5477\times5.5=3.01$ mm——任何比 3 mm 更细的流场结构在三次样条核下都会被抹掉。

用同一组数据可以预判重构误差。对 $f=x^{2}$ 做核插值，规则格点上的一阶误差项是 $\frac{1}{2}\sigma_W^{2}f''=\frac{1}{2}\times0.300h^{2}\times2=0.300h^{2}$。在 $h=5.5$ mm 处该偏差为 $0.300\times30.25=9.08$ mm²；若评估点位于 $x=100$ mm，真值 $10^{4}$ mm²，相对误差 $9.08/10^{4}=0.091\%$。所以"三次样条核把结果算歪了"在二阶场量上通常只有千分之一量级，真正的误差源是下面两项。

## 离散归一化量与梯度一致性量

离散化之后，连续归一化不再自动成立，必须逐粒子检查：

$$S_i=\sum_j V_jW_{ij},\qquad \boldsymbol{\beta}_i=\sum_j V_j\nabla_iW_{ij}$$

内部规则粒子上 $S_i$ 应落在 $0.999$ 附近（三维、$\eta=1.1$ 时实测 0.998~1.001）。自由面上的粒子因为核被几何截断，$S_i$ 约为 $0.5$；壁面角点可低到 0.25。$\boldsymbol{\beta}_i$ 的理想值是零向量，实测其模长应小于 $10^{-3}$ 倍的 $\max_j|\nabla_iW_{ij}|$；若 $\boldsymbol{\beta}_i$ 的模长与 $\nabla_iW_{ij}$ 同量级，说明该粒子处于极度无序区，梯度近似已经失效。

判断准则很简单：$S_i$ 的**最小值**决定是否出现伪力，而不是均值。均值 0.99 但最小值 0.30 的算例，在最小值所在位置会产生肉眼可见的粒子堆积。

## 配对不稳定：从谱条件到粒子对计数

三次样条核的傅里叶变换在邻居数偏高时出现负瓣，规则排布失稳并坍缩成对。三维中的经验阈值约在 60 个邻居附近，用 $N_{3D}\approx\frac{4}{3}\pi(\kappa\eta)^{3}$ 反推：

| $\eta$（$\kappa=2$，三维） | $N_{3D}$ | 预期行为 |
|---|---|---|
| 1.0 | 33.5 | 稳定，无配对 |
| 1.1 | 44.6 | 稳定，余量约 25% |
| 1.2 | 57.9 | 临界，拉伸区开始出现成对 |
| 1.3 | 73.6 | 失稳，团聚成对 |

现场判定不看谱，只数粒子对：定义 $\Xi_i$ 为粒子 $i$ 邻域内 $r_{ij}<0.5\Delta p$ 的邻居个数。规则初始排布下 $\Xi_i=0$；一旦配对，$\Xi_i$ 会出现 1 到 2 的密集取值，全场非零粒子数从 0 跳到数千。这个指标比压力噪声曲线更早给出信号，且不需要任何后处理假设。

## 自由面与壁面的截断诊断

同一套粒子在内部与表面的表现差异极大，必须分开统计。三维中把粒子按 $S_i$ 分成三档：$S_i>0.95$ 视为内部，$0.5<S_i\le0.95$ 视为近表面，$S_i\le0.5$ 视为表面或角点。三次样条核在表面处 $S_i\approx0.5$，若不做 Shepard 重归一化，密度被低估一半，压力随之被低估，表现为粒子被壁面"吸住"。诊断时不要把这个当作核函数缺陷：它是几何截断，正确的处置是补边界粒子或改用重归一化核，而不是给密度强行加下限。

## 诊断脚本

```python
import math
SIGMA3 = 1.0/math.pi

def w(q):
    if q >= 2.0: return 0.0
    return 1.0-1.5*q*q+0.75*q**3 if q < 1.0 else 0.25*(2.0-q)**3

def dw(q):
    if q >= 2.0: return 0.0
    return -3.0*q+2.25*q*q if q < 1.0 else -0.75*(2.0-q)**2

def diagnose(pos, m, rho, h, dp, rc):
    V = [mi/ri for mi, ri in zip(m, rho)]
    S, beta, pairs = [], [], 0
    for i, xi in enumerate(pos):
        s = gx = gy = gz = 0.0
        for j, xj in enumerate(pos):
            r = math.dist(xi, xj)
            if r >= rc or r == 0.0: continue
            q = r/h
            s  += V[j]*SIGMA3*w(q)/h**3
            g  = SIGMA3*dw(q)/h**4
            gx += V[j]*g*(xi[0]-xj[0])/r
            gy += V[j]*g*(xi[1]-xj[1])/r
            gz += V[j]*g*(xi[2]-xj[2])/r
            if r < 0.5*dp: pairs += 1
        S.append(s); beta.append(math.sqrt(gx*gx+gy*gy+gz*gz))
    print("S  min/mean/max = %.3f / %.3f / %.3f" % (min(S), sum(S)/len(S), max(S)))
    print("beta max       = %.3e" % max(beta))
    print("paired pairs   = %d  (expect 0)" % pairs)
    return S, beta
```

脚本里的三个输出对应三种不同的失效：`S` 的最小值低说明几何截断或归一化常数错；`beta` 偏大说明局部无序；`pairs` 非零说明配对不稳定。

## 误判清单

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现与 $\Delta p$ 同尺度的高频振铃 | 三阶导数在 $q=1$ 处跳变 6.0，噪声以 $O(\Delta p^{3})$ 进入 | 把 $\Delta p$ 减半，若振铃幅度降到约 1/8 则确认为该项 |
| 拉伸区粒子聚成对，压力反而变平滑 | $\eta=1.2$ 使 $N_{3D}=57.9$，越过配对阈值 | 统计 $\Xi_i$ 非零粒子数，同时把 $\eta$ 降到 1.0 重跑 |
| 重构 $f=x^2$ 的相对误差远大于 0.1% | 核二阶矩被误当成 $h^{2}$，实际为 $0.300h^{2}$ | 用 $0.300h^{2}$ 重算理论偏差并对比实测 |
| 内部 $S_i$ 只有 0.70 | 三维算例用了二维常数 $\sigma_2$ 或反之 | 打印所用 $\sigma_d$，与 $1/\pi$、$10/(7\pi)$ 对照 |
| 壁面附近粒子被吸住 | 表面 $S_i\approx0.5$，压力被低估 | 按 $S_i$ 分档统计内部/近表面/表面三组密度均值 |
| 时间步减半后振铃不变 | 误差来自核而非积分器 | 同上第 1 行，检查振铃随 $\Delta p$ 的缩放指数 |

## 参考文献

1. Monaghan J.J., Lattanzio J.C., *A refined particle method for astrophysical problems*, Astronomy and Astrophysics, 149, 135–143, 1985.
2. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425, 1068–1082, 2012.
3. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, 17, 25–76, 2010.
4. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
5. Zhu Q., Hernquist L., Li Y., *Numerical convergence in smoothed particle hydrodynamics*, The Astrophysical Journal, 800, 6, 2015.
6. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, 231, 759–794, 2012.
