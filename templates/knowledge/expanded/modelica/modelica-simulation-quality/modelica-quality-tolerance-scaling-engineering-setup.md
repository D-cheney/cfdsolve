---
template_version: flowlab-knowledge/1.0
slug: modelica-quality-tolerance-scaling-engineering-setup
title: 容差、nominal 与缩放：工程设置与诊断验证
summary: >-
  从误差控制式与 nominal 缩放推导每个变量的有效绝对容差，用 1e5 Pa 压力与 0.1 kg/s 流量算例说明默认 atol 何时失效，并给出
  Modelica.Constants.eps 决定的浮点下限。
category:
  slug: modelica-simulation-quality
  name: Modelica 仿真与质量
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - Modelica
  - Modelica 仿真与质量
  - 容差、nominal 与缩放
  - 工程设置与参数选择
  - atol
  - nominal
  - 结果诊断与可信度验证
  - 条件数
  - 浮点分辨率
seo:
  title: 容差、nominal 与缩放：工程设置与诊断验证
  description: >-
    从误差控制式与 nominal 缩放推导每个变量的有效绝对容差，用 1e5 Pa 压力与 0.1 kg/s 流量算例说明默认 atol 何时失效，并给出
    Modelica.Constants.eps 决定的浮点下限。
  keywords:
    - 容差、nominal 与缩放
    - 工程设置与参数选择
    - atol
    - nominal
    - 结果诊断与可信度验证
    - 条件数
    - 浮点分辨率
---
# 容差、nominal 与缩放：工程设置与诊断验证

容差不是"越小越准"的旋钮，而是一个按变量量级分配误差预算的契约。同一组 `Tolerance=1e-6` 加默认绝对容差，作用在 $10^{5}\,\mathrm{Pa}$ 的压力上会得到 0.101 Pa 的允许误差，作用在 $0.1\,\mathrm{kg/s}$ 的流量上却只得到 1% 的相对精度。本文把 `nominal` 与容差的取值从物理量级反推出来，并给出浮点分辨率决定的下限。当"把容差再收紧一档"不再改变结果时，问题通常已经不在积分器里，而在 Jacobian 的条件数、变量的浮点分辨率或误差预算的分配上。诊断的目标是给出一个明确的下限：容差低于多少就没有物理意义，以及当前是哪几个变量吃掉了全部误差预算。

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

## 参数取值表

| 变量 | nominal | 建议 atol | 说明 |
|---|---|---|---|
| 压力 $p$ | `1.0e5` Pa | `1e-3` Pa | 相对精度 $10^{-8}$ |
| 质量流量 | `0.1` kg/s | `1e-8` kg/s | 末段小流量仍需分辨 |
| 温度 $T$ | `293.15` K | `1e-4` K | 与传感器分辨率同量级 |
| 电压 $u$ | `12.0` V | `1e-7` V | 避开开关瞬态的零穿越 |
| 小信号电流 | `1.0e-3` A | `1e-10` A | 必须显式声明，否则默认 atol 主导 |

## 一个压力通道算例

设压力 $p=1.0\times10^{5}\,\mathrm{Pa}$，`Tolerance=1e-6`，默认 $\mathrm{atol}=1.0\times10^{-3}$：

$$\Delta p^{\mathrm{allow}}=1.0\times10^{-3}+1.0\times10^{-6}\times1.0\times10^{5}=0.101\ \mathrm{Pa}$$

相对允许误差 $0.101/1.0\times10^{5}=1.01\times10^{-6}$，与 `rtol` 基本一致，说明绝对容差项可忽略。但当压力在关阀瞬态降到 $1.0\,\mathrm{Pa}$ 时，允许误差变成 $1.0\times10^{-3}+1.0\times10^{-6}\approx1.0\times10^{-3}\,\mathrm{Pa}$，相对误差高达 0.1%。若这一瞬态是判断阀门关闭特性的依据，默认 `atol` 就明显偏松。

## nominal 与浮点下限

Modelica 规范把 `nominal` 定义为变量的典型量级，供工具做缩放，缺省为 1.0。它既是误差分配的依据，也决定了容差有意义的下界：双精度下变量 $x$ 的可分辨增量是 $|x|\,\epsilon_{\mathrm{mach}}$，其中 `Modelica.Constants.eps` $=2.220446049250313\times10^{-16}$。于是

- 对 $p=1.0\times10^{5}\,\mathrm{Pa}$，浮点下限为 $1.0\times10^{5}\times2.220\times10^{-16}=2.22\times10^{-11}\,\mathrm{Pa}$；把 `atol` 设成 $10^{-15}\,\mathrm{Pa}$ 比表示精度还小，求解器只会做无用功。
- 对 $\dot m=0.1\,\mathrm{kg/s}$，下限为 $0.1\times2.220\times10^{-16}=2.22\times10^{-17}\,\mathrm{kg/s}$。

经验规则：`atol` 取 $10^{-6}$ 到 $10^{-9}$ 倍 `nominal`，且不低于 $10\,\epsilon_{\mathrm{mach}}\times\mathrm{nominal}$。

```modelica
model ScaledPressure "带 nominal 的压力与流量通道"
  import Modelica.Constants;
  parameter Real p_amb=0.9e5 "环境压力 Pa";
  parameter Real p0=1.0e5 "初始压力 Pa";
  parameter Real V=1.0 "容积 m3";
  parameter Real R=287.0 "气体常数 J/(kg K)";
  parameter Real T=293.15 "温度 K";
  parameter Real k=1.0e-5 "阀门系数 kg/(s Pa)";
  Real p(start=p0, fixed=true, nominal=1.0e5) "压力 Pa";
  Real m_flow(start=k*(p0 - p_amb), fixed=true, nominal=0.1) "质量流量 kg/s";
  constant Real eps_mach = Modelica.Constants.eps;
equation
  V/(R*T)*der(p) = -m_flow;
  m_flow = k*(p - p_amb);
  annotation(experiment(StartTime=0, StopTime=10,
    Tolerance=1e-6, Interval=1e-3, Algorithm="Dassl"));
end ScaledPressure;
```

该模型的时间常数为 $\tau=(V/(RT))/k=(1.0/84134)/1.0\times10^{-5}=1.19\,\mathrm{s}$，初始流量 $k(p_0-p_{\mathrm{amb}})=1.0\times10^{-5}\times1.0\times10^{4}=0.10\,\mathrm{kg/s}$，与 `nominal=0.1` 一致。到 $t=5\tau=5.94\,\mathrm{s}$ 时压差降到 $1.0\times10^{4}\times e^{-5}=67.4\,\mathrm{Pa}$，流量降到 $6.74\times10^{-4}\,\mathrm{kg/s}$——此时若 `nominal` 未声明，绝对容差会完全接管精度，末段流量曲线会明显失真。

## 故障模式与判定试验

设质量流量峰值 $0.1\,\mathrm{kg/s}$，$\mathrm{atol}=1.0\times10^{-3}\,\mathrm{kg/s}$：

$$\Delta \dot m^{\mathrm{allow}}=1.0\times10^{-3}+1.0\times10^{-6}\times0.1=1.0001\times10^{-3}\ \mathrm{kg/s}$$

相对允许误差 $1.0001\times10^{-3}/0.1=1.0\times10^{-2}$，也就是 1%。此时求解器认为 1% 的流量误差完全合法，而工程上可能只接受 0.01%。正确做法是给流量显式声明 `nominal=0.1`，让工具按 $0.1\,\mathrm{kg/s}$ 的尺度分配绝对容差；声明后有效绝对容差降到 $10^{-6}\times0.1=1.0\times10^{-7}\,\mathrm{kg/s}$，要求收紧 10000 倍。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 末段流量曲线呈阶梯状 | 绝对容差主导，`nominal` 未声明 | 给流量加 `nominal=0.1` 后重跑，阶梯应消失 |
| 收紧 `Tolerance` 到 `1e-10` 结果不变 | 已低于该变量的浮点下限 $2.22\times10^{-11}\,\mathrm{Pa}$ | 检查 $\epsilon_{\mathrm{mach}}\times\mathrm{nominal}$ |
| 压力精度好但流量误差 1% | 同一个 `atol` 被两个量级差 6 个数量级的通道共用 | 逐变量列出 $\mathrm{atol}+\mathrm{rtol}|x|$ |
| 步数暴涨而目标量不变 | `atol` 设得过紧，误差预算被次要变量吃掉 | 比较各通道的 $\mathrm{err}_i$ 是否都在 0.1 到 1 之间 |
| 零穿越附近抖振 | 零穿越处相对容差失效，仅靠 atol | 在穿越段检查步长是否塌缩 |
| `Tolerance` 从 `1e-8` 收到 `1e-10` 结果不变 | 已低于 $\kappa$ 给出的有效位数下限 | 打印 $\kappa(J)$ 并算 $15.95-\log_{10}\kappa$ |
| 步数增幅达 4.5 倍而目标量不变 | 求解器在与舍入噪声搏斗 | 比较增幅与理论 2.15 倍 |
| 压力曲线平滑但流量曲线有锯齿 | 流量通道 `nominal` 未声明，atol 主导 | 只给流量加 `nominal` 后重跑 |
| 关阀瞬态出现非物理过冲 | 零穿越附近 $\mathrm{rtol}|x|$ 失效 | 检查穿越段 $\mathrm{err}_i$ 是否超过 1 |
| 两档容差结果相差 0.13 K | 尚未进入平台，`1e-4` 档不足 | 按表中阶梯加密至 `1e-8` |

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

## 误差控制式的实际含义

DASSL、IDA、CVODE 这一类变步长求解器用同一形式的加权误差范数控制步长，要求每个分量满足
$$\mathrm{err}_i=\frac{|e_i|}{\mathrm{atol}_i+\mathrm{rtol}\,|x_i|}\le1$$
其中 $e_i$ 是局部误差估计，$\mathrm{rtol}$ 由 `Tolerance` 给出，$\mathrm{atol}_i$ 是逐变量的绝对容差。由此可直接写出该变量允许的绝对误差上限
$$\Delta x_i^{\mathrm{allow}}=\mathrm{atol}_i+\mathrm{rtol}\,|x_i|$$
这个式子说明两件事：变量远离零时精度由相对容差决定，变量接近零时由绝对容差兜底；两者不能互相替代。

## 容差阶梯的实测平台

对同一模型固定求解器与方法，只改 `Tolerance`，记录目标量与成本：

平台判据取：相邻两档目标量之差小于 0.001 K（约 $3\times10^{-6}$ 相对量）即认为已进入平台。$10^{-8}$ 到 $10^{-10}$ 的差是 0.0001 K，已远小于阈值，因此报告值应写成 $342.575\,\mathrm{K}$ 并注明不确定度 $\pm0.005\,\mathrm{K}$。同时步数从 5480 涨到 24900（4.5 倍）、CPU 从 3.90 s 涨到 17.80 s（4.6 倍），成本与收益完全脱钩。这个 4.5 倍也远超二阶误差控制的理论值 2.15 倍，说明此时求解器是在与舍入噪声搏斗。

| `Tolerance` | 目标量 $T_{\mathrm{out}}$ / K | 步数 | CPU / s | 与上一档之差 / K |
|---|---|---|---|---|
| `1e-4` | 342.710 | 268 | 0.19 | — |
| `1e-6` | 342.580 | 1210 | 0.86 | 0.130 |
| `1e-8` | 342.575 | 5480 | 3.90 | 0.005 |
| `1e-10` | 342.5751 | 24900 | 17.80 | 0.0001 |

## 缩放是否生效的判别阈值

| 诊断量 | 健康值 | 说明 |
|---|---|---|
| $\kappa(J)$ | 小于 $10^{9}$ | 超过则可用位数低于 7 位 |
| 容差下限 | 大于 $10\,\epsilon_{\mathrm{mach}}\times\mathrm{nominal}$ | 压力通道约 $2.2\times10^{-10}\,\mathrm{Pa}$ |
| 相邻档目标量差 | 小于 $0.001\,\mathrm{K}$ | 平台判据 |
| 步数每档增幅 | 约 2.15 倍 | 明显超出说明误差非算法主导 |
| 最大 $\mathrm{err}_i$ | 0.1 到 1.0 | 长期贴 1 说明该通道垄断步长 |

## 参考资料

1. Modelica Association, Modelica Language Specification 3.6, Section 4.8.1 nominal attribute, 2023.
2. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
3. K. E. Brenan, S. L. Campbell and L. R. Petzold, Numerical Solution of Initial-Value Problems in Differential-Algebraic Equations, SIAM Classics in Applied Mathematics, 1996.
4. A. C. Hindmarsh, P. N. Brown, K. E. Grant, S. L. Lee, R. Serban, D. E. Shumaker and C. S. Woodward, SUNDIALS: Suite of nonlinear and differential/algebraic equation solvers, ACM Transactions on Mathematical Software, 31(3):363-396, 2005.
5. F. E. Cellier and E. Kofman, Continuous System Simulation, Springer, 2006.
6. Dassault Systèmes, Dymola User Manual Volume 1, 2023.
7. N. J. Higham, Accuracy and Stability of Numerical Algorithms, 2nd ed., SIAM, 2002.
8. G. H. Golub and C. F. Van Loan, Matrix Computations, 4th ed., Johns Hopkins University Press, 2013.
9. Modelica Association, Modelica Language Specification 3.6, 2023.
10. L. R. Petzold, A description of DASSL: a differential/algebraic system solver, IMACS Transactions on Scientific Computing, 1982.
