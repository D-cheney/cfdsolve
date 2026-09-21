---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-state-selection-diagnosis-validation
title: "状态选择与 StateSelect：结果诊断与可信度验证"
summary: "从翻译日志与 Jacobian 条件数判断工具选了哪组状态、选择是否近退化，用减速器解析解 phi=t^2 验收积分精度，并给出刚接后快模态频率与输出采样间隔的定量匹配规则。"
category:
  slug: modelica-dynamics-events
  name: "Modelica 动态、初始化与事件"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 动态、初始化与事件"
  - "状态选择与 StateSelect"
  - "结果诊断与可信度验证"
  - "条件数"
  - "快模态"
seo:
  title: "状态选择与 StateSelect：结果诊断与可信度验证"
  description: "从翻译日志与 Jacobian 条件数判断工具选了哪组状态、选择是否近退化，用减速器解析解 phi=t^2 验收积分精度，并给出刚接后快模态频率与输出采样间隔的定量匹配规则。"
  keywords:
    - "状态选择与 StateSelect"
    - "结果诊断与可信度验证"
    - "条件数"
    - "快模态"
    - "结构奇异"
---

# 状态选择与 StateSelect：结果诊断与可信度验证

状态选择出问题时，症状往往不是"解错了"，而是"换个减速比就崩"或"换个工具状态数变了"。这两类症状都无法靠看轨迹发现，必须回到翻译日志和 Jacobian 的条件数上。本文给出可复算的验收流程：先确定工具选了哪组状态，再用解析解验收积分精度，最后用参数扰动判断选择是否近退化。

## 从翻译日志确定状态集

Dymola 的 `dslog.txt` 与 OpenModelica 的 `-d=states` 都会打印最终状态集与选择依据。要读三类信息：状态总数、每个状态的 `StateSelect` 档位来源（是作者标注还是工具默认）、以及被指数约简引入的虚拟导数个数。三者相加应等于初始化方程数。

跨工具复现的判据很直接：把同一模型在 Dymola 与 OpenModelica 下各翻译一次，状态数应相同。若不同，说明模型存在多个等代价的状态集，此时必须用 `StateSelect` 显式固定，否则初始化和结果都不具备可移植性。

## 用解析解验收积分精度

对 $J_1 = 0.5\ \mathrm{kg\cdot m^2}$、$J_2 = 0.02\ \mathrm{kg\cdot m^2}$、减速比 $r = 5$、负载侧恒转矩 $\tau = 2.0\ \mathrm{N\cdot m}$ 的刚性传动，等效惯量 $J_{eff} = J_1 + r^2J_2 = 1.0\ \mathrm{kg\cdot m^2}$，电机角加速度恒为 $\dot\omega_1 = \tau/J_{eff} = 2.0\ \mathrm{rad/s^2}$。从静止起积分给出

$$ \omega_1(t)=\frac{\tau}{J_{eff}}\,t,\qquad \varphi_1(t)=\frac{\tau}{2J_{eff}}\,t^2 $$

在 $t = 0.5\ \mathrm{s}$ 处应得 $\omega_1 = 1.0\ \mathrm{rad/s}$、$\varphi_1 = 0.25\ \mathrm{rad}$；在 $t = 1.0\ \mathrm{s}$ 处应得 $\omega_1 = 2.0\ \mathrm{rad/s}$、$\varphi_1 = 1.0\ \mathrm{rad}$。这四个值是状态集选择的验收基准：只要状态集正确，任意求解器在 `Tolerance = 1e-6` 下都应给出相对误差小于 $10^{-6}$ 的结果。若 $\varphi_1$ 与 $t^2$ 偏离，说明工具选了负载侧状态而把 $r^2$ 折算进去后数值消减严重。

```modelica
model GearAudit
  parameter Real J1 = 0.5, J2 = 0.02, r = 5.0, tau = 2.0;
  Real phi1(start = 0, fixed = true, stateSelect = StateSelect.prefer);
  Real w1(start = 0, fixed = true);
  Real phi2(stateSelect = StateSelect.never);
  Real w2;
  Real phiRef, err;
equation
  der(phi1) = w1;
  phi2 = r*phi1;
  w2 = r*w1;
  (J1 + r^2*J2)*der(w1) = tau;
  phiRef = tau*time^2/(2*(J1 + r^2*J2));
  err = phi1 - phiRef;
  annotation(experiment(StopTime = 1.0, Tolerance = 1e-6, Interval = 1e-3));
end GearAudit;
```

`err` 的峰值应随 `Tolerance` 从 1e-4 收到 1e-6 而下降两个数量级；若不下降，问题在状态集或代数环而不在步长。

## 条件数诊断：两种状态集的对比

把状态集分别固定为电机侧与负载侧，各跑一次并输出求解器报告的 Jacobian 条件数

$$ \kappa(\mathbf{J})=\frac{\sigma_{max}}{\sigma_{min}} $$

刚性传动下两者相差 $r^2 = 25$ 倍；减速比改成 $r = 50$ 时相差 2500 倍。$\kappa > 10^{8}$ 时双精度下的有效位数不足 8 位，$\kappa > 10^{12}$ 时线性求解基本不可信。诊断动作是：在 `StateSelect` 两种设置下各跑 100 步，比较累计 Newton 迭代次数；若负载侧状态需要 3 倍以上迭代次数，就把状态固定在电机侧。

## 近退化选择与参数扰动试验

近退化指的是两个候选状态集的代价几乎相同，工具的选择对参数微小变化敏感。判定试验是把某个参数扰动 $10^{-3}$ 的相对量再翻译一次，看状态数是否改变。改变即说明处于近退化区，必须显式标注 `StateSelect`。

扰动对象要选对：对传动系统扰动减速比 $r$ 最有效（$r$ 从 5.000 到 5.005 会让 $r^2$ 从 25.00 变到 25.05，等效惯量从 1.000 变到 1.001 kg·m²）；扰动惯量 $J_2$ 效果弱得多，因为 $r^2J_2$ 只占 $J_{eff}$ 的一部分。

## 加刚性连接后出现的快模态

把刚性连接换成刚度 $k = 10^{6}\ \mathrm{N\cdot m/rad}$ 的弹性轴，系统从 1 个状态变成 2 个，新增快模态

$$ \omega_{fast}=\sqrt{k\left(\frac1{J_1}+\frac1{J_2}\right)}=\sqrt{10^{6}\times(2+50)}=7211\ \mathrm{rad/s} $$

对应 $f_{fast} = \omega/2\pi = 1148\ \mathrm{Hz}$、周期 0.87 ms。此时原输出设置 `Interval = 1e-3` 只有 1000 Hz 采样率，低于 2 倍快模态频率，$f_{fast}$ 会被混叠成一个低频假信号——这是状态选择诊断中最容易误判为"物理振荡"的陷阱。判据是

$$ \Delta t_{out}<\frac{1}{2f_{fast}}=\frac{1}{2295}\approx 4.4\times10^{-4}\ \mathrm{s} $$

把 `Interval` 改到 $10^{-4}\ \mathrm{s}$ 后，若"振荡"消失或频率翻倍，就确认是混叠而非物理。这一步必须在怀疑状态选择之前完成，否则会花时间在错误的方向上调参。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\varphi_1$ 与 $t^2$ 偏差随 $r$ 放大 | 状态选在负载侧，$r^2$ 进入病态项 | 把 `StateSelect.prefer` 移到电机侧角度，比较 `err` 峰值 |
| 换工具后状态数从 1 变 2 | 存在多个等代价状态集 | 显式标注 `never` 与 `prefer` 后重新交叉翻译 |
| 参数扰动 1e-3 后状态数改变 | 近退化选择 | 扰动 $r$ 而非 $J_2$，确认敏感方向 |
| 输出出现 1148 Hz 附近的假低频 | 采样间隔 1e-3 s 低于 Nyquist | 把 `Interval` 收到 1e-4 s，看频率是否翻倍 |
| `Structurally singular system` | 对代数确定量用了 `always` | 改为 `never` 并检查初始化方程数 |
| 约束漂移超过 1e-4 m | 指数约简后未投影 | 输出约束残差曲线，与 `Tolerance` 同步缩放 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Section 8.4 "State Selection", 2023.
2. Pantelides, C. C. "The consistent initialization of differential-algebraic systems." *SIAM J. Sci. Stat. Comput.*, 9(2):213–231, 1988.
3. Mattsson, S. E., Söderlind, G. "Index reduction in differential-algebraic equations using dummy derivatives." *SIAM Journal on Scientific Computing*, 14(3):677–692, 1993.
4. Hairer, E., Wanner, G. *Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems*. 2nd ed., Springer, 1996.
5. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
6. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Mechanics.Rotational.Components`.
