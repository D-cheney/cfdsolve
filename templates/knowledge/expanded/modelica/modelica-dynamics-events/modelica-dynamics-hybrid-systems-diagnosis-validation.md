---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-hybrid-systems-diagnosis-validation
title: "连续离散混合系统：结果诊断与可信度验证"
summary: "用事件时刻审计、整周期能量闭合和平均化模型交叉验证三条线验收混合仿真，给出占空比 75%、周期 111.9 s、事件率 0.018 Hz 等可对照数值，并说明如何区分抖振与真实高频切换。"
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
  - "连续离散混合系统"
  - "结果诊断与可信度验证"
  - "能量闭合"
  - "平均化模型"
seo:
  title: "连续离散混合系统：结果诊断与可信度验证"
  description: "用事件时刻审计、整周期能量闭合和平均化模型交叉验证三条线验收混合仿真，给出占空比 75%、周期 111.9 s、事件率 0.018 Hz 等可对照数值，并说明如何区分抖振与真实高频切换。"
  keywords:
    - "连续离散混合系统"
    - "结果诊断与可信度验证"
    - "能量闭合"
    - "平均化模型"
    - "抖振"
---

# 连续离散混合系统：结果诊断与可信度验证

混合仿真的结果里混着两类误差：连续段的积分误差和离散段的时序误差。前者可以靠收紧容差压下去，后者不会——事件时刻错一个采样点，占空比就整体偏移，而轨迹看上去依然平滑。可复算的验收方式是把混合模型投影到两个可手算的量上：占空比与周期，再用整周期能量闭合和平均化模型做交叉验证。

## 混合结果的三条验收线

第一条是时序线：事件时刻集合是否落在解析预期的 $\{84.0,\ 111.9,\ 195.9,\ \ldots\}$ s 附近。第二条是能量线：一个完整周期内输入热量是否等于散热量。第三条是极限线：把开关换成占空比平均后的连续模型，其稳态温度是否等于混合模型的周期平均值。

三条线覆盖不同的失效模式。时序线抓逻辑错误，能量线抓漏热或漏功率支路，极限线抓离散化本身的偏差。三条同时通过，结论才具备可移植性。

## 占空比与周期的事件时刻审计

对 $C = 8372\ \mathrm{J/K}$、$UA = 20\ \mathrm{W/K}$、$Q_{on} = 800\ \mathrm{W}$、$T_{amb} = 293.15\ \mathrm{K}$、带宽 $[322.15,\ 324.15]\ \mathrm{K}$ 的恒温器，解析周期为升温 84.0 s 加降温 27.9 s 共 111.9 s，占空比 0.751。运行 600 s 应得到 $600/111.9 = 5.36$ 个周期，即约 10 到 11 个事件。

把事件日志的相邻时刻做差分，得到交替的 $84.0 \pm 0.1$ 与 $27.9 \pm 0.1$ s 序列。若差分序列里出现小于 1 s 的间隔，说明存在抖振；若升温间隔系统性偏短（例如 70 s），说明 `heater` 的关断阈值被读成了带延迟的值。审计时要注意：求解器在事件时刻会重排步长，日志里同一事件可能打印两次，去重时按时刻而不是按行号。

## 整周期能量闭合

一个完整周期内输入与输出的闭合判据是

$$ \left|\frac{\int Q_{in}\,dt-\int UA\,(T-T_{amb})\,dt}{\int Q_{in}\,dt}\right|\le 10^{-3} $$

按解析值估算：$\int Q_{in}\,dt = 800\times84.0 = 67200\ \mathrm{J}$；散热积分近似为 $20\times(323.15-293.15)\times111.9 = 67140\ \mathrm{J}$。两者差 60 J，相对偏差 $8.9\times10^{-4}$，刚好在 $10^{-3}$ 之内。这个 60 J 的余量不是误差，而是滞回带宽内温度偏离中心值造成的真实差异——带宽越大，这一项越大，所以带宽 2.0 K 对应的容差不能直接照搬到带宽 10 K 的工况。

```modelica
model HybridAudit
  parameter Real C = 8372, UA = 20, Q_on = 800;
  parameter Real T_amb = 293.15, T_high = 324.15, T_low = 322.15;
  Real T(start = 322.15, fixed = true);
  discrete Boolean heater(start = true, fixed = true);
  Real Q_net "净热流, W";
  discrete Real t_ev "上一事件时刻, s";
  discrete Real dt_ev "事件间隔, s";
equation
  Q_net = (if heater then Q_on else 0.0) - UA*(T - T_amb);
  C*der(T) = Q_net;
  when {T > T_high, T < T_low} then
    heater = if T > T_high then false else true;
    t_ev = time;
    dt_ev = time - pre(t_ev);
  end when;
  annotation(experiment(StopTime = 600, Tolerance = 1e-6, Interval = 0.1));
end HybridAudit;
```

`dt_ev` 直接给出事件间隔序列，不必事后处理日志；`Q_net` 的时间积分与输入功率积分之差就是闭合残差。

## 与平均化模型交叉验证

把开关动作替换成占空比平均，得到连续模型。其稳态温度为

$$ \bar{T}=T_{amb}+\frac{D\,Q_{on}}{UA}=293.15+\frac{0.75\times800}{20}=293.15+30=323.15\ \mathrm{K} $$

混合模型一个周期内的温度平均值应与 323.15 K 相差不超过半个带宽（1.0 K）。若偏差达到 2 K 或更多，说明占空比没落在 0.75 附近，或平均化时把 $UA$ 非线性项线性化错了位置。

这条交叉验证的价值在于它给出一个不依赖求解器的参考值。$D$ 由能量平衡确定，与事件时刻的精确值无关，所以它能在求解器设置完全不同（Dassl 与 Euler 对比）时依然成立。把两套设置的周期平均温度放在同一张图上，两者都应在 323.15 K 上下 1.0 K 内重合。

## 事件迭代次数与抖振监控

正常恒温器每个事件的迭代次数是 1 到 2 次。把迭代次数打印出来后，出现 3 次以上就说明 `when` 体里存在依赖链。抖振的事件率判据为

$$ r_{ev}=\frac{2}{T_{period}}=\frac{2}{111.9}=0.0179\ \mathrm{Hz} $$

实测事件率超过 1 Hz 且周期不是 111.9 s 的整数分频，即为抖振。区分抖振与真实高频切换的方法是把 `Tolerance` 从 1e-6 放宽到 1e-4：抖振的事件数会随容差剧烈变化，真实切换的事件数不变。这个 A/B 试验是唯一可靠的判据——单看轨迹无法区分两者。

另一个隐蔽的抖振源是滞回带宽与数值噪声同量级。当带宽设成 0.01 K 而求解器相对容差为 1e-6、温度量级 323.15 K 时，绝对精度约 $323.15\times10^{-6} = 3.2\times10^{-4}\ \mathrm{K}$，占带宽的 3.2%，事件率已不稳定。判据是带宽至少比绝对精度大一个数量级，即带宽 $> 3.2\times10^{-3}\ \mathrm{K}$；取 0.01 K 可留 3 倍余量。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 周期 111.9 s 对但占空比偏离 0.75 | 事件时刻记录用了新值而非 `pre` | 打印每次事件的 `T`，检查是否等于阈值 ±0.001 K |
| 事件数远多于 10 次 | 带宽被噪声穿透 | 容差从 1e-6 放到 1e-4，看事件数是否剧变 |
| 整周期能量残差超过 $10^{-3}$ | 漏掉一条散热支路或 $Q_{on}$ 定义错 | 输出 `Q_net` 积分与 `Q_on*D` 两条曲线对比 |
| 周期平均温度偏离 323.15 K 超过 1.0 K | 占空比与能量平衡不一致 | 用 $\bar{T}$ 公式反算 $D$，与实测 $t_{up}/T_{period}$ 对比 |
| 每次事件迭代 3 次以上 | `when` 体内存在跨变量依赖链 | 把 `dt_ev` 的赋值改为使用 `pre(t_ev)`，看迭代数是否降到 1 |
| 换求解器后事件数变化 | 离散更新对当前值不确定 | 统一为 `pre` 取值后重新交叉验证 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Section 3.7.3 "Events" and Section 8.5 "Event Iteration", 2023.
2. Mosterman, P. J., Biswas, G. "A comprehensive methodology for building hybrid models of physical systems." *Artificial Intelligence*, 121(1–2):63–100, 2000.
3. Brogliato, B. *Nonsmooth Mechanics: Models, Dynamics and Control*. 3rd ed., Springer, 2016.
4. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
5. Zhang, F., Yeddanapudi, M., Mosterman, P. J. "Zero-crossing location and detection algorithms for hybrid system simulation." *IFAC Proceedings Volumes*, 41(2):7967–7972, 2008.
6. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Blocks.Logical`.
