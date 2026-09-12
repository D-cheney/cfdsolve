---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-result-validation
title: Modelica 仿真结果的守恒、步长与回归验证
summary: 用方程残差、能量预算、容差扫描和基准轨迹检验系统模型，区分初始化成功与动态结果可信。
category: { slug: modelica-simulation-quality, name: "Modelica 仿真与质量" }
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [Modelica, 验证, 守恒, 容差, 回归测试]
---

# Modelica 仿真结果的守恒、步长与回归验证

模型成功翻译和初始化只说明工具找到了一个可用的代数初始状态。动态结果还需验证方程、参数、事件和求解容差。

对封闭机械系统，可计算总能量：

$$
E(t)=\sum_i\left(\frac{1}{2}m_iv_i^2+V_i(q_i)\right).
$$

无阻尼、无外功时，$E(t)$ 的变化应与积分误差一致；有阻尼和外部输入时，应比较储能变化、输入功与耗散的预算。热、流体和电气域也应建立对应守恒量。

## 验证组合

1. 对可解析的简化模型比较频率、稳态值和时间常数。
2. 将相对容差收紧 10 倍，比较峰值、事件时刻和积分量。
3. 限制最大步长，确认快速动态和控制采样被解析。
4. 改变初始化猜值，检查是否落入不同工作点。
5. 保存一组带容差的回归指标，而不是逐点比较全部浮点结果。

事件系统可用事件次数、切换序列和首次触发时间作为回归指标。不同求解器可能使用不同步长仍得到等价轨迹，因此回归容限应围绕物理输出定义。

发布结果时记录工具版本、求解算法、容差、输出间隔和参数集。只保存绘图采样点可能遗漏求解器内部事件和高频变化。
