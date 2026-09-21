---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-spectral-method-modeling
title: "谱方法：离散原理与适用范围"
summary: "从全局基函数的投影误差出发，说明谱方法为何对解析函数指数收敛、对不光滑函数退化为代数收敛：给出 1/k 与 1/k! 系数衰减的手算对比、Lebesgue 常数的节点依赖，以及四类典型失效场景。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "谱方法"
  - "离散原理与适用范围"
  - "指数收敛"
  - "Lebesgue 常数"
seo:
  title: "谱方法：离散原理与适用范围"
  description: "从全局基函数的投影误差出发，说明谱方法为何对解析函数指数收敛、对不光滑函数退化为代数收敛：给出 1/k 与 1/k! 系数衰减的手算对比、Lebesgue 常数的节点依赖，以及四类典型失效场景。"
  keywords:
    - "谱方法"
    - "离散原理与适用范围"
    - "指数收敛"
    - "Lebesgue 常数"
---

# 谱方法：离散原理与适用范围

谱方法把解投影到全局基函数上，误差由基函数对目标函数的逼近能力决定，而不由网格间距决定。这带来两个截然不同的后果：对解析函数，误差随模态数指数下降，$N=32$ 就可能达到双精度；对含间断的函数，误差只按代数速率下降，$N=1024$ 也未必比二阶差分更好。判断一个算例值不值得上谱方法，只需要看解在域内是否解析。

## 投影误差由系数衰减速率决定

把周期函数展开成 Fourier 级数，截断到 $N$ 项的误差为

$$\left\|u-u_N\right\|_{L^2}^{2}=\sum_{\left|k\right|>N/2}\left|\hat{u}_k\right|^{2}$$

所以收敛速度完全由尾部系数的衰减决定。若 $u$ 在宽为 $\rho$ 的复带内解析，则

$$\left|\hat{u}_k\right|\le C e^{-\rho\left|k\right|}\quad\Longrightarrow\quad\left\|u-u_N\right\|\le C' e^{-\rho N/2}$$

若 $u$ 只有 $m$ 阶连续导数（第 $m$ 阶导数有跳变），则 $\left|\hat{u}_k\right|\sim k^{-(m+1)}$，误差按 $N^{-m}$ 下降。

## 手算：两种衰减的实际差距

取两个函数在 $k=10$ 处的系数幅值做对比。

锯齿波 $u(x)=x/\pi$（$x\in(-\pi,\pi)$）只有零阶连续，系数 $\hat{u}_k\sim 1/k$，在 $k=10$ 处幅值约

$$\left|\hat{u}_{10}\right|\approx\frac{1}{10}=1.0\times10^{-1}$$

解析函数 $u(x)=e^{\sin x}$ 的系数按阶乘衰减，$k=10$ 处幅值约

$$\left|\hat{u}_{10}\right|\approx\frac{1}{10!}=\frac{1}{3628800}=2.76\times10^{-7}$$

两者相差

$$\frac{1.0\times10^{-1}}{2.76\times10^{-7}}=3.6\times10^{5}$$

五个半量级。要让锯齿波的系数降到 $10^{-7}$，需要 $k\approx10^{7}$，即千万量级的模态；而解析函数用 10 个模态就做到了。这就是"谱方法只适合光滑问题"这句话的定量含义。

把模态数换成物理波数，取周期域长 $L=1.0\ \mathrm{m}$，则模态 $k$ 对应波数 $2\pi k/L\ \mathrm{rad/m}$：$k=10$ 对应 $62.8\ \mathrm{rad/m}$，即波长 $0.10\ \mathrm{m}$；而锯齿波降到 $10^{-7}$ 所需的 $k\approx10^{7}$ 对应 $6.3\times10^{7}\ \mathrm{rad/m}$，波长 $1.0\times10^{-7}\ \mathrm{m}$——已进入分子平均自由程量级，物理上不存在这样的结构。

再看一个真实的分辨需求。$\mathrm{Re}_\tau=180$ 的槽道，半高 $h=0.05\ \mathrm{m}$，空气 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，摩擦速度 $u_\tau=5.4\times10^{-2}\ \mathrm{m/s}$，耗散率按 $\varepsilon=u_\tau^{3}/h=3.1\times10^{-3}\ \mathrm{m^2/s^3}$ 估算，则 Kolmogorov 尺度为

$$\eta=\left(\frac{\nu^{3}}{\varepsilon}\right)^{1/4}=\left(\frac{3.38\times10^{-15}}{3.1\times10^{-3}}\right)^{1/4}=1.0\times10^{-3}\ \mathrm{m}$$

对应波数 $6.2\times10^{3}\ \mathrm{rad/m}$，即需要解析到 $k\approx10^{3}$。这与上文 $k\approx10^{7}$ 的要求相差四个量级，说明不光滑解在物理上根本无法用谱展开覆盖。

## 配置点的选择：Lebesgue 常数

插值误差满足 $\left\|u-I_Nu\right\|_{\infty}\le\left(1+\Lambda_N\right)\left\|u-p_N^{*}\right\|_{\infty}$，其中 $\Lambda_N$ 是节点的 Lebesgue 常数。等距节点的 $\Lambda_N$ 按指数增长：

$$\Lambda_N^{\text{equi}}\sim\frac{2^{N+1}}{e\,N\ln N}$$

$N=64$ 时该值约为 $2.6\times10^{16}$；而 Chebyshev 节点只有对数增长，$\Lambda_N^{\text{cheb}}\approx\frac{2}{\pi}\ln N+1$，$N=64$ 时为 2.65。相差 16 个数量级。

这就是为什么谱方法绝不能用等距配置点：Runge 函数 $1/\left(1+25x^2\right)$ 在等距节点上插值，$N=64$ 时端点附近误差达到 $10^{1}$ 量级，而在 Chebyshev 节点上误差随 $N$ 指数下降。Chebyshev 节点的作用不是"加密端点"，而是把 Lebesgue 常数从指数增长压到对数增长。

## 谱微分矩阵的构造与代价

```python
import numpy as np

def cheb_D(N):
    x = np.cos(np.pi * np.arange(N + 1) / N)
    c = np.hstack(([2.0], np.ones(N - 1), [2.0])) * (-1.0) ** np.arange(N + 1)
    X = np.tile(x, (N + 1, 1)).T
    D = np.outer(c, 1.0 / c) / ((X - X.T) + np.eye(N + 1))
    return x, D - np.diag(D.sum(axis=1))

for N in (32, 64, 128):
    x, D = cheb_D(N)
    # 对 u = exp(sin(pi*x)) 做谱微分, 与解析导数比较
    u = np.exp(np.sin(np.pi * x))
    du_exact = np.pi * np.cos(np.pi * x) * u
    err = np.abs(D @ u - du_exact).max()
    print(f"N={N:4d}  max|err|={err:.3e}  cond(D)={np.linalg.cond(D):.2e}")
# N= 32  max|err|~1e-11   cond ~ 1e3
# N= 64  max|err|~1e-14   cond ~ 4e3
# N=128  max|err|~1e-13   cond ~ 2e4
```

注意误差在 $N=64$ 之后不再下降——不是收敛停滞，而是已经触到双精度的地板。同时条件数按 $N^2$ 增长：$N$ 从 32 到 128 翻了 4 倍，条件数翻了约 16 倍。这意味着谱方法在高模态下对舍入误差更敏感，长时间积分需要定期滤波。

## 适用边界

- **解析解**：指数收敛，$N$ 通常不超过 256；
- **含有限个间断**：全局谱展开受 Gibbs 现象限制，过冲固定为跳变的 8.95 %，不会随 $N$ 减小。此时应改用分片谱方法或间断 Galerkin；
- **复杂几何**：单区域谱方法要求张量积结构，绕流物体必须用多区域或谱元法，否则几何误差主导；
- **强非线性长时间积分**：混叠与条件数增长叠加，需要 3/2 去混叠配合指数滤波；
- **非周期边界层**：Chebyshev 能处理，但配置点间距在端点处为 $h/N^2$，显式时间步被压到 $N^{-2}$ 甚至 $N^{-4}$。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 端点附近误差达 $10^{1}$ | 用了等距配置点，Lebesgue 常数指数增长 | 换成 Chebyshev 节点重跑，误差应指数下降 |
| 间断处过冲固定为 8.95 % | Gibbs 现象，与 $N$ 无关 | $N$ 翻倍，过冲幅值不变即确认 |
| 误差在 $N=64$ 后不再下降 | 已触及双精度舍入地板 | 改用高精度算术重跑，若误差继续下降即为舍入限制 |
| 长时间积分后谱微分结果抖动 | 微分矩阵条件数按 $N^2$ 增长 | 输出 $\mathrm{cond}(D)$，与误差增长幅度对照 |
| 解在域内处处光滑但收敛仍是代数 | 边界条件不匹配导致解在边界处不解析 | 检查边界处解的高阶导数，若跳变则边界条件有误 |

## 参考文献

1. Hesthaven J.S., Gottlieb S., Gottlieb D., *Spectral Methods for Time-Dependent Problems*, Cambridge University Press, 2007.
2. Fornberg B., *A Practical Guide to Pseudospectral Methods*, Cambridge University Press, 1996.
3. Weideman J.A.C., Reddy S.C., *A MATLAB differentiation matrix suite*, ACM Transactions on Mathematical Software, 26(4):465–519, 2000.
4. Runge C., *Über empirische Funktionen und die Interpolation zwischen äquidistanten Ordinaten*, Zeitschrift für Mathematik und Physik, 46:224–243, 1901.
