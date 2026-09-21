---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-event-handling-modeling
title: "状态事件与时间事件：物理建模与适用边界"
summary: "区分状态事件的零交叉定位与时间事件的精确命中，用弹跳球解析解确定事件时刻与恢复系数关系，说明零交叉函数连续性要求、事件迭代的离散更新写法，以及何时应改用正则化而非不连续。"
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
  - "状态事件与时间事件"
  - "物理建模与适用边界"
  - "零交叉函数"
  - "reinit"
seo:
  title: "状态事件与时间事件：物理建模与适用边界"
  description: "区分状态事件的零交叉定位与时间事件的精确命中，用弹跳球解析解确定事件时刻与恢复系数关系，说明零交叉函数连续性要求、事件迭代的离散更新写法，以及何时应改用正则化而非不连续。"
  keywords:
    - "状态事件与时间事件"
    - "物理建模与适用边界"
    - "零交叉函数"
    - "reinit"
    - "事件迭代"
---

# 状态事件与时间事件：物理建模与适用边界

Modelica 里"到点做事"有两套机制：状态事件由某个连续量过零触发，时刻由求解器迭代定位；时间事件由 `sample` 或 `time` 比较触发，时刻精确已知。选错机制会带来两类典型问题——把物理冲击写成周期采样会漏掉真实峰值，把周期控制器写成状态事件会让步长被逻辑抖动绑架。本文用弹跳球与采样保持两个算例划清边界。

## 状态事件与时间事件的语义差别

状态事件的触发条件是零交叉函数变号：

$$ g\big(\mathbf{x}(t),t\big)=0,\qquad g\big(\mathbf{x}(t_e^-),t\big)\cdot g\big(\mathbf{x}(t_e^+),t\big)\le 0 $$

求解器先用步长控制找到变号区间，再用割线或二分把 $t_e$ 收敛到事件容差内（通常等于 `Tolerance`，例如 1e-6 s）。因此状态事件的时刻精度受容差支配，不是机器精度。

时间事件则是 $t = t_{start} + k\,\Delta t$ 上的精确定位，`sample(0, 0.5)` 保证求解器在 0.0、0.5、1.0 s 这些点必然落步，误差为零。周期控制器、数据采集、离散滤波器都应走这条路。

## 零交叉函数必须连续

Modelica 规范要求 `when` 的条件表达式在事件前后连续可微，否则求解器无法可靠定位变号。写成 `when T > 320 then` 是合法的，但写成 `when (if T > 320 then 1 else -1) > 0 then` 会让零交叉函数本身跳变，工具可能报 `Zero crossing function is discontinuous` 或直接漏事件。

物理上确实存在跳变的场合，做法是把不连续放进事件体，让条件保持连续：

$$ \mathbf{x}(t_e^+)=g\big(\mathbf{x}(t_e^-),\mathbf{u}(t_e)\big) $$

上式右侧只使用事件前的值（通过 `pre` 读取）和事件时刻的外部输入，保证更新映射是良定义的。事件体内不要引用自身的新值，否则会形成代数环。

## 碰撞算例：从解析解确定事件时刻

质量 $m = 0.1\ \mathrm{kg}$ 的小球从 $h_0 = 1.0\ \mathrm{m}$ 自由下落，$g = 9.81\ \mathrm{m/s^2}$，恢复系数 $e = 0.8$。首次触地速度 $v = \sqrt{2gh_0} = \sqrt{19.62} = 4.429\ \mathrm{m/s}$，首次触地时刻 $t_1 = \sqrt{2h_0/g} = 0.4515\ \mathrm{s}$。反弹速度 $v^+ = e\,v = 3.543\ \mathrm{m/s}$，反弹高度

$$ h_1=\frac{(e\,v)^2}{2g}=e^2\,h_0=0.64\times 1.0=0.640\ \mathrm{m} $$

每次碰撞损失的能量比例为 $1 - e^2 = 36\%$：初始势能 $E_0 = mgh_0 = 0.1\times 9.81\times 1.0 = 0.981\ \mathrm{J}$，反弹后 $E_1 = 0.1\times 9.81\times 0.640 = 0.628\ \mathrm{J}$。若不加任何终止判据，事件次数趋于无穷（Zeno 现象），理论上停止时刻为

$$ t_\infty=t_1\left(1+\frac{2e}{1-e}\right)=0.4515\times\left(1+\frac{1.6}{0.2}\right)=4.064\ \mathrm{s} $$

而实际要 31 次碰撞后高度才降到 $10^{-6}\ \mathrm{m}$ 以下（$e^{2n} = 10^{-6}$ 给出 $n = 30.96$）。这说明建模时必须给一个"高度低于 $10^{-4}\ \mathrm{m}$ 或速度低于 $10^{-3}\ \mathrm{m/s}$ 即锁死"的终止事件，否则末段事件率会爆炸。

```modelica
model BouncingBall
  parameter Real g = 9.81;
  parameter Real e = 0.8;
  Real h(start = 1.0, fixed = true);
  Real v(start = 0.0, fixed = true);
equation
  der(h) = v;
  der(v) = -g;
  when h <= 0 and v < 0 then
    reinit(v, -e*pre(v));
  end when;
  annotation(experiment(StopTime = 5.0, Tolerance = 1e-6, Interval = 0.01));
end BouncingBall;
```

条件里加 `v < 0` 是为了让零交叉函数只在下降段触发，否则末段 $h$ 在零附近振荡时同一 `when` 会在上下两个方向反复激活。

## 事件迭代与离散更新的一致性

事件体内若有多条赋值互相依赖，工具会反复求值直到离散状态收敛，这个循环叫事件迭代。下面的周期采样例子把时间事件与离散保持放在一起：

```modelica
model SampledHold
  parameter Modelica.Units.SI.Time Ts = 0.02 "采样周期";
  discrete Modelica.Units.SI.Temperature u_hold;
  Modelica.Units.SI.Temperature u;
equation
  u = 293.15 + 10*sin(2*Modelica.Constants.pi*7*time);
  when sample(0, Ts) then
    u_hold = u;
  end when;
  annotation(experiment(StopTime = 1.0, Tolerance = 1e-6, Interval = 1e-3));
end SampledHold;
```

`u_hold` 只在 $t = 0,\ 0.02,\ 0.04\ \ldots$ 更新，两个采样点之间保持前值。迭代收敛失败时工具会报 `Event iteration did not converge` 并给出迭代次数上限（常见 100 次），根因通常是事件体内存在跨变量的代数环，而不是容差太小。

## 何时该改用正则化

若切换只是数值上的近似（例如把饱和函数写成硬限幅），应改回连续表达式而不产生事件。判据是：切换前后目标量的差是否小于工程容差。以采样保持为例，若被采样信号的最高频率为 7 Hz、采样周期 0.02 s（50 Hz），零阶保持引入的平均时延为 $T_s/2 = 0.01\ \mathrm{s}$，折算相位滞后 $360\times7\times0.01 = 25.2^\circ$；这个滞后是物理上真实存在的，不能靠 `noEvent` 消除，只能靠减小 $T_s$ 或改用 `Modelica.Blocks.Discrete.FirstOrderHold`。

`noEvent` 的正确用途是屏蔽那些不承载物理意义的变号，例如 `noEvent(abs(x) < 1e-9)` 这类除零保护。用它去压掉真实冲击，只会让能量凭空消失。

## 失效信号与边界

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 碰撞后能量回升，超过 $E_0 = 0.981\ \mathrm{J}$ | `reinit` 里用了 `v` 而非 `pre(v)`，形成自反馈 | 把 `pre(v)` 换成 `v` 复跑，看是否报代数环 |
| 事件次数远多于 31 次 | 零交叉条件缺少方向判据 | 在条件里加 `and v < 0`，比较事件计数 |
| 事件时刻与 0.4515 s 差 0.01 s 以上 | 容差过松或零交叉函数不连续 | 把 `Tolerance` 从 1e-3 收到 1e-6，看误差是否线性下降 |
| `Event iteration did not converge` | 事件体内跨变量代数环 | 逐个注释事件体赋值，定位环所在 |
| 周期控制器在非采样点动作 | 误用状态事件代替 `sample` | 输出动作时刻，检查是否为 $k \times 0.02\ \mathrm{s}$ |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Chapter 8 "Equations" and Section 3.7.3 "Events", 2023.
2. Mattsson, S. E., Elmqvist, H., Otter, M. "Physical system modeling with Modelica." *Control Engineering Practice*, 6(4):501–510, 1998.
3. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
4. Zhang, F., Yeddanapudi, M., Mosterman, P. J. "Zero-crossing location and detection algorithms for hybrid system simulation." *IFAC Proceedings Volumes*, 41(2):7967–7972, 2008.
5. Stewart, D. E. "A high accuracy method for solving ODEs with discontinuous right-hand side." *Numerische Mathematik*, 58(1):299–328, 1990.
6. Brogliato, B. *Nonsmooth Mechanics: Models, Dynamics and Control*. 3rd ed., Springer, 2016.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Blocks.Discrete`.
