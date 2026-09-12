---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-event-hysteresis
title: Modelica 事件抖振、滞回与采样控制
summary: 解释零交叉事件、离散状态和高频事件抖振，并用滞回、when 与 sample 设计稳定的混合系统逻辑。
category: { slug: modelica-dynamics-events, name: "Modelica 动态、初始化与事件" }
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [Modelica, 事件, 滞回, when, sample]
---

# Modelica 事件抖振、滞回与采样控制

关系表达式跨越零点时，Modelica 工具通常定位状态事件并重新求解离散系统。如果开关条件在同一阈值附近受到噪声或快速反馈影响，模型会频繁切换，形成事件抖振并显著降低仿真速度。

滞回使用不同的开启和关闭阈值。例如温度控制可写成离散状态：

```modelica
when {T > T_high, T < T_low} then
  heater = if T > T_high then false else if T < T_low then true else pre(heater);
end when;
```

`pre(heater)` 读取事件发生前的离散值，避免在滞回区间内重新定义状态。两个阈值应来自传感器精度和物理允许波动，不能只为提升速度任意放大。

周期控制可使用 `sample(start, interval)`，使离散控制器按已知采样周期更新。连续保护逻辑仍可能需要状态事件，避免在两个采样时刻之间越过安全边界。

## 诊断事件问题

- 统计事件次数及相邻事件时间间隔；
- 找到触发频率最高的零交叉条件；
- 检查条件是否直接依赖不连续输出或未滤波测量；
- 为物理开关增加合理滞回或最小保持时间；
- 比较修改前后的状态轨迹、切换时刻和能量预算。

`noEvent()` 会抑制关系表达式产生事件，只适用于允许连续区间内近似处理的表达式。滥用会让求解器跨过真正的不连续点。
