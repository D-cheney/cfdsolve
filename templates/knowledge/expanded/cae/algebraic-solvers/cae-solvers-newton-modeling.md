---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-newton-modeling
title: "Newton 非线性求解：算法原理与适用范围"
summary: "Newton 法的二次收敛严格依赖雅可比与残差定义完全一致。本文推导修正方程与误差递推，用弹塑性径向返回的一致切线说明连续切线为何把二次收敛降为线性，并给出载荷增量与残差尺度的量级判据。"
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
  - "Newton 非线性求解"
  - "算法原理与适用范围"
  - "一致切线"
  - "二次收敛"
seo:
  title: "Newton 非线性求解：算法原理与适用范围"
  description: "Newton 法的二次收敛严格依赖雅可比与残差定义完全一致。本文推导修正方程与误差递推，用弹塑性径向返回的一致切线说明连续切线为何把二次收敛降为线性，并给出载荷增量与残差尺度的量级判据。"
  keywords:
    - "Newton 非线性求解"
    - "算法原理与适用范围"
    - "一致切线"
    - "二次收敛"
    - "载荷增量"
---

# Newton 非线性求解：算法原理与适用范围

Newton 法的迭代数少，不是因为步长选得好，而是因为它的雅可比与残差在数学上严格一致。一旦两者出现任何不匹配——最常见的是弹塑性本构里用了连续切线而不是一致切线——收敛阶会立刻从二次降为线性，迭代数从 5 次变成 20 次以上。本文推导修正方程与误差递推，用径向返回映射给出可核对的对比，并说明载荷增量与残差尺度如何决定从远处能否收敛。

## 从 Taylor 展开到 Newton 修正方程

把非线性残差记为 $R(\mathbf u)=0$，在 $\mathbf u_k$ 处展开：

$$
R(\mathbf u_k+\Delta\mathbf u)=R_k+J_k\Delta\mathbf u+O(\|\Delta\mathbf u\|^2),
\qquad J_k=\frac{\partial R}{\partial\mathbf u}\Big|_{\mathbf u_k},
$$

忽略高阶项即得 Newton 修正方程

$$
J_k\,\Delta\mathbf u_k=-R_k,\qquad \mathbf u_{k+1}=\mathbf u_k+\Delta\mathbf u_k .
$$

结构问题里 $R=\mathbf F_{\text{ext}}-\mathbf F_{\text{int}}(\mathbf u)$，于是 $J=-\partial\mathbf F_{\text{int}}/\partial\mathbf u$ 就是切线刚度矩阵。这个定义是全部问题的根源：**$J$ 必须是 $R$ 对 $\mathbf u$ 的**精确**导数，包括所有算法层面的分支**。

## 二次收敛需要精确的雅可比

若 $J$ 精确、$J(\mathbf u^*)$ 非奇异且初值足够近，则误差满足

$$
\|\mathbf e_{k+1}\|\le C\|\mathbf e_k\|^2 .
$$

取 $\|\mathbf e_0\|=10^{-1}$、$C=1$，则误差序列为 $10^{-2}\to10^{-4}\to10^{-8}\to10^{-16}$，**四次迭代即达机器精度**，残差日志表现为有效位数每步翻倍：$1.0\times10^{-1}$、$1.1\times10^{-2}$、$8.7\times10^{-5}$、$3.2\times10^{-9}$、$4.1\times10^{-15}$。相反，若 $J$ 只是近似（误差与残差同量级），迭代退化为线性收敛，压缩因子约 0.4，同样从 $10^{-1}$ 到 $10^{-10}$ 需要 $\ln(10^{-9})/\ln(0.4)=23$ 次迭代。**日志里有效位数每步只增加固定位数，就是雅可比不精确的直接证据。**

## 一致切线：连续切线为什么毁掉二次收敛

弹塑性本构是这个问题最典型的现场。径向返回映射给出更新后的应力 $\boldsymbol\sigma_{n+1}$，Newton 需要的是**算法切线**

$$
C^{ep}=\frac{\partial\boldsymbol\sigma_{n+1}}{\partial\boldsymbol\varepsilon_{n+1}},
$$

而经典塑性理论给出的连续切线 $\partial\boldsymbol\sigma/\partial\boldsymbol\varepsilon$ 是应变率意义上的导数。二者在小应变增量下接近，但一般情形不同：连续切线忽略了返回映射中塑性乘子 $\Delta\gamma$ 对应变的依赖。对 von Mises 等向硬化，一致切线的形式为

$$
C^{ep}=C-\frac{(C:\mathbf n)\otimes(C:\mathbf n)}{\mathbf n:C:\mathbf n+H'},
\qquad
\mathbf n=\frac{\partial f}{\partial\boldsymbol\sigma},
$$

其中分母中的硬化模量必须取**离散返回映射导出的算法硬化模量**，而不是连续介质硬化模量。用错切线的后果很具体：同一弹塑性算例用一致切线 5 次迭代收敛，用连续切线需要 24 次，且当载荷增量较大时连续切线版本可能完全无法把残差压到 $10^{-8}$ 以下。**判断方法极其简单——把残差序列打印出来，看有效位数是否每步翻倍。**

## 残差尺度与载荷增量

残差必须无量纲化后再比较，否则量纲大的自由度会掩盖真实误差。对结构问题常用

$$
\|\mathbf R\|_{\text{rel}}=\frac{\|\mathbf R\|_2}{\max(\|\mathbf F_{\text{ext}}\|_2,\ \|\mathbf F_{\text{int}}\|_2)},
$$

同时对位移增量用 $\|\Delta\mathbf u\|_2/\|\mathbf u\|_2$ 做第二道判据。载荷增量决定初值离解有多远：把总载荷分成 $N_{\text{inc}}$ 步，每步的 Newton 初值是上一步的收敛解，因此 $\|\mathbf e_0\|$ 大致随步长线性下降。对强非线性问题（屈服面扩展、接触状态切换），$N_{\text{inc}}=10$ 与 $N_{\text{inc}}=50$ 的差别可能是 5 次迭代收敛与完全不收敛的差别。经验规则是：**如果某一步的 Newton 需要超过 12 次迭代，说明载荷增量偏大，应当减半而不是放宽收敛容差。**

## 收敛半径与全局化的必要性

二次收敛只在解的某个邻域内成立，这个邻域的大小由 Kantorovich 条件控制，粗略地要求初值误差与非线性强度之积足够小。远离解时 Newton 方向可能根本不是下降方向，步长 $\alpha=1$ 会直接跳到物理上非法的区域（负密度、负温度、穿透）。因此工业求解器都会加上阻尼或线搜索：

$$
\mathbf u_{k+1}=\mathbf u_k+\alpha_k\Delta\mathbf u_k,\qquad 0<\alpha_k\le1,
$$

其中步长由回溯法确定，接受条件是功函数下降

$$
\phi(\mathbf u_k+\alpha\Delta\mathbf u_k)\le\phi(\mathbf u_k)+c_1\alpha\,\nabla\phi^{\mathsf T}\Delta\mathbf u_k,
\qquad \phi=\tfrac12\|\mathbf R\|_2^2,
$$

Armijo 常数取 $c_1=10^{-4}$、步长按 0.5 倍收缩。残差光滑且初值可靠时线搜索几乎从不触发，$\alpha_k$ 恒为 1，收敛仍是二次的；一旦日志里频繁出现 $\alpha<0.5$，说明问题已经偏离了 Newton 的适用域。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差每步只降固定倍数（约 0.4） | 雅可比与残差不一致，典型为用了连续切线 | 打印有效位数增长，逐项核验本构导数 |
| 前 3 步很快、之后完全不动 | 残差尺度被大量纲分量主导 | 改用相对残差并按分量归一化后重测 |
| 载荷增量减半后迭代数大幅下降 | 初值超出收敛半径 | 固定本构，只改 $N_{\text{inc}}$ 做对照 |
| 线搜索步长长期停在 $10^{-4}$ 以下 | Newton 方向不是下降方向，雅可比符号有误 | 用有限差分核验 $J$ 的单列 |

```python
import numpy as np

def newton_armijo(R, J, u0, c1=1.0e-4, rho=0.5,
                  tol=1.0e-10, maxit=50):
    u = np.array(u0, float)
    for k in range(maxit):
        r = R(u)
        phi0 = 0.5 * r @ r
        if np.sqrt(phi0) <= tol:
            break
        du = np.linalg.solve(J(u), -r)   # Newton 修正方程
        gTdu = -r @ r                    # grad(phi)^T du < 0
        alpha = 1.0
        while alpha > 1.0e-12:           # Armijo 回溯, c1=1e-4
            un = u + alpha * du
            if 0.5 * R(un) @ R(un) <= phi0 + c1 * alpha * gTdu:
                break
            alpha *= rho                 # 步长按 0.5 倍收缩
        u = u + alpha * du
    return u, k + 1
```

在一致切线正确的算例上，这个循环里 `alpha` 始终为 1.0，循环体只执行 5 次；一旦日志显示 `alpha` 被反复收缩，就应回到本构导数去查而不是放宽容差。

## 参考

1. Deuflhard, P., *Newton Methods for Nonlinear Problems: Affine Invariance and Adaptive Algorithms*, Springer, 2004.
2. Kelley, C. T., *Iterative Methods for Linear and Nonlinear Equations*, SIAM, 1995.
3. Dennis, J. E., Schnabel, R. B., *Numerical Methods for Unconstrained Optimization and Nonlinear Equations*, SIAM, 1996.
4. Simo, J. C., Hughes, T. J. R., *Computational Inelasticity*, Springer, 1998.
5. Knoll, D. A., Keyes, D. E., "Jacobian-free Newton–Krylov methods: a survey of approaches and applications", *Journal of Computational Physics*, 193(2), 2004.
6. Kantorovich, L. V., Akilov, G. P., *Functional Analysis*, 2nd ed., Pergamon Press, 1982.
