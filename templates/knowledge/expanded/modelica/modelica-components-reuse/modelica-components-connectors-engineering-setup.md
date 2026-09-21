---
template_version: "flowlab-knowledge/1.0"
slug: modelica-components-connectors-engineering-setup
title: "连接器设计：工程设置与参数选择"
summary: "端口类决定组件之间交换哪些量、正方向如何约定、connect 会生成几条方程。给出可直接复制的 FluidPort 定义模板、单位与 nominal 取值、方程计数公式，以及端口变量选多选少导致的欠定与过定判据。"
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
  - "连接器设计"
  - "工程设置与参数选择"
  - "FluidPort"
  - "nominal"
seo:
  title: "连接器设计：工程设置与参数选择"
  description: "端口类决定组件之间交换哪些量、正方向如何约定、connect 会生成几条方程。给出可直接复制的 FluidPort 定义模板、单位与 nominal 取值、方程计数公式，以及端口变量选多选少导致的欠定与过定判据。"
  keywords:
    - "连接器设计"
    - "工程设置与参数选择"
    - "FluidPort"
    - "nominal"
    - "连接方程"
---

# 连接器设计：工程设置与参数选择

端口类决定两个组件之间允许交换哪些量、这些量的正方向如何约定，以及 `connect` 会生成多少条方程。端口变量选多了会强迫组件暴露内部状态，选少了守恒无法闭合。下面给出可直接复制的端口定义模板、单位与 `nominal` 取值，以及在 MSL 4.0.0 上验证过的方程计数方法。

## 端口只承载跨边界交换量

端口是组件间的契约，凡组件内部能由状态方程算出的量都不应出现在端口上。流体端口只需压力、质量流量、随流携带的比焓与组分；温度、密度、液位、换热系数都由介质包在组件内部求解。若把温度也写进端口，两个组件会对同一状态各写一条方程，形成结构奇异。

以 `Modelica.Fluid.Interfaces.FluidPort_a` 为基准，湿空气端口含 5 个标量/数组元素：`p`、`m_flow`、`h_outflow` 与 `Xi_outflow[2]`，其中 `Medium.nXi = 2` 对应干空气与水蒸气两组分。若再塞入 `T` 与 `d`，端口变量从 5 个升到 7 个，四路节点的方程数从 5 条涨到 7 条，其中 2 条与介质状态方程线性相关。

## 前缀决定连接方程的生成规则

连接方程由连接集自动生成，组件作者不写。对含 $k$ 个连接器的连接集，每个势变量产生 $k-1$ 条独立等式：

$$ p_1 = p_2 = \cdots = p_k $$

压力相等即同一节点共享一个压力，这是节点概念的数学形式。每个 `flow` 变量产生 1 条守恒式，正方向统一为流入组件为正：

$$ \sum_{i=1}^{k} f_i = 0 $$

式中 $f$ 泛指任一 flow 变量，压力端口里就是质量流量，热端口里就是热流量，电端口里就是电流。势变量等式与 flow 守恒式合计给出连接集方程总数：

$$ n_{eq} = (k-1)\,n_{pot} + n_{flow} $$

三支路、单势变量、单 flow 变量的 T 形节点有 $n_{eq} = (3-1)\times 1 + 1 = 3$ 条方程。若端口同时把质量流量与摩尔流量都声明为 flow，则 $n_{eq} = 2\times 1 + 2 = 4$，多出的那条必须由物理换算式补齐，否则过定。

## 单位、nominal 与量级

`nominal` 不是初值，而是求解器做变量缩放时用的参考量级，取错会让近零流量处的正则化项失效。下表是工程上可直接采用的取值。

| 端口变量 | 单位 | 典型 nominal | 取值依据 |
|---|---|---|---|
| p | Pa | 1.0e5 | 常压管网绝对压力约 101325 Pa |
| m_flow | kg/s | 1.0 | 单支路设计流量 0.1~5 kg/s |
| h_outflow | J/kg | 1.0e5 | 液态水 20 °C 附近焓值量级 |
| T（内部，不入端口） | K | 293.15 | 20 °C 参考温度 |
| dp（压降传感器） | Pa | 1.0e4 | 支路设计压降 0.1 bar |

`nominal` 与物理量同数量级即可，不必精确到 1%。给 `p` 写 `nominal=1.0e5` 而实际工作在 3.0e5 Pa 绝对压力，缩放因子偏大 3 倍，通常仍可接受；但给 `m_flow` 写 `nominal=1.0e-6` 而实际流量是 1 kg/s，正则化项会被放大 $10^{6}$ 倍，混合焓被常数项污染。

## 方向约定与命名

全库统一流入为正之后，`connect` 才与拓扑无关。MSL 用 `FluidPort_a` 与 `FluidPort_b` 区分语义方向，二者变量集合完全相同，可以互连，区别只体现在文档与图形箭头。自定义端口时建议：每个组件用 `port_a`/`port_b` 命名并配 `annotation(defaultComponentName="port")`；端口类名以 `Port` 结尾，与 `Modelica.Fluid.Interfaces` 风格一致；绝不在端口内部写方程，端口类只声明变量。

## 一个可复现的端口定义

```modelica
connector FluidPort
  replaceable package Medium = Modelica.Media.Interfaces.PartialMedium
    annotation(choicesAllMatching=true);
  flow Modelica.Units.SI.MassFlowRate m_flow(nominal=1.0);
  Modelica.Units.SI.AbsolutePressure p(nominal=1.0e5);
  stream Modelica.Units.SI.SpecificEnthalpy h_outflow(nominal=1.0e5);
  stream Modelica.Units.SI.MassFraction Xi_outflow[Medium.nXi];
  annotation(defaultComponentName="port");
end FluidPort;
```

用它拼一个三通：`connect(src.port, tee.port_a)`、`connect(tee.port_b, sink.port)`、`connect(tee.port_c, dump.port)`。工具会为压力生成 2 条等式、为质量流量生成 1 条求和式，合计 3 条，与 $n_{eq}$ 公式一致；若手工再写一条 `src.m_flow + tee.m_flow + sink.m_flow = 0`，模型立即过定。

## 端口设置的失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 编译报 variables are not assigned | 端口变量声明了但组件方程未给出，连接集又只含一个连接器 | 统计每个端口变量参与 connect 的次数，等于 1 的即为欠定源 |
| 报 singular system 且自由度数恰好多 1 | 端口变量集合与内部状态方程重复 | 把端口变量逐个移入 protected，看方程数是否回到平衡 |
| 近零流量处混合焓跳变 | m_flow 的 nominal 比实际流量小几个量级 | 把 nominal 设为设计流量，观察跳变是否消失 |
| 互连后压力出现 1e5 量级偏差 | 一方用表压、另一方用绝对压力 | 检查端口 p 的 unit 与初值，比对 101325 Pa 基准 |
| 端口数组维数编译期报错 | Xi_outflow 的维数取自被替换的介质包 | 检查 Medium.nXi 在端口与组件两处是否 redeclare 到同一包 |

## 参考

1. Modelica Association. *Modelica Language Specification, Version 3.6*. 2023. — 第 9 章连接器与连接集的定义规则
2. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Fluid.Interfaces.FluidPort_a`. 2020.
3. Tiller M. *Introduction to Physical Modeling with Modelica*. Kluwer Academic Publishers, 2001. — 物理端口与流变量正方向约定
4. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015. — 连接器类设计
5. Mattsson S.E., Elmqvist H., Otter M. Physical System Modeling with Modelica. *Control Engineering Practice*, 6(4): 501–510, 1998.
6. Elmqvist H., Mattsson S.E., Otter M. Modelica — A Language for Physical System Modeling, Visualization and Interaction. *IEEE CACSD*, 1999. — 连接器类的语言设计
