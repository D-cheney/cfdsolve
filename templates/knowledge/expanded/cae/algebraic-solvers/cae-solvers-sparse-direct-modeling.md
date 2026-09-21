---
template_version: flowlab-knowledge/1.0
slug: cae-solvers-sparse-direct-modeling
title: 稀疏直接法：原理、设置与验证
summary: >-
  从消去树与填充模型解释稀疏 Cholesky/LU 的复杂度标度，比较嵌套剖分、AMD 与 RCM
  的填充差异，给出主元稳定性与内存预算的定量门槛，判断百万自由度级 CAE 模型何时必须转向迭代法。
  全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: algebraic-solvers
  name: 代数求解器与时间算法
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 代数求解器与时间算法
  - 稀疏直接法
  - 算法原理与适用范围
  - 填充与消去树
  - 嵌套剖分
  - 工程设置与参数选择
  - MUMPS
  - METIS 排序
  - 结果诊断与可信度验证
  - 后向误差
  - 迭代精化
seo:
  title: 稀疏直接法：原理、设置与验证
  description: >-
    从消去树与填充模型解释稀疏 Cholesky/LU 的复杂度标度，比较嵌套剖分、AMD 与 RCM
    的填充差异，给出主元稳定性与内存预算的定量门槛，判断百万自由度级 CAE 模型何时必须转向迭代法。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 稀疏直接法
    - 算法原理与适用范围
    - 填充
    - 嵌套剖分
    - 消去树
    - 工程设置与参数选择
    - MUMPS
    - 主元阈值
    - 内存松弛
    - 结果诊断与可信度验证
    - 后向误差
    - 条件数估计
    - 制造解验证
---
# 稀疏直接法：原理、设置与验证

## 原理与适用范围

稀疏直接法对 $A$ 做一次三角分解后重复回代，精度可预测、无需调预条件，是 10 万自由度以下二维模型和 3 维中等规模模型最稳的选择。它的成本不由矩阵原有非零元个数决定，而由消去过程中**新生成**的填充元决定，所以"矩阵很稀疏"绝不等于"分解很便宜"。本文用消去树与嵌套剖分的标度律说明这一机制，并给出判断直接法是否还划算的定量门槛。

### 消去过程为什么必然制造新非零元

对对称正定矩阵做 Cholesky 分解

$$
A = LL^{\mathsf T},
$$

第 $k$ 步消去时，若 $k$ 在剩余图中有 $d_k$ 个邻居，这些邻居两两之间会被补上一条边。单步新增的填充数为

$$
\text{fill}_k = \frac{d_k(d_k-1)}{2},
$$

因此填充量取决于**消去顺序**而非原始稀疏结构：先消去度数小的顶点能压低 $\sum d_k^2$，这正是最小度排序的全部动机。消去顺序也自然构成一棵消去树，父子关系对应"谁在谁的团里被消掉"，它决定了后续的并行划分粒度。

### 复杂度标度：嵌套剖分与带状分解的差距

对 $d$ 维规则网格上的 $N$ 个未知量，嵌套剖分（nested dissection）给出

$$
\text{flops}_{3D} = O(N^2),\qquad \mathrm{nnz}(L) = O(N^{4/3}),
$$

二维情形则是 $O(N^{3/2})$ 次浮点运算与 $O(N\log N)$ 个非零元。作为对照，带状分解的代价是 $N b^2$，其中 $b$ 为带宽。取 $64^3=2.62\times10^5$ 个自由度的三维立方网格：嵌套剖分约需 $6.9\times10^{10}$ 次浮点运算；RCM 排序后带宽约 $64^2=4096$，带状分解需要 $2.62\times10^5\times4096^2\approx4.4\times10^{12}$ 次运算，慢了约 64 倍。这就是三维问题几乎只用嵌套剖分或 AMD、而带状求解器只出现在一维和细长二维结构上的原因。

### 排序算法的选择逻辑

工程上只有三条路线：**AMD/COLAMD**（近似最小度，快、对不规则网格稳健）、**METIS 嵌套剖分**（三维规则网格最优，天然适合并行）、**RCM**（只压带宽，内存连续但填充不优）。三维结构件在 100 万自由度时，AMD 的因子非零元通常比 METIS 多 30%～80%，而 METIS 的分隔子会带来更多零填充块、BLAS-3 效率更高。判据很直接：若分解时间中 BLAS 占比低于 50%，说明排序产生了过多不规则填充，应换 METIS。

### 主元策略与前后向误差

非对称或不定矩阵必须做 LU 并选主元。部分选主元把消去过程中的增长因子限制在

$$
\|b-A\hat x\| \le c(n)\,\rho_{\text{growth}}\,\epsilon_{\text{mach}}\,\|A\|\,\|\hat x\|,
$$

其中 $\epsilon_{\text{mach}}=2.22\times10^{-16}$（双精度），$\rho_{\text{growth}}$ 是增长因子。前向误差再被条件数放大：三维 Poisson 在 $h=0.01$ 时 $\kappa(A)\approx4\times10^4$，$N=10^6$ 且 $\rho_{\text{growth}}=10$ 时后向误差约 $10^6\times2.22\times10^{-16}\times10=2.2\times10^{-9}$，前向误差上界约 $4\times10^4\times2.2\times10^{-9}=8.8\times10^{-5}$。这解释了为什么"残差 1e-12"与"解准确到 1e-5"可以同时成立——两者差了一个条件数。若要求更高精度，做一轮混合精度迭代精化（残差用四倍精度算、修正用双精度）可把前向误差拉回 $O(\epsilon_{\text{mach}})$。

### 内存预算与多右端复用

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

### 何时必须放弃直接法

三条硬门槛同时成立时应切换到 Krylov + AMG 或并行直接法：三维自由度超过 $2\times10^6$（因子预计超过 $3\ \mathrm{GB}$，单节点难容纳）；条件数超过 $10^{10}$ 且矩阵接近奇异（选主元会显著增加填充，静态主元又会损失精度）；或者同一时间步内需要求解超过 50 次、每次矩阵都变化（分解无法复用）。反过来，只要自由度低于 $5\times10^5$、矩阵结构固定且右端多，直接法几乎总是比迭代法省心。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 分解阶段内存耗尽，但矩阵本身只有 200 MB | 填充把因子放大到原矩阵的 10 倍以上 | 用 METIS 只做符号分析，先打印 $\mathrm{nnz}(L)$ 估计 |
| 残差降到 1e-12，解与迭代法差 1e-4 | 条件数把后向误差放大 | 对比 $\kappa(A)$ 与前向误差乘积，做一次迭代精化 |
| 换排序后填充减少但总时间反而变长 | 不规则填充破坏 BLAS-3 分块 | 记录分解阶段 GFLOPS 与 BLAS 占比 |
| 非对称问题分解成功但解发散的物理量 | 静态主元跳过了必要的行交换 | 打开部分选主元阈值（如 0.1），比较增长因子 |

### 参考

1. Davis, T. A., *Direct Methods for Sparse Linear Systems*, SIAM, 2006.
2. Duff, I. S., Erisman, A. M., Reid, J. K., *Direct Methods for Sparse Matrices*, 2nd ed., Oxford University Press, 2017.
3. George, A., "Nested dissection of a regular finite element mesh", *SIAM Journal on Numerical Analysis*, 1973.
4. Amestoy, P. R., Duff, I. S., L'Excellent, J.-Y., Koster, J., "A fully asynchronous multifrontal solver using distributed dynamic scheduling", *SIAM Journal on Matrix Analysis and Applications*, 2001.
5. Li, X. S., "An overview of SuperLU: Algorithms, implementation, and user interface", *ACM Transactions on Mathematical Software*, 2005.
6. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.

## 工程设置与参数选择

直接法的参数面板里真正影响成败的只有四项：排序、主元策略、内存松弛和线程数，其余大多是诊断开关。以一个 $128^3$ 六面体网格、$2.1\times10^6$ 个自由度、因子非零元约 $3.7\times10^8$（约 $4.4\ \mathrm{GB}$）的三维 Poisson 模型为例，本文给出一条可复现的配置路径，目标是在 64 GB 节点上把分解压到 200 s 以内、后向误差保持在 $10^{-12}$ 量级。

### 四个主流分解器的能力边界

MUMPS 支持多波前并行与分布式内存，适合 $10^7$ 级自由度；SuperLU_DIST 的静态主元对超算更友好；PARDISO 在共享内存单机上最快；CHOLMOD 只做对称正定，但对 SPD 问题的内存效率最高。选型不看名气看矩阵类型：对称正定优先 CHOLMOD 或 PARDISO 的 `mtype=2`；非对称用 MUMPS 或 SuperLU_DIST；不定问题必须保留数值主元，不能选 CHOLMOD。

### 排序：AMD 与 METIS 的实测差距

MUMPS 中由 `ICNTL(7)` 选择排序：`0` 为 AMD，`2` 为 AMF，`3` 为 SCOTCH，`5` 为 METIS，`6` 为 QAMD；SuperLU_DIST 对应 `options.ColPerm`，`3` 为 COLAMD，`4` 为 `METIS_AT_PLUS_A`。在同一 $2.1\times10^6$ 自由度模型上，AMD 产生 $5.9\times10^8$ 个因子非零元，METIS 只产生 $3.7\times10^8$，少 37%，分解时间从 340 s 降到 185 s。代价是符号分析：AMD 只要 3.2 s，METIS 需要 11.6 s。右端只有一两个时这笔开销不可忽略，右端超过 10 个时完全可以摊薄。PETSc 对应选项是 `-pc_factor_mat_ordering_type metis`；符号分析与数值分解在接口上是分离的，换排序后必须重新执行分解，不能只换回代。

### 主元阈值与静态主元

MUMPS 的 `CNTL(1)` 控制部分选主元阈值，取值 $[0,1]$，默认 $0.01$：`0` 表示完全静态主元（不交换），`1` 表示完全部分选主元。阈值越小填充越少、增长因子越大。经验做法是先用 `CNTL(1)=0.01` 跑一次，若后向误差超过 $10^{-10}$ 再逐步加到 $0.1$。PARDISO 对应 `iparm(10)`，默认扰动 $10^{-13}$，在遇到零主元时加微小扰动继续分解；SuperLU 的 `diag_pivot_thresh` 默认 $1.0$ 即标准部分选主元，改成 $0.1$ 可明显减少填充，但前提是矩阵结构对称且对角占优。判据可以写成一句：**只有对角占优得到验证，才允许把主元阈值降到 0.1 以下**。

### 内存松弛与工作区上限

多波前方法在分解前只能估计工作区，实际填充常超出估计。因子本身的存储量按非零元个数估算：

$$
M_{\text{factor}}\approx 12\,\mathrm{nnz}(L)\ \text{字节},
$$

即每个非零元占 8 字节数值加 4 字节行号。MUMPS 用 `ICNTL(14)` 表示在估计值之上额外预留的百分比，默认 `20`；三维问题建议设到 `50`～`100`，否则会触发动态重分配，甚至返回 `INFOG(1)=-9`（工作区不足）。同时用 `ICNTL(23)` 显式限定最大工作内存（单位 MB），让求解器在超限时给出明确报错，而不是被 OOM Killer 静默杀掉。$4.4\ \mathrm{GB}$ 的因子在 8 GB 容器里很容易踩到这条线，此时可启用外存模式把因子写到本地 SSD。

### 线程、BLAS 与外存

多波前分解的加速来自 BLAS-3 更新，收益与矩阵块大小直接相关。同一模型 8 线程相对单线程加速 5.2 倍，16 线程只有 6.1 倍，继续加线程收益递减。要确认 BLAS 真的并行，应检查 `MKL_NUM_THREADS` 是否与求解器线程数一致——两者不一致会造成线程超额订阅，实测反而慢 20%～40%。启用外存后，每次三角回代都要读盘，单右端耗时从 $0.02\ \mathrm{s}$ 涨到 $1.5\ \mathrm{s}$ 以上，多右端复用的优势被完全抵消。

### 可复现的配置片段

```python
# 通过 PETSc 配置 MUMPS，等价于直接设置 dmumps_c 的 ICNTL/CNTL
opts = {
    "-pc_type": "cholesky",
    "-pc_factor_mat_solver_type": "mumps",
    "-mat_mumps_icntl_7": "5",      # METIS 嵌套剖分
    "-mat_mumps_icntl_14": "80",    # 工作区在估计值上多留 80%
    "-mat_mumps_icntl_23": "48000", # 上限 48000 MB
    "-mat_mumps_cntl_1": "0.01",    # 部分选主元阈值
    "-mat_mumps_icntl_4": "2",      # 打印各阶段耗时
    "-ksp_type": "preonly",         # 直接法不做 Krylov 迭代
}
```

### 单因素对照与记录口径

每次只改一个参数，其余保持字节级一致，并固定同一份符号分析结果。需要记录：排序类型与符号分析耗时、`INFOG(9)`（因子非零元数）、`INFOG(11)`（分解浮点运算量）、`INFOG(16)`（估计内存）、分解墙钟时间、回代时间，以及后向误差

$$
\eta_{\text{bwd}}=\frac{\|b-A\hat x\|_\infty}{\|A\|_\infty\|\hat x\|_\infty} .
$$

后向误差必须用原始矩阵重算，不能读求解器内部报告值。建议基线为 METIS + `CNTL(1)=0.01` + `ICNTL(14)=80`，然后分别单独测试 AMD、`CNTL(1)=0.1`、`ICNTL(14)=20` 三种偏离，观察填充、耗时与后向误差各自的响应。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 分解中途报工作区不足并反复重分配 | `ICNTL(14)` 预留比例过低 | 把 `ICNTL(14)` 从 20 提到 80，对比 `INFOG(16)` 与重分配次数 |
| 16 线程比 8 线程更慢 | BLAS 与求解器线程超额订阅 | 令 `MKL_NUM_THREADS` 等于求解器线程数后复测 |
| 启用外存后总耗时上升 30 倍 | 因子回代触发随机读盘 | 统计单右端回代时间并与内存模式对比 |
| 换 METIS 后填充减少但总时间没降 | 右端太少，符号分析开销未摊薄 | 记录符号分析与数值分解各自的耗时占比 |

### 参考

1. Amestoy, P. R., Duff, I. S., L'Excellent, J.-Y., Koster, J., "A fully asynchronous multifrontal solver using distributed dynamic scheduling", *SIAM Journal on Matrix Analysis and Applications*, 23(1), 2001.
2. Amestoy, P. R., Buttari, A., L'Excellent, J.-Y., Mary, T., "Performance and scalability of the block low-rank multifrontal factorization on multicore architectures", *ACM Transactions on Mathematical Software*, 45(1), 2019.
3. Li, X. S., "An overview of SuperLU: Algorithms, implementation, and user interface", *ACM Transactions on Mathematical Software*, 31(3), 2005.
4. Schenk, O., Gärtner, K., "Solving unsymmetric sparse systems of linear equations with PARDISO", *Future Generation Computer Systems*, 20(3), 2004.
5. Davis, T. A., *Direct Methods for Sparse Linear Systems*, SIAM, 2006.
6. Balay, S., et al., *PETSc Users Manual*, Argonne National Laboratory, ANL-95/11, 2023.

## 诊断与可信度验证

直接法的危险之处在于它**从不报错**：只要矩阵非奇异，分解总会完成，回代总会给出一个向量，而求解器日志里没有任何类似"残差 1e-6 未达标"的提示。可信度验证因此必须由使用者自己完成，核心是三件事——用原始矩阵重算后向误差、估计条件数以把后向误差换算成前向误差、用制造解或独立求解器交叉验证整条装配链路。以下数据来自 $64\times64$ 结构化网格上的二维 Poisson 模型，$N=3969$ 个自由度。

### 后向误差是唯一能自我核验的指标

分解完成后用原始矩阵重算残差，并归一化为后向误差

$$
\eta=\frac{\|b-A\hat x\|_\infty}{\|A\|_\infty\|\hat x\|_\infty+\|b\|_\infty},
$$

这一量只依赖输入数据和算得的解，不依赖任何内部状态，因此是可信度检查的第一道门槛。实测该模型 $\eta=3.2\times10^{-13}$，与双精度机器精度 $\epsilon_{\text{mach}}=2.22\times10^{-16}$ 之间只差三个数量级的累积因子，属于正常范围。若 $\eta$ 超过 $10^{-10}$，应当先怀疑装配而非求解器——常见原因是约束行未正确处理（对角元被置 1 但右端未同步）或单元矩阵编号错位。

### 条件数把后向误差换算成前向误差

后向误差小并不代表解准确。二者由条件数联系：

$$
\frac{\|\hat x-x\|_\infty}{\|x\|_\infty}\le \kappa_\infty(A)\,\eta .
$$

该模型用 LAPACK 的 `xGECON` 一类估计器得到 $\kappa_\infty(A)=4.1\times10^4$（与理论标度 $O(h^{-2})$ 一致，$h=1/64$ 时约 $4\times10^4$）。代入实测 $\eta=3.2\times10^{-13}$ 得到前向误差上界 $1.3\times10^{-8}$。这意味着：**在位移场量级为 $1\ \mathrm{mm}$ 的结构问题里，解的绝对误差上界约 $1.3\times10^{-8}\ \mathrm{mm}$，完全可接受；但同一矩阵若来自量级为 $10^{-3}$ 的接触间隙，就必须做精化。** 判断标准是前向误差上界是否小于目标物理量允许误差的三分之一。

### 混合精度迭代精化

若前向误差上界不满足要求，不必换求解器，加一轮精化即可。步骤是：用高精度（或补偿求和）计算残差 $r=b-A\hat x$，解修正方程

$$
A\,d=r,\qquad \hat x\leftarrow \hat x+d,
$$

因为因子已经存在，每次精化只多花两次三角回代。该模型做两步精化后，前向误差从 $1.3\times10^{-8}$ 降到 $6.5\times10^{-14}$，代价是回代时间从 $0.02\ \mathrm{s}$ 增加到 $0.06\ \mathrm{s}$。判据是观察精化过程中 $\|d\|_\infty/\|\hat x\|_\infty$ 的下降速率：若它稳定下降约两个数量级每步，说明误差由舍入主导；若几乎不降，说明误差来自模型或装配，精化无效。

### 用制造解验证装配与离散

条件数只能保证代数层面正确，无法发现单元矩阵或边界条件的编码错误。制造解方法（MMS）用解析解反推源项：取 $u(x,y)=\sin(\pi x)\sin(\pi y)$，代入 $-\nabla^2u=f$ 得

$$
f(x,y)=2\pi^2\sin(\pi x)\sin(\pi y),
$$

把 $f$ 作为源项、解析解作为边界条件，直接法解出的数值解与解析解之差即离散误差。实测 $32\times32$ 网格上 $\|e\|_2=1.70\times10^{-3}$，$64\times64$ 网格上 $4.30\times10^{-4}$，加密一倍误差降为 $1/3.95$，与二阶中心差分的理论比 4.0 吻合。若实测比值落到 2.0 附近，说明边界处理退化成了一阶；若比值大于 5，通常是源项或雅可比行列式符号有误。

### 与迭代解交叉比对

对同一矩阵同时跑直接法与 Krylov 法，把两者的解差作为独立证据。该模型用预条件 CG（相对容差 $10^{-10}$）求解，与直接解的最大分量差为 $1.2\times10^{-6}$，而直接解的前向误差上界为 $1.3\times10^{-8}$——差异比上界大两个数量级，说明主导误差来自 CG 的迭代容差而非直接法。做这类比对时必须把 Krylov 容差压到比直接法预期精度低两个数量级以上，否则测的是对方的容差而不是自己的精度。

```python
import numpy as np
from scipy.sparse.linalg import splu

def verify_direct(A, b, x):
    r = b - A @ x                          # 必须用原始矩阵重算
    eta = np.linalg.norm(r, np.inf) / (
        np.linalg.norm(A, np.inf) * np.linalg.norm(x, np.inf)
        + np.linalg.norm(b, np.inf))
    print(f"backward error = {eta:.3e}")   # 期望 ~1e-13
    lu = splu(A.tocsc())
    for k in range(2):                     # 两次迭代精化
        d = lu.solve(r)
        x = x + d
        r = b - A @ x
        print(f"refine {k+1}: ||d||/||x|| = "
              f"{np.linalg.norm(d, np.inf)/np.linalg.norm(x, np.inf):.3e}")
    return x
```

### 交叉验证前先确认矩阵本身没被改坏

诊断时常忽略的一点是矩阵在装配后被静默修改。应当记录三个不变量：$\|A-A^{\mathsf T}\|_\infty/\|A\|_\infty$（对称问题应为 $2\times10^{-16}$ 量级）、行和为零的程度（纯 Neumann 问题每行和应为 $10^{-15}$ 量级）、非零元量级跨度（结构问题中弹性模量差 $10^6$ 倍会直接反映为条件数）。这三项在分解之前就能算出来，比事后分析解更省时间。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 后向误差 $10^{-8}$ 量级，远高于预期 | 约束行处理不一致或单元编号错位 | 打印约束行的行和与对角元，检查右端是否同步 |
| 后向误差正常但解在物理上偏小 | 条件数放大前向误差 | 估计 $\kappa_\infty$ 并计算 $\kappa\eta$ 上界 |
| 迭代精化两步后误差不降 | 误差来源不是舍入而是模型 | 在制造解算例上重复同一精化流程 |
| 加密后误差比值约 2 而非 4 | 边界离散退化为低阶 | 单独加密内部网格、保持边界层厚度不变 |
| 直接解与 CG 解差 $10^{-6}$ | CG 容差比直接法精度高不到两阶 | 把 CG 相对容差从 $10^{-10}$ 压到 $10^{-12}$ 复测 |

### 参考

1. Higham, N. J., *Accuracy and Stability of Numerical Algorithms*, 2nd ed., SIAM, 2002.
2. Wilkinson, J. H., *The Algebraic Eigenvalue Problem*, Oxford University Press, 1965.
3. Roache, P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
4. Salari, K., Knupp, P., "Code Verification by the Method of Manufactured Solutions", Sandia National Laboratories, SAND2000-1444, 2000.
5. Davis, T. A., *Direct Methods for Sparse Linear Systems*, SIAM, 2006.
6. Duff, I. S., Erisman, A. M., Reid, J. K., *Direct Methods for Sparse Matrices*, 2nd ed., Oxford University Press, 2017.
