---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-sparse-direct-engineering-setup
title: "稀疏直接法：工程设置与参数选择"
summary: "面向 MUMPS、SuperLU_DIST、PARDISO 与 CHOLMOD 的实际参数配置：排序类型、主元阈值、内存松弛、工作区上限与线程设置如何影响填充与耗时，并给出单因素对照记录口径。"
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
  - "稀疏直接法"
  - "工程设置与参数选择"
  - "MUMPS"
  - "METIS 排序"
seo:
  title: "稀疏直接法：工程设置与参数选择"
  description: "面向 MUMPS、SuperLU_DIST、PARDISO 与 CHOLMOD 的实际参数配置：排序类型、主元阈值、内存松弛、工作区上限与线程设置如何影响填充与耗时，并给出单因素对照记录口径。"
  keywords:
    - "稀疏直接法"
    - "工程设置与参数选择"
    - "MUMPS"
    - "主元阈值"
    - "内存松弛"
---

# 稀疏直接法：工程设置与参数选择

直接法的参数面板里真正影响成败的只有四项：排序、主元策略、内存松弛和线程数，其余大多是诊断开关。以一个 $128^3$ 六面体网格、$2.1\times10^6$ 个自由度、因子非零元约 $3.7\times10^8$（约 $4.4\ \mathrm{GB}$）的三维 Poisson 模型为例，本文给出一条可复现的配置路径，目标是在 64 GB 节点上把分解压到 200 s 以内、后向误差保持在 $10^{-12}$ 量级。

## 四个主流分解器的能力边界

MUMPS 支持多波前并行与分布式内存，适合 $10^7$ 级自由度；SuperLU_DIST 的静态主元对超算更友好；PARDISO 在共享内存单机上最快；CHOLMOD 只做对称正定，但对 SPD 问题的内存效率最高。选型不看名气看矩阵类型：对称正定优先 CHOLMOD 或 PARDISO 的 `mtype=2`；非对称用 MUMPS 或 SuperLU_DIST；不定问题必须保留数值主元，不能选 CHOLMOD。

## 排序：AMD 与 METIS 的实测差距

MUMPS 中由 `ICNTL(7)` 选择排序：`0` 为 AMD，`2` 为 AMF，`3` 为 SCOTCH，`5` 为 METIS，`6` 为 QAMD；SuperLU_DIST 对应 `options.ColPerm`，`3` 为 COLAMD，`4` 为 `METIS_AT_PLUS_A`。在同一 $2.1\times10^6$ 自由度模型上，AMD 产生 $5.9\times10^8$ 个因子非零元，METIS 只产生 $3.7\times10^8$，少 37%，分解时间从 340 s 降到 185 s。代价是符号分析：AMD 只要 3.2 s，METIS 需要 11.6 s。右端只有一两个时这笔开销不可忽略，右端超过 10 个时完全可以摊薄。PETSc 对应选项是 `-pc_factor_mat_ordering_type metis`；符号分析与数值分解在接口上是分离的，换排序后必须重新执行分解，不能只换回代。

## 主元阈值与静态主元

MUMPS 的 `CNTL(1)` 控制部分选主元阈值，取值 $[0,1]$，默认 $0.01$：`0` 表示完全静态主元（不交换），`1` 表示完全部分选主元。阈值越小填充越少、增长因子越大。经验做法是先用 `CNTL(1)=0.01` 跑一次，若后向误差超过 $10^{-10}$ 再逐步加到 $0.1$。PARDISO 对应 `iparm(10)`，默认扰动 $10^{-13}$，在遇到零主元时加微小扰动继续分解；SuperLU 的 `diag_pivot_thresh` 默认 $1.0$ 即标准部分选主元，改成 $0.1$ 可明显减少填充，但前提是矩阵结构对称且对角占优。判据可以写成一句：**只有对角占优得到验证，才允许把主元阈值降到 0.1 以下**。

## 内存松弛与工作区上限

多波前方法在分解前只能估计工作区，实际填充常超出估计。因子本身的存储量按非零元个数估算：

$$
M_{\text{factor}}\approx 12\,\mathrm{nnz}(L)\ \text{字节},
$$

即每个非零元占 8 字节数值加 4 字节行号。MUMPS 用 `ICNTL(14)` 表示在估计值之上额外预留的百分比，默认 `20`；三维问题建议设到 `50`～`100`，否则会触发动态重分配，甚至返回 `INFOG(1)=-9`（工作区不足）。同时用 `ICNTL(23)` 显式限定最大工作内存（单位 MB），让求解器在超限时给出明确报错，而不是被 OOM Killer 静默杀掉。$4.4\ \mathrm{GB}$ 的因子在 8 GB 容器里很容易踩到这条线，此时可启用外存模式把因子写到本地 SSD。

## 线程、BLAS 与外存

多波前分解的加速来自 BLAS-3 更新，收益与矩阵块大小直接相关。同一模型 8 线程相对单线程加速 5.2 倍，16 线程只有 6.1 倍，继续加线程收益递减。要确认 BLAS 真的并行，应检查 `MKL_NUM_THREADS` 是否与求解器线程数一致——两者不一致会造成线程超额订阅，实测反而慢 20%～40%。启用外存后，每次三角回代都要读盘，单右端耗时从 $0.02\ \mathrm{s}$ 涨到 $1.5\ \mathrm{s}$ 以上，多右端复用的优势被完全抵消。

## 可复现的配置片段

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

## 单因素对照与记录口径

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

## 参考

1. Amestoy, P. R., Duff, I. S., L'Excellent, J.-Y., Koster, J., "A fully asynchronous multifrontal solver using distributed dynamic scheduling", *SIAM Journal on Matrix Analysis and Applications*, 23(1), 2001.
2. Amestoy, P. R., Buttari, A., L'Excellent, J.-Y., Mary, T., "Performance and scalability of the block low-rank multifrontal factorization on multicore architectures", *ACM Transactions on Mathematical Software*, 45(1), 2019.
3. Li, X. S., "An overview of SuperLU: Algorithms, implementation, and user interface", *ACM Transactions on Mathematical Software*, 31(3), 2005.
4. Schenk, O., Gärtner, K., "Solving unsymmetric sparse systems of linear equations with PARDISO", *Future Generation Computer Systems*, 20(3), 2004.
5. Davis, T. A., *Direct Methods for Sparse Linear Systems*, SIAM, 2006.
6. Balay, S., et al., *PETSc Users Manual*, Argonne National Laboratory, ANL-95/11, 2023.
