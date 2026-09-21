---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-initialization-diagnosis-validation
title: "初始化方程与稳态起点：结果诊断与可信度验证"
summary: "用初始残差、方程计数和解析解三条独立证据审查 Modelica 初始化结果，给出把容差、初值和 homotopy 路径变化与真实物理变化区分开的判定试验，并量化初始化 Jacobian 的条件数阈值。"
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
  - "初始化方程与稳态起点"
  - "结果诊断与可信度验证"
  - "初始残差"
  - "方程计数"
seo:
  title: "初始化方程与稳态起点：结果诊断与可信度验证"
  description: "用初始残差、方程计数和解析解三条独立证据审查 Modelica 初始化结果，给出把容差、初值和 homotopy 路径变化与真实物理变化区分开的判定试验，并量化初始化 Jacobian 的条件数阈值。"
  keywords:
    - "初始化方程与稳态起点"
    - "结果诊断与可信度验证"
    - "初始残差"
    - "方程计数"
    - "解析解对照"
---

# 初始化方程与稳态起点：结果诊断与可信度验证

初始化"跑通了"不等于初始化"对了"。一个欠定的初始化方程组同样能收敛，只是解依赖于求解器内部初值；一个过约束的系统有时靠最小二乘被悄悄放过。本文给出三条可独立复核的证据：初始残差是否为零、方程计数是否相等、瞬态是否与解析解一致，并给出容差敏感性阈值。

## 初始化结果需要三类独立证据

第一类是结构证据：状态数加离散变量数是否等于初始方程数。第二类是残差证据：把解出的 $\mathbf{x}_0$ 代回方程算残差，是否在机器精度量级。第三类是轨迹证据：瞬态段与解析解或长时稳态的偏差是否随容差单调收敛。三类证据缺一不可——残差为零但方程数不匹配，说明解落在非唯一解族的一个点上；方程数匹配但残差非零，说明求解器提前退出。

## 方程计数与初始残差

对集总热容模型 $C = 8372\ \mathrm{J/K}$、$UA = 12\ \mathrm{W/K}$、$Q = 600\ \mathrm{W}$、$T_{amb} = 293.15\ \mathrm{K}$，初始残差定义为

$$ r_0 = C\,\dot{T}_0 - Q + UA\,(T_0 - T_{amb}) $$

稳态起点给出 $T_0 = 343.15\ \mathrm{K}$、$\dot{T}_0 = 0$，代入得 $r_0 = 0 - 600 + 12 \times 50 = 0\ \mathrm{W}$，恰好为零。若误设 $T_0 = 340\ \mathrm{K}$，则 $12 \times 46.85 = 562.2\ \mathrm{W}$，$r_0 = -37.8\ \mathrm{W}$，对应 $\dot{T}_0 = -37.8/8372 = -4.5\times10^{-3}\ \mathrm{K/s}$。这个量级远大于数值噪声，所以 $t = 0$ 处的 `der(T)` 是一个零成本的哨兵：稳态初始化下它必须小于 $10^{-8}\ \mathrm{K/s}$。

结构检查同样直接：在 Dymola 或 OpenModelica 的翻译日志里数 `Number of states`，加上 `Number of discrete-time variables`，与 `initial equation` 里的方程条数加 `fixed = true` 的 start 定义数比较。两侧不等就是结构性错误，任何容差调整都掩盖不了。

## 用解析解核对瞬态起点

一阶惯性的解析解为

$$ T(t)=T_{ss}+(T_0-T_{ss})\,e^{-t/\tau}, \qquad T_{ss}=T_{amb}+\frac{Q}{UA},\quad \tau=\frac{C}{UA} $$

用 $T_{ss} = 343.15\ \mathrm{K}$、$\tau = 8372/12 = 697.7\ \mathrm{s}$、$T_0 = 300.15\ \mathrm{K}$，初始偏差 43.0 K。在 $t = 200\ \mathrm{s}$ 处 $e^{-200/697.7} = 0.7508$，仿真应给出 $T = 343.15 - 43.0 \times 0.7508 = 310.87\ \mathrm{K}$；在 $t = \tau = 697.7\ \mathrm{s}$ 处应给出 $343.15 - 43.0/e = 327.33\ \mathrm{K}$。把这两点与仿真输出对比，偏差应随 `Tolerance` 从 1e-3 收紧到 1e-6 而下降至少一个数量级。若两点偏差不随容差变化，问题在模型方程而不在求解器。

## 稳态起点的自洽性检查

稳态起点的验证方式是把同一模型用两种方式跑到同一时刻：一种用 `initial equation der(T) = 0`，另一种用 `fixed = true` 给一个粗估初值并跑到 $t = 10\tau = 6977\ \mathrm{s}$。两条轨迹在末端的差应小于 0.01 K。若差超过 1 K，通常是稳态方程漏了一项源项，或某个换热支路在 $t_0$ 处仍有阶跃未生效。

```modelica
model InitAudit
  parameter Real C = 8372, UA = 12, Q = 600, T_amb = 293.15;
  Real T(start = 300.15, fixed = true);
  Real r0 "初始残差, W";
equation
  C*der(T) = Q - UA*(T - T_amb);
  r0 = C*der(T) - Q + UA*(T - T_amb);
  annotation(experiment(StopTime = 7000, Tolerance = 1e-6, Interval = 1.0),
             __Dymola_experimentSetupOutput);
end InitAudit;
```

`r0` 在整条轨迹上应恒等于零；把它作为输出变量画出来，比事后手算更容易发现某段时间内残差不为零（意味着方程与状态不一致）。

## 容差敏感性：区分物理与伪影

把 `Tolerance` 从 1e-6 放宽到 1e-3 再跑一遍。若 $T(200)$ 的变化超过 0.01 K，说明初始状态病态，需要检查初始化 Jacobian $\mathbf{J}_0 = \partial \mathbf{F}/\partial \mathbf{x}_0$ 的条件数

$$ \kappa(\mathbf{J}_0)=\frac{\sigma_{max}}{\sigma_{min}} $$

$\kappa > 10^{10}$ 时双精度下初始解只有约 6 位有效数字，此时应先用 `homotopy` 或降低模型刚性。另一个伪影来源是输出 `Interval = 1.0` 与内部步长的错配：初始化偏差在第一个输出点可能已被内部小步长衰减掉，导致误判"初始化没问题"。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 初始化收敛但 $T(200)$ 与解析解差 5 K 以上 | 初值被 `fixed = true` 锁死而非由方程解出 | 把 `fixed` 改为 `false` 并保留 `initial equation`，看是否回到 310.87 K |
| 换一台机器 $T_0$ 变化 2 K | 初始化方程组欠定 | 打印状态数与初始方程数，核对两侧是否相等 |
| 放宽容差后 $T_0$ 跳变 | 初始 Jacobian 条件数过大 | 用 `homotopy` 重跑，若路径平稳则确认为病态 |
| 残差 $\|r_0\|$ 小于 1e-10 但能量不守恒 | 残差按绝对值判据，未按 $Q$ 的量级归一 | 改用 $r_0/Q$，阈值 1e-8 |
| 稳态起点与 10τ 长跑不一致 | 稳态方程漏项或 $t_0$ 处有阶跃源 | 在 $t_0$ 输出全部源项，检查是否有未生效的阶跃 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Section 8.6, 2023.
2. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
3. Pantelides, C. C. "The consistent initialization of differential-algebraic systems." *SIAM J. Sci. Stat. Comput.*, 9(2):213–231, 1988.
4. Sielemann, M., Casella, F., Otter, M. "Robust initialization of differential algebraic equations." *8th International Modelica Conference*, 2011, pp. 133–141.
5. Brown, P. N., Hindmarsh, A. C., Petzold, L. R. "Consistent initial condition calculation for differential-algebraic systems." *SIAM J. Sci. Comput.*, 19(5):1495–1512, 1998.
6. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015.
7. Hairer, E., Wanner, G. *Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems*. 2nd ed., Springer, 1996.
