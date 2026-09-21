---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-conjugate-gradient-modeling
title: "共轭梯度法：算法原理与适用范围"
summary: "共轭梯度法是最小化二次泛函的 Krylov 方法，其收敛速率由条件数的平方根控制。本文推导 A-范数误差界、用 Lanczos 过程解释谱聚集带来的超线性收敛，并给出可手算的迭代数估算与 SPD 前提的失效信号。"
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
  - "共轭梯度法"
  - "算法原理与适用范围"
  - "Krylov 子空间"
  - "条件数"
seo:
  title: "共轭梯度法：算法原理与适用范围"
  description: "共轭梯度法是最小化二次泛函的 Krylov 方法，其收敛速率由条件数的平方根控制。本文推导 A-范数误差界、用 Lanczos 过程解释谱聚集带来的超线性收敛，并给出可手算的迭代数估算与 SPD 前提的失效信号。"
  keywords:
    - "共轭梯度法"
    - "算法原理与适用范围"
    - "Krylov 子空间"
    - "条件数"
    - "Lanczos"
---

# 共轭梯度法：算法原理与适用范围

共轭梯度法是求解对称正定稀疏系统的默认算法，每步只需一次矩阵—向量积、两次内积和 $O(n)$ 存储。它的收敛速率不取决于迭代上限，而取决于矩阵条件数 $\kappa$ 的**平方根**以及谱的聚集程度——这正是预条件能把迭代数从几千降到几十的原因。本文推导 A-范数误差界，用 Lanczos 过程解释为什么谱聚集比谱跨度更重要，并给出可手算的迭代数估算。

## 共轭梯度法在最小化什么

对对称正定 $A$，求解 $A\mathbf x=\mathbf b$ 等价于最小化严格凸二次泛函

$$
\phi(\mathbf x)=\tfrac12\mathbf x^{\mathsf T}A\mathbf x-\mathbf b^{\mathsf T}\mathbf x,
\qquad \nabla\phi=A\mathbf x-\mathbf b=-\mathbf r .
$$

最速下降沿 $-\mathbf r$ 走，但在病态矩阵上会反复折返；CG 改为构造 $A$-共轭方向族 $\mathbf p_i^{\mathsf T}A\mathbf p_j=0\ (i\neq j)$，并在每一步做精确线搜索：

$$
\alpha_k=\frac{\mathbf r_k^{\mathsf T}\mathbf r_k}{\mathbf p_k^{\mathsf T}A\mathbf p_k},
\qquad
\mathbf x_{k+1}=\mathbf x_k+\alpha_k\mathbf p_k .
$$

共轭性保证第 $k$ 步误差在 $\mathrm{span}\{\mathbf p_0,\dots,\mathbf p_k\}$ 上最优，因此无需保存历史向量，短递推就够。这也是 CG 与 GMRES 的根本分野：CG 用三项递推换内存，代价是必须保持对称正定。

## 收敛速率由条件数的平方根决定

误差的 $A$-范数满足经典上界

$$
\|\mathbf e_k\|_A\le 2\left(\frac{\sqrt\kappa-1}{\sqrt\kappa+1}\right)^{k}\|\mathbf e_0\|_A,
\qquad \kappa=\frac{\lambda_{\max}}{\lambda_{\min}} .
$$

取 $\kappa=10^4$ 时 $(\sqrt\kappa-1)/(\sqrt\kappa+1)=99/101=0.9802$，要压到 $10^{-6}$ 需要 $k=\ln(5\times10^{-7})/\ln(0.9802)=725$ 步。这一上界对 $\kappa$ 的依赖是 $\sqrt\kappa$：把 $\kappa$ 从 $10^4$ 降到 $10^2$，同一精度只需 $k=\ln(5\times10^{-7})/\ln(0.8182)=73$ 步，减少整整十倍。| $\kappa$ | $(\sqrt\kappa-1)/(\sqrt\kappa+1)$ | 到 $10^{-6}$ 所需步数 |
|---|---|---|
| $1.0\times10^2$ | 0.8182 | 72 |
| $1.0\times10^3$ | 0.9387 | 229 |
| $1.0\times10^4$ | 0.9802 | 725 |
| $1.0\times10^6$ | 0.9980 | 7255 |

这解释了预条件为什么值得投入——**它是唯一能把迭代数按平方根缩放的杠杆**。

## 谱聚集带来的超线性收敛

上界只看 $\lambda_{\min}$ 与 $\lambda_{\max}$，因此对谱聚集的情形极度悲观。CG 隐含地执行 Lanczos 过程，生成三对角矩阵

$$
T_k=V_k^{\mathsf T}AV_k,\qquad AV_k=V_kT_k+\beta_k\mathbf v_{k+1}\mathbf e_k^{\mathsf T},
$$

$T_k$ 的 Ritz 值单调逼近 $A$ 的极值特征值，中间谱则被"平均掉"。若 $A$ 只有 $m$ 个互不相同的特征值，CG 在 $m$ 步内精确收敛。工程上常见的是谱分成少数几簇，此时迭代数接近簇数而非 $\sqrt\kappa$，曲线在若干步后突然陡降——这就是**超线性收敛段**。诊断价值在于：残差曲线出现陡降说明谱确实成簇，若预条件后陡降消失、曲线变成均匀直线，说明预条件把谱抹平了，反而可以适当放松。

## 有限精度下的正交性丢失

理论上 CG 至多 $n$ 步终止。以二维 Poisson 在 $64\times64$ 网格上为例，$N=3969$，$\kappa\approx4/(\pi^2h^2)=1.71\times10^3$（$h=1/65$），代入上界得 $\varepsilon=10^{-8}$ 时约需 396 步；而浮点运算中实测约 180 步即达标，说明上界偏保守约 2.2 倍。但正交性会被舍入逐步破坏，表现为递推残差 $\|\mathbf r_k\|$ 与真实残差 $\|\mathbf b-A\mathbf x_k\|$ 逐渐分离。长时间迭代后必须周期性重算真实残差；一旦两者相差超过两个数量级，就应停止并重新考虑预条件，而不是继续加迭代数。

## 适用边界：SPD 之外一概不成立

CG 的推导依赖 $A$ 对称正定。矩阵对称但不定（鞍点、混合有限元）时 $\mathbf p_k^{\mathsf T}A\mathbf p_k$ 可能为零或为负，步长 $\alpha_k$ 失去意义，算法直接崩溃；矩阵非对称时共轭性不再蕴含最优性，残差曲线会停滞在某个水平不再下降。这两类情况必须换 MINRES（对称不定）或 GMRES/BiCGStab（非对称）。判断方法不是看求解器有没有报错，而是在装配后检查 $\|A-A^{\mathsf T}\|_\infty/\|A\|_\infty$：若它只有 $10^{-16}$ 量级但最小特征值为负，属于对称不定；若它达到 $10^{-2}$ 量级，属于非对称。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 迭代几步后步长发散或出现负的 $\mathbf p^{\mathsf T}A\mathbf p$ | 矩阵不定，共轭性失效 | 用 Lanczos 或 `eigsh` 估最小特征值符号 |
| 残差曲线在 $10^{-3}$ 处完全拉平 | 矩阵非对称，短递推丢掉了必要信息 | 计算 $\|A-A^{\mathsf T}\|_\infty/\|A\|_\infty$ |
| 迭代数远超 $\sqrt\kappa$ 估算 | 谱存在离群特征值，极值收敛被拖慢 | 用 `eigsh` 看极值特征值是否孤立 |
| 递推残差与真实残差差两个数量级 | 有限精度破坏正交性 | 每 50 步重算 $\|\mathbf b-A\mathbf x_k\|$ 并比对 |

```python
import numpy as np

def cg(A, b, tol=1e-8, maxit=2000):
    x = np.zeros_like(b)
    r = b - A @ x
    p = r.copy()
    rr = r @ r
    r0 = np.sqrt(rr)
    for k in range(maxit):
        Ap = A @ p
        pAp = p @ Ap
        if pAp <= 0.0:            # 非正定，CG 的前提被破坏
            raise ValueError("A is not symmetric positive definite")
        alpha = rr / pAp
        x = x + alpha * p
        r = r - alpha * Ap
        if np.linalg.norm(r) <= tol * r0:
            break
        rr_new = r @ r
        p = r + (rr_new / rr) * p
        rr = rr_new
    return x, k + 1
```

把它跑在二维 Poisson 上，记录每一步的 $\|\mathbf r_k\|$ 并与 $\mathbf b-A\mathbf x_k$ 对比，就能同时验证递推正确性与正交性是否还在。

## 参考

1. Hestenes, M. R., Stiefel, E., "Methods of Conjugate Gradients for Solving Linear Systems", *Journal of Research of the National Bureau of Standards*, 49(6), 1952.
2. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
3. Trefethen, L. N., Bau, D., *Numerical Linear Algebra*, SIAM, 1997.
4. Greenbaum, A., *Iterative Methods for Solving Linear Systems*, SIAM, 1997.
5. Shewchuk, J. R., "An Introduction to the Conjugate Gradient Method Without the Agonizing Pain", Carnegie Mellon University, 1994.
6. Golub, G. H., Van Loan, C. F., *Matrix Computations*, 4th ed., Johns Hopkins University Press, 2013.
