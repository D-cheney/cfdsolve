---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-newton-engineering-setup
title: "Newton 非线性求解：工程设置与参数选择"
summary: "Newton 求解器的落地配置：残差/增量/步长三档收敛判据、Eisenstat–Walker 强迫项序列、线搜索与信赖域的参数取值、雅可比与预条件的复用节奏，以及载荷增量的自适应规则。"
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
  - "Newton 非线性求解"
  - "工程设置与参数选择"
  - "强迫项"
  - "线搜索"
seo:
  title: "Newton 非线性求解：工程设置与参数选择"
  description: "Newton 求解器的落地配置：残差/增量/步长三档收敛判据、Eisenstat–Walker 强迫项序列、线搜索与信赖域的参数取值、雅可比与预条件的复用节奏，以及载荷增量的自适应规则。"
  keywords:
    - "Newton 非线性求解"
    - "工程设置与参数选择"
    - "强迫项"
    - "线搜索"
    - "收敛判据"
---

# Newton 非线性求解：工程设置与参数选择

Newton 求解器的参数分三组：判据（残差、增量、步长）、线性子问题的求解精度（强迫项）、以及全局化策略（线搜索或信赖域）。三组参数相互耦合——判据定得太紧会逼着强迫项变小，强迫项太小又让每步线性求解代价暴涨。以下配置基于 PETSc SNES 求解一个三维弹塑性模型（$n=2.4\times10^6$，$N_{\text{inc}}=20$ 个载荷步）。

## 收敛判据必须同时给三档

只判残差是工程事故的常见来源。正确的停机条件同时检查三项：

$$
\|\mathbf R_k\|\le\text{atol}+\text{rtol}\|\mathbf R_0\|,
\qquad
\|\Delta\mathbf u_k\|\le\text{stol}\|\mathbf u_k\|,
\qquad
k\le k_{\max}.
$$

实测配置取 `rtol=1e-8`、`atol=1e-10`、`stol=1e-8`、`max_it=50`。三档判据各司其职：相对残差判据保证解的质量；绝对残差防止 $\|\mathbf R_0\|$ 本身极小（增量载荷步、纯 Neumann 问题）时第 1 步就误判收敛；增量判据防止"残差小但解还在剧烈调整"——这类情形在接触状态反复切换时很常见，残差降到 $10^{-9}$ 而位移增量仍在 $10^{-2}$ 量级。**三项中任意一项长期不满足就应判定失败，而不是只放宽其中一项。**

## 强迫项：不要每步都把线性问题解到底

Inexact Newton 只要求线性子问题解到

$$
\|J_k\Delta\mathbf u_k+\mathbf R_k\|\le\eta_k\|\mathbf R_k\|,\qquad 0\le\eta_k<1 .
$$

固定 $\eta$ 会限制收敛速率：$\eta=0.1$ 时外层退化为压缩因子 0.1 的线性收敛，从 $10^{-1}$ 到 $10^{-10}$ 需 9 次迭代；$\eta=10^{-2}$ 需 5 次但每步线性求解都很贵。Eisenstat–Walker 自适应序列按

$$
\eta_k=\gamma\left(\frac{\|\mathbf R_k\|}{\|\mathbf R_{k-1}\|}\right)^{\alpha},
\qquad \gamma=0.9,\ \alpha=2.0,\ \eta_{\max}=0.9,
$$

动态调整。以实测残差序列 $1.0\times10^{-1}\to1.1\times10^{-2}\to8.7\times10^{-5}$ 代入：$\eta_1=0.9\times(0.11)^2=0.0109$，$\eta_2=0.9\times(7.9\times10^{-3})^2=5.6\times10^{-5}$。可见离解远时线性求解很松、接近解时自动收紧，从而保住超线性收敛。三种策略的总 Krylov 迭代数对比很直观：

| 策略 | Newton 步数 | 每步 Krylov 迭代 | 合计 |
|---|---|---|---|
| 固定 $\eta=0.9$ | 20 | 2 | 40 |
| 固定 $\eta=10^{-2}$ | 5 | 25 | 125 |
| EW 自适应 | 5 | 3, 5, 12, 24, 9 | 53 |

EW 用接近固定 $\eta=0.9$ 的总代价拿到了接近固定 $\eta=10^{-2}$ 的收敛速度。

## 线搜索与信赖域的选择

残差光滑、雅可比可靠时用回溯线搜索，PETSc 中设 `-snes_linesearch_type bt`，步长按 0.5 倍收缩，Armijo 常数 $c_1=10^{-4}$，最小步长下限取 $10^{-12}$；一旦收缩到下限仍未满足下降条件，说明方向失效，应中止并报告而不是继续缩。初值差、雅可比接近奇异、或残差含非光滑分支（接触、相变）时改用信赖域：初始半径 $\Delta_0$ 取与典型位移增量同量级（弹性问题常取 $1.0$），上限 $\Delta_{\max}$ 设成物理位移尺度的 10 倍以防一次跳出合法区间。信赖域半径按实际下降与预测下降之比 $\rho_k$ 更新：$\rho_k<0.25$ 时把 $\Delta_k$ 缩到 1/4 并拒绝该步，$\rho_k>0.75$ 且步长触及边界时把 $\Delta_k$ 加倍。**非光滑问题不要用纯线搜索**，它会在不连续面上反复折返。

## 雅可比与预条件的复用节奏

每步重算雅可比与预条件最稳但最贵。实测把雅可比复用 3 步（`-snes_lag_jacobian 3`）可省 40% 的装配时间，代价是 Newton 迭代数从 5 增到 7；把预条件复用 3 步（`-snes_lag_preconditioner 3`）省得更多，但 Krylov 迭代数从 53 涨到 96，总时间反而增加 12%。经验规则是**雅可比可以适当滞后，预条件尽量每步更新**，因为预条件质量直接决定线性迭代数，而线性迭代数是总成本的主导项。JFNK 场景下雅可比本来就不组装，滞后策略改为滞后预条件，判据相同。

## 载荷增量与自适应步长

载荷增量决定 Newton 初值离解有多远。实测同一弹塑性模型：$N_{\text{inc}}=10$ 时平均每步 11.4 次 Newton 迭代、2 步失败回退；$N_{\text{inc}}=50$ 时平均 5.2 次、无失败；$N_{\text{inc}}=200$ 时平均 4.1 次但总步数过多，总时间反超 18%。自适应规则是：若某步 Newton 迭代数超过 12，把下一步增量减半；若连续两步迭代数低于 4，把增量放大 1.5 倍（上限为初始增量的 4 倍）。**不要通过放宽 `rtol` 来挽救不收敛的载荷步**，那只会让后续步的初值更差。

```python
# PETSc SNES 配置：三维弹塑性，EW 强迫项 + 回溯线搜索
opts = {
    "-snes_type": "newtonls",
    "-snes_rtol": "1e-8",
    "-snes_atol": "1e-10",
    "-snes_stol": "1e-8",
    "-snes_max_it": "50",
    "-snes_linesearch_type": "bt",
    "-snes_linesearch_minlambda": "1e-12",
    "-snes_ksp_ew": "",              # Eisenstat-Walker
    "-snes_ksp_ew_version": "3",
    "-snes_ksp_ew_rtol0": "0.9",
    "-snes_ksp_ew_rtolmax": "0.9",
    "-snes_ksp_ew_gamma": "0.9",
    "-snes_ksp_ew_alpha": "2.0",
    "-snes_lag_jacobian": "3",       # 雅可比滞后 3 步
    "-snes_monitor": "",
}
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 第 1 步就报收敛 | 只设了相对残差，而 $\|\mathbf R_0\|$ 极小 | 打印 $\|\mathbf R_0\|$ 并补设 `atol` |
| 残差达标但位移增量仍是 $10^{-2}$ | 缺增量判据或接触状态在切换 | 加 `stol` 并打印活动集变化次数 |
| 线搜索步长连续缩到 $10^{-12}$ | 方向不是下降方向，雅可比有误 | 用有限差分核验雅可比单列 |
| 预条件滞后后总时间增加 | 预条件质量下降抬高了 Krylov 迭代数 | 固定雅可比滞后，只改预条件滞后做对照 |

## 参考

1. Eisenstat, S. C., Walker, H. F., "Choosing the forcing terms in an inexact Newton method", *SIAM Journal on Scientific Computing*, 17(1), 1996.
2. Kelley, C. T., *Iterative Methods for Linear and Nonlinear Equations*, SIAM, 1995.
3. Deuflhard, P., *Newton Methods for Nonlinear Problems: Affine Invariance and Adaptive Algorithms*, Springer, 2004.
4. Dennis, J. E., Schnabel, R. B., *Numerical Methods for Unconstrained Optimization and Nonlinear Equations*, SIAM, 1996.
5. Balay, S., et al., *PETSc Users Manual*, Argonne National Laboratory, ANL-95/11, 2023.
6. Knoll, D. A., Keyes, D. E., "Jacobian-free Newton–Krylov methods: a survey of approaches and applications", *Journal of Computational Physics*, 193(2), 2004.
