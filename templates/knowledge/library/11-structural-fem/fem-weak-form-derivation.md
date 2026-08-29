---
template_version: "flowlab-knowledge/1.0"
slug: fem-weak-form-derivation
title: 有限元弱式推导：从 Poisson 强式到单元矩阵
summary: 逐步推导加权余量、分部积分、自然边界、Galerkin 近似、单元刚度与装配，给出有限元一致性、稳定性和收敛检查。
category:
  slug: structural-fem
  name: 结构与有限元算法
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [有限元, 弱式, Galerkin, 单元矩阵, 变分法]
seo:
  title: 有限元弱式与单元矩阵完整推导｜流研工坊
  description: 从 Poisson 强式逐步得到有限元弱式、边界项、单元刚度和装配方程。
  keywords: [有限元推导, 弱形式, Galerkin, 单元刚度]
---

# 有限元弱式推导：从 Poisson 强式到单元矩阵

以扩散/稳态导热的统一模型为例。设区域 $\Omega$，边界分为本质边界 $\Gamma_D$ 和自然边界 $\Gamma_N$：

$$
-\nabla\cdot(k\nabla u)=f\quad\text{in }\Omega,
\qquad u=\bar u\text{ on }\Gamma_D,
\qquad -k\nabla u\cdot n=\bar q\text{ on }\Gamma_N.
$$

其中 $u$ 可代表温度或势函数，$k>0$，$f$ 是体源。

## 1. 加权余量与分部积分

取在 $\Gamma_D$ 上为零的试验函数 $v$，令强式余量与 $v$ 正交：

$$
\int_\Omega v[-\nabla\cdot(k\nabla u)-f]\,d\Omega=0.
$$

使用散度定理：

$$
-\int_\Omega v\nabla\cdot(k\nabla u)d\Omega
=\int_\Omega \nabla v\cdot k\nabla u\,d\Omega
-\int_{\partial\Omega}v(k\nabla u\cdot n)d\Gamma.
$$

$v=0$ 使 $\Gamma_D$ 边界项消失；在 $\Gamma_N$ 代入 $k\nabla u\cdot n=-\bar q$，得到弱式：求 $u\in V$，使任意 $v\in V_0$ 满足

$$
a(u,v)=\ell(v),
$$

$$
a(u,v)=\int_\Omega \nabla v\cdot k\nabla u\,d\Omega,
\qquad
\ell(v)=\int_\Omega vf\,d\Omega-\int_{\Gamma_N}v\bar q\,d\Gamma.
$$

分部积分把 $u$ 的二阶导数降为一阶，因此连续一阶形函数即可；自然边界自动进入右端，本质边界则必须约束试探空间。

## 2. Galerkin 离散

以形函数 $N_j$ 展开：

$$
u_h=\sum_{j=1}^{n}N_jU_j,\qquad v_h=N_i.
$$

代入弱式：

$$
\sum_j\left(\int_\Omega \nabla N_i\cdot k\nabla N_j\,d\Omega\right)U_j
=\int_\Omega N_if\,d\Omega-\int_{\Gamma_N}N_i\bar q\,d\Gamma.
$$

于是得到 $KU=F$，其中

$$
K_{ij}=\int_\Omega \nabla N_i\cdot k\nabla N_j\,d\Omega,
\qquad
F_i=\int_\Omega N_if\,d\Omega-\int_{\Gamma_N}N_i\bar q\,d\Gamma.
$$

## 3. 一维二节点单元的显式推导

单元 $[x_1,x_2]$ 长度 $h$，局部坐标 $\xi\in[-1,1]$：

$$
N_1=\frac{1-\xi}{2},\quad N_2=\frac{1+\xi}{2},\quad
\frac{dN_1}{dx}=-\frac1h,\quad\frac{dN_2}{dx}=\frac1h.
$$

若 $k$ 为常数，则

$$
K^e=\int_{x_1}^{x_2}B^TkB\,dx
=\frac{k}{h}\begin{bmatrix}1&-1\\-1&1\end{bmatrix}.
$$

均匀源 $f$ 的一致载荷为

$$
F_f^e=\int_{x_1}^{x_2}N^Tf\,dx
=\frac{fh}{2}\begin{bmatrix}1\\1\end{bmatrix}.
$$

局部矩阵通过连接关系 $A_e$ 装配：$K=\sum_e A_e^TK^eA_e$，$F=\sum_eA_e^TF^e$。共享节点的贡献相加，这正是全局弱平衡。

## 4. 数学条件与误差

当双线性型连续且强制，即存在 $\alpha>0$ 使 $a(v,v)\ge\alpha\|v\|_V^2$，Lax–Milgram 定理给出解的存在唯一性。Galerkin 正交性

$$
a(u-u_h,v_h)=0
$$

导出 Céa 估计：离散误差不超过试探空间最佳逼近误差的常数倍。若所有边界都是 Neumann，常数场位于零空间，必须指定参考值或零均值约束。

## 5. 实现与验证

1. 检查单元 Jacobian 行列式为正；
2. 数值积分阶次必须覆盖被积多项式，非线性/曲边时适当加阶；
3. 用 patch test 检查常应变/线性场再现；
4. 检查 $K$ 的对称性、零空间和约束后的正定性；
5. 对制造解计算 $L^2$ 与能量范数收敛率。

## 6. 参考资料

1. MFEM, *Weak Formulations*, https://mfem.org/fem_weak_form/ 。
2. Hughes, *The Finite Element Method: Linear Static and Dynamic Finite Element Analysis*.
3. Brenner & Scott, *The Mathematical Theory of Finite Element Methods*.

