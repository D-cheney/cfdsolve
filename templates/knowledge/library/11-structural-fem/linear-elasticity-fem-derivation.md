---
template_version: "flowlab-knowledge/1.0"
slug: linear-elasticity-fem-derivation
title: 线弹性有限元：虚功原理、刚度矩阵与应力恢复
summary: 从平衡方程、应变位移关系和 Hooke 定律推导虚功弱式、单元刚度、载荷向量与应力恢复，并说明平面应力、平面应变和锁死问题。
category:
  slug: structural-fem
  name: 结构与有限元算法
level: 工程
reading_minutes: 27
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [线弹性, 虚功原理, 刚度矩阵, 应力恢复, 有限元]
seo:
  title: 线弹性有限元刚度矩阵完整推导｜流研工坊
  description: 从强平衡到虚功弱式、B 矩阵、材料矩阵、装配和应力恢复。
  keywords: [线弹性有限元, 虚功, B矩阵, Hooke定律]
---

# 线弹性有限元：虚功原理、刚度矩阵与应力恢复

小变形线弹性由平衡、运动学与本构三组关系闭合：

$$
\nabla\cdot\boldsymbol\sigma+\boldsymbol b=\boldsymbol0,
\quad
\boldsymbol\varepsilon=\frac12(\nabla\boldsymbol u+\nabla\boldsymbol u^T),
\quad
\boldsymbol\sigma=\mathsf C:\boldsymbol\varepsilon.
$$

边界为 $\boldsymbol u=\bar{\boldsymbol u}$ 于 $\Gamma_u$，$\boldsymbol\sigma\boldsymbol n=\bar{\boldsymbol t}$ 于 $\Gamma_t$。

## 1. 虚功弱式

用满足 $\delta\boldsymbol u=0$ 于 $\Gamma_u$ 的虚位移乘平衡方程并积分：

$$
\int_\Omega\delta\boldsymbol u\cdot(\nabla\cdot\boldsymbol\sigma+\boldsymbol b)d\Omega=0.
$$

对第一项分部积分，并利用应力对称性：

$$
\int_\Omega\delta\boldsymbol\varepsilon:\boldsymbol\sigma\,d\Omega
=\int_\Omega\delta\boldsymbol u\cdot\boldsymbol b\,d\Omega
+\int_{\Gamma_t}\delta\boldsymbol u\cdot\bar{\boldsymbol t}\,d\Gamma.
$$

左侧是内虚功，右侧是外虚功。其成立依赖准静态、Cauchy 应力对称和小应变假设。

## 2. 有限元插值与矩阵形式

单元内 $\boldsymbol u=N\boldsymbol d_e$，工程应变向量 $\boldsymbol\epsilon=B\boldsymbol d_e$，其中 $B=\mathcal{L}N$。虚应变为 $\delta\boldsymbol\epsilon=B\delta\boldsymbol d_e$。代入虚功并提取任意 $\delta\boldsymbol d_e$：

$$
K_e\boldsymbol d_e=\boldsymbol f_e,
$$

$$
K_e=\int_{\Omega_e}B^TDB\,d\Omega,
\quad
\boldsymbol f_e=\int_{\Omega_e}N^T\boldsymbol b\,d\Omega
+\int_{\Gamma_t^e}N^T\bar{\boldsymbol t}\,d\Gamma.
$$

若 $D=D^T$ 且约束消除了刚体模态，$K$ 应对称正定；未约束模型的三维刚体有 6 个零能模态。

## 3. 各向同性材料矩阵

三维 Hooke 定律可写为

$$
\boldsymbol\sigma=2G\boldsymbol\varepsilon+\lambda\,\mathrm{tr}(\boldsymbol\varepsilon)I,
\quad
G=\frac{E}{2(1+\nu)},\quad
\lambda=\frac{E\nu}{(1+\nu)(1-2\nu)}.
$$

平面应力中 $\sigma_{zz}=0$：

$$
D_{ps}=\frac{E}{1-\nu^2}
\begin{bmatrix}1&\nu&0\\\nu&1&0\\0&0&(1-\nu)/2\end{bmatrix}.
$$

平面应变中 $\varepsilon_{zz}=0$：

$$
D_{pe}=\frac{E}{(1+\nu)(1-2\nu)}
\begin{bmatrix}1-\nu&\nu&0\\\nu&1-\nu&0\\0&0&(1-2\nu)/2\end{bmatrix}.
$$

二者不能混用；薄板面内载荷通常用平面应力，长厚体截面约束常用平面应变。

## 4. 应力恢复

求得节点位移后，高斯点应力为 $\boldsymbol\sigma_g=D B_g\boldsymbol d_e$。节点应力不是主未知量，通常通过高斯点外推、面积加权平均或 $L^2$ 投影得到。跨材料界面不应平均法向应力；平滑图不能替代原始积分点结果。

von Mises 等效应力为

$$
\sigma_v=\sqrt{\frac32\boldsymbol s:\boldsymbol s},
\qquad \boldsymbol s=\boldsymbol\sigma-\frac13\mathrm{tr}(\boldsymbol\sigma)I.
$$

它只适用于以偏应力驱动的延性金属屈服判断，不是所有材料的通用失效指标。

## 5. 数值陷阱

- $\nu\to0.5$ 时纯位移低阶单元会体积锁死，应使用混合 $u-p$、选择性降阶积分或合适的杂交单元；
- 一阶完全积分单元可能剪切锁死，过度降阶又会产生沙漏模态；
- 点载荷和尖角导致应力奇异，网格加密时峰值不收敛；
- 必须分别检查反力平衡、应变能、位移和远离奇异区的应力收敛。

## 6. 参考资料

1. MFEM, *Example 2: Linear Elasticity*, https://mfem.org/examples/ 。
2. Zienkiewicz, Taylor & Zhu, *The Finite Element Method*.
3. Bathe, *Finite Element Procedures*.

