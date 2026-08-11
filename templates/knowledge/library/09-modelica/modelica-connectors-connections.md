---
template_version: "flowlab-knowledge/1.0"
slug: modelica-connectors-connections
title: Modelica 连接器、连接方程与能流方向
summary: 解释 across、flow 与 stream 变量在连接时生成的方程，说明符号约定、端口方向、多端连接和流体焓流建模中的常见错误。
category:
  slug: modelica
  name: Modelica 系统建模
level: 进阶
reading_minutes: 13
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [Modelica连接器, flow变量, stream变量, 能量守恒, 组件连接]
seo:
  title: Modelica 连接器与连接方程｜流研工坊
  description: 理解 potential、flow、stream 变量及其自动生成的守恒连接方程。
  keywords: [Modelica connector, flow, stream, connect方程]
---

# Modelica 连接器、连接方程与能流方向

连接器定义组件边界上的物理变量。`connect()` 不只是复制数值，而是根据变量前缀生成相等关系和守恒关系，使组件可以改变连接方向而无需改写内部方程。

## 1. across 与 flow

普通连接变量（如电压、压力、温度）在连接点相等；带 `flow` 前缀的电流、质量流量或热流在连接集合中代数和为零。

```text
p1 = p2 = ...
Σ m_flow = 0
```

flow 正方向通常定义为流入组件，因此组件内部方程和端口图标方向必须一致。

## 2. stream 变量

流体连接中，比焓和组分随质量流携带。`stream` 语义用于在可能反向流动时建立正确混合值，避免用简单相等关系错误处理焓流。

## 3. 多端连接

三通或汇合点会自动形成质量守恒和混合关系。零流量附近可能出现数值困难，应使用库中经过正则化的函数，而不是自行用除以 `m_flow` 的表达式。

## 4. 调试方法

从两个简单组件开始，检查连接后的方程数、flow 符号和能量守恒。对端口施加已知流量时，观察正负号是否符合“流入组件为正”的约定。

## 5. 常见错误

把 flow 变量声明为普通变量、对 stream 变量直接相等、连接两个都强制压力和流量的边界，以及在组件内部重复写连接守恒，都会造成欠定或过定。

## 6. 参考资料

1. Modelica Association, *Modelica Language Specification*.
2. Tiller, *Introduction to Physical Modeling with Modelica*.

