---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-conjugate-gradient-engineering-setup
title: "共轭梯度法：工程设置与参数选择"
summary: "PCG 的实际配置清单：Jacobi、SSOR、IC(0)、IC(k) 与 AMG 预条件的迭代数与总耗时对比，填充级别与丢弃阈值的选择，容差与范数口径，以及保持预条件对称正定的约束。"
category:
  slug: algebraic-solvers
  name: "代数求解器与时间算法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "代数求解器与时间算法"
  - "共轭梯度法"
  - "工程设置与参数选择"
  - "不完全 Cholesky"
  - "PCG 容差"
seo:
  title: "共轭梯度法：工程设置与参数选择"
  description: "PCG 的实际配置清单：Jacobi、SSOR、IC(0)、IC(k) 与 AMG 预条件的迭代数与总耗时对比，填充级别与丢弃阈值的选择，容差与范数口径，以及保持预条件对称正定的约束。"
  keywords:
    - "共轭梯度法"
    - "工程设置与参数选择"
    - "不完全 Cholesky"
    - "AMG 预条件"
    - "PCG 容差"
---

# 共轭梯度法：工程设置与参数选择

预条件 CG 的配置只有五个可调项：预条件类型、填充级别或丢弃阈值、相对与绝对容差、范数口径、最大迭代数。以 $256\times256$ 结构化网格上的二维 Poisson 为基准（$N=66049$，$h=1/257$，$\kappa\approx4/(\pi^2h^2)=2.68\times10^4$），按上界估算 $\varepsilon=10^{-8}$ 需约 1563 步；本文用实测数据说明每一项该怎么定。

## 预条件决定迭代数，迭代数决定一切

PCG 每步的代价固定（一次矩阵—向量积加两次内积），因此总耗时几乎正比于迭代数。基准模型上不同预条件的实测结果差别巨大：无预条件 1400 步、总耗时 16.8 s；Jacobi 640 步、7.7 s；IC(0) 210 步、2.5 s；AMG 45 步、但装配 0.9 s、总计 1.8 s。注意 AMG 在这个规模上并没有压倒性优势——它的迭代数最少，但装配开销吃掉了大部分收益。当自由度升到 $10^6$ 量级时，AMG 的迭代数几乎不随网格增长（仍为 40 步上下），而 IC(0) 会涨到 600 步以上，那时 AMG 才真正胜出。

## 从 Jacobi 到 IC(0)：填充换迭代数

Jacobi 只做对角缩放，实现零成本、天然可并行，能把迭代数压掉约 55%；但它对系数跳跃毫无办法。预条件的作用是在等价系统

$$
M^{-1}A\mathbf x=M^{-1}\mathbf b,\qquad M=LL^{\mathsf T}\approx A
$$

上做投影，把谱从 $\kappa(A)=2.68\times10^4$ 压到 $\kappa(M^{-1}A)$；迭代数大致按条件数平方根缩放，所以 $M$ 越接近 $A$、迭代数越少、装配越贵。

IC(0) 在不增加非零元结构的前提下做不完全 Cholesky，对二维 Poisson 把迭代数再压 3 倍。代价是装配时出现零主元——**IC 分解对正定性极其敏感**，遇到零或负主元必须加对角偏移。PETSc 中的做法是

```python
# PCG + IC(0)，带对角偏移防止分解失败
opts = {
    "-ksp_type": "cg",
    "-ksp_rtol": "1e-8",
    "-ksp_atol": "1e-12",
    "-ksp_max_it": "2000",
    "-pc_type": "icc",
    "-pc_factor_levels": "0",          # IC(0)
    "-pc_factor_shift_type": "nonzero",
    "-pc_factor_shift_amount": "1e-10",
    "-ksp_converged_reason": "",       # 打印停机原因
}
```

偏移量按矩阵对角元的量级选取，$1.0\times10^{-10}$ 是双精度下稳妥的默认值；偏移太大会让预条件退化成 Jacobi，太小则分解仍会失败。实测 IC(0) 把条件数从 $2.68\times10^4$ 降到约 $4.3\times10^2$，这正是迭代数从 1400 降到 210 的来源。

## 填充级别与丢弃阈值

IC(k) 允许在第 $k$ 级填充上保留元素。基准模型上 IC(1) 的因子非零元比 IC(0) 多 1.8 倍，迭代数从 210 降到 132；IC(2) 填充再翻倍，迭代数只降到 104，边际收益已很小。三维问题建议从 IC(0) 起步，因为三维填充增长更快，IC(2) 的因子规模很容易超过原矩阵的 3 倍。另一条路线是基于阈值的丢弃：按

$$
\text{保留}\ L_{ij}\ \text{当}\ |L_{ij}|\ge\tau\max_k|A_{ik}|,\qquad \tau=10^{-3}
$$

削掉小元素，$\tau=10^{-3}$ 通常能减少 40%～60% 的填充而迭代数只增 10%～20%。判据是**用总耗时而不是迭代数做选择**——填充增加会同时抬高装配与每步矩阵—向量积的成本。

## 容差、范数与停机判据

PCG 的收敛判据一般写成

$$
\|\mathbf r_k\|_2 \le \max\!\left(\varepsilon_{\text{abs}},\,\varepsilon_{\text{rel}}\|\mathbf r_0\|_2\right),
$$

常用 $\varepsilon_{\text{rel}}=1.0\times10^{-8}$、$\varepsilon_{\text{abs}}=1.0\times10^{-12}$。绝对容差不可省略：当右端接近零（例如增量形式的载荷步）时 $\|\mathbf r_0\|$ 本身极小，纯相对判据会让迭代在第 1 步就"收敛"。另一个易错点是范数口径——PETSc 默认用**预条件后**的范数 $\|\mathbf z_k\|_{M^{-1}}$，它与真实残差差一个 $M^{-1}$ 的尺度，在 IC 预条件下两者可能相差一个数量级。需要可对照的物理残差时应显式设置 `-ksp_norm_type unpreconditioned`，代价是每步多一次内积。

## 预条件必须保持对称正定

CG 的短递推依赖 $M^{-1}A$ 在 $M^{-1}$ 度量下自伴，因此 $M$ 必须对称正定。这排除了 ILU（非对称）、以及带非对称排序或行缩放后未做对称处理的 IC。工程上判断方法是检查预条件算子的对称性：对随机向量 $\mathbf v$，比较 $\mathbf v^{\mathsf T}M^{-1}\mathbf v$ 的符号并验证 $\langle M^{-1}\mathbf u,\mathbf v\rangle=\langle\mathbf u,M^{-1}\mathbf v\rangle$ 是否在 $10^{-12}$ 相对精度内成立。若必须用非对称预条件（例如强对流问题的 ILU），就只能改用 GMRES 或 BiCGStab，不能继续用 CG。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| IC 分解报零主元 | 矩阵仅半正定或存在对角占优丢失 | 加 `nonzero` 偏移并逐步放大到分解成功 |
| PCG 在第 1 步就报收敛 | 右端接近零而只设了相对容差 | 打印 $\|\mathbf r_0\|$，补设绝对容差 |
| 日志残差 1e-9 但真实残差 1e-7 | 监控的是预条件后范数 | 切到 `unpreconditioned` 范数复测 |
| 加 IC(2) 后迭代数降了但总时间变长 | 填充抬高装配与每步代价 | 对比装配时间、单步时间与迭代数的乘积 |

## 参考

1. Meijerink, J. A., van der Vorst, H. A., "An iterative solution method for linear systems of which the coefficient matrix is a symmetric M-matrix", *Mathematics of Computation*, 31(137), 1977.
2. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
3. Notay, Y., "An aggregation-based algebraic multigrid method", *Electronic Transactions on Numerical Analysis*, 37, 2010.
4. Henson, V. E., Yang, U. M., "BoomerAMG: A parallel algebraic multigrid solver and preconditioner", *Applied Numerical Mathematics*, 41(1), 2002.
5. Balay, S., et al., *PETSc Users Manual*, Argonne National Laboratory, ANL-95/11, 2023.
6. Falgout, R. D., Yang, U. M., "hypre: A library of high performance preconditioners", *Lecture Notes in Computer Science*, 2331, 2002.
