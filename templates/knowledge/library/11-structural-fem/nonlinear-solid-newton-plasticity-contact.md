---
template_version: "flowlab-knowledge/1.0"
slug: nonlinear-solid-newton-plasticity-contact
title: 非线性结构算法：Newton 迭代、J2 塑性返回映射与接触
summary: 统一推导几何和材料非线性残量、切线刚度、增量 Newton 法、J2 塑性径向返回及罚函数接触，说明一致切线和路径依赖状态更新。
category:
  slug: structural-fem
  name: 结构与有限元算法
level: 专题
reading_minutes: 38
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [非线性有限元, Newton法, J2塑性, 返回映射, 接触]
seo:
  title: 非线性有限元 Newton、塑性与接触推导｜流研工坊
  description: 从残量和一致切线推导非线性结构 Newton 迭代、J2 返回映射与罚接触。
  keywords: [非线性有限元, J2塑性, 径向返回, 接触算法]
---

# 非线性结构算法：Newton 迭代、J2 塑性返回映射与接触

非线性平衡写成残量方程

$$
R(u)=F_{ext}(u)-F_{int}(u)=0,
\qquad
F_{int}=\int_{\Omega_0}B^T(u)\,S(u,\alpha)\,d\Omega_0,
$$

其中 $\alpha$ 表示塑性应变、硬化量、损伤等历史变量。几何非线性改变 $B$ 和应力度量，材料非线性改变本构，接触则改变约束活动集。

## 1. 增量 Newton–Raphson

在第 $k$ 次迭代对残量一阶展开：

$$
R(u_k+\Delta u)\approx R(u_k)+\frac{\partial R}{\partial u}\Delta u=0.
$$

定义切线刚度 $K_T=\partial F_{int}/\partial u-\partial F_{ext}/\partial u$，则

$$
K_T(u_k)\Delta u_k=R(u_k),\qquad u_{k+1}=u_k+\alpha_k\Delta u_k.
$$

$\alpha_k$ 可由线搜索确定。使用一致切线时，解附近可获得二次收敛；固定初始刚度是修正 Newton，单次迭代便宜但通常线性收敛。载荷极限点附近，单纯载荷控制会失效，应使用位移控制或弧长法。

## 2. 小应变 J2 塑性

应变分解 $\varepsilon=\varepsilon^e+\varepsilon^p$，弹性预测为

$$
\sigma_{tr}=C:(\varepsilon_{n+1}-\varepsilon_n^p),
\quad s_{tr}=\mathrm{dev}(\sigma_{tr}),
\quad q_{tr}=\sqrt{\frac32s_{tr}:s_{tr}}.
$$

各向同性线性硬化屈服函数

$$
f_{tr}=q_{tr}-[\sigma_{y0}+H\bar\varepsilon_n^p].
$$

若 $f_{tr}\le0$，步内保持弹性。若 $f_{tr}>0$，关联流动法则给出径向返回。塑性乘子增量为

$$
\Delta\gamma=\frac{f_{tr}}{3G+H},
$$

$$
n=\frac{s_{tr}}{\|s_{tr}\|},\qquad
s_{n+1}=s_{tr}-2G\Delta\gamma\sqrt{\frac32}\,n,
\qquad
\bar\varepsilon_{n+1}^p=\bar\varepsilon_n^p+\Delta\gamma.
$$

状态变量只能在全局平衡收敛后提交；Newton 试算过程中必须从步初已提交状态重新积分。否则迭代次数会污染材料历史。

## 3. 一致算法切线

全局 Newton 需要离散返回映射的导数

$$
C_{alg}=\frac{\partial\sigma_{n+1}}{\partial\varepsilon_{n+1}},
$$

而不是简单使用弹性矩阵 $C$。一致切线包含塑性流动方向和硬化模量。缺失它通常不会改变最终理论方程，却会显著破坏二次收敛，导致更多迭代甚至错误切步。

## 4. 单边接触

法向间隙 $g_n(u)\ge0$、接触压力 $p_n\ge0$ 和互补条件

$$
g_n p_n=0
$$

构成 Karush–Kuhn–Tucker 条件。罚函数近似为

$$
p_n=\epsilon_n\langle-g_n\rangle_+,
$$

其中 $\epsilon_n$ 太小会穿透，太大导致病态。拉格朗日乘子法严格满足约束但增加鞍点未知量；增广拉格朗日法在二者之间迭代更新乘子。摩擦常用 Coulomb 条件 $\|t_t\|\le\mu p_n$，粘着/滑移通过试算—返回算法切换。

## 5. 收敛判据

至少同时检查

$$
\eta_R=\frac{\|R\|}{\max(\|F_{ext}\|,F_0)},\quad
\eta_u=\frac{\|\Delta u\|}{\max(\|u\|,u_0)},\quad
\eta_E=\frac{|\Delta u^TR|}{E_0}.
$$

还应监控塑性耗散非负、接触穿透、活动集振荡和能量平衡。自动切步应在迭代失败时回滚全部历史变量。

## 6. 参考资料

1. Simo & Hughes, *Computational Inelasticity*.
2. Wriggers, *Computational Contact Mechanics*.
3. Crisfield, *Non-linear Finite Element Analysis of Solids and Structures*.

