---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-gmres-engineering-setup
title: "GMRES 与重启：工程设置与参数选择"
summary: "GMRES 落地配置：重启长度 m 在迭代数与正交化代价之间的折中、左/右预条件对残差口径的影响、何时必须改用 FGMRES、正交化变体选择，以及停机与断点保护的实际取值。"
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
  - "GMRES 与重启"
  - "工程设置与参数选择"
  - "FGMRES"
  - "重启长度"
seo:
  title: "GMRES 与重启：工程设置与参数选择"
  description: "GMRES 落地配置：重启长度 m 在迭代数与正交化代价之间的折中、左/右预条件对残差口径的影响、何时必须改用 FGMRES、正交化变体选择，以及停机与断点保护的实际取值。"
  keywords:
    - "GMRES 与重启"
    - "工程设置与参数选择"
    - "FGMRES"
    - "重启长度"
    - "右预条件"
---

# GMRES 与重启：工程设置与参数选择

GMRES 的配置项不多，但每一项都可能决定成败：重启长度决定内存与正交化开销，预条件作用侧决定残差口径，正交化变体决定数值稳定性，预条件是否恒定决定能不能继续用 GMRES 而不换 FGMRES。以下数据来自一个三维对流—扩散模型（$n=1.2\times10^6$，每行平均 7 个非零元，格点 Peclet 数约 8），预条件为 ILU(1)。

## 重启长度是唯一需要调的核心参数

$m$ 同时影响三件事：内存、每周期正交化代价、以及能覆盖的谱信息量。三者可以写成

$$
M_{\text{mem}}=8(m+1)n\ \text{字节},\qquad
\frac{T_{\text{orth}}}{T_{\text{matvec}}}\approx\frac{m}{2\bar d},
$$

其中 $\bar d$ 为每行平均非零元个数（本模型 $\bar d=7$，故 $m=50$ 时比值约 3.57）。实测三档配置：

| $m$ | 内存 | 迭代数 | 墙钟时间 |
|---|---|---|---|
| 30 | 294 MB | 412 | 21.7 s |
| 50 | 490 MB | 235 | 16.4 s |
| 100 | 980 MB | 158 | 20.1 s |

$m=100$ 的迭代数最少，总时间却比 $m=50$ 长 23%，因为正交化的 $nm^2$ 项开始主导。**结论是把 $m$ 调到"迭代数不再明显下降"的拐点即可，不要追求最少迭代数。** 稀疏度更差（每行非零元少）的矩阵应取更小的 $m$，因为正交化与矩阵—向量积的代价比随稀疏度变差而上升。

## 左预条件与右预条件的区别

右预条件与左预条件求解的系统分别是

$$
\text{右: }AM^{-1}\mathbf y=\mathbf b,\qquad
\text{左: }M^{-1}A\mathbf x=M^{-1}\mathbf b .
$$

右预条件最小化的仍是真实残差 $\|\mathbf b-A\mathbf x_m\|$；左预条件最小化的是**预条件残差** $\|M^{-1}(\mathbf b-A\mathbf x_m)\|$，两者可以差一个数量级。PETSc 中 GMRES 默认使用右预条件，正是因为它的收敛判据与物理残差一致。若出于诊断目的需要看预条件残差，可以显式切到左预条件，但必须记住此时日志里的残差不能直接当作物理量守恒误差。

## FGMRES：预条件每次都在变时必须用它

GMRES 的 Arnoldi 关系 $AV_m=V_{m+1}\bar H_m$ 隐含假设预条件算子在 $m$ 步内保持不变。一旦预条件在周期内被重建——例如每步重算 AMG 层级、每步换 ILU 排序、或用 Krylov 法本身做内层预条件——这一假设被破坏，GMRES 会给出错误的正交基并静默收敛到错的解。此时必须换 FGMRES，它额外保存预条件后的向量 $Z_m=M^{-1}V_m$，把基的正交性与预条件解耦，代价是多一份 $O(nm)$ 存储。判断规则很简单：**只要预条件在迭代过程中有任何一步不是同一个算子，就用 FGMRES。**

## 正交化与重正交

经典 Gram–Schmidt（CGS）与改进 Gram–Schmidt（MGS）的浮点运算量相同，但 CGS 在基向量接近线性相关时损失正交性，表现为残差估计值比真实残差低几个数量级——即"假收敛"。实测在 $m=100$、条件数 $1.0\times10^8$ 量级的模型上，CGS 报告残差 $4.0\times10^{-9}$ 而真实残差为 $2.0\times10^{-5}$，相差四个数量级。PETSc 中打开 `-ksp_gmres_modifiedgramschmidt` 可切到 MGS，开销为零；若问题更病态，可再启用完整重正交，代价是正交化时间翻倍，但能把正交性维持在 $10^{-14}$ 量级。

## 停机、发散与断点

停机判据应同时给相对与绝对两档：`-ksp_rtol 1e-8` 与 `-ksp_atol 1e-11`。此外必须设置发散容差 `-ksp_divtol 1e5`，否则残差在发散时会一直涨到溢出。断点（breakdown）有两种：Arnoldi 过程中 $\mathbf v_{k+1}$ 范数接近零属于 happy breakdown，此时当前解已是精确解，应当接受；Hessenberg 矩阵奇异则属于严重断点，通常由预条件算子退化引起，应重建预条件。

```python
# GMRES(50) + ILU(1) 右预条件，三维对流—扩散模型
opts = {
    "-ksp_type": "gmres",
    "-ksp_gmres_restart": "50",
    "-ksp_gmres_modifiedgramschmidt": "",   # 防假收敛
    "-ksp_rtol": "1e-8",
    "-ksp_atol": "1e-11",
    "-ksp_divtol": "1e5",
    "-ksp_pc_side": "right",                # 最小化真实残差
    "-pc_type": "ilu",
    "-pc_factor_levels": "1",
    "-pc_factor_drop_tolerance": "1e-4",
    "-ksp_monitor_true_residual": "",       # 打印真实残差
}
```

## 参数表与对照记录

固定网格、物性与预条件，每次只改一项：$m\in\{30,50,100\}$、预条件作用侧、CGS/MGS、ILU 填充级别 0/1/2。记录字段应包括：迭代数、总时间、正交化时间占比、每周期重启点残差跳变幅度、以及真实残差与递推残差的最终比值。ILU(1) 相对 ILU(0) 把迭代数从 520 降到 235、填充比从 1.0 升到 2.4，装配时间从 0.9 s 涨到 2.6 s；在 235 步的规模下这笔装配开销值得付。最后一列必须写真实残差，因为 GMRES 的递推残差在 MGS 缺失时会低估误差。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 日志残差 $10^{-9}$ 但物理量守恒误差 $10^{-4}$ | CGS 损失正交性或用了左预条件 | 打开 MGS，并打印真实残差对比 |
| 重启点残差每次抬高 20% | $m$ 过小，谱信息不足 | 把 $m$ 从 30 提到 80，观察跳变是否消失 |
| 换用自适应 AMG 后解完全错误 | 预条件在周期内变化，违反 GMRES 假设 | 切到 FGMRES 后复测同一配置 |
| 残差单调上升到 $10^{6}$ 才停下 | 未设发散容差 | 加 `-ksp_divtol 1e5` 让求解器及时中止 |

## 参考

1. Saad, Y., Schultz, M. H., "GMRES: A generalized minimal residual algorithm for solving nonsymmetric linear systems", *SIAM Journal on Scientific and Statistical Computing*, 7(3), 1986.
2. Saad, Y., "A flexible inner-outer preconditioned GMRES algorithm", *SIAM Journal on Scientific Computing*, 14(2), 1993.
3. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
4. Simoncini, V., Szyld, D. B., "Recent computational developments in Krylov subspace methods for linear systems", *Numerical Linear Algebra with Applications*, 14(1), 2007.
5. Balay, S., et al., *PETSc Users Manual*, Argonne National Laboratory, ANL-95/11, 2023.
6. Paige, C. C., Saunders, M. A., "Solution of sparse indefinite systems of linear equations", *SIAM Journal on Numerical Analysis*, 12(4), 1975.
