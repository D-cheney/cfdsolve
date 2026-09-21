---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-media-engineering-setup
title: "介质模型：工程设置与参数选择"
summary: "针对 Modelica.Media 说明状态变量组合的选择、setState_pT/ph 的调用方式、参考态与焓基准的统一、有效范围与超限行为，并给出空气密度、声速与两相干度的手算核对及两段可运行代码。"
category:
  slug: modelica-physical-domains
  name: "Modelica 物理域建模"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 物理域建模"
  - "介质模型"
  - "工程设置与参数选择"
  - "StandardWater"
  - "ThermodynamicState"
seo:
  title: "介质模型：工程设置与参数选择"
  description: "针对 Modelica.Media 说明状态变量组合的选择、setState_pT/ph 的调用方式、参考态与焓基准的统一、有效范围与超限行为，并给出空气密度、声速与两相干度的手算核对及两段可运行代码。"
  keywords:
    - "介质模型"
    - "工程设置与参数选择"
    - "StandardWater"
    - "参考态"
---

# 介质模型：工程设置与参数选择

介质包决定状态关系，一旦选错，压力、温度、焓三者中就至少有一个会与物理不符，而且错误会通过 stream 变量扩散到整个回路。设置介质需要明确四件事：用哪一组独立状态变量、参考态怎么定、有效范围在哪里、以及超限时模型如何表现。本文用空气与水两组物性把四项逐一算清。

## 介质接口必须提供什么

`Modelica.Media.Interfaces.PartialMedium` 规定介质包必须给出 `ThermodynamicState` 记录与一组以状态记录为入口的函数，例如 `density(state)`、`specificHeatCapacityCp(state)`、`dynamicViscosity(state)`、`thermalConductivity(state)`、`velocityOfSound(state)`。同时它必须声明边界量：`T_min`、`T_max`、`p_min`、`p_max`、`mediumName`、`extraPropertiesNames`。选择介质时先看这四个数，再看函数是否覆盖工作点。`Modelica.Media.Water.StandardWater` 的适用范围约为 273.15 K～1073.15 K、最高 100 MPa；超出后 IAPWS-IF97 的区域划分失效，函数会返回无效值或抛异常，而不是自动外推。

## 状态变量组合与调用方式

介质包用 `setState_*` 构造状态记录，可选组合由 `Modelica.Media.Interfaces.Choices.IndependentVariables` 枚举给出，最常用的是 `pTX`、`phX`、`dTX` 三种。同一回路中所有组件必须用同一组合，否则流体会在接口处出现不一致。热流体回路推荐 `phX`，因为守恒方程给出的正是压力与比焓：

$$h=u+\frac{p}{\rho}, \qquad \rho=\rho\left(p,T\right)$$

`phX` 组合的代价是需要迭代反算温度，因为 $T=T(p,h)$ 通常没有解析式。若回路中流量可能反号，必须配合 stream 语义使用 `inStream(port.h_outflow)`，否则反转处会凭空产生或吞掉能量。空气这类可压缩介质在低压下可用理想气体关系直接验证：

$$R=\frac{R_u}{M}, \qquad p=\rho R T$$

取 R_u=8.314462618 J/(mol·K)、空气摩尔质量 M=0.028964 kg/mol，则 R=8.314462618/0.028964=287.05 J/(kg·K)。在 p=101325 Pa、T=293.15 K 时 ρ=101325/(287.05×293.15)=101325/84158.6=1.204 kg/m³，与手册值一致。同一状态下声速 a=√(γRT)=√(1.4×287.05×293.15)=√117800=343.2 m/s。这两个数字应作为选完介质后的第一道核对：若 `Medium.density(state)` 给出的不是 1.204 而是 1.29，说明介质被换成了含湿空气或参考态被改动。

## 参考态与焓基准

比焓的绝对值没有物理意义，只有差值有意义，因此介质包必须声明参考态 `reference_T`、`reference_p`、`reference_h`、`reference_s`。水常用 273.15 K、101325 Pa 处 h=0；理想气体常用 298.15 K、101325 Pa 处 h=0。同一回路中若混用两个参考态不同的介质包，接口处的焓差会被当成真实热流，表现为"没有热源却持续升温"。做法是把参考态写进模型的文档字符串，并在回路入口处用一次 $\dot Q=\dot m\,c_p\,\Delta T$ 核对：取水 cp=4184 J/(kg·K)、ṁ=0.5 kg/s、ΔT=20 K，得 Q=0.5×4184×20=41840 W=41.84 kW；若仿真给出的热功率不是这个量级，先查参考态再查 cp。

## 两相与单相的选择

含相变的回路必须让介质返回两相状态，用干度描述：

$$x=\frac{h-h_l}{h_v-h_l}$$

在 101325 Pa 下水的 h_l=419.1 kJ/kg、h_v=2675.6 kJ/kg，h_fg=2256.5 kJ/kg。若某控制体算出 h=1000 kJ/kg，则 x=(1000−419.1)/2256.5=0.257，属两相区。但两相状态的密度与粘度对 h 极其敏感，会让求解器步长骤降。若工程上只关心过冷或过热工况，应改用 `Modelica.Media.Water.StandardWaterOnePhase`，把状态限制在单相区，可显著提升速度；代价是一旦真实工况进入两相，模型会直接报错而不是给出错误答案——这恰好是希望的行为。

## 两段可运行的介质代码

```modelica
model MediumCheck "介质有效域与调用方式自检"
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  Medium.ThermodynamicState state;
  Real rho(unit="kg/m3");
  Real cp(unit="J/(kg.K)");
  Real a(unit="m/s");
equation
  state = Medium.setState_pT(101325, 293.15);
  rho = Medium.density(state);
  cp = Medium.specificHeatCapacityCp(state);
  a = Medium.velocityOfSound(state);
  assert(293.15 > Medium.T_min and 293.15 < Medium.T_max,
    "工作温度超出介质有效范围");
end MediumCheck;
```

```modelica
model WaterLoopMediumChoice "顶层统一 redeclare 的单相水回路"
  package Medium = Modelica.Media.Water.StandardWaterOnePhase;
  inner Modelica.Fluid.System system(p_ambient=101325, T_ambient=293.15);
  Modelica.Fluid.Sources.Boundary_pT source(
    redeclare package Medium = Medium, nPorts=1, p=300000, T=293.15);
  Modelica.Fluid.Pipes.DynamicPipe pipe(
    redeclare package Medium = Medium, length=2, diameter=0.03, nNodes=5,
    p_a_start=300000, p_b_start=299000, T_start=293.15);
  Modelica.Fluid.Sources.Boundary_pT sink(
    redeclare package Medium = Medium, nPorts=1, p=299000, T=293.15);
equation
  connect(source.ports[1], pipe.port_a);
  connect(pipe.port_b, sink.ports[1]);
end WaterLoopMediumChoice;
```

## 介质设置失效与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 接口报介质类型不匹配 | 子组件各自 redeclare 了不同 Medium | 用 MediumCheck 打印 mediumName，统一到顶层 |
| 无热源却持续升温 | 两侧介质包的 reference_h 不一致 | 对比两包的 reference_T/reference_p，统一后再看 |
| 求解器步长掉到 1e-6 s | 状态落入两相区，物性梯度极大 | 打印干度 x，若 0<x<1 则改用单相介质或细化模型 |
| 密度比手算大 7% | 实际调用的是含湿空气而非干空气 | 核对 M 与 R，干空气 R 应为 287.05 J/(kg·K) |
| 温度超出 1073.15 K 后报错 | 工作点越出 IAPWS-IF97 有效域 | 检查是否误用了水蒸气高温段，改用相应介质包 |

## 介质参数的验收判据与依据

选完介质后至少核对四项：一是 `density(state)` 与手算 1.204 kg/m³（空气）或 998.2 kg/m³（20 ℃ 水）的偏差，应小于 0.5%；二是声速 343.2 m/s（空气）与 `velocityOfSound` 的偏差；三是参考态一致性检查，同一回路内所有介质包的 `reference_h` 必须相同；四是有效域检查，用 `assert` 把 T_min、T_max 写进模型，越界时立即报错而不是静默外推。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Media` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Wagner W., Kretzschmar H.-J. *International Steam Tables: Properties of Water and Steam Based on the Industrial Formulation IAPWS-IF97*, 3rd ed., Springer, 2019.
4. Lemmon E.W., Jacobsen R.T., Penoncello S.G., Friend D.G. "Thermodynamic properties of air and mixtures of nitrogen, argon, and oxygen from 60 to 2000 K at pressures to 2000 MPa", *Journal of Physical and Chemical Reference Data*, 29(3):331–385, 2000.
5. Poling B.E., Prausnitz J.M., O'Connell J.P. *The Properties of Gases and Liquids*, 5th ed., McGraw-Hill, 2001.
6. Tiller M. *Introduction to Physical Modeling with Modelica*, Kluwer Academic Publishers, 2001.
