---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-spectral-method-engineering-setup
title: "谱方法：工程设置与参数选择"
summary: "从 Chebyshev 二阶微分算子的特征值标度 N⁴ 反推显式时间步上限，给出 N=64 与 N=128 下扩散与对流两种限制的手算结果，并说明 IMEX 分裂、配置点选取与去混叠模态数三处配置的取值依据。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "谱方法"
  - "工程设置与参数选择"
  - "Chebyshev 配置点"
  - "IMEX 时间推进"
seo:
  title: "谱方法：工程设置与参数选择"
  description: "从 Chebyshev 二阶微分算子的特征值标度 N⁴ 反推显式时间步上限，给出 N=64 与 N=128 下扩散与对流两种限制的手算结果，并说明 IMEX 分裂、配置点选取与去混叠模态数三处配置的取值依据。"
  keywords:
    - "谱方法"
    - "工程设置与参数选择"
    - "Chebyshev 配置点"
    - "IMEX"
---

# 谱方法：工程设置与参数选择

谱方法的配置量比有限差分少得多，但每个取值的影响都被放大：模态数 $N$ 每翻一倍，显式时间步的上限就掉到十六分之一。因此谱方法的工程设置实质上是一道时间步预算题——先算清楚 $N$ 带来的刚性，再决定哪些项必须隐式处理。本文给出从 $N$ 到 $\Delta t$ 的完整换算，并给出可直接使用的 IMEX 配置骨架。

## 模态数 N 决定刚性有多强

Chebyshev 配置点上二阶微分算子 $D^{(2)}$ 的最大特征值按 $N^4$ 标度。在 $N\le256$ 的常用范围内，可取

$$\lambda_{\max}\left(D^{(2)}\right)\approx\frac{N^{4}}{4}$$

显式推进扩散项要求 $\left|1+\nu\lambda_{\max}\Delta t\right|\le1$，即

$$\Delta t_{\text{diff}}\le\frac{2}{\nu\,\lambda_{\max}}\approx\frac{8}{\nu N^{4}}$$

手算两档。取空气 $\nu=1.0\times10^{-5}\ \mathrm{m^2/s}$，槽道半高 $h=0.05\ \mathrm{m}$：

- $N=64$：$\lambda_{\max}=64^4/4=4.19\times10^{6}\ \mathrm{m^{-2}}$，$\Delta t_{\text{diff}}=2/\left(1.0\times10^{-5}\times4.19\times10^{6}\right)=4.8\times10^{-2}\ \mathrm{s}$；
- $N=128$：$\lambda_{\max}=128^4/4=6.71\times10^{7}\ \mathrm{m^{-2}}$，$\Delta t_{\text{diff}}=2/\left(1.0\times10^{-5}\times6.71\times10^{7}\right)=3.0\times10^{-3}\ \mathrm{s}$。

比值 $4.8\times10^{-2}/3.0\times10^{-3}=16$，正是 $2^4$。这就是谱方法不能靠加模态换精度的地方。

## 对流项往往比扩散项更紧

对流的显式限制由最小配置点间距决定。Chebyshev 网格的壁面间距约 $h/N^2$，于是

$$\Delta t_{\text{adv}}\le\frac{C\,h}{u\,N^{2}}$$

取来流 $u=10\ \mathrm{m/s}$，$h=0.05\ \mathrm{m}$，$C=1$，$N=64$：

$$\Delta t_{\text{adv}}=\frac{1\times0.05}{10\times64^{2}}=\frac{0.05}{40960}=1.2\times10^{-6}\ \mathrm{s}$$

比同模态下的扩散限制紧 4 万倍。本例的雷诺数为 $\mathrm{Re}=uh/\nu=10\times0.05/1.0\times10^{-5}=5.0\times10^{4}$，属于对流主导，因此**对流项而非扩散项才是决定步长的瓶颈**。反过来，在 $\mathrm{Re}<100$ 的算例中扩散项会重新成为瓶颈，配置时必须两项都算。

## IMEX 分裂：把刚性项交给隐式

标准做法是把线性刚性项（扩散、线性源）隐式处理，非线性项显式处理。写成

$$\frac{\hat{u}^{n+1}-\hat{u}^{n}}{\Delta t}=-ik\,\widehat{u^2}^{\,n}-\nu k^{2}\hat{u}^{n+1}$$

整理后每个模态独立求解，隐式部分只需求一个标量除法：

$$\hat{u}^{n+1}=\frac{\hat{u}^{n}+\Delta t\left(-ik\,\widehat{u^2}^{\,n}\right)}{1+\nu k^{2}\Delta t}$$

谱方法隐式推进的代价之所以低，是因为 Fourier 基下 $D^{(2)}$ 是对角的。Chebyshev 基下 $D^{(2)}$ 是满阵，需要解一个 $N\times N$ 的带状或稠密系统，每次求解代价 $O(N^2)$ 至 $O(N^3)$，这是 Chebyshev 与 Fourier 在配置上最重要的差别。

## 配置骨架

```python
import numpy as np

def cheb(N):
    """Chebyshev 配置点与一阶微分矩阵 (Trefethen 2000, 程序 6)"""
    if N == 0:
        return np.array([1.0]), np.zeros((1, 1))
    x = np.cos(np.pi * np.arange(N + 1) / N)          # 从 +1 到 -1
    c = np.hstack(([2.0], np.ones(N - 1), [2.0])) * (-1.0) ** np.arange(N + 1)
    X = np.tile(x, (N + 1, 1)).T
    dX = X - X.T
    D = np.outer(c, 1.0 / c) / (dX + np.eye(N + 1))
    D = D - np.diag(D.sum(axis=1))
    return x, D

N = 64
x, D = cheb(N)
D2 = D @ D
lam_max = np.abs(np.linalg.eigvals(D2)).max()
nu, h, u = 1.0e-5, 0.05, 10.0
dt_diff = 2.0 / (nu * lam_max)
dt_adv = h / (u * N**2)
print(f"N={N}  lambda_max={lam_max:.3e} 1/m^2")
print(f"dt_diff={dt_diff:.3e} s   dt_adv={dt_adv:.3e} s   -> 取 {min(dt_diff, dt_adv):.3e} s")

# 去混叠模态数
print("去混叠需补零到:", 3 * N // 2, "个模态")
```

## 设置台账

| 设置项 | 取值 | 依据 | 失效信号 |
|---|---|---|---|
| 基函数 | Chebyshev（非周期）/ Fourier（周期） | 边界条件类型 | 非周期问题用 Fourier 会出现边界振荡 |
| 模态数 N | 128（壁湍流 $\mathrm{Re}_\tau=180$） | 需 $y^{+}<0.5$ | 系数尾部未衰减到 $10^{-12}$ |
| 显式/隐式分裂 | 扩散隐式、对流显式 | $\Delta t_{\text{diff}}\gg\Delta t_{\text{adv}}$ | 隐式系统求解时间超过总时间的 50 % |
| 去混叠模态数 | $3N/2=192$ | 二次非线性项的 3/2 规则 | 低频能量随 $N$ 提高而变化 |
| 时间格式 | 显式部分 RK3、隐式部分 Crank–Nicolson | 三阶精度的低存储需求 | 观测时间阶低于 2.8 |
| 滤波 | 指数滤波器，截断到 $k=2N/3$ | 抑制混叠残余 | 滤波后总能量下降超过 1 % |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $N$ 从 64 提到 128 后立刻发散 | 时间步未按 $N^4$ 同步缩小 | 把 $\Delta t$ 除以 16 重跑，若稳定即确认 |
| 每个时间步耗时随 $N$ 增长过快 | Chebyshev 的 $D^{(2)}$ 满阵被反复求逆 | 把求逆结果缓存，比较装配与求解耗时占比 |
| 谱解能量随时间单调下降 | 滤波截断过低，物理模态被削 | 把截断从 $2N/3$ 提到 $0.9N$，能量下降应停止 |
| 壁面附近出现 $2\Delta x$ 振荡 | 边界条件用配点强加而非 Galerkin 投影 | 换成 tau 方法施加边界条件，振荡应消失 |
| 低 Re 算例中步长由对流项决定 | 误判主导项 | 分别计算 $\Delta t_{\text{diff}}$ 与 $\Delta t_{\text{adv}}$，取小者 |

## 参考文献

1. Peyret R., *Spectral Methods for Incompressible Viscous Flow*, Springer, 2002.
2. Gottlieb D., Orszag S.A., *Numerical Analysis of Spectral Methods: Theory and Applications*, SIAM, 1977.
3. Karniadakis G.E., Sherwin S.J., *Spectral/hp Element Methods for Computational Fluid Dynamics*, 2nd ed., Oxford University Press, 2005.
4. Spalart P.R., *Direct simulation of a turbulent boundary layer up to $Re_\theta=1410$*, Journal of Fluid Mechanics, 187:61–98, 1988.
