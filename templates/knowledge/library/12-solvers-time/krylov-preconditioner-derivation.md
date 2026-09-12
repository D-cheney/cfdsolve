---
template_version: "flowlab-knowledge/1.0"
slug: krylov-preconditioner-derivation
title: Krylov 迭代与预条件：CG、GMRES 和残差判据推导
summary: 从投影条件推导共轭梯度与 Arnoldi-GMRES，解释左/右预条件、谱与条件数、停止准则以及 CAE 矩阵选型。
category:
  slug: algebraic-solvers
  name: 代数求解器与时间算法
level: 专题
reading_minutes: 34
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [Krylov, 共轭梯度, GMRES, 预条件, 线性求解器]
seo:
  title: Krylov、CG、GMRES 与预条件推导｜CFD菜鸟
  description: 从 Krylov 子空间投影推导 CG 和 GMRES，说明预条件与可靠残差判据。
  keywords: [CG推导, GMRES推导, Krylov, 预条件]
---

# Krylov 迭代与预条件：CG、GMRES 和残差判据推导

CAE 离散最终反复求解 $Ax=b$。迭代法从初值 $x_0$ 和残差 $r_0=b-Ax_0$ 出发，在 Krylov 子空间

$$
\mathcal K_m(A,r_0)=\mathrm{span}\{r_0,Ar_0,\ldots,A^{m-1}r_0\}
$$

中寻找 $x_m=x_0+z_m$。不同算法的核心差别是矩阵性质、子空间基与投影条件。

## 1. 共轭梯度 CG

当 $A=A^T>0$，解等价于最小化二次泛函

$$
J(x)=\frac12x^TAx-b^Tx,qquad \nabla J=Ax-b=-r.
$$

CG 构造 $A$-共轭方向 $p_i^TAp_j=0$。沿 $p_k$ 精确最小化：

$$
x_{k+1}=x_k+\alpha_kp_k,qquad
\alpha_k=\frac{r_k^Tr_k}{p_k^TAp_k}.
$$

更新残差与方向：

$$
r_{k+1}=r_k-\alpha_kAp_k,
$$

$$
\beta_k=\frac{r_{k+1}^Tr_{k+1}}{r_k^Tr_k},qquad
p_{k+1}=r_{k+1}+\beta_kp_k.
$$

精确算术中至多 $n$ 步收敛；实际速度受预条件矩阵的谱聚集影响。经典上界与 $\kappa(A)$ 的平方根有关，因此仅增加迭代上限不能替代预条件。

## 2. Arnoldi 与 GMRES

一般非对称矩阵使用 Arnoldi 正交化生成 $V_m=[v_1,\ldots,v_m]$：

$$
AV_m=V_{m+1}\bar H_m,
$$

其中 $\bar H_m$ 为上 Hessenberg 矩阵。GMRES 令 $x_m=x_0+V_my$，最小化真实二范数残差：

$$
\min_y\|b-A(x_0+V_my)\|_2
=\min_y\|\beta e_1-\bar H_my\|_2.
$$

小型最小二乘问题用 Givens 旋转更新。完整 GMRES 存储和正交代价随 $m$ 增长，工程中常用 GMRES($m$) 重启；重启可能丢失有用谱信息。BiCGStab 内存较小但残差可能振荡。

## 3. 左右预条件

$$
(M_L^{-1}AM_R^{-1})y=M_L^{-1}b,qquad x=M_R^{-1}y.
$$

右预条件保持原系统残差 $r=b-Ax$，左预条件通常监控 $M_L^{-1}r$。因此日志中的“残差”必须注明范数定义和预条件侧。常见方法：

- Jacobi/块 Jacobi：便宜、并行，但对强耦合较弱；
- ILU/ICC：保留稀疏近似因子，排序和填充控制关键；
- AMG/几何多重网格：通过光滑器消除高频误差、粗网格消除低频误差；
- 域分解 Schwarz：子域局部解加重叠交换；
- Schur 补/字段分裂：用于不可压流、混合 FEM 和多物理块矩阵。

## 4. 矩阵性质与选型

| 矩阵 | 推荐 Krylov | 典型来源 |
|---|---|---|
| 对称正定 | CG | 约束后线弹性、Poisson |
| 对称不定 | MINRES | 混合位移压力、约束乘子 |
| 非对称 | GMRES、FGMRES、BiCGStab | 对流、非对称耦合 |
| 多右端/特征值 | Block Krylov、Krylov–Schur | 频响、模态 |

柔性预条件器每次作用可变化，应使用 FGMRES 等兼容算法，而不是普通 GMRES 的固定预条件假设。

## 5. 停止准则

可靠判据至少包含

$$
\|r_k\|\le \max(\varepsilon_{abs},\varepsilon_{rel}\|b\|).
$$

残差不是误差；有 $\|x-x_k\|\le\|A^{-1}\|\|r_k\|$，病态系统的小残差仍可能对应较大解误差。还要检查物理守恒、增量和目标量。递推残差会因舍入漂移，应周期性重算 $b-Ax_k$。

## 6. 参考资料

1. PETSc, *KSP: Linear System Solvers*, https://petsc.org/main/manual/ksp/ 。
2. Saad, *Iterative Methods for Sparse Linear Systems*.
3. Greenbaum, *Iterative Methods for Solving Linear Systems*.

