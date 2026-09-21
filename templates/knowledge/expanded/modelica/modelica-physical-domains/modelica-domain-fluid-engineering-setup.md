---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-fluid-engineering-setup
title: "一维流体系统：工程设置与参数选择"
summary: "针对 Modelica.Fluid 一维管网，给出 DynamicPipe 的离散节点数、三项 Dynamics 开关、粗糙度与压降系数的取值方法，附雷诺数—摩擦因子—压降的手算核对、端口与介质声明规范以及两段可运行回路代码。"
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
  - "一维流体系统"
  - "工程设置与参数选择"
  - "DynamicPipe"
  - "StandardWater"
seo:
  title: "一维流体系统：工程设置与参数选择"
  description: "针对 Modelica.Fluid 一维管网，给出 DynamicPipe 的离散节点数、三项 Dynamics 开关、粗糙度与压降系数的取值方法，附雷诺数—摩擦因子—压降的手算核对、端口与介质声明规范以及两段可运行回路代码。"
  keywords:
    - "一维流体系统"
    - "工程设置与参数选择"
    - "DynamicPipe"
    - "压降系数"
---

# 一维流体系统：工程设置与参数选择

一维流体系统的设置难点不在方程，而在三件事：选多少离散节点、开哪几项 Dynamics、以及压降系数从哪里来。下面以 10 m 长、内径 50 mm 的水管为基线，把这三件事全部落到具体数值上，并给出一次从流量反算压降的完整手算，用来在运行前判断参数是否合理。

## 管模型与离散节点数

`Modelica.Fluid.Pipes.DynamicPipe` 用 `nNodes` 把管道切成若干有限体积，每节点独立保存质量、能量与动量状态。节点数应由关注的最高频率或最短传输时间决定：

$$N \ge \frac{L/v}{\Delta t_{max}}$$

其中 v 为流速、Δt_max 为需要分辨的时间尺度。取管长 L=10 m，若质量流量 ṁ=1.5 kg/s、ρ=998.2 kg/m³、内径 D=0.05 m，则流通面积 A=πD²/4=1.9635e-3 m²，流速 v=1.5/(998.2×1.9635e-3)=0.765 m/s，管内总容积 V=A·L=0.0196 m³，对应水质量 19.6 kg，平均停留时间 19.6/1.5=13.1 s。若只关心秒级以上的水温变化，N=10 已足够，每节点容积仅 1.96 L；若要在模型中捕捉水锤，N 需要提高到数十并同时打开动量动态。

## 三项 Dynamics 开关的组合

`DynamicPipe` 有 `massDynamics`、`energyDynamics`、`momentumDynamics` 三个开关，取值来自 `Modelica.Fluid.Types.Dynamics` 枚举。常用组合是质量与能量 `FixedInitial`、动量 `SteadyState`：动量方程退化为代数压降关系，避免声速量级的时间步长限制。研究水锤、泵启停冲击或快速阀门动作时才把 `momentumDynamics` 设为 `FixedInitial`，此时声速取 1480 m/s，时间步需降到 1e-4 s 量级。反向流由 `allowFlowReversal` 控制，单向工况设 `false` 可减少迭代，但下游有倒灌风险时必须保留 `true`。

## 压降系数的手算与核对

一维管流的压降用 Darcy–Weisbach 形式，配合 `roughness` 参数：

$$\Delta p = f\frac{L}{D}\frac{\rho v^2}{2}, \qquad Re=\frac{\rho v D}{\mu}$$

取 μ=1.002e-3 Pa·s，得 Re=998.2×0.765×0.05/1.002e-3=38124，属充分湍流。光滑管用 Blasius 近似 f=0.316·Re^(−1/4)=0.316/13.97=0.0226。代入 L=10 m、D=0.05 m，Δp=0.0226×(10/0.05)×(998.2×0.765²/2)=0.0226×200×292.4=1322 Pa≈1.32 kPa。钢管取 `roughness=4.5e-5` m 时 f 会升到约 0.0245，压降变为 1433 Pa，两者相差 8%，属于粗糙度带来的合理差异。`p_a_start` 与 `p_b_start` 应分别写成 300000 Pa 与 298700 Pa，落差与手算一致，否则初始化会把动量方程的起点推到错误分支上。

## 介质声明与端口

`FluidPort_a` 与 `FluidPort_b` 的势变量是压力 `p`，流变量是质量流量 `m_flow`；此外每个端口还携带 `h_outflow` 作为 stream 变量，用于在流向反转时取上游焓。介质必须用 `redeclare package Medium` 在系统顶层统一声明，子组件各写一套会在连接时报类型不匹配。闭合回路需要一个压力基准，但只能有一处：若同时用 `Boundary_pT` 固定两个节点压力，再叠加泵特性，初始化必然过定。

## 两段可运行的回路

```modelica
model WaterPipeRig "管流基线：定压源 + 动态管 + 定压汇"
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  inner Modelica.Fluid.System system(
    energyDynamics=Modelica.Fluid.Types.Dynamics.FixedInitial,
    massDynamics=Modelica.Fluid.Types.Dynamics.FixedInitial,
    momentumDynamics=Modelica.Fluid.Types.Dynamics.SteadyState,
    p_ambient=101325, T_ambient=293.15);
  Modelica.Fluid.Sources.Boundary_pT source(
    redeclare package Medium = Medium, nPorts=1, p=300000, T=293.15);
  Modelica.Fluid.Pipes.DynamicPipe pipe(
    redeclare package Medium = Medium, length=10, diameter=0.05, nNodes=10,
    roughness=4.5e-5, height_ab=0,
    p_a_start=300000, p_b_start=298700, T_start=293.15, m_flow_start=1.5);
  Modelica.Fluid.Sources.Boundary_pT sink(
    redeclare package Medium = Medium, nPorts=1, p=298700, T=293.15);
  Modelica.Fluid.Sensors.MassFlowRate mflow(redeclare package Medium = Medium);
equation
  connect(source.ports[1], pipe.port_a);
  connect(pipe.port_b, mflow.port_a);
  connect(mflow.port_b, sink.ports[1]);
  annotation(experiment(StopTime=60, Tolerance=1e-6, Interval=0.1));
end WaterPipeRig;
```

```modelica
model ValveOrificeRig "阀门与孔板串联：局部阻力设置"
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  inner Modelica.Fluid.System system;
  Modelica.Fluid.Sources.Boundary_pT source(
    redeclare package Medium = Medium, nPorts=1, p=400000, T=293.15);
  Modelica.Fluid.Valves.ValveLinear valve(
    redeclare package Medium = Medium,
    dp_nominal=50000, m_flow_nominal=1.5, opening_nominal=1.0);
  Modelica.Fluid.Fittings.SimpleGenericOrifice orifice(
    redeclare package Medium = Medium, diameter=0.02, zeta=2.5);
  Modelica.Fluid.Sources.Boundary_pT sink(
    redeclare package Medium = Medium, nPorts=1, p=101325, T=293.15);
  Modelica.Blocks.Sources.Ramp openSignal(height=1.0, duration=5);
equation
  connect(openSignal.y, valve.opening);
  connect(source.ports[1], valve.port_a);
  connect(valve.port_b, orifice.port_a);
  connect(orifice.port_b, sink.ports[1]);
end ValveOrificeRig;
```

## 管流模型失效与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 求解器步长被压到 1e-5 s | 动量动态与可压缩介质同时打开 | 改 SteadyState，步长应回到 1e-3 s 量级 |
| 流量为手算值的 3 倍 | dp_nominal 与 m_flow_nominal 不匹配实际工作点 | 用 $K=\Delta p/\dot m^2$ 反算，核对 50000/1.5²=22222 Pa·s²/kg² |
| 端口连接报介质类型错误 | 子组件各自 redeclare 了不同 Medium | 把 Medium 提升到顶层，统一 redeclare |
| 初始化报压力过定 | 两端都用了固定压力边界且中间有泵 | 只保留一个压力基准，另一端改流量边界 |
| 反向流处温度突变 | 未使用 stream 语义取上游焓 | 检查是否自定义了 h_outflow 而未调用 inStream |

## 管流参数的验收判据与依据

交付前把三件事写进记录：用 Re、f、Δp 的手算值与 `MassFlowRate` 读数对照，偏差应小于 10%；节点数从 5 加密到 20 时出口温度变化应小于 2%；核对管内水质量 19.6 kg 与初始 `p_a_start`/`p_b_start` 是否自洽。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Fluid` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Moody L.F. "Friction factors for pipe flow", *Transactions of the ASME*, 66:671–684, 1944.
4. Colebrook C.F. "Turbulent flow in pipes, with particular reference to the transition region", *Journal of the Institution of Civil Engineers*, 11(4):133–156, 1939.
5. White F.M. *Fluid Mechanics*, 8th ed., McGraw-Hill, 2016.
6. Elmqvist H., Mattsson S.E., Otter M. "Modelica — the new object-oriented modeling language", *12th European Simulation Multiconference*, 1998.
