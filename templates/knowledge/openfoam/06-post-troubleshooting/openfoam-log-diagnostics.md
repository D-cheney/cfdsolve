---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-log-diagnostics
title: OpenFOAM 日志中的残差、Courant 数与守恒诊断
summary: 给出从求解日志提取线性残差、连续性误差、时间步和函数对象结果的排错流程。
category: { slug: openfoam-post-troubleshooting, name: "OpenFOAM 后处理与排错" }
level: 工程
reading_minutes: 7
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [OpenFOAM, 日志, 残差, Courant数, 守恒]
---

# OpenFOAM 日志中的残差、Courant 数与守恒诊断

求解日志应按时间步组织分析。线性求解器输出的初始残差反映当前线性系统在求解前的不平衡，最终残差和迭代次数反映该次内层求解；它们不能单独证明外层非线性方程已经收敛。

瞬态计算需同时观察平均和最大 Courant 数：

$$
Co=\frac{|\mathbf{u}_f\cdot\mathbf{S}_f|\Delta t}{V}.
$$

多相界面、声学或扩散过程可能有更严格的专用时间尺度。自动时间步只能限制已配置的判据，不能替代对物理时间分辨率的检查。

日志中的局部与累计连续性误差可用于发现质量不平衡，但其定义随求解器而异。建议同时配置函数对象输出入口、出口质量流量和目标积分量，直接形成全域预算。

## 异常模式

- 残差周期振荡：检查问题是否本质瞬态、边界反馈或外循环不足；
- 压力迭代激增：检查网格非正交、压力参考和出口回流；
- Courant 数突然上升：定位局部速度峰值、体积过小单元和源项突变；
- 目标量漂移但残差较低：检查守恒、时间平均窗口和线性停止条件；
- 出现非有限值：回看首次异常变量和位置，而不是最后的崩溃堆栈。

保存完整日志和解析脚本，可以让不同工况使用同一诊断口径。
