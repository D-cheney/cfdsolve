---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-initialization-modeling
title: "初始化方程与稳态起点：物理建模与适用边界"
summary: "讲清 Modelica 初始化方程组的未知量与方程计数规则、稳态起点与瞬态起点的分界条件，用集总热容算例给出可核对的手算基线，并说明 homotopy 延拓何时能救回难收敛的初值。"
category:
  slug: modelica-dynamics-events
  name: "Modelica 动态、初始化与事件"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 动态、初始化与事件"
  - "初始化方程与稳态起点"
  - "物理建模与适用边界"
  - "initial equation"
  - "homotopy"
seo:
  title: "初始化方程与稳态起点：物理建模与适用边界"
  description: "讲清 Modelica 初始化方程组的未知量与方程计数规则、稳态起点与瞬态起点的分界条件，用集总热容算例给出可核对的手算基线，并说明 homotopy 延拓何时能救回难收敛的初值。"
  keywords:
    - "初始化方程与稳态起点"
    - "物理建模与适用边界"
    - "initial equation"
    - "homotopy"
    - "fixed 属性"
---

# 初始化方程与稳态起点：物理建模与适用边界

Modelica 仿真的第一个时间步不是从零状态出发的，而是先解一个与时间推进同规模的非线性方程组。稳态起点用 $\dot{\mathbf{x}}_0 = 0$ 换取可复现的工作点，`fixed = true` 的 start 值只提供瞬态起点。本文说明初始方程该写几条、稳态假设什么时候成立、以及初始化失败在工具日志里长什么样。

## 初始化是一组与时间推进同形的方程

Modelica 把初始化写成与时域推进结构相同的方程组，未知量是全部变量在 $t_0$ 的取值：

$$ \mathbf{F}(\dot{\mathbf{x}}_0,\mathbf{x}_0,\mathbf{z}_0,t_0)=\mathbf{0} $$

$\mathbf{x}$ 是指数约简后剩余的连续状态，$\mathbf{z}$ 是离散变量。这条式子决定了初始化的自由度：需要补充的方程条数恰好等于状态数与离散变量数之和。多一条会得到 `The initialization problem is overdetermined`，少一条得到 `underdetermined`，两者都是计数问题而非数值问题。

补方程的途径有两条。其一是 `initial equation` 段里对某个状态直接写一条；其二是 `x(start = 300.15, fixed = true)`。同一状态上两者不可同时使用——那会平白多出一条方程，这正是过约束最常见的来源。把 `fixed` 从 `true` 改成 `false` 后，该状态重新变成待解量，`initial equation` 里那条方程才重新生效。

## 稳态起点与瞬态起点的分界

稳态起点给每个状态补 $\dot{x}_0 = 0$：

$$ \dot{\mathbf{x}}_0 = \mathbf{0}, \qquad \mathbf{F}(\mathbf{0},\mathbf{x}_0,\mathbf{z}_0,t_0)=\mathbf{0} $$

它成立的前提是系统在 $t_0$ 确实处于平衡，或者你只关心 $t \gg \tau$ 之后的响应。若目标是复现启动过程或故障后 3 s 内的压力波，稳态起点会把真实的初始不平衡抹平，得到一条物理上不存在的平缓曲线。

分界判据用时间常数与观测窗口比较：设系统最慢时间常数为 $\tau$，观测窗口为 $T_{obs}$，当 $T_{obs} < 3\tau$ 时应使用瞬态起点（`fixed = true` 加实测或估算初值）；当 $T_{obs} > 10\tau$ 且不关心前段时用稳态起点更省事，因为它不依赖初值估计质量。

## 集总热容的手算基线

一个 2 kg 水当量、比热 $c_p = 4186\ \mathrm{J/(kg\cdot K)}$ 的集总热容，热容 $C = 2 \times 4186 = 8372\ \mathrm{J/K}$，与环境总换热系数 $UA = 12\ \mathrm{W/K}$，加热功率 $Q = 600\ \mathrm{W}$，环境温度 $T_{amb} = 293.15\ \mathrm{K}$。控制方程为

$$ C\frac{dT}{dt} = Q - UA\,(T - T_{amb}) $$

稳态解 $T_{ss} = T_{amb} + Q/UA = 293.15 + 600/12 = 343.15\ \mathrm{K}$，时间常数 $\tau = C/UA = 8372/12 = 697.7\ \mathrm{s}$。若改用 `fixed = true` 并把初值设为 300.15 K，初始偏差 43.0 K 在 $t = \tau$ 时衰减到 $43.0/e = 15.8\ \mathrm{K}$，在 $t = 5\tau = 3489\ \mathrm{s}$ 时只剩 $43.0\,e^{-5} = 0.29\ \mathrm{K}$。所以错误初值只污染前几百秒，不改变稳态；反过来，若只跑 200 s，你看到的几乎全是初始化偏差而不是模型行为。

稳态起点的代价也要算清：它把 $T_0$ 从待解量变成由代数方程确定的值，如果 $Q$ 或 $UA$ 在 $t_0$ 处本身有阶跃定义，稳态方程会与阶跃后的值矛盾，工具会在第一步给出非零的 `der(T)`。

## homotopy 延拓与初始约束数

非线性初始化失败多发生在初值离解太远，或方程含指数、对数、开方项。Modelica 的 `homotopy(actual, simplified)` 提供从简化方程到真实方程的连续路径，工具在初始化阶段沿 $\lambda$ 做延拓：

$$ \mathbf{F}\big(\mathrm{homotopy}(a,h)\big)=0, \qquad \mathrm{homotopy}(a,h)=(1-\lambda)\,h+\lambda\,a,\quad \lambda:0\to1 $$

$\lambda = 0$ 时返回 simplified，$\lambda = 1$ 时返回 actual。MSL 的 `Modelica.Fluid` 介质模型就用它把理想气体解延拓到真实状态方程。注意 homotopy 只改变求解路径，不改变初始约束数：简化式必须与真实式在 $\lambda = 1$ 处连通，否则延拓终点仍然无解。

```modelica
model ThermalStart
  parameter Modelica.Units.SI.HeatCapacity C = 8372 "热容";
  parameter Modelica.Units.SI.ThermalConductance UA = 12 "总换热系数";
  parameter Modelica.Units.SI.Power Q = 600 "加热功率";
  parameter Modelica.Units.SI.Temperature T_amb = 293.15 "环境温度";
  Modelica.Units.SI.Temperature T(start = 300.15, fixed = false);
equation
  C*der(T) = Q - UA*(T - T_amb);
initial equation
  der(T) = 0;   // 稳态起点, 等价于 T = 343.15 K
  // 复现瞬态时删掉上一行, 改为 T = 300.15 并把 fixed 置 true
  annotation(experiment(StopTime = 3600, Tolerance = 1e-6, Interval = 1.0));
end ThermalStart;
```

## 初始化失败的可观测信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `overdetermined initialization` | 同一状态既有 `fixed = true` 又有 `initial equation` | 注释掉 `der(T) = 0`，看方程计数是否恢复 |
| 初始化收敛但第一步 `der(T)` 跳变 | 稳态假设与 `start` 值或阶跃源项矛盾 | 输出 $t = 0$ 的 `der(T)`，量级超过 1e-3 K/s 即矛盾 |
| `homotopy` 路径末端无解 | simplified 与 actual 在 $\lambda = 1$ 不连通 | 令 simplified 等于 actual 复跑，若成功则简化式选错 |
| 长跑后温度仍缓慢漂移 | 稳态方程漏掉一项源项或换热支路 | 检查 $t = 10\tau$ 处 $|\dot{T}|$ 是否小于 1e-8 K/s |
| 不同工具给出不同 $T_0$ | 初始化方程组欠定，解不唯一 | 打印状态数与初始方程数，核对是否相等 |

## 什么条件下该升级模型

单节点集总热容只在毕渥数 $Bi = hL/k < 0.1$ 时成立。以上述算例估算，若物体特征长度 $L = 0.05\ \mathrm{m}$、导热系数 $k = 0.6\ \mathrm{W/(m\cdot K)}$，则要求 $h < 0.1 \times 0.6/0.05 = 1.2\ \mathrm{W/(m^2\cdot K)}$；超过这个值就需要把物体离散成多节点或改用 `Modelica.Thermal.HeatTransfer.Components.ThermalConductor` 网络。升级的信号是：把节点数从 1 增到 5 后 $T_{ss}$ 变化超过 1 K，或实测与仿真的时间常数比值偏离 1 超过 20%。

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Section 8.6 "Initialization, initial equation, and initial algorithm", 2023.
2. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015.
3. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
4. Pantelides, C. C. "The consistent initialization of differential-algebraic systems." *SIAM Journal on Scientific and Statistical Computing*, 9(2):213–231, 1988.
5. Sielemann, M., Casella, F., Otter, M. "Robust initialization of differential algebraic equations." *Proceedings of the 8th International Modelica Conference*, Dresden, 2011, pp. 133–141.
6. Mattsson, S. E., Söderlind, G. "Index reduction in differential-algebraic equations using dummy derivatives." *SIAM Journal on Scientific Computing*, 14(3):677–692, 1993.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Fluid.Utilities`.
