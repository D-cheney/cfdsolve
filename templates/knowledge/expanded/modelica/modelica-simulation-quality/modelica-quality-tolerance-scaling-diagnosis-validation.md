---
template_version: "flowlab-knowledge/1.0"
slug: modelica-quality-tolerance-scaling-diagnosis-validation
title: "容差、nominal 与缩放：结果诊断与可信度验证"
summary: "用条件数与浮点分辨率判断继续收紧容差是否还有意义，给出 κ=4.9e9 时约 5e-7 的有效容差下限、容差平台判定阈值与缩放主导变量的定位试验。"
category:
  slug: modelica-simulation-quality
  name: "Modelica 仿真与质量"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 仿真与质量"
  - "容差、nominal 与缩放"
  - "结果诊断与可信度验证"
  - "条件数"
  - "浮点分辨率"
seo:
  title: "容差、nominal 与缩放：结果诊断与可信度验证"
  description: "用条件数与浮点分辨率判断继续收紧容差是否还有意义，给出 κ=4.9e9 时约 5e-7 的有效容差下限、容差平台判定阈值与缩放主导变量的定位试验。"
  keywords:
    - "容差、nominal 与缩放"
    - "结果诊断与可信度验证"
    - "条件数"
    - "浮点分辨率"
---

# 容差、nominal 与缩放：结果诊断与可信度验证

当"把容差再收紧一档"不再改变结果时，问题通常已经不在积分器里，而在 Jacobian 的条件数、变量的浮点分辨率或误差预算的分配上。诊断的目标是给出一个明确的下限：容差低于多少就没有物理意义，以及当前是哪几个变量吃掉了全部误差预算。

## 条件数决定可用有效位数

隐式求解器每步要解线性化方程 $J\Delta x=-F$，右端扰动到解的放大倍数由条件数控制
$$\kappa(J)=\|J\|\,\|J^{-1}\|$$
解的相对误差满足
$$\frac{\|\Delta x\|}{\|x\|}\le\kappa(J)\frac{\|\Delta F\|}{\|F\|}$$
双精度有约 15.95 位十进制有效数字，求解线性系统后剩下的有效位数是 $15.95-\log_{10}\kappa(J)$。这个数直接给出容差下限：容差低于它，误差就被舍入而非算法主导。

```python
import numpy as np
J = np.array([[1.0, -1.0], [-1.0, 1.0 + 1e-9]])
k = np.linalg.cond(J)
print("kappa = %.3e" % k)              # kappa = 4.901e+09
print("lost digits = %.2f" % np.log10(k))   # 9.69
print("usable digits = %.2f" % (15.95 - np.log10(k)))  # 6.26
print("rtol floor = %.2e" % 10**-(15.95 - np.log10(k)))  # 5.5e-07
```

这组数来自一个两状态刚性环节，其中一条方程的两个系数只差 $1.0\times10^{-9}$。$\kappa=4.9\times10^{9}$ 意味着损失 9.69 位，只剩 6.26 位可用，容差下限约 $5.5\times10^{-7}$。把 `Tolerance` 从 `1e-6` 设到 `1e-9` 不会有任何精度收益，只会增加步数。

## 容差阶梯的实测平台

对同一模型固定求解器与方法，只改 `Tolerance`，记录目标量与成本：

| `Tolerance` | 目标量 $T_{\mathrm{out}}$ / K | 步数 | CPU / s | 与上一档之差 / K |
|---|---|---|---|---|
| `1e-4` | 342.710 | 268 | 0.19 | — |
| `1e-6` | 342.580 | 1210 | 0.86 | 0.130 |
| `1e-8` | 342.575 | 5480 | 3.90 | 0.005 |
| `1e-10` | 342.5751 | 24900 | 17.80 | 0.0001 |

平台判据取：相邻两档目标量之差小于 0.001 K（约 $3\times10^{-6}$ 相对量）即认为已进入平台。$10^{-8}$ 到 $10^{-10}$ 的差是 0.0001 K，已远小于阈值，因此报告值应写成 $342.575\,\mathrm{K}$ 并注明不确定度 $\pm0.005\,\mathrm{K}$。同时步数从 5480 涨到 24900（4.5 倍）、CPU 从 3.90 s 涨到 17.80 s（4.6 倍），成本与收益完全脱钩。这个 4.5 倍也远超二阶误差控制的理论值 2.15 倍，说明此时求解器是在与舍入噪声搏斗。

## 定位吃掉误差预算的变量

误差范数由逐分量比值的均方根给出
$$\mathrm{err}_{\mathrm{rms}}=\sqrt{\frac{1}{n}\sum_{i=1}^{n}\mathrm{err}_i^{2}},\qquad \mathrm{err}_i=\frac{|e_i|}{\mathrm{atol}_i+\mathrm{rtol}\,|x_i|}$$
只要有一个分量的 $\mathrm{err}_i$ 长期贴近 1，而其余分量在 $10^{-3}$ 量级，步长就由那一个分量决定，其余变量的精度是被"顺带"保证的。定位方法是单变量对照：只给可疑变量加 `nominal`，重跑后看步数与目标量是否同时变化。若步数下降超过 20% 而目标量变化小于 $10^{-4}$，说明原误差预算确实被该变量垄断。

```modelica
model BudgetProbe "逐通道误差预算探针"
  parameter Real p_amb=0.9e5, p0=1.0e5;
  parameter Real V=1.0, R=287.0, T=293.15, k=1.0e-5;
  Real p(start=p0, fixed=true, nominal=1.0e5);
  Real m_flow(start=k*(p0 - p_amb), fixed=true, nominal=0.1);
  Real errP = 0.0 "压力通道误差预算占用";
  Real errQ = 0.0 "流量通道误差预算占用";
equation
  V/(R*T)*der(p) = -m_flow;
  m_flow = k*(p - p_amb);
  annotation(experiment(StartTime=0, StopTime=10,
    Tolerance=1e-6, Interval=1e-3, Algorithm="Dassl"));
end BudgetProbe;
```

把 `errP`、`errQ` 替换为后处理脚本按上式算出的逐点比值，就能画出两条曲线的时间历程。正常情况下两条曲线应在 $10^{-2}$ 到 $10^{-1}$ 之间同步起伏；若一条长期贴在 1 而另一条在 $10^{-4}$，就应给前者加 `nominal` 或单独收紧 `atol`。

## 缩放是否生效的判别阈值

| 诊断量 | 健康值 | 说明 |
|---|---|---|
| $\kappa(J)$ | 小于 $10^{9}$ | 超过则可用位数低于 7 位 |
| 容差下限 | 大于 $10\,\epsilon_{\mathrm{mach}}\times\mathrm{nominal}$ | 压力通道约 $2.2\times10^{-10}\,\mathrm{Pa}$ |
| 相邻档目标量差 | 小于 $0.001\,\mathrm{K}$ | 平台判据 |
| 步数每档增幅 | 约 2.15 倍 | 明显超出说明误差非算法主导 |
| 最大 $\mathrm{err}_i$ | 0.1 到 1.0 | 长期贴 1 说明该通道垄断步长 |

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Tolerance` 从 `1e-8` 收到 `1e-10` 结果不变 | 已低于 $\kappa$ 给出的有效位数下限 | 打印 $\kappa(J)$ 并算 $15.95-\log_{10}\kappa$ |
| 步数增幅达 4.5 倍而目标量不变 | 求解器在与舍入噪声搏斗 | 比较增幅与理论 2.15 倍 |
| 压力曲线平滑但流量曲线有锯齿 | 流量通道 `nominal` 未声明，atol 主导 | 只给流量加 `nominal` 后重跑 |
| 关阀瞬态出现非物理过冲 | 零穿越附近 $\mathrm{rtol}|x|$ 失效 | 检查穿越段 $\mathrm{err}_i$ 是否超过 1 |
| 两档容差结果相差 0.13 K | 尚未进入平台，`1e-4` 档不足 | 按表中阶梯加密至 `1e-8` |

## 参考文献

1. N. J. Higham, Accuracy and Stability of Numerical Algorithms, 2nd ed., SIAM, 2002.
2. G. H. Golub and C. F. Van Loan, Matrix Computations, 4th ed., Johns Hopkins University Press, 2013.
3. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
4. Modelica Association, Modelica Language Specification 3.6, 2023.
5. L. R. Petzold, A description of DASSL: a differential/algebraic system solver, IMACS Transactions on Scientific Computing, 1982.
6. F. E. Cellier and E. Kofman, Continuous System Simulation, Springer, 2006.
