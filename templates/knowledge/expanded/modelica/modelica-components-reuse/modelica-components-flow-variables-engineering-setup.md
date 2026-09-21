---
template_version: "flowlab-knowledge/1.0"
slug: modelica-components-flow-variables-engineering-setup
title: "flow 变量与守恒连接：工程设置与参数选择"
summary: "flow 前缀决定连接集是求和为零还是取相等，写错不会报语法错只会在求解阶段表现为欠定。给出质量与能量守恒残差的定义与容差量级、边界条件的四种固定组合、nominal 缩放判据，以及过定欠定的排查顺序。"
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
  - "flow 变量与守恒连接"
  - "工程设置与参数选择"
  - "质量守恒"
  - "nominal"
seo:
  title: "flow 变量与守恒连接：工程设置与参数选择"
  description: "flow 前缀决定连接集是求和为零还是取相等，写错不会报语法错只会在求解阶段表现为欠定。给出质量与能量守恒残差的定义与容差量级、边界条件的四种固定组合、nominal 缩放判据，以及过定欠定的排查顺序。"
  keywords:
    - "flow 变量与守恒连接"
    - "工程设置与参数选择"
    - "质量守恒残差"
    - "nominal"
    - "边界条件"
---

# flow 变量与守恒连接：工程设置与参数选择

`flow` 前缀是 Modelica 里唯一会改变方程生成规则的声明修饰符：带 `flow` 的变量在连接集内求和为零，不带前缀的取相等。参数选择上的后果很直接——凡是需要总量守恒的物理量都必须写成 `flow`，写错不会报语法错，只会在求解阶段表现为欠定或质量不守恒。下面给出残差定义、容差量级与边界条件的取舍规则。

## 前缀写错时方程会发生什么

同一连接集里，势变量生成相等关系，`flow` 变量生成求和关系：

$$ \sum_{i=1}^{k} \dot m_i = 0 $$

若把 `m_flow` 漏写成 `flow`，工具会为它生成 $k-1$ 条各支路流量相等的等式。三支路节点上，原本 1 条质量守恒变成 2 条相等约束，流量被迫全部相同，同时压力失去约束，节点压力变成自由变量。求解器通常报 structurally singular，而不是提示前缀错误，这是排查时最容易走偏的一类故障。

能量守恒同样依赖正确的前缀组合。节点处焓流平衡写成：

$$ \sum_{i=1}^{k} \dot m_i\, h_{out,i} = 0 $$

式中 $h_{out,i}$ 是第 $i$ 条支路在流出该组件方向上的比焓，单位 J/kg；入流支路必须取上游混合焓，这一点由 `stream` 语义保证。若把 $h_{out,i}$ 简化为本组件内部焓，反向流动时能量会被重复计入。

## 守恒残差怎么定义、容差取多少

质量守恒残差直接由连接集给出，不需要额外方程：

$$ r_m = \sum_{i=1}^{k} \dot m_i $$

工程验收上应把 $r_m$ 与支路设计流量之比作为相对残差。单支路设计流量 1.0 kg/s、四条支路的集管，绝对残差应低于 $1.0\times10^{-9}$ kg/s，即相对残差 $1.0\times10^{-9}$；这是双精度求解器在良好缩放下能达到的量级。若实测残差为 $1.0\times10^{-4}$ kg/s（相对 $1.0\times10^{-4}$），通常是 `nominal` 设置不当导致缩放失衡，而不是方程写错。

能量残差量级更高。水在 300.15 K、比热 4186 J/(kg·K) 附近，1.0 kg/s 的支路焓流约 $4.2\times10^{5}$ W，能量平衡残差控制在 $1.0\times10^{-3}$ W 量级（相对 $2.4\times10^{-9}$）即说明混合焓计算正确。

## 边界条件：每条边界只固定一半

势变量与 `flow` 变量成对出现，边界条件应每个端口只固定其中一个。下表是常见组合。

| 边界类型 | 固定的量 | 放开求解的量 | 适用场景 |
|---|---|---|---|
| 压力边界 | p = 3.0e5 Pa | m_flow | 下游接大气或定压罐 |
| 流量边界 | m_flow = 0.50 kg/s | p | 泵出口、定流量试验台 |
| 压力加焓边界 | p、h | m_flow | 定压热源 |
| 双压力边界串联 | 两个 p | 回路流量 | 自然循环、烟囱效应 |

若一个组件两端都连压力边界，回路流量由压差与阻力决定，模型有解；若两端都连流量边界，压力整体失去参考，节点压力可任意平移，工具报初始化问题奇异。

## nominal 与缩放

`nominal` 影响的是迭代矩阵的对角占优程度。定流量 0.5 kg/s 的回路，`m_flow` 的 `nominal` 取 1.0 比取 1.0e-3 收敛快得多；压力回路 `p` 的 `nominal` 取 1.0e5 Pa 量级即可。一个实用的检查：把 `nominal` 整体放大或缩小 10 倍，若迭代次数变化超过 50%，说明原取值偏离工作点太远。

## 最小守恒检查模型

```modelica
model MassBalanceCheck
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  Modelica.Fluid.Sources.MassFlowSource_T src(
    redeclare package Medium = Medium, m_flow=1.20, T=300.15, nPorts=1);
  Modelica.Fluid.Sources.Boundary_pT sink(
    redeclare package Medium = Medium, p=101325, T=300.15, nPorts=1);
  Modelica.Fluid.Pipes.StaticPipe pipe(
    redeclare package Medium = Medium, length=2.0, diameter=0.05);
  Real r_m;
equation
  connect(src.ports[1], pipe.port_a);
  connect(pipe.port_b, sink.ports[1]);
  r_m = src.ports[1].m_flow + pipe.port_a.m_flow;
end MassBalanceCheck;
```

`StaticPipe` 内径 0.05 m、长 2.0 m，入口流量 1.20 kg/s；`src.ports[1].m_flow` 与 `pipe.port_a.m_flow` 方向相反，理想情况下 `r_m = 0.0`。实测若得 `r_m = 1.0e-12` kg/s，相对设计流量 1.20 kg/s 为 $8.3\times10^{-13}$，属正常舍入。

## 过定与欠定的排查顺序

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 singular system，未知数比方程多 1 | 某 flow 变量漏写前缀，守恒方程缺失 | 在连接器类里逐个数带 flow 的变量，与物理守恒量个数对照 |
| 报 too many equations | 组件内部手写了节点守恒 | 注释掉内部流量和为零式，看模型是否转为平衡 |
| 流量符号全为负 | 端口正方向约定与库不一致 | 用单管稳态算例核对：进口应为正、出口应为负 |
| 解出负的绝对压力 | 边界给了表压 | 检查边界 p 是否写成 101325 Pa 基准之上的表压 |
| 稳态残差随分段数变化 | 把离散误差当成守恒误差 | 提高管道 nSegments，看残差是否收敛到 1e-9 量级 |

## 参考

1. Modelica Association. *Modelica Language Specification, Version 3.6*. 2023. — 连接方程与 flow 前缀语义
2. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Fluid.Sources`. 2020.
3. Cellier F.E., Kofman E. *Continuous System Simulation*. Springer, 2006. — 守恒方程与 DAE 结构
4. Otter M., Elmqvist H., Mattsson S.E. Hybrid Modeling in Modelica Based on the Synchronous Data Flow Principle. *IEEE CACSD*, 1999.
5. Modelica Association. *Functional Mock-up Interface Specification, Version 3.0*. 2022.
6. Sielemann M., Casella F., Otter M., et al. Robust Initialization of Differential-Algebraic Equations Using Homotopy. *8th International Modelica Conference*, 2011. — 流量边界与初值的一致性
