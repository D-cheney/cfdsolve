---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-sparse-direct-modeling
title: "稀疏直接法：算法原理与适用范围"
summary: "从消去树与填充模型解释稀疏 Cholesky/LU 的复杂度标度，比较嵌套剖分、AMD 与 RCM 的填充差异，给出主元稳定性与内存预算的定量门槛，判断百万自由度级 CAE 模型何时必须转向迭代法。"
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
  - "稀疏直接法"
  - "算法原理与适用范围"
  - "填充与消去树"
  - "嵌套剖分"
seo:
  title: "稀疏直接法：算法原理与适用范围"
  description: "从消去树与填充模型解释稀疏 Cholesky/LU 的复杂度标度，比较嵌套剖分、AMD 与 RCM 的填充差异，给出主元稳定性与内存预算的定量门槛，判断百万自由度级 CAE 模型何时必须转向迭代法。"
  keywords:
    - "稀疏直接法"
    - "算法原理与适用范围"
    - "填充"
    - "嵌套剖分"
    - "消去树"
---

# 稀疏直接法：算法原理与适用范围

稀疏直接法对 $A$ 做一次三角分解后重复回代，精度可预测、无需调预条件，是 10 万自由度以下二维模型和 3 维中等规模模型最稳的选择。它的成本不由矩阵原有非零元个数决定，而由消去过程中**新生成**的填充元决定，所以"矩阵很稀疏"绝不等于"分解很便宜"。本文用消去树与嵌套剖分的标度律说明这一机制，并给出判断直接法是否还划算的定量门槛。

## 消去过程为什么必然制造新非零元

对对称正定矩阵做 Cholesky 分解

$$
A = LL^{\mathsf T},
$$

第 $k$ 步消去时，若 $k$ 在剩余图中有 $d_k$ 个邻居，这些邻居两两之间会被补上一条边。单步新增的填充数为

$$
\text{fill}_k = \frac{d_k(d_k-1)}{2},
$$

因此填充量取决于**消去顺序**而非原始稀疏结构：先消去度数小的顶点能压低 $\sum d_k^2$，这正是最小度排序的全部动机。消去顺序也自然构成一棵消去树，父子关系对应"谁在谁的团里被消掉"，它决定了后续的并行划分粒度。

## 复杂度标度：嵌套剖分与带状分解的差距

对 $d$ 维规则网格上的 $N$ 个未知量，嵌套剖分（nested dissection）给出

$$
\text{flops}_{3D} = O(N^2),\qquad \mathrm{nnz}(L) = O(N^{4/3}),
$$

二维情形则是 $O(N^{3/2})$ 次浮点运算与 $O(N\log N)$ 个非零元。作为对照，带状分解的代价是 $N b^2$，其中 $b$ 为带宽。取 $64^3=2.62\times10^5$ 个自由度的三维立方网格：嵌套剖分约需 $6.9\times10^{10}$ 次浮点运算；RCM 排序后带宽约 $64^2=4096$，带状分解需要 $2.62\times10^5\times4096^2\approx4.4\times10^{12}$ 次运算，慢了约 64 倍。这就是三维问题几乎只用嵌套剖分或 AMD、而带状求解器只出现在一维和细长二维结构上的原因。

## 排序算法的选择逻辑

工程上只有三条路线：**AMD/COLAMD**（近似最小度，快、对不规则网格稳健）、**METIS 嵌套剖分**（三维规则网格最优，天然适合并行）、**RCM**（只压带宽，内存连续但填充不优）。三维结构件在 100 万自由度时，AMD 的因子非零元通常比 METIS 多 30%～80%，而 METIS 的分隔子会带来更多零填充块、BLAS-3 效率更高。判据很直接：若分解时间中 BLAS 占比低于 50%，说明排序产生了过多不规则填充，应换 METIS。

## 主元策略与前后向误差

非对称或不定矩阵必须做 LU 并选主元。部分选主元把消去过程中的增长因子限制在

$$
\|b-A\hat x\| \le c(n)\,\rho_{\text{growth}}\,\epsilon_{\text{mach}}\,\|A\|\,\|\hat x\|,
$$

其中 $\epsilon_{\text{mach}}=2.22\times10^{-16}$（双精度），$\rho_{\text{growth}}$ 是增长因子。前向误差再被条件数放大：三维 Poisson 在 $h=0.01$ 时 $\kappa(A)\approx4\times10^4$，$N=10^6$ 且 $\rho_{\text{growth}}=10$ 时后向误差约 $10^6\times2.22\times10^{-16}\times10=2.2\times10^{-9}$，前向误差上界约 $4\times10^4\times2.2\times10^{-9}=8.8\times10^{-5}$。这解释了为什么"残差 1e-12"与"解准确到 1e-5"可以同时成立——两者差了一个条件数。若要求更高精度，做一轮混合精度迭代精化（残差用四倍精度算、修正用双精度）可把前向误差拉回 $O(\epsilon_{\text{mach}})$。

## 内存预算与多右端复用

因子存储量为 $\mathrm{nnz}(L)$ 个非零元，每个占 8 字节数值加 4 字节行号，即约 12 字节。三维 100 万自由度 Poisson 的 $\mathrm{nnz}(L)\approx10^8$，因子占 $1.12\ \mathrm{GB}$，加上原矩阵、工作区和多线程缓冲，进程常驻内存应预留 $3\ \mathrm{GB}$ 以上。直接法真正的优势在多右端：分解完成后每个新右端只需两次三角回代，代价为 $2\,\mathrm{nnz}(L)\approx2\times10^8$ 次运算，在 10 GFLOP/s 的有效算力下约 $0.02\ \mathrm{s}$；而分解本身是 $10^{12}$ 次运算、约 $100\ \mathrm{s}$。也就是说，当同一矩阵要解 20 个以上右端（多载荷步、多频点、多组分）时，直接法的均摊成本会迅速低于迭代法。

```python
def budget(n):
    """三维规则网格嵌套剖分标度: nnz(L) ~ 100 N, flops ~ N^2"""
    nnz_L = 1.0e2 * n
    mem_gb = nnz_L * 12.0 / 1024**3   # 8 字节数值 + 4 字节行号
    flops = 1.0 * n**2
    return nnz_L, mem_gb, flops

for n in (1.0e5, 1.0e6, 4.0e6):
    nnz_L, gb, fl = budget(n)
    print(f"N={n:.1e}  nnz(L)={nnz_L:.1e}  "
          f"mem={gb:.2f} GB  flops={fl:.1e}")
# N=1.0e+05  nnz(L)=1.0e+07  mem=0.11 GB  flops=1.0e+10
# N=1.0e+06  nnz(L)=1.0e+08  mem=1.12 GB  flops=1.0e+12
# N=4.0e+06  nnz(L)=4.0e+08  mem=4.47 GB  flops=1.6e+13
```

代入 400 万自由度可以看到因子需要 $4.47\ \mathrm{GB}$，已逼近 8 GB 容器的可用上限，而分解运算量升到 $1.6\times10^{13}$ 次——这正是三条硬门槛中第一条的由来。

## 何时必须放弃直接法

三条硬门槛同时成立时应切换到 Krylov + AMG 或并行直接法：三维自由度超过 $2\times10^6$（因子预计超过 $3\ \mathrm{GB}$，单节点难容纳）；条件数超过 $10^{10}$ 且矩阵接近奇异（选主元会显著增加填充，静态主元又会损失精度）；或者同一时间步内需要求解超过 50 次、每次矩阵都变化（分解无法复用）。反过来，只要自由度低于 $5\times10^5$、矩阵结构固定且右端多，直接法几乎总是比迭代法省心。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 分解阶段内存耗尽，但矩阵本身只有 200 MB | 填充把因子放大到原矩阵的 10 倍以上 | 用 METIS 只做符号分析，先打印 $\mathrm{nnz}(L)$ 估计 |
| 残差降到 1e-12，解与迭代法差 1e-4 | 条件数把后向误差放大 | 对比 $\kappa(A)$ 与前向误差乘积，做一次迭代精化 |
| 换排序后填充减少但总时间反而变长 | 不规则填充破坏 BLAS-3 分块 | 记录分解阶段 GFLOPS 与 BLAS 占比 |
| 非对称问题分解成功但解发散的物理量 | 静态主元跳过了必要的行交换 | 打开部分选主元阈值（如 0.1），比较增长因子 |

## 参考

1. Davis, T. A., *Direct Methods for Sparse Linear Systems*, SIAM, 2006.
2. Duff, I. S., Erisman, A. M., Reid, J. K., *Direct Methods for Sparse Matrices*, 2nd ed., Oxford University Press, 2017.
3. George, A., "Nested dissection of a regular finite element mesh", *SIAM Journal on Numerical Analysis*, 1973.
4. Amestoy, P. R., Duff, I. S., L'Excellent, J.-Y., Koster, J., "A fully asynchronous multifrontal solver using distributed dynamic scheduling", *SIAM Journal on Matrix Analysis and Applications*, 2001.
5. Li, X. S., "An overview of SuperLU: Algorithms, implementation, and user interface", *ACM Transactions on Mathematical Software*, 2005.
6. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
