---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-gmres-modeling
title: "GMRES 与重启：算法原理与适用范围"
summary: "GMRES 在 Krylov 子空间上最小化真实残差，代价是 O(nm) 内存与 O(nm²) 正交化。本文推导 Arnoldi 最小二乘形式，量化内存与计算量随重启长度 m 的增长，并说明重启为何能彻底停滞以及非正规矩阵的伪谱判据。"
category:
  slug: algebraic-solvers
  name: "代数求解器与时间算法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "代数求解器与时间算法"
  - "GMRES 与重启"
  - "算法原理与适用范围"
  - "Arnoldi 过程"
  - "非正规矩阵"
seo:
  title: "GMRES 与重启：算法原理与适用范围"
  description: "GMRES 在 Krylov 子空间上最小化真实残差，代价是 O(nm) 内存与 O(nm²) 正交化。本文推导 Arnoldi 最小二乘形式，量化内存与计算量随重启长度 m 的增长，并说明重启为何能彻底停滞以及非正规矩阵的伪谱判据。"
  keywords:
    - "GMRES 与重启"
    - "算法原理与适用范围"
    - "Arnoldi 过程"
    - "重启长度"
    - "非正规矩阵"
---

# GMRES 与重启：算法原理与适用范围

非对称稀疏系统没有像 CG 那样廉价的三项递推可用，GMRES 的应对方式是显式保存整组正交基并在其上做最小二乘——这换来单调下降的真实残差，代价是内存与计算量随重启长度线性、平方地增长。理解 $m$ 的三重影响（内存、正交化代价、收敛能力）是判断 GMRES 配置是否合理的前提。本文以 $n=5\times10^6$、每行平均 7 个非零元的可压缩流动模型为量级基准。

## 最小残差是 GMRES 的全部定义

从 $\mathbf x_0$ 出发，Arnoldi 过程逐步构造标准正交基，满足

$$
AV_m=V_{m+1}\bar H_m,
\qquad V_m=[\mathbf v_1,\dots,\mathbf v_m],
$$

其中 $\bar H_m$ 是 $(m+1)\times m$ 的上 Hessenberg 矩阵。令 $\mathbf x_m=\mathbf x_0+V_m\mathbf y$、$\beta=\|\mathbf r_0\|_2$，最小化真实残差就化为一个 $(m+1)\times m$ 的小型最小二乘：

$$
\min_{\mathbf y}\|\mathbf r_0-AV_m\mathbf y\|_2
=\min_{\mathbf y}\|\beta\mathbf e_1-\bar H_m\mathbf y\|_2 .
$$

这个子问题用 Givens 旋转以 $O(m^2)$ 递推求解，因此每步只需监控残差估计值而不必真的更新 $\mathbf x$。**单调性是全 GMRES 独有的性质**：因为 $\mathcal K_m\subset\mathcal K_{m+1}$，残差范数不会回升。重启会立刻破坏这一性质。

## 内存与正交化代价随 m 的增长

GMRES 必须保存全部 $m+1$ 个基向量，内存为

$$
M_{\text{mem}}=(m+1)\,n\cdot 8\ \text{字节}.
$$

$n=5\times10^6$ 时不同 $m$ 的开销如下表，$m=200$ 已经超过单节点常规内存：

| $m$ | 基向量内存 | 正交化与矩阵—向量积代价比 |
|---|---|---|
| 20 | 0.84 GB | 1.43 |
| 50 | 2.04 GB | 3.57 |
| 100 | 4.04 GB | 7.14 |
| 200 | 8.04 GB | 14.29 |

正交化本身也不便宜：改进 Gram–Schmidt 每步需要 $2n$ 次运算乘以已积累的基向量数，一个完整周期的代价约 $nm^2$ 次浮点运算。与矩阵—向量积对比，单周期内 $m$ 次矩阵—向量积的总代价是 $2m\cdot\mathrm{nnz}$，两者之比为

$$
\frac{nm^2}{2m\cdot \mathrm{nnz}}=\frac{m\,n}{2\,\mathrm{nnz}}=\frac{m}{2\times(\text{每行平均非零元数})},
$$

代入每行 7 个非零元、$m=50$，正交化代价约为矩阵—向量积的 3.6 倍。若 $m$ 取到 200，这个倍数升到 14 倍。这解释了为什么"把重启长度调大"在大规模问题上往往不划算：**收益是迭代数减少，代价是内存翻倍且每步计算量按平方增长**。工程上 $m$ 常落在 30～100，稀疏度越差（每行非零元越少）越应取小。

## 重启为什么可能彻底失效

重启的做法是解完 $m$ 步后令 $\mathbf x_0\leftarrow\mathbf x_m$、丢弃全部基向量、重新开始。理论上存在一类矩阵，使得 GMRES($m$) 的残差在任意 $m$ 下都不下降（Greenbaum、Pták、Strakoš 1996 给出了构造）。工程上更容易遇到的弱化版本是**重启点残差回升**：全 GMRES 的残差单调，但重启后新周期的第 1 步可能高于上一周期末尾，因为最小化是在新的仿射空间里重新做的。若日志里反复出现残差在重启点抬高 5%～20%，说明当前 $m$ 不足以覆盖问题的有效谱段。判据是观察 $\|\mathbf r\|$ 在重启点的跳变幅度：跳变小于 1% 属于正常，持续超过 10% 就应增大 $m$ 或改用厚重启（thick restart，保留若干 Ritz 向量）。

## 非正规矩阵与伪谱

非对称问题的收敛不能用特征值分布来解释。若 $A$ 可对角化，残差有界

$$
\frac{\|\mathbf r_m\|_2}{\|\mathbf r_0\|_2}
\le \kappa(V)\min_{p\in\Pi_m,\ p(0)=1}\max_{\lambda\in\Lambda(A)}|p(\lambda)|,
$$

其中 $\kappa(V)$ 是特征向量矩阵的条件数。对流占优问题里 $\kappa(V)$ 可达 $10^6$ 以上，使特征值看起来"远离原点"却仍然收敛缓慢——这就是非正规性。正确的判据是伪谱 $\Lambda_\epsilon(A)=\{z:\sigma_{\min}(zI-A)\le\epsilon\}$：GMRES 的实际收敛由 $\epsilon$ 从 $10^{-2}$ 到 $10^{-6}$ 时伪谱包围原点的程度决定。伪谱向原点扩张得越快，需要的 $m$ 越大。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 每周期重启点残差抬高 15% | $m$ 太小，谱信息不足以支撑一次完整下降 | 把 $m$ 从 30 提到 80，比较跳变幅度 |
| 特征值都在右半平面但收敛极慢 | 非正规性导致 $\kappa(V)$ 极大 | 计算伪谱轮廓，看 $\epsilon=10^{-4}$ 时是否包围原点 |
| 增大 $m$ 后总耗时反而增加 | 正交化代价按 $m^2$ 增长 | 统计单周期内正交化与矩阵—向量积的耗时比 |
| Arnoldi 过程中 $\mathbf v_{k+1}$ 范数接近零 | 出现 happy breakdown，子空间已不变 | 直接接受当前解，它是精确解 |

```python
import numpy as np

def gmres_cost(n, nnz_per_row, m):
    mem_gb = (m + 1) * n * 8.0 / 1024**3
    ratio = m / (2.0 * nnz_per_row)     # 正交化 / 矩阵—向量积
    return mem_gb, ratio

def arnoldi(A, b, m, x0=None):
    n = b.size
    x0 = np.zeros(n) if x0 is None else x0
    r0 = b - A @ x0
    beta = np.linalg.norm(r0)
    V = np.zeros((n, m + 1))
    H = np.zeros((m + 1, m))
    V[:, 0] = r0 / beta
    for j in range(m):
        w = A @ V[:, j]
        for i in range(j + 1):          # 改进 Gram-Schmidt
            H[i, j] = V[:, i] @ w
            w = w - H[i, j] * V[:, i]
        H[j + 1, j] = np.linalg.norm(w)
        if H[j + 1, j] < 1.0e-14:       # happy breakdown
            break
        V[:, j + 1] = w / H[j + 1, j]
    return V, H, beta

for m in (20, 50, 100, 200):
    gb, ratio = gmres_cost(5.0e6, 7.0, m)
    print(f"m={m:3d}  mem={gb:.2f} GB  ortho/matvec={ratio:.2f}")
```

## 参考

1. Saad, Y., Schultz, M. H., "GMRES: A generalized minimal residual algorithm for solving nonsymmetric linear systems", *SIAM Journal on Scientific and Statistical Computing*, 7(3), 1986.
2. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
3. Greenbaum, A., Pták, V., Strakoš, Z., "Any nonincreasing convergence curve is possible for GMRES", *SIAM Journal on Matrix Analysis and Applications*, 17(3), 1996.
4. Trefethen, L. N., Embree, M., *Spectra and Pseudospectra: The Behavior of Nonnormal Matrices and Operators*, Princeton University Press, 2005.
5. Simoncini, V., Szyld, D. B., "Recent computational developments in Krylov subspace methods for linear systems", *Numerical Linear Algebra with Applications*, 14(1), 2007.
6. Baker, A. H., Jessup, E. R., Manteuffel, T., "A technique for accelerating the convergence of restarted GMRES", *SIAM Journal on Matrix Analysis and Applications*, 26(4), 2005.
