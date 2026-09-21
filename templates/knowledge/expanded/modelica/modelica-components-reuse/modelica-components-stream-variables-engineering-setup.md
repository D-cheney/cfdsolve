---
template_version: "flowlab-knowledge/1.0"
slug: modelica-components-stream-variables-engineering-setup
title: "stream 变量与混合焓：工程设置与参数选择"
summary: "stream 变量不能取相等也不能直接相加，混合焓由流入支路加权决定。给出混合焓与正则化公式、一次可核对的两支路混合算例、epsilon 与 nominal 的配比、以及 inStream 与 actualStream 的分工和反流工况参数。"
category:
  slug: modelica-components-reuse
  name: "Modelica 组件与复用"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 组件与复用"
  - "stream 变量与混合焓"
  - "工程设置与参数选择"
  - "inStream"
  - "actualStream"
seo:
  title: "stream 变量与混合焓：工程设置与参数选择"
  description: "stream 变量不能取相等也不能直接相加，混合焓由流入支路加权决定。给出混合焓与正则化公式、一次可核对的两支路混合算例、epsilon 与 nominal 的配比、以及 inStream 与 actualStream 的分工和反流工况参数。"
  keywords:
    - "stream 变量与混合焓"
    - "工程设置与参数选择"
    - "inStream"
    - "actualStream"
    - "正则化"
---

# stream 变量与混合焓：工程设置与参数选择

`stream` 变量回答的是这股流体若从这里流出会携带什么状态。它不能直接取相等，也不能直接相加；必须经 `inStream()` 取上游混合值、经 `actualStream()` 按实际流向选择。多支路汇合节点的混合焓、混合温度都由这两个函数决定，参数设置的核心是正则化项 $\varepsilon$ 与 `nominal` 的配合。

## 三支路汇合时的混合焓

设节点有若干支路，$\dot m_i$ 为第 $i$ 条支路流入节点的质量流量（kg/s），$h_i$ 为该支路来流的比焓（J/kg）。节点向下游送出的混合比焓为

$$ h_{mix} = \frac{\sum_i \max(-\dot m_i, 0)\, h_i}{\sum_i \max(-\dot m_i, 0)} $$

符号取 $\max(-\dot m_i,0)$ 的原因是全库正方向为流入组件，因此流入节点对应 $\dot m_i<0$。分母必须大于零，否则节点处于纯出流状态，没有上游来流可供混合，此时 $h_{mix}$ 应由上游分支的 `h_outflow` 直接传递。

## 一次可核对的混合算例

取常压液态水、定比热 $c_p = 4186\ \mathrm{J/(kg\cdot K)}$，以 273.15 K 为焓参考点。两条支路汇合：支路 1 流量 1.2 kg/s、温度 300.15 K；支路 2 流量 0.8 kg/s、温度 350.15 K。

先算两支路比焓：

$$ h_1 = c_p (300.15 - 273.15) = 4186 \times 27 = 1.13022\times10^{5}\ \mathrm{J/kg} $$

$$ h_2 = c_p (350.15 - 273.15) = 4186 \times 77 = 3.22322\times10^{5}\ \mathrm{J/kg} $$

代入混合式：

$$ h_{mix} = \frac{1.2 \times 1.13022\times10^{5} + 0.8 \times 3.22322\times10^{5}}{1.2 + 0.8} = \frac{1.35788\times10^{5} + 2.57858\times10^{5}}{2.0} = 1.96823\times10^{5}\ \mathrm{J/kg} $$

反算混合温度 $T_{mix} = 273.15 + 1.96823\times10^{5}/4186 = 273.15 + 47.0 = 320.15\ \mathrm{K}$，即 47.0 °C。这个 320.15 K 与按流量直接加权 $(1.2\times300.15 + 0.8\times350.15)/2.0$ 完全一致，可作为模型输出的核对值；若仿真给出 340 K 以上，说明有一支来流被错误地按本端焓处理。

## 正则化项与 nominal 的配合

近零流量处 $\max(-\dot m_i,0)$ 会出现符号抖动，MSL 风格的做法是加入正则化项：

$$ h_{mix} = \frac{\sum_i \max(-\dot m_i,0)\, h_i + \varepsilon \bar h}{\sum_i \max(-\dot m_i,0) + \varepsilon} $$

$\varepsilon$ 的量级应远小于最小支路流量，典型取设计流量的 $10^{-3}$ 倍。设计流量 1.0 kg/s 时取 $\varepsilon = 1.0\times10^{-3}$ kg/s，比焓参考 $\bar h = 1.0\times10^{5}$ J/kg。当总流入降到 0.001 kg/s 时，正则化项权重约 50%，混合焓被拉向 $\bar h$ 对应的 23.9 °C；这属于可接受的正则化误差，但必须把 `m_flow` 的 `nominal` 设为 1.0 而非 $10^{-6}$，否则求解器会把 $\varepsilon$ 当作主导项。

## inStream 与 actualStream 的分工

`inStream(h_outflow)` 返回从连接网络流入本端口的混合比焓，等价于上式的 $h_{mix}$；`actualStream(h_outflow)` 则按本端口当前流向，在本组件内部焓与 `inStream` 结果之间二选一。能量方程里必须用 `actualStream`。

```modelica
model MixingVolume
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  Modelica.Fluid.Interfaces.FluidPort_a port_a(redeclare package Medium = Medium);
  Modelica.Fluid.Interfaces.FluidPort_b port_b(redeclare package Medium = Medium);
  parameter Modelica.Units.SI.Volume V = 0.01;
  Modelica.Units.SI.MassFlowRate m_in;
equation
  m_in = -port_a.m_flow;
  port_b.m_flow = -m_in;
  port_a.h_outflow = inStream(port_b.h_outflow);
  port_b.h_outflow = inStream(port_a.h_outflow);
  // 能量方程用 actualStream 选择真实携带的焓
  V * Medium.d * der(Medium.u) = port_a.m_flow * actualStream(port_a.h_outflow)
                               + port_b.m_flow * actualStream(port_b.h_outflow);
end MixingVolume;
```

罐容 0.01 m³ 的水，两条支路分别 1.2 kg/s 与 0.8 kg/s 汇入后由 `port_b` 送出 2.0 kg/s，`port_b.h_outflow` 应等于上面的 $1.96823\times10^{5}$ J/kg。

## 参数设置清单

| 参数 | 取值 | 依据 |
|---|---|---|
| m_flow.nominal | 1.0 kg/s | 与设计流量同量级 |
| p.nominal | 1.0e5 Pa | 常压绝对压力 |
| h_outflow.nominal | 1.0e5 J/kg | 20 °C 液态水量级 |
| epsilon 正则化流量 | 1.0e-3 kg/s | 设计流量的 1e-3 |
| h_bar 正则化焓 | 1.0e5 J/kg | 参考工况比焓 |
| 反流滞回带宽 | 1.0e-2 kg/s | 抑制流向切换抖动 |

## 混合焓出错的判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 混合温度等于两支路中较高者 | 直接对 h_outflow 取相等，退化为单支路 | 把两支路流量比从 1.5 改成 0.5，看输出是否随之变化 |
| 零流量附近求解器反复重试 | 未加正则化，max 在零点不光滑 | 把 epsilon 从 0 改成 1e-3 kg/s，观察步长是否恢复 |
| 反向流动时能量不守恒 | 能量方程直接用了 h_outflow 而非 actualStream | 令支路 2 反向，检查残差是否突增到 1e-3 W 以上 |
| 混合温度漂向 23.9 °C | epsilon 相对流量过大 | 检查 epsilon 与总流量的比值，应低于 1e-3 |
| 多支路时只有两路参与混合 | 第三条支路端口未加入连接集 | 数一数节点的 connect 条数与物理支路数是否一致 |

## 参考

1. Franke R., Casella F., Otter M., Sielemann M., Mattsson S.E., Olsson H., Wetter M. Stream Connectors — An Extension of Modelica for Device-Oriented Modeling of Convective Transport Phenomena. *7th International Modelica Conference*, 2009.
2. Modelica Association. *Modelica Language Specification, Version 3.6*. 2023. — stream 变量与 inStream/actualStream 运算符
3. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Fluid.Interfaces`. 2020. — 混合焓的正则化实现
4. Wetter M., et al. Modelica Buildings Library. *Journal of Building Performance Simulation*, 7(4): 253–270, 2014.
5. Tiller M. *Introduction to Physical Modeling with Modelica*. Kluwer Academic Publishers, 2001. — 多支路混合与反向流处理
6. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015. — 流向相关表达式
