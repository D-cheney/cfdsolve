---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-hybrid-systems-modeling
title: "连续离散混合系统：物理建模与适用边界"
summary: "给出混合 DAE 的连续流与离散跳变两段式结构、事件迭代不动点的收敛条件，并用恒温器滞回算例手算出 75% 占空比与 111.9 s 周期，说明离散方程为何必须对 pre 值确定。"
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
  - "连续离散混合系统"
  - "物理建模与适用边界"
  - "事件迭代"
  - "占空比"
seo:
  title: "连续离散混合系统：物理建模与适用边界"
  description: "给出混合 DAE 的连续流与离散跳变两段式结构、事件迭代不动点的收敛条件，并用恒温器滞回算例手算出 75% 占空比与 111.9 s 周期，说明离散方程为何必须对 pre 值确定。"
  keywords:
    - "连续离散混合系统"
    - "物理建模与适用边界"
    - "事件迭代"
    - "占空比"
    - "pre 算子"
---

# 连续离散混合系统：物理建模与适用边界

混合系统的状态空间里同时存在连续变量和离散变量，前者由微分方程推进，后者只在事件时刻跳变。把两者混在一组方程里写，是 Modelica 最容易出错的地方——工具不会阻止你写出一个事件迭代不收敛的模型，它只会在某个工况下报 `Event iteration did not converge`。本文给出两段式写法、不动点收敛条件，以及一个能用手算闭合验收的恒温器算例。

## 混合系统由连续流与离散跳变两部分组成

规范的混合 DAE 写法把两段分开：

$$ \dot{\mathbf{x}}=\mathbf{f}\big(\mathbf{x},\mathbf{z},t\big),\qquad \mathbf{z}(t_e^+)=\mathbf{h}\big(\mathbf{x}(t_e^-),\mathbf{z}(t_e^-),t_e\big) $$

连续段 $\mathbf{f}$ 可以依赖离散变量 $\mathbf{z}$，但只能以分段常数的形式出现——也就是 $\mathbf{z}$ 在两次事件之间不变。离散段 $\mathbf{h}$ 只在 $t_e$ 求值，其右侧使用事件前的值。这种划分保证了两次事件之间系统是光滑 ODE，求解器可以正常做步长控制。

破坏这个划分的常见写法是把离散变量的更新条件写成依赖自身新值的表达式，例如 `z = not z`。这在 Modelica 中形成代数环，工具会尝试事件迭代并最终失败。

## 事件迭代：离散状态的不动点

事件时刻的求解目标是找到满足下式的 $\mathbf{z}(t_e^+)$：

$$ \mathbf{z}^{(k+1)}=\mathbf{h}\big(\mathbf{x}(t_e^-),\mathbf{z}^{(k)},t_e\big),\qquad \mathbf{z}^{(k+1)}=\mathbf{z}^{(k)} $$

工具从 $\mathbf{z}^{(0)} = \mathrm{pre}(\mathbf{z})$ 出发迭代，直到两次迭代的离散状态完全相同。收敛条件是映射 $\mathbf{h}$ 在离散变量集合上是压缩的——实践中意味着每个离散变量只能依赖其他离散变量的 `pre` 值或已确定的当前值，不能形成环。

收敛速度直接决定仿真耗时。一个恒温器只有 1 个 Boolean，事件迭代 1 到 2 次就收敛；一个有 8 个联锁逻辑的保护系统，若写成链式依赖，迭代次数可能达到上限的 100 次，每次迭代都要重算全部代数方程，代价是数量级的。

## 恒温器滞回：占空比与周期的闭合手算

取 $C = 8372\ \mathrm{J/K}$、$UA = 20\ \mathrm{W/K}$、加热功率 $Q_{on} = 800\ \mathrm{W}$、$T_{amb} = 293.15\ \mathrm{K}$，滞回带宽设为 $[322.15,\ 324.15]\ \mathrm{K}$，中心温度 $T_{avg} = 323.15\ \mathrm{K}$。

周期稳态下平均输入功率必须等于平均散热量，于是占空比

$$ D=\frac{UA\,(T_{avg}-T_{amb})}{Q_{on}}=\frac{20\times30}{800}=0.75 $$

升温段从 322.15 K 到 324.15 K，升温上限温度 $T_{max} = T_{amb} + Q_{on}/UA = 293.15 + 40 = 333.15\ \mathrm{K}$，时间常数 $\tau = C/UA = 8372/20 = 418.6\ \mathrm{s}$。由 $T(t) = T_{max} - (T_{max}-T_{low})e^{-t/\tau}$ 解得

$$ t_{up}=\tau\ln\frac{T_{max}-T_{low}}{T_{max}-T_{high}}=418.6\ln\frac{11}{9}=418.6\times0.2007=84.0\ \mathrm{s} $$

降温段由 $T(t) = T_{amb} + (T_{high}-T_{amb})e^{-t/\tau}$ 给出 $t_{down} = \tau\ln(31/29) = 418.6\times0.06669 = 27.9\ \mathrm{s}$。周期 $84.0 + 27.9 = 111.9\ \mathrm{s}$，占空比 $84.0/111.9 = 0.751$，与能量平衡算出的 0.75 一致，反算平均热流 $0.751\times800 = 600.8\ \mathrm{W}$ 对 $UA(T_{avg}-T_{amb}) = 600\ \mathrm{W}$，闭合到 0.13%。

```modelica
model HybridThermostat
  parameter Modelica.Units.SI.HeatCapacity C = 8372;
  parameter Modelica.Units.SI.ThermalConductance UA = 20;
  parameter Modelica.Units.SI.Power Q_on = 800;
  parameter Modelica.Units.SI.Temperature T_amb = 293.15;
  parameter Modelica.Units.SI.Temperature T_high = 324.15, T_low = 322.15;
  Modelica.Units.SI.Temperature T(start = 322.15, fixed = true);
  discrete Boolean heater(start = true, fixed = true);
equation
  C*der(T) = (if heater then Q_on else 0.0) - UA*(T - T_amb);
  when {T > T_high, T < T_low} then
    heater = if T > T_high then false else true;
  end when;
  annotation(experiment(StopTime = 600, Tolerance = 1e-6, Interval = 0.1));
end HybridThermostat;
```

`heater` 是 `discrete Boolean`，初始值通过 `start = true` 加 `fixed = true` 固定；`when` 的两个条件都是连续的零交叉函数，事件迭代在 1 到 2 次内收敛。若把条件改成单一阈值 `when T > 323.15 then heater = not pre(heater)`，带宽变成零，事件率会随数值噪声无限升高。

## 模式数与状态枚举的代价

$n$ 个离散 Boolean 最多对应 $2^n$ 个模式。8 个联锁开关就是 256 个模式，工具在事件迭代中枚举组合的代价随 $n$ 指数增长。控制手段有两条：把互斥逻辑合并成一个 `Integer` 模式变量（枚举 `Modelica.Blocks.Types` 风格的整数编码），使模式数从 $2^n$ 降到 $n+1$；或者把只在极端工况触发的保护逻辑放到独立模型里，用条件实例化 `if` 语句在翻译期裁掉。

选择哪条取决于逻辑是否真的互斥。互斥逻辑必须合并——分开写会让工具在每个事件上迭代全部组合；非互斥逻辑（例如"同时过温且过流"）不能合并，只能接受枚举代价。

## 离散方程必须对 pre 值确定

确定性要求是：给定 $\mathbf{x}(t_e^-)$ 与 $\mathrm{pre}(\mathbf{z})$，$\mathbf{z}(t_e^+)$ 必须唯一。违反它的三种典型写法：

- `z = not z`：无 `pre`，形成自环；
- `z1 = z2; z2 = not z1`：两个离散变量互指；
- `z = if T > T_high then false else pre(z)` 与另一处 `z = if T < T_low then true else pre(z)` 同时存在：同一离散变量被两条 `when` 赋值，工具报 `Discrete variable assigned in multiple when clauses`。

最后一种是滞回逻辑最常见的错误，正确做法是把两个条件放进同一个 `when` 的条件集合里，只在事件体中出现一次赋值——也就是上面代码的写法。

## 混合建模的失效边界

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Event iteration did not converge` | 离散方程存在跨变量代数环 | 逐个注释 `when` 体赋值，二分定位环 |
| 实测周期远小于 111.9 s | 带宽被写成零或条件缺方向 | 打印事件时刻间隔，检查是否为 84.0/27.9 s 量级 |
| 平均热流与 600 W 差超过 5% | 占空比由能量平衡不成立，存在漏热支路 | 输出 `D*Q_on` 与 `UA*(T_avg-T_amb)` 两条曲线对比 |
| 同一模型换求解器后事件数翻倍 | 离散更新依赖当前值而非 `pre` | 把 `when` 体中的当前值全部换成 `pre` 复跑 |
| 模式数增长后仿真变慢十倍 | 未合并互斥逻辑，枚举代价指数上升 | 把 Boolean 对合并为整数模式变量后比较耗时 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Section 3.7 "Discrete-time and hybrid equations", 2023.
2. Mosterman, P. J., Biswas, G. "A comprehensive methodology for building hybrid models of physical systems." *Artificial Intelligence*, 121(1–2):63–100, 2000.
3. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
4. Elmqvist, H., Mattsson, S. E., Otter, M. "Modelica — the new object-oriented modeling language." *12th European Simulation Multiconference*, 1998.
5. Brogliato, B. *Nonsmooth Mechanics: Models, Dynamics and Control*. 3rd ed., Springer, 2016.
6. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Blocks.Logical`.
