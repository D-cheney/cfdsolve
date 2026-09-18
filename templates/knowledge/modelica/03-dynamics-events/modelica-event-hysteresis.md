---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-event-hysteresis
title: Modelica 事件抖振、滞回与采样控制
summary: 解释零交叉事件、离散状态与高频抖振的成因，推导滞回带宽、采样周期与事件率度量，并给出用 when、sample 与最小保持时间设计稳定混合系统逻辑的方法。
category: { slug: modelica-dynamics-events, name: "Modelica 动态、初始化与事件" }
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [Modelica, 事件, 滞回, when, sample, 抖振]
seo:
  title: Modelica 事件抖振、滞回与采样控制
  description: 用双阈值滞回、最小保持时间与采样周期抑制零交叉事件抖振，稳定混合系统逻辑。
  keywords: [Modelica 抖振, 滞回, sample, when, 事件率]
---

# Modelica 事件抖振、滞回与采样控制

关系表达式跨越零点时，工具定位状态事件并重新求解离散系统。当开关系直接依赖含噪或快速反馈的量，且阈值单一，就会出现事件抖振：同一阈值附近高频切换，仿真步长被压缩到极小，用时急剧上升。本文给出滞回、采样与最小保持时间三种稳健化手段。

## 1. 结论与适用场景

结论：抖振的根因是“单阈值 + 无状态记忆 + 不平滑输入”。解决方案按优先级为物理滞回、最小保持时间、采样保持、正则化；切忌仅放大求解器容差。

适用场景：

- 温控、压控、液位控制等开关控制；
- 保护逻辑（越限报警、跳闸）；
- 传感器噪声驱动的阈值判断。

不适用：本就连续、可导的限幅与饱和——应写成连续表达式，不产生事件。

## 2. 语言机制与数学基础

单一阈值 $T_{set}$ 下，条件

$$ g = T - T_{set} $$

在 $T$ 于 $T_{set}$ 附近波动时反复过零，事件频率随噪声幅度增大而升高。引入滞回后使用两个阈值 $T_{low} < T_{high}$，带宽

$$ \Delta T = T_{high} - T_{low} > 0 $$

状态只在越出带宽时切换，带宽内由离散记忆保持，从而把事件频率限制在物理合理范围。

采样控制以固定周期更新：

$$ t_k = t_{start} + k \Delta t $$

在采样点之间控制器输出保持不变，抑制了高频更新。事件频率可用事件率度量：

$$ r = \frac{N_{events}}{T_{end} - T_{start}} $$

若 $r$ 远高于物理切换预期，即存在抖振。带宽的选择存在权衡：$\Delta T$ 越大越稳定，但控制精度越差；经验上取物理允许波动幅度的 1.5~2 倍。若开关系在带宽内仍高频触发，说明噪声幅度已超过带宽，应加大滤波或放宽精度要求。

## 3. 关键语法与公式

`sample(start, interval)` 生成周期时间事件；`pre(x)` 取事件前离散值；`edge(b)` 检测上升沿 $b \wedge \neg \text{pre}(b)$。滞回状态更新可分段写为

$$ d^{+} = \begin{cases} \text{false}, & T > T_{high} \\ \text{true}, & T < T_{low} \\ \text{pre}(d), & \text{otherwise} \end{cases} $$

最小保持时间：进入状态时记录时间戳 $t_{enter}$，仅当 $t - t_{enter} \geq t_{hold}$ 才允许切换。典型写法是在同一 `when` 子句内完成保持判断与状态更新：

```modelica
when {T > T_high, T < T_low, sample(0, 0.01)} then
  heater = if T > T_high and time - t_enter >= t_hold then false
           else if T < T_low and time - t_enter >= t_hold then true
           else pre(heater);
  t_enter = if heater <> pre(heater) then time else pre(t_enter);
end when;
```

## 4. 工程做法与参数

阈值来自物理：传感器精度、允许波动范围决定带宽，不为提速任意放大。

保持时间：$t_{hold}$ 应显著大于数值噪声的特征时间尺度，但小于真实动态响应时间。

滤波：对含噪测量先做低通滤波再送入比较；注意滤波本身引入相位滞后，可能与滞回叠加产生极限环。

采样与事件并存：周期控制器用 `sample`；连续保护逻辑仍需状态事件，避免在采样间隔内越过安全边界。

正则化：对必须连续近似的切换使用 `smooth` 修正，但 `smooth` 只是对平滑阶数的承诺，不会自动让表达式变光滑。

诊断：统计事件次数与相邻间隔，定位触发频率最高的零交叉条件。当采样周期 $\Delta t$ 与系统时间常数 $\tau$ 相近时，采样保持会引入明显时延，可用 $\Delta t \lesssim \tau / 10$ 作为起点。交叉检查时把滞回前后的状态轨迹、切换时刻与能量预算并排对比，确认切换次数下降但平均占空比仍与控制目标一致。

## 5. 可复现示例

```modelica
model HysteresisSwitch
  parameter Real T_high = 296.15;
  parameter Real T_low = 293.15;
  parameter Modelica.Units.SI.Time t_hold = 1.0;
  Real T(start = 294.15, fixed = true);
  discrete Boolean heater;
  discrete Modelica.Units.SI.Time t_enter;
equation
  der(T) = if heater then 0.05 else -0.03;
  when {T > T_high, T < T_low, sample(0, 0.01)} then
    heater = if T > T_high and time - t_enter >= t_hold then false
             else if T < T_low and time - t_enter >= t_hold then true
             else pre(heater);
    t_enter = if heater <> pre(heater) then time else pre(t_enter);
  end when;
end HysteresisSwitch;
```

运行后统计 `heater` 切换次数：把 `T_high - T_low` 从 3 K 减小到 0.05 K，事件数会显著增加；恢复带宽后应下降。

## 6. 常见坑与排查

- 只用单阈值：必抖。改双阈值滞回。
- 带宽任意放大：控制精度下降。阈值需物理依据。
- `noEvent` 掩盖切换：跨过真实不连续点。仅用于允许连续近似处。
- 滤波滞后未被察觉：相位滞后改变切换时刻。
- 只调容差：掩盖问题且拖慢仿真。先改逻辑。
- 采样与保护冲突：纯周期采样可能漏掉区间内越限，保留关键状态事件。

## 7. 检查清单与参考

- 开关逻辑使用双阈值滞回；
- 带宽与保持时间有物理依据；
- 测量已滤波且相位滞后可接受；
- 周期控制用 `sample`，保护逻辑保留状态事件；
- 已统计事件次数与间隔；
- 对比修改前后的轨迹、切换时刻与能量预算；
- 未用容差掩盖抖振。

参考：

1. Modelica Association, *Modelica Language Specification* — Events.
2. Modelica Standard Library, `Modelica.Blocks.Logical` 中的滞回与逻辑块。
3. Cellier & Kofman, *Continuous System Simulation*.
