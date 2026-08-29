---
template_version: "flowlab-knowledge/1.0"
slug: adjoint-sensitivity-topology-optimization
title: CAE 灵敏度与优化：离散伴随、MMA 和拓扑优化
summary: 从隐式状态方程推导直接灵敏度与离散伴随梯度，说明有限差分验证、约束优化、SIMP 拓扑优化、滤波和网格依赖。
category:
  slug: optimization-uq-rom
  name: 优化、不确定性与降阶
level: 专题
reading_minutes: 37
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [伴随法, 灵敏度, 拓扑优化, MMA, SIMP]
seo:
  title: CAE 离散伴随与拓扑优化推导｜流研工坊
  description: 推导状态方程灵敏度、离散伴随梯度和 SIMP 拓扑优化算法。
  keywords: [伴随法, 拓扑优化, SIMP, MMA]
---

# CAE 灵敏度与优化：离散伴随、MMA 和拓扑优化

设离散状态方程和目标为

$$
R(u,m)=0,qquad J=J(u,m),
$$

其中 $m$ 是设计变量。目标总导数包含状态的隐式变化。

## 1. 直接灵敏度

对状态方程求导：

$$
R_u\frac{du}{dm}+R_m=0,
\qquad
\frac{du}{dm}=-R_u^{-1}R_m.
$$

因此

$$
\frac{dJ}{dm}=J_m-J_uR_u^{-1}R_m.
$$

直接法每个设计变量通常需求解一次线性系统，适合设计变量少、响应多的场景。

## 2. 离散伴随

定义 Lagrangian

$$
\mathcal L(u,m,\lambda)=J(u,m)-\lambda^TR(u,m).
$$

令对 $u$ 的导数为零：

$$
R_u^T\lambda=J_u^T.
$$

解一次伴随后

$$
\frac{dJ}{dm}=J_m-\lambda^TR_m.
$$

当目标少而设计变量多时优势巨大。连续伴随先对 PDE 变分，离散伴随则对实际离散残量求导；后者更容易与程序目标梯度严格一致。

## 3. 梯度验证

中心有限差分

$$
g_i^{FD}=\frac{J(m+h_ie_i)-J(m-h_ie_i)}{2h_i}
$$

有 $O(h_i^2)$ 截断误差，但过小 $h_i$ 受舍入和未收敛状态误差污染。推荐扫描多个 $h_i$，检查相对误差的 U 形曲线；复步法对解析程序可避免消去误差。每个扰动工况必须达到比梯度目标更严格的状态收敛。

## 4. 约束优化

一般问题

$$
\min_m J(m),\quad g_j(m)\le0,\quad h_k(m)=0,\quad m_L\le m\le m_U.
$$

SQP 用二次子问题近似 KKT 系统；内点法用屏障项处理不等式；MMA 构造移动渐近线的可分凸近似，常用于大规模拓扑优化。无梯度遗传算法、CMA-ES、粒子群和贝叶斯优化适合不连续/噪声/小维变量，但样本成本高且没有“自动全局最优”保证。

## 5. SIMP 拓扑优化

单元密度 $0\le\rho_e\le1$，材料插值

$$
E_e(\rho_e)=E_{min}+\rho_e^p(E_0-E_{min}),\qquad p>1.
$$

最小柔度问题

$$
\min_\rho C=f^Tu=u^TKu,
\quad Ku=f,
\quad \sum_e\rho_eV_e\le V^*.
$$

伴随等于位移后，灵敏度

$$
\frac{\partial C}{\partial\rho_e}=-u_e^T\frac{\partial K_e}{\partial\rho_e}u_e.
$$

密度/灵敏度滤波和投影用于控制棋盘格与最小长度尺度；没有长度尺度的问题会网格依赖。应进行设计网格、分析网格和制造约束的独立检查。

## 6. 参考资料

1. Giles & Pierce, “An Introduction to the Adjoint Approach to Design”, 2000.
2. Bendsøe & Sigmund, *Topology Optimization*.
3. Svanberg, “The Method of Moving Asymptotes”, 1987.

