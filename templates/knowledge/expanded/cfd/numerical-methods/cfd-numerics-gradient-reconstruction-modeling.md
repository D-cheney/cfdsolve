---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-gradient-reconstruction-modeling
title: "梯度重构：离散原理与适用范围"
summary: "从散度定理推出 Gauss–Green 梯度对线性场的精确性，再把最小二乘写成加权投影问题，推导非均匀网格上的截断误差公式，并用一次手算说明 2:1 网格间距比怎样带来 50 % 的梯度误差。"
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
  - "梯度重构"
  - "离散原理与适用范围"
  - "散度定理"
  - "截断误差"
seo:
  title: "梯度重构：离散原理与适用范围"
  description: "从散度定理推出 Gauss–Green 梯度对线性场的精确性，再把最小二乘写成加权投影问题，推导非均匀网格上的截断误差公式，并用一次手算说明 2:1 网格间距比怎样带来 50 % 的梯度误差。"
  keywords:
    - "梯度重构"
    - "离散原理与适用范围"
    - "散度定理"
    - "线性保持"
---

# 梯度重构：离散原理与适用范围

梯度重构的两种主流做法——Gauss–Green 与最小二乘——不是可以互换的偏好选项，它们的精度性质由完全不同的机制决定。Gauss–Green 的精度来自散度定理对线性场的精确性，最小二乘的精度来自加权投影对支撑域几何的要求。理解这两条机制，才能判断在给定网格上哪一种会先失效。

## Gauss–Green：散度定理给出的精确性

对控制体 $V_P$ 与标量场 $\phi$，散度定理给出

$$\int_{V_P}\nabla\phi\,dV=\oint_{\partial V_P}\phi\,\mathbf{n}\,dS$$

取单元平均梯度近似左边，得到

$$\nabla\phi_P=\frac{1}{V_P}\sum_{f}\phi_f\mathbf{A}_f+\mathcal{O}\left(\Delta x\right)$$

关键性质是：当 $\phi$ 为线性场时，$\phi_f$ 用相邻单元中心值线性插值得到的值恰好等于面上的真实值，求和严格等于 $\nabla\phi$，误差为零——**与网格是否畸变无关**。这就是线性保持（linearity preserving）性质，也是线性场补丁检验能够成立的根据。

代价在于面值 $\phi_f$。在非正交网格上，面中心并不位于两单元中心的连线上，线性插值引入的是 $\mathcal{O}(\Delta x)$ 量级的偏差，且偏差随非正交角的正切增长。Gauss–Green 的精度完全押在网格正交性上。

## 最小二乘：一个加权投影问题

把梯度估计写成最小化问题：求 $\mathbf{g}$ 使

$$J(\mathbf{g})=\sum_{N}w_N\left[\phi_N-\phi_P-\mathbf{g}\cdot\mathbf{d}_{PN}\right]^{2}$$

最小。令 $\partial J/\partial\mathbf{g}=0$ 得到法方程，解为

$$\mathbf{g}=\left(\sum_{N}w_N\mathbf{d}_{PN}\mathbf{d}_{PN}^{\mathsf{T}}\right)^{-1}\sum_{N}w_N\mathbf{d}_{PN}\left(\phi_N-\phi_P\right)$$

$3\times3$ 矩阵 $\mathbf{M}=\sum_N w_N\mathbf{d}_{PN}\mathbf{d}_{PN}^{\mathsf{T}}$ 可逆的条件是邻居方向张成三维空间，因此三维最少需要 4 个不共面的邻居，二维需要 3 个不共线邻居。四面体网格每个单元恰好 4 个面，最小二乘恰好适定；六面体网格有 6 个邻居，属于超定，对畸变的鲁棒性更好——这是最小二乘在歪斜网格上优于 Gauss–Green 的原因。

权重常取 $w_N=1/\left|\mathbf{d}_{PN}\right|^{2}$，使远近距离的邻居贡献均衡。若权重全取 1，长宽比大的单元会由远端邻居主导，条件数按长宽比的平方恶化。

## 非均匀网格上的截断误差

一维三点梯度是最小二乘在单方向上的特例。设中心点 $x_i$ 到左右邻居的距离分别为 $h_+$ 与 $h_-$，泰勒展开相减得

$$\frac{\phi_{i+1}-\phi_{i-1}}{h_++h_-}=\phi'_i+\frac{h_+-h_-}{2}\phi''_i+\mathcal{O}\left(h^2\right)$$

手算一次：取 $h_+=0.2\ \mathrm{m}$、$h_-=0.1\ \mathrm{m}$，$\phi=x^2$（$\phi''=2\ \mathrm{m^{-1}}$），中心点 $x_i=0.1\ \mathrm{m}$。真实梯度 $\phi'_i=2x_i=0.2\ \mathrm{m^{-1}}$。

$$\frac{0.3^2-0.0^2}{0.3}=\frac{0.09}{0.3}=0.30\ \mathrm{m^{-1}}$$

误差 $0.30-0.20=0.10\ \mathrm{m^{-1}}$，相对误差 50 %。公式预测的误差是 $\frac{h_+-h_-}{2}\phi''=\frac{0.1}{2}\times2=0.10\ \mathrm{m^{-1}}$，与实测完全一致。

结论很直接：网格间距比达到 2:1 时，梯度误差是 O(1) 量级，不是小量。任何依赖梯度的项（对流、扩散、湍流源项）都会继承这 50 % 的偏差。均匀化网格间距的收益远大于换梯度格式。

## 实现骨架

```python
import numpy as np

def gauss_green(vol, faces):
    """faces: list of (A_vec[m^2], phi_f)"""
    g = np.zeros(3)
    for A_f, phi_f in faces:
        g += phi_f * A_f
    return g / vol

def least_squares(dPN, dphi, w):
    """dPN: (N,3) m; dphi: (N,) ; w: (N,) 权重"""
    M = np.einsum('n,ni,nj->ij', w, dPN, dPN)   # 3x3
    b = np.einsum('n,ni,n->i', w, dPN, dphi)
    return np.linalg.solve(M, b)

# 线性场补丁: phi = 3x + 2y + 1, 期望 g = (3, 2, 0)
rng = np.random.default_rng(0)
dPN = rng.normal(size=(6, 3)) * 1e-3           # 6 个邻居, 单位 m
dphi = dPN @ np.array([3.0, 2.0, 0.0])         # 精确线性场
w = 1.0 / np.sum(dPN**2, axis=1)               # 1/|d|^2
print(least_squares(dPN, dphi, w))             # 应为 [3. 2. 0.]
```

线性场补丁是唯一能在任意网格上给出机器精度结论的检验：最小二乘在线性场上必须精确，与权重取法无关，因为法方程本身就是线性场的精确投影。

## 适用边界

- **间断附近**：两种格式都在间断两侧取邻居，重构梯度会被污染，必须配合 `cellLimited` 或改用保单调重构；
- **强各向异性单元**：长宽比超过 $10^3$ 时，最小二乘法方程的 $3\times3$ 矩阵条件数达到 $10^6$ 量级，双精度下的有效位不足 10 位；
- **边界单元**：支撑域只剩一半，一维截断误差公式中的 $h_+-h_-$ 无法通过网格均匀化消除，只能降阶处理；
- **无网格与粒子法**：邻居集合随粒子运动变化，法方程需要每步重新装配并求逆，代价随邻居数三次方增长。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 线性场补丁在畸变网格上误差 $10^{-4}$ | 面值插值不是线性保持的（用了距离倒数权重） | 换回线性插值重跑，误差应降到 $10^{-10}$ 以下 |
| 长宽比 500 的单元上梯度抖动 | 最小二乘法方程条件数过大 | 把权重从 1 改为 $1/\left|\mathbf{d}\right|^2$，抖动幅度应显著减小 |
| 二维算例中梯度在角点处发散 | 邻居共线，$2\times2$ 矩阵奇异 | 输出邻居方向的行列式，接近零即确认 |
| Gauss–Green 与最小二乘相差 15 % | 网格非正交角超过 60°，前者已丢阶 | 输出最大非正交角，若 > 60° 则以前者为不可信 |
| 加密网格后梯度误差停在 1 % 不动 | 误差来自网格间距比而非截断阶 | 计算相邻单元体积比，若 > 1.5 则先修网格 |

## 参考文献

1. Barth T.J., *Aspects of unstructured grids and finite-volume solvers for the Euler and Navier-Stokes equations*, VKI Lecture Series 1992-05, 1992.
2. Aftosmis M., Gaitonde D., Tavares T.S., *Behavior of linear reconstruction techniques on unstructured meshes*, AIAA Journal, 33(11):2038–2049, 1995.
3. Frink N.T., *Upwind scheme for solving the Euler equations on unstructured tetrahedral meshes*, AIAA Journal, 30(1):70–77, 1992.
4. Hyman J.M., Shashkov M., *Natural discretizations for the divergence, gradient, and curl on logically rectangular grids*, Computers & Mathematics with Applications, 33(4):81–104, 1997.
