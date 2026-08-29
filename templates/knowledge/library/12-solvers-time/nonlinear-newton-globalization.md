---
template_version: "flowlab-knowledge/1.0"
slug: nonlinear-newton-globalization
title: 非线性方程求解：Newton、JFNK、线搜索与信赖域
summary: 推导非线性残量的 Newton 线性化、Jacobian-free 矩阵向量积、inexact Newton 强迫项，并比较线搜索、信赖域、Picard 与拟 Newton。
category:
  slug: algebraic-solvers
  name: 代数求解器与时间算法
level: 专题
reading_minutes: 30
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [Newton法, JFNK, 线搜索, 信赖域, 非线性求解]
seo:
  title: Newton 与 JFNK 非线性求解算法推导｜流研工坊
  description: 推导 Newton、Jacobian-free Newton-Krylov、inexact Newton 与全局化策略。
  keywords: [Newton法, JFNK, 非线性残量, 线搜索]
---

# 非线性方程求解：Newton、JFNK、线搜索与信赖域

求 $F(x)=0$。在 $x_k$ 做 Taylor 展开：

$$
F(x_k+s)=F_k+J_ks+O(\|s\|^2),\qquad J_k=\frac{\partial F}{\partial x}(x_k).
$$

忽略高阶项得到 Newton 修正

$$
J_ks_k=-F_k,\qquad x_{k+1}=x_k+s_k.
$$

若 $J(x^*)$ 非奇异、初值足够近且 Jacobian 连续，局部误差满足 $\|e_{k+1}\|=O(\|e_k\|^2)$。

## 1. Inexact Newton

大规模 CAE 不必把线性子问题解到机器精度，只需

$$
\|J_ks_k+F_k\|\le\eta_k\|F_k\|,
$$

其中强迫项 $0\le\eta_k<1$。离解较远时使用宽松容差，接近解时减小 $\eta_k$，可避免过度求解并保持超线性收敛。

## 2. Jacobian-free Newton–Krylov

Krylov 法只需要 $Jv$：

$$
J(x)v\approx\frac{F(x+\epsilon v)-F(x)}{\epsilon}.
$$

$\epsilon$ 过大产生截断误差，过小产生消去误差；常取与机器精度、$\|x\|$ 和 $\|v\|$ 相关的尺度。JFNK 省去显式 Jacobian，但仍需要物理有效的预条件器；“无矩阵”不等于“无预条件”。

## 3. 线搜索

全 Newton 步可能使残量增大。以功函数 $\phi(x)=\tfrac12\|F(x)\|^2$，更新

$$
x_{k+1}=x_k+\alpha_ks_k,qquad 0<\alpha_k\le1.
$$

回溯线搜索寻找满足充分下降的 $\alpha_k$。若残量含尺度差异，应先无量纲化，否则大单位分量会主导 $\phi$。

## 4. 信赖域

在 $\|s\|\le\Delta_k$ 内最小化局部模型

$$
m_k(s)=\frac12\|F_k+J_ks\|^2.
$$

比较实际下降与预测下降比值，决定接受步长并调整 $\Delta_k$。信赖域对差初值和近奇异 Jacobian 往往比纯线搜索稳健。

## 5. Picard 与拟 Newton

Picard 把一部分非线性冻结，如 $A(x_k)x_{k+1}=b$，通常线性收敛但单步稳定。Broyden 等拟 Newton 用低秩更新近似 Jacobian，适合 Jacobian 昂贵且残量较平滑的问题。工程上常先 Picard 建立可行场，再切换 Newton。

## 6. 失败诊断

- 线性求解失败：检查预条件、零空间和尺度；
- 残量下降但状态非法：加入变量界限、阻尼或变量变换；
- 锯齿振荡：检查非光滑接触/相变活动集；
- 时间步反复失败：回滚状态并减小步长，不能提交未收敛历史；
- 停止需同时满足残量、增量和物理约束。

## 7. 参考资料

1. PETSc, *SNES: Nonlinear Solvers*, https://petsc.org/main/manual/snes/ 。
2. Knoll & Keyes, “Jacobian-free Newton–Krylov Methods”, 2004.
3. Kelley, *Iterative Methods for Linear and Nonlinear Equations*.

