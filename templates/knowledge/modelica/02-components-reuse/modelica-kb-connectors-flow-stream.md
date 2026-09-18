---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-connectors-flow-stream
title: Modelica 连接器、flow/stream 与连接方程
summary: 解释势变量相等、flow 变量守恒和 stream 变量上游混合语义，推导连接集生成的等势与守恒方程，覆盖连接器设计、符号方向、多支路汇合与流体反向流动的常见错误。
category: { slug: modelica-components-reuse, name: Modelica 组件与复用 }
level: 进阶
reading_minutes: 16
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, connector, flow, stream, inStream, actualStream, connect]
seo:
  title: Modelica 连接器与 flow stream 语义
  description: 理解势变量、守恒流变量与流体 stream 混合，推导连接方程并设计方向无关的物理端口。
  keywords: [Modelica connector, flow variable, stream connector, inStream, actualStream, 连接方程]
---

# Modelica 连接器、flow/stream 与连接方程

物理连接器用一组变量描述组件边界，是最小化接口耦合的关键抽象。`connect(a, b)` 不是过程式函数调用，而是把若干连接器合并为一个连接集，并按变量前缀自动生成等势方程与守恒方程。理解这一机制，才能设计出方向无关、可多支路汇合、支持反向流动的物理端口。

## 1. 结论与适用场景

结论：普通（potential）变量在连接集内相等；`flow` 变量在连接集内代数和为零；`stream` 变量表示“随质量流携带”的比焓或组分，必须通过 `inStream`/`actualStream` 访问，不能直接取相等。

适用场景：

- 流体网络（管网、液压、热流体）的端口；
- 多支路汇合/分流节点，需要自动质量与能量守恒；
- 存在反向流的回路，需正确混合上游状态。

不适用：纯因果信号（控制信号、传感器读数）应使用 `input`/`output` 或 `RealInput`/`RealOutput`，而非物理连接器。

## 2. 语言机制与数学基础

对一个含 $k$ 个连接器的连接集，工具生成两组方程。

势变量相等（对每个势变量 $v$）：

$$ v_1 = v_2 = \dots = v_k $$

flow 变量守恒（对每个 flow 变量 $f$，正方向定义为流入组件）：

$$ \sum_{i=1}^{k} f_i = 0 $$

这两组方程同时保证了能量/质量守恒与“方向无关”：组件内部方程只需按统一正方向书写，连接拓扑改变无需修改组件。对 $k$ 个连接器，势变量给出 $k-1$ 个独立等式，flow 变量给出 1 个守恒式；方程总数由连接拓扑自动决定，无需人工补齐，这也是“连接即建模”的核心。

以质量流为例，若节点有 $k$ 条支路，则

$$ \sum_{i=1}^{k} \dot m_i = 0 $$

对能量，节点处焓流满足

$$ \sum_{i=1}^{k} \dot m_i h_{out,i} = 0 $$

其中 $h_{out,i}$ 由流向决定：出流取自身焓，入流取上游混合焓——这正是 `stream` 语义要解决的问题。

## 3. 关键语法与公式

流体连接器的 `stream` 变量只描述“若流出则携带的性质”，其混合值由流入支路决定。节点混合比焓为

$$ h_{mix} = \frac{\sum_{i \in in} \dot m_i h_i}{\sum_{i \in in} \dot m_i} $$

此式要求 $\sum_{i \in in} \dot m_i > 0$，否则退化为纯出流（无混合）。为避免零流量附近的除零与符号抖动，库中通常引入正则化，例如

$$ h_{mix} = \frac{\sum_{i} \max(\dot m_i, 0)\, h_i + \epsilon \bar h}{\sum_{i} \max(\dot m_i, 0) + \epsilon} $$

`inStream(h)` 返回从连接网络流入本端口的混合比焓；`actualStream(h)` 根据实际流向在本端口自身焓与 `inStream` 之间选择，用于能量方程。

## 4. 工程做法与参数

连接器只放接口必需量：压力、质量流、比焓、组分（或直接引用介质包）。内部温度、库存等状态不放进端口。

方向约定统一：全库采用“流入组件为正”。生态常用 `FluidPort_a`（流入）/`FluidPort_b`（流出），二者物理等价、仅标注方向，可互连。

多支路守恒自动生成：三通、集管无需手写质量守恒；重复手写会与连接方程叠加造成过定。

正则化：近零流量处使用库提供的正则化函数（如按 nominal 流量缩放的 `smooth` 表达式），不要自行写以 $\dot m$ 直接作分母的表达式。

边界条件：边界只约束端口变量中的一部分（压力或流量之一，焓或温度之一）。同时固定压力与流量会过定。

扩展而非自创：继承标准库连接器（如 `Modelica.Fluid.Interfaces.FluidPort_a`）比新建不兼容接口更利于复用。

nominal 缩放：为质量流量与压力提供 nominal，使近零流量处的正则化项量级合理，避免求解器在极小流量上耗费步长。

## 5. 可复现示例

```modelica
model TwoPortMixing
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  Modelica.Fluid.Interfaces.FluidPort_a port_a(redeclare package Medium = Medium);
  Modelica.Fluid.Interfaces.FluidPort_b port_b(redeclare package Medium = Medium);
  Modelica.Units.SI.MassFlowRate m_flow;
  Modelica.Units.SI.SpecificEnthalpy h_out;
equation
  m_flow = port_a.m_flow;
  port_b.m_flow = -m_flow;
  h_out = inStream(port_a.h_outflow);
  port_b.h_outflow = h_out;
  port_a.h_outflow = inStream(port_b.h_outflow);
end TwoPortMixing;
```

连接两个该组件并施加已知流量，检查端口处是否满足 `port_a.m_flow + port_b.m_flow = 0` 以及焓流平衡。

## 6. 常见坑与排查

- 连接后过定：组件内又手写网络守恒。删除冗余方程，依赖连接集生成。
- flow 被误声明为普通变量：导致守恒缺失、系统欠定。
- 直接对 stream 变量取相等：破坏多支路混合与反向流，混合焓错误。改用 `inStream`/`actualStream`。
- 零流量附近事件抖动：流向切换表达式不平滑。使用正则化并配合滞回。
- 两个边界都固定压力与流量：约束过多。每端口只固定必需量。
- 符号方向错误：组件内部翻转了端口正方向。用双端口稳态案例核对。

## 7. 检查清单与参考

- 连接器仅含接口必需变量；
- 全库方向约定一致（流入为正）；
- 未重复手写连接集守恒方程；
- stream 变量均经 `inStream`/`actualStream` 使用；
- 近零流量处使用正则化；
- 每个边界只固定必要变量；
- 用两/三端口案例验证质量与能量守恒残差。

参考：

1. Modelica Association, *Modelica Language Specification* — Connectors and Connections.
2. Modelica Standard Library, `Modelica.Fluid.Interfaces`.
3. Tiller, *Introduction to Physical Modeling with Modelica*.
