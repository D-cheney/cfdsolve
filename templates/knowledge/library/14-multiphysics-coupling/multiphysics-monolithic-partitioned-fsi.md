---
template_version: "flowlab-knowledge/1.0"
slug: multiphysics-monolithic-partitioned-fsi
title: 多物理耦合与 FSI：单体、分区、Aitken 与界面守恒
summary: 从块残量和界面条件推导单体与分区耦合、Dirichlet–Neumann 固定点、Aitken 松弛、网格映射守恒以及附加质量不稳定。
category:
  slug: multiphysics-coupling
  name: 多物理场耦合算法
level: 专题
reading_minutes: 38
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [多物理场, 流固耦合, 分区耦合, Aitken松弛, 界面守恒]
seo:
  title: 多物理与流固耦合算法完整推导｜CFD菜鸟
  description: 推导单体/分区耦合、FSI 界面条件、Aitken 松弛和守恒映射。
  keywords: [流固耦合, FSI, 分区算法, Aitken松弛]
---

# 多物理耦合与 FSI：单体、分区、Aitken 与界面守恒

两个物理场的离散残量可写成

$$
R_1(u_1,u_2)=0,\qquad R_2(u_2,u_1)=0.
$$

单体法一次组装块 Jacobian；分区法复用各场求解器并迭代交换界面量。

## 1. 单体 Newton 系统

$$
\begin{bmatrix}J_{11}&J_{12}\\J_{21}&J_{22}\end{bmatrix}
\begin{bmatrix}\Delta u_1\\\Delta u_2\end{bmatrix}
=-\begin{bmatrix}R_1\\R_2\end{bmatrix}.
$$

单体法在强耦合下稳健，但块尺度、异构离散和预条件困难。块 LU 显示 Schur 补

$$
S=J_{22}-J_{21}J_{11}^{-1}J_{12}
$$

是高效字段分裂预条件的核心。

## 2. FSI 界面条件

流体与固体界面 $\Gamma$ 满足运动学连续和动力学平衡：

$$
u_f=u_s,\qquad v_f=\dot u_s,
$$

$$
\sigma_fn_f+\sigma_sn_s=0.
$$

ALE 流体网格速度为 $w$，对流速度使用 $v_f-w$。网格运动必须满足几何守恒律，否则均匀流在移动网格上也会产生伪源。

## 3. Dirichlet–Neumann 分区迭代

给定界面位移 $d_\Gamma^k$：

1. 移动流体网格并求流体，得到牵引 $t_f^k$；
2. 将 $t_f^k$ 映射到结构并求位移 $\tilde d_\Gamma^{k+1}$；
3. 形成残差 $r^k=\tilde d_\Gamma^{k+1}-d_\Gamma^k$；
4. 松弛 $d_\Gamma^{k+1}=d_\Gamma^k+\omega_kr^k$。

固定 $\omega$ 需要经验调参。Aitken $\Delta^2$ 根据两次残差更新

$$
\omega_k=-\omega_{k-1}
\frac{(r^{k-1})^T(r^k-r^{k-1})}{\|r^k-r^{k-1}\|^2},
$$

并应设置合理上下界。IQN-ILS 使用历史界面增量近似逆 Jacobian，通常比标量松弛更快。

## 4. 附加质量不稳定

当不可压流体的有效附加质量相对结构质量很大时，显式或弱耦合分区法可能不稳定，即使每个子求解器单独稳定。减小时间步不一定解决；需要时间步内强耦合、Robin 界面条件、准 Newton 或单体方案。

## 5. 非匹配网格映射

位移映射 $d_f=H d_s$。为保持离散功率，应令力映射满足

$$
f_s=H^Tf_f,
$$

因为 $d_f^Tf_f=d_s^Tf_s$。仅做最近邻插值可能不守恒总力、力矩或热量。热耦合应检查界面温度连续与两侧积分热流相反。

## 6. 时间耦合

不同求解器时间步可用子循环，但交换值需与各自积分阶次一致。零阶保持会降低整体阶次；插值/外推必须避免使用未来信息。强耦合停止条件应基于归一化界面位移、力和能量残差，而非仅子场内部残差。

## 7. 验证清单

- 单向耦合极限和刚体/无流体极限；
- 界面总力、力矩、热流与功率平衡；
- 耦合迭代和时间步独立性；
- added-mass 敏感性和松弛历史；
- 映射前后常量场、线性场与积分量再现。

## 8. 参考资料

1. Farhat & Lesoinne, “Two Efficient Staggered Algorithms for the Serial and Parallel Solution of Three-Dimensional Nonlinear Transient Aeroelastic Problems”, 2000.
2. Degroote et al., “Performance of a New Partitioned Procedure versus a Monolithic Procedure in Fluid–Structure Interaction”, 2009.
3. Küttler & Wall, “Fixed-Point Fluid–Structure Interaction Solvers with Dynamic Relaxation”, 2008.

