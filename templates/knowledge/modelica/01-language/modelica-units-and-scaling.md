---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-units-scaling
title: Modelica 单位、nominal 与数值缩放
summary: 区分单位一致性检查与求解器数值缩放，说明 quantity、unit、displayUnit、nominal 和 min/max 属性的用途。
category: { slug: modelica-language, name: "Modelica 语言基础" }
level: 入门
reading_minutes: 7
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [Modelica, 单位, nominal, 数值缩放, 变量属性]
---

# Modelica 单位、nominal 与数值缩放

Modelica 变量可声明 `quantity`、`unit`、`displayUnit`、`min`、`max`、`start` 和 `nominal`。`unit` 用于量纲一致性，`displayUnit` 只改变显示方式；两者不会自动改变模型物理意义。

`nominal` 表示变量的典型非零量级，工具可用它缩放残差和误差控制。例如压力约为 $10^5\ \mathrm{Pa}$、质量分数约为 $10^{-3}$ 时，合理的 nominal 有助于避免某类方程在统一绝对尺度下被忽略。

## 常见误区

- `start` 通常是初始化猜值或初值候选，不等于始终固定的边界条件；
- `min` 和 `max` 多用于检查、界面和优化约束，不保证积分过程中自动截断；
- `displayUnit="degC"` 不会把温差按摄氏温标平移处理；
- 所有变量统一设置 `nominal=1` 会破坏跨数量级模型的缩放。

## 核对步骤

1. 为公共连接器和参数声明 SI 单位。
2. 编译时启用单位检查并处理全部不一致提示。
3. 为远离 1 的状态量和代数量设置典型 nominal。
4. 比较缩放前后的初始化残差、步长与事件定位。
5. 导出结果时同时保存原始单位和显示单位。

单位正确保证方程在物理量纲上相容；数值缩放则帮助求解器公平处理不同量级的方程。这两个问题需要分别验证。
