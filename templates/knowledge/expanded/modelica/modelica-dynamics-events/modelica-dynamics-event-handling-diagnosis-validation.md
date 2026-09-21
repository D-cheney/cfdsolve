---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-event-handling-diagnosis-validation
title: "状态事件与时间事件：结果诊断与可信度验证"
summary: "从事件日志读出事件次数、时刻与迭代次数，用解析事件时刻、跨事件能量闭合和事件率三条判据验收混合仿真，给出容差—事件定位误差的定量关系与 noEvent 掩盖事件的排查方法。"
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
  - "状态事件与时间事件"
  - "结果诊断与可信度验证"
  - "事件率"
  - "事件定位误差"
seo:
  title: "状态事件与时间事件：结果诊断与可信度验证"
  description: "从事件日志读出事件次数、时刻与迭代次数，用解析事件时刻、跨事件能量闭合和事件率三条判据验收混合仿真，给出容差—事件定位误差的定量关系与 noEvent 掩盖事件的排查方法。"
  keywords:
    - "状态事件与时间事件"
    - "结果诊断与可信度验证"
    - "事件率"
    - "事件定位误差"
    - "能量闭合"
---

# 状态事件与时间事件：结果诊断与可信度验证

混合仿真的结果对不对，很少能从轨迹曲线上直接看出来——事件时刻错 1 ms，肉眼几乎无差别，但能量账目会差出可见的量。可复算的验收方式是把事件日志当作一等输出：事件次数、事件时刻、每次事件的迭代次数，各自都有解析值或量级阈值可以对照。

## 事件日志里能读出什么

多数工具（Dymola 的 `dslog.txt`、OpenModelica 的 `-lv=LOG_EVENTS`）会逐条打印事件时刻与类型。三类信息必须分开统计：状态事件（state event）由零交叉触发，时刻是迭代求出的；时间事件（time event）由 `sample` 触发，时刻是 $t_{start} + k\,\Delta t$ 的精确值；还有一类是步长被拒后的重试记录，它不属于事件。

诊断的第一步是把状态事件时刻排序后与解析解对比。对 $h_0 = 1.0\ \mathrm{m}$、$g = 9.81\ \mathrm{m/s^2}$、$e = 0.8$ 的弹跳球，首次触地解析时刻为 $t_1 = \sqrt{2h_0/g} = 0.4515\ \mathrm{s}$，若日志给出的首个状态事件是 0.46 s，偏差 8.5 ms，已经远超容差应有的量级。

## 事件定位精度的定量验收

状态事件的时刻误差 $\delta t$ 由事件容差支配，它对反弹高度的相对误差传播为

$$ \frac{\delta h_1}{h_1}=\frac{2\,g\,\delta t}{v} $$

其中 $v = 4.429\ \mathrm{m/s}$ 是触地速度。在 `Tolerance = 1e-6` 下 $\delta t \le 10^{-6}\ \mathrm{s}$，代入得 $\delta h_1/h_1 = 2\times9.81\times10^{-6}/4.429 = 4.4\times10^{-6}$，即 $h_1 = 0.640\ \mathrm{m}$ 的绝对误差上限 $2.8\times10^{-6}\ \mathrm{m}$。这就是验收阈值：仿真给出的首次反弹高度落在 $0.640 \pm 0.000003\ \mathrm{m}$ 之外，说明事件定位或容差设置有问题。

把 `Tolerance` 依次设为 1e-3、1e-4、1e-5、1e-6 各跑一遍，画出 $\delta h_1$ 对容差的曲线。若误差随容差线性下降，定位机制正常；若误差在某档突然跳变，说明该档下求解器跨过了整个事件区间而没有检测到变号——这是零交叉函数不连续或步长上限过大的典型征兆。

## 跨事件能量闭合检查

每次碰撞的机械能比值为 $E_n/E_0 = e^{2n}$。以 $E_0 = mgh_0 = 0.1\times9.81\times1.0 = 0.981\ \mathrm{J}$ 为基准，五次碰撞后的高度依次为 0.640、0.4096、0.2621、0.1678、0.1074 m，对应能量 0.628、0.402、0.257、0.165、0.105 J。到第五次碰撞时累计耗散 $0.981 - 0.105 = 0.876\ \mathrm{J}$，占初值的 89.3%，与 $1 - 0.8^{10} = 0.8926$ 一致。

这条账目的诊断价值在于：把仿真输出的每次反弹高度与 $h_0 e^{2n}$ 逐项对比，若第 3 项开始系统性偏低，说明碰撞后能量被额外吞掉——常见原因是 `reinit` 之后求解器把不连续点当作普通步继续积分，或者事件体里除 `pre(v)` 外还改了其他状态。若逐项偏高，说明碰撞条件在上升段也被触发，一次下落被计成两次碰撞。

```modelica
model BallAudit
  parameter Real g = 9.81, e = 0.8, m = 0.1;
  Real h(start = 1.0, fixed = true), v(start = 0.0, fixed = true);
  Real E "机械能, J";
  Integer nBounce(start = 0, fixed = true);
equation
  der(h) = v;
  der(v) = -g;
  E = m*(0.5*v*v + g*h);
  when h <= 0 and v < 0 then
    reinit(v, -e*pre(v));
    nBounce = pre(nBounce) + 1;
  end when;
  annotation(experiment(StopTime = 5.0, Tolerance = 1e-6, Interval = 1e-3));
end BallAudit;
```

`nBounce` 在 `when` 内赋值，属于离散变量；把它与解析反弹序号对比是最直接的定位手段。注意 `E` 在碰撞瞬间不连续，采样输出必须包含事件时刻（`Interval` 取 1e-3 而非 0.1），否则会漏掉跳变点、误判为能量连续。

## 抖振与事件率阈值

事件率定义为

$$ r=\frac{N_{ev}}{T_{end}-T_{start}} $$

上述弹跳球在 4.064 s 内应发生 31 次碰撞（$e^{2n} = 10^{-6}$ 给出 $n = 30.96$），事件率约 7.6 Hz。若日志显示事件率超过 100 Hz，且事件时刻间距小于 $10^{-4}\ \mathrm{s}$，就是抖振。抖振的三种根因按出现频率排序：零交叉条件缺少方向判据（例如只用 `h <= 0` 而不同时判 `v < 0`）、事件体内存在跨变量代数环导致事件迭代不收敛、以及在阈值附近被 `noEvent` 屏蔽后又重新触发。

`noEvent` 的排查方式是做一次 A/B：保持其他设置不变，把 `noEvent` 去掉再跑，比较事件次数与最终能量。若去掉后事件数增加但能量账目更闭合，说明此前的事件被掩盖；若事件数暴涨而能量不变，说明这些变号没有物理意义，`noEvent` 的使用是合理的。

## 时间事件与状态事件的混淆排查

周期控制器的正确事件集合是 $\{0,\ 0.02,\ 0.04,\ \ldots\}$。把动作时刻导出后做一次模运算检查：$t_k / 0.02$ 是否为整数。若出现 0.031 s 这类非整数时刻，说明控制器走了状态事件而非 `sample`。

另一个高发问题是采样点与状态事件撞在同一时刻。求解器会先处理时间事件再处理状态事件，若控制器读到的测量值是该时刻的旧值，就会出现一个采样周期的额外延迟。判定试验是给被采样信号加一个已知斜率的斜坡，检查保持值是否比理论值晚一个 $T_s = 0.02\ \mathrm{s}$；晚一个周期说明处理顺序反了，需要改用 `Modelica.Blocks.Discrete.Sampler` 或在事件体内显式 `pre` 取值。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 首次反弹高度偏离 0.640 m 超过 3e-6 m | 事件定位容差过松或零交叉函数不连续 | 容差从 1e-3 收到 1e-6，看误差是否线性下降 |
| 事件率超过 100 Hz | 零交叉条件缺方向判据 | 条件加 `and v < 0`，比较事件计数 |
| 五次碰撞后耗散比例偏离 89.3% | `reinit` 改动了额外状态或用了新值 | 打印每次碰撞前后的 `E`，定位跳变点 |
| `Event iteration did not converge` | 事件体内跨变量代数环 | 逐条注释事件体赋值，二分定位 |
| 控制器动作时刻非 0.02 s 整数倍 | 误用状态事件实现周期逻辑 | 导出动作时刻做模运算检查 |
| 去掉 `noEvent` 后能量反而更守恒 | 真实变号被屏蔽 | A/B 对比事件数与能量账目 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Section 3.7.3 "Events", 2023.
2. Zhang, F., Yeddanapudi, M., Mosterman, P. J. "Zero-crossing location and detection algorithms for hybrid system simulation." *IFAC Proceedings Volumes*, 41(2):7967–7972, 2008.
3. Stewart, D. E. "A high accuracy method for solving ODEs with discontinuous right-hand side." *Numerische Mathematik*, 58(1):299–328, 1990.
4. Brogliato, B. *Nonsmooth Mechanics: Models, Dynamics and Control*. 3rd ed., Springer, 2016.
5. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
6. Hairer, E., Wanner, G. *Solving Ordinary Differential Equations II*. 2nd ed., Springer, 1996.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Blocks.Discrete`.
