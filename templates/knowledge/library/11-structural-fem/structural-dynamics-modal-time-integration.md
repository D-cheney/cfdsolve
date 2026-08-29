---
template_version: "flowlab-knowledge/1.0"
slug: structural-dynamics-modal-time-integration
title: 结构动力学：模态分析、阻尼与 Newmark 时间积分推导
summary: 从半离散运动方程推导广义特征值、模态正交、Rayleigh 阻尼、模态叠加及 Newmark 有效刚度，并给出稳定性和能量检查。
category:
  slug: structural-fem
  name: 结构与有限元算法
level: 工程
reading_minutes: 30
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [结构动力学, 模态分析, Newmark, 阻尼, 特征值]
seo:
  title: 结构动力学模态与 Newmark 算法推导｜流研工坊
  description: 推导质量刚度特征值、模态正交、Rayleigh 阻尼和 Newmark 有效刚度。
  keywords: [模态分析, Newmark, 结构动力学, Rayleigh阻尼]
---

# 结构动力学：模态分析、阻尼与 Newmark 时间积分推导

空间有限元离散后，线性结构动力学为

$$
M\ddot u+C\dot u+Ku=f(t).
$$

$M$ 可为一致质量或集中质量；$C$ 通常是模型假设，不应仅为拟合结果随意调节。

## 1. 自由振动与广义特征值

无阻尼自由振动令 $u=\phi e^{i\omega t}$，代入得到

$$
(K-\omega^2M)\phi=0.
$$

非零解要求 $\det(K-\omega^2M)=0$。对称 $K,M$ 且 $M$ 正定时，不同模态满足

$$
\phi_i^TM\phi_j=0,\qquad \phi_i^TK\phi_j=0\quad(i\ne j).
$$

常用质量归一化 $\Phi^TM\Phi=I$，则 $\Phi^TK\Phi=\Omega^2$。刚体模态的 $\omega=0$；负 $\omega^2$ 通常意味着切线刚度不稳定或约束错误。

## 2. 模态叠加

令 $u=\Phi q$，左乘 $\Phi^T$：

$$
\ddot q+\Phi^TC\Phi\dot q+\Omega^2q=\Phi^Tf.
$$

若阻尼可模态对角化，各模态独立：

$$
\ddot q_i+2\zeta_i\omega_i\dot q_i+\omega_i^2q_i=p_i(t).
$$

截断模态必须覆盖载荷频带并检查有效质量参与率；局部高频应力可能在总位移参与率充分时仍不准确。

## 3. Rayleigh 阻尼

设 $C=\alpha M+\beta K$，第 $i$ 阶阻尼比

$$
\zeta_i=\frac12\left(\frac{\alpha}{\omega_i}+\beta\omega_i\right).
$$

给定两频率 $\omega_1,\omega_2$ 的目标阻尼比，可解二元线性方程求 $\alpha,\beta$。质量比例项主导低频，刚度比例项主导高频；频带外阻尼可能被夸大。

## 4. Newmark-$\beta$ 推导

时间步 $\Delta t$ 内假设加速度按参数积分：

$$
u_{n+1}=u_n+\Delta t\dot u_n+\Delta t^2[(1/2-\beta)\ddot u_n+\beta\ddot u_{n+1}],
$$

$$
\dot u_{n+1}=\dot u_n+\Delta t[(1-\gamma)\ddot u_n+\gamma\ddot u_{n+1}].
$$

由第一式解出

$$
\ddot u_{n+1}=a_0(u_{n+1}-u_n)-a_2\dot u_n-a_3\ddot u_n,
$$

其中 $a_0=1/(\beta\Delta t^2)$，$a_2=1/(\beta\Delta t)$，$a_3=1/(2\beta)-1$。代入平衡方程得到有效系统

$$
K_{eff}u_{n+1}=f_{eff},\qquad K_{eff}=K+a_0M+a_1C,
$$

$a_1=\gamma/(\beta\Delta t)$，右端由已知历史项组成。平均加速度法 $\gamma=1/2,\beta=1/4$ 对线性系统无条件稳定且二阶准确，但不自动耗散非物理高频；广义-$\alpha$ 可控制高频数值耗散。

## 5. 显式中心差分

$$
\ddot u_n\approx\frac{u_{n+1}-2u_n+u_{n-1}}{\Delta t^2}.
$$

集中质量使每步无需线性求解，但稳定步长近似满足 $\Delta t\le2/\omega_{max}$。最小单元、最高波速和接触刚度决定临界步长；质量缩放会改变惯性，必须报告其比例。

## 6. 验证

- 单自由度解析解验证频率、相位和阻尼；
- 模态残差 $\|K\phi-\omega^2M\phi\|$ 与正交性；
- 自由无阻尼系统检查总能量漂移；
- 强迫响应检查时间步收敛和载荷采样；
- 实验模态用 MAC 比较振型而不仅是频率。

## 7. 参考资料

1. SLEPc, *EPS Eigenvalue Problem Solver*, https://slepc.upv.es/release/documentation/manual/eps.html 。
2. Newmark, “A Method of Computation for Structural Dynamics”, 1959.
3. Chung & Hulbert, “A Time Integration Algorithm for Structural Dynamics with Improved Numerical Dissipation”, 1993.
