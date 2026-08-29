---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-simulation-solvers
title: Modelica 实验设置、求解器、容差与结果采样
summary: 从 ODE/DAE 特性、刚性、事件密度和时间尺度选择求解策略，解释相对/绝对容差、输出间隔与内部步长的区别，并给出结果可信度检查方法。
category: { slug: modelica-simulation-quality, name: Modelica 仿真与质量 }
level: 工程
reading_minutes: 17
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, 求解器, 容差, 刚性, 输出间隔, 仿真设置]
seo:
  title: Modelica 求解器容差与仿真设置
  description: 根据刚性和事件选择积分策略，区分内部步长与结果采样并验证容差敏感性。
  keywords: [Modelica solver, tolerance, simulation setup]
---

# Modelica 实验设置、求解器、容差与结果采样

模型翻译后可能是 ODE、DAE 或混合系统。求解器选择应基于刚性、事件、精度和成本，而不是固定沿用工具默认值。

## 1. 时间区间

起止时间要覆盖启动、主要动态和统计窗口。极长仿真若只关心慢过程，应先检查是否能用稳态或多速率简化；极短快速过程要保证事件和输入变化被解析。

## 2. 容差与尺度

相对容差按变量尺度控制误差，变量接近零时还需要绝对尺度或 nominal。量级差异过大时先检查单位和模型缩放。通过收紧容差并比较关键输出，确认结果对数值误差不敏感。

## 3. 内部步长与输出间隔

变步长求解器内部步长由误差控制决定，结果文件的输出间隔通常只是采样或插值间隔。把输出点设得很密不会自动提高积分精度，却会增加文件大小；设得太稀会错过峰值和事件后瞬态。

## 4. 刚性与事件

快慢时间尺度并存适合刚性求解策略；频繁不连续事件会迫使求解器反复定位零点和重启。先修正不必要的事件、缩放和初始化，再比较求解器。

## 5. 验收

比较至少两档容差、必要时两类求解器，并检查状态、守恒、事件时刻和工程指标。保存完整实验设置，而非只保存结果曲线。

## 6. 参考资料

1. 所用 Modelica 工具的 Simulation/Integration 文档。
2. Modelica Language Specification, experiment annotation。

