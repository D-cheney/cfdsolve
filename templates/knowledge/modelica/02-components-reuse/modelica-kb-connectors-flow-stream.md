---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-connectors-flow-stream
title: Modelica 连接器、flow/stream 与连接方程
summary: 解释势变量相等、flow 变量守恒和 stream 变量上游混合语义，覆盖连接器设计、符号方向、连接集和流体反向流动的常见错误。
category: { slug: modelica-components-reuse, name: Modelica 组件与复用 }
level: 进阶
reading_minutes: 16
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, connector, flow, stream, connect]
seo:
  title: Modelica 连接器与 flow stream 语义
  description: 理解势变量、守恒流变量和流体 stream 混合，设计方向无关的物理端口。
  keywords: [Modelica connector, flow variable, stream connector]
---

# Modelica 连接器、flow/stream 与连接方程

物理连接器描述接口上的变量集合。`connect(a,b)` 不是普通函数调用，而是生成连接集合的等势与守恒方程。

## 1. 三类变量

- 普通势变量：连接后相等，如电压、温度、压力；
- `flow` 变量：按连接器外向符号求和为零，如电流、热流率、质量流率；
- `stream` 变量：表示随流携带的比焓或组分等，支持混合和反向流动。

## 2. 符号约定

组件必须统一“流入组件为正”或库规定的方向。守恒错误常来自组件内部又人为翻转符号。用两个端口的简单稳态案例检查流量和能量方向。

## 3. stream 操作

流体端口通常用 `inStream()` 获取从连接网络流入的混合性质，用 `actualStream()` 表示按实际流向选择的流体性质。直接读取另一个端口的 stream 变量会破坏多支路混合与反向流语义。

## 4. 连接器设计

连接器只放接口必需量，避免把内部状态暴露出去。信号连接器适合因果控制，物理连接器适合双向能量/质量交换。扩展标准库接口比自创不兼容接口更利于复用。

## 5. 常见问题

- 独立组件可平衡，连接后过定：重复写了网络守恒式；
- 零流量附近事件抖动：流向切换表达式不平滑；
- 混合焓错误：忽略 `stream` 语义或端口最小流量正则化；
- 端口压力和流量均固定：边界约束过多。

## 6. 参考资料

1. Modelica Language Specification, Connectors and Connections。

