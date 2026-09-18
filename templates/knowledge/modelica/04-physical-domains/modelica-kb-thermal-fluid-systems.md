---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-thermal-fluid-systems
title: Modelica 热流体网络、介质与守恒建模
summary: 从介质包与流体端口出发推导控制体的质量、能量与动量守恒，说明压降关联式、nominal 缩放、闭合回路基准与初始化，并给出可抄用的 MSL Fluid 回路示例与逐项验收清单。
category: { slug: modelica-physical-domains, name: Modelica 物理域建模 }
level: 工程
reading_minutes: 18
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, Fluid, Medium, 质量守恒, 能量守恒, 热流体]
seo:
  title: Modelica 热流体网络、介质与守恒建模｜CFD菜鸟
  description: 用介质包、流体端口、容积与阻力组件构建守恒、可初始化、可查错的热流体网络。
  keywords: [Modelica Fluid, Medium, 质量守恒, 能量守恒, 热流体网络]
---

# Modelica 热流体网络、介质与守恒建模

系统级热流体建模关注的是库存、压降、换热与控制动态，而不是解析三维流场。组件的职责应清晰分为存储、输运、边界与控制四类，并且每一处守恒关系都必须能单独核算。

## 1. 结论与适用场景

当部件几何细节远小于所关注的时间与空间尺度，且结论主要取决于流量、温度与压力的整体演化时，应使用集中参数热流体网络：中央空调水系统、发动机冷却回路、储热罐、液压回路与蒸汽循环的瞬态分析都属于这一类。反之，如果分离、回流、温度分层或相变界面决定结论，这部分必须交给 CFD 承担。合理的工程分工是让 CFD 生成部件特性——阻力系数、换热关联式、泵与风机曲线——再嵌入守恒网络，用系统模型回答控制与能耗问题。

## 2. 物理/数学基础

一个连通流体网络在数学上是微分代数方程组（DAE）。每个控制体通常贡献质量与能量两个守恒方程，再叠加介质状态关系与连接器约束这两类代数方程。质量守恒写成

$$\frac{dm}{dt}=\sum_{j}\dot m_{j,\mathrm{in}}-\sum_{j}\dot m_{j,\mathrm{out}}$$

能量守恒在忽略动能、势能与轴向做功时常写为

$$\frac{dU}{dt}=\sum_{j}\dot m_{j,\mathrm{in}}h_{j,\mathrm{in}}-\sum_{j}\dot m_{j,\mathrm{out}}h_{j,\mathrm{out}}+\dot Q+\dot W_{sh}$$

其中 $U$ 为内能、$h$ 为比焓、$\dot Q$ 为外部热流率、$\dot W_{sh}$ 为轴功。闭合性来自连接方程：势变量（压力）在连接点相等，带 `flow` 前缀的质量流量在整个连接集合代数和为零。

## 3. 关键模型与公式

介质（Medium）决定状态关系与物性，是热流体网络的第一等公民。给定压力与比焓时，介质必须返回温度、密度等量：

$$h=u+\frac{p}{\rho},\qquad T=T(p,h)$$

管阻与阀门用动量关系提供压降，常写成对流向连续的形式以支持反向流

$$p_a-p_b=K\,\dot m\,|\dot m|$$

其中 $K$ 由阻力系数 $\zeta$、流通面积与参考密度组合而成。泵或风机在回路中提供扬程

$$\Delta p_{\mathrm{pump}}=H(\dot m)\,\rho\,g$$

换热器则在两个流路或热端口之间交换热量，用效能—传热单元数法常写成

$$\dot Q=\varepsilon\,C_{\min}\,(T_{h,\mathrm{in}}-T_{c,\mathrm{in}})$$

当流量可能反号时，供出焓必须使用 stream 语义的混合值，否则流向反转处会凭空产生或吞掉能量。

## 4. 工程做法与参数

介质 redeclare 应在系统顶层统一管理，子组件各选一套会在连接时报类型错误。为压力、比焓与流量设置合理的 `nominal`，可避免量级差异导致的容差失衡；量级跨度大时还应检查单位与参考状态是否一致。闭合回路需要一个压力或库存基准，但不能把每个节点压力都固定，否则初始化必然过定。初始化时给出自洽的库存、温度与流量起点，泵转速与控制信号优先使用缓升斜坡。对可忽略的小容积不要设为严格零容积，应加入有物理依据的小容积或流惯性，以消除高指标代数环。参数应来自厂商曲线、实验或经验关联式，并记录来源。

## 5. 可复现示例

下面给出一个自包含的输运组件与最小回路测试台，可直接抄用并替换介质或系数。

```modelica
model ThermofluidResistance "二次律管阻（对流向连续）"
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  Modelica.Fluid.Interfaces.FluidPort_a port_a(redeclare package Medium = Medium);
  Modelica.Fluid.Interfaces.FluidPort_b port_b(redeclare package Medium = Medium);
  parameter Real K(unit="Pa.s2/kg2") = 8e4 "压降系数";
equation
  port_a.m_flow + port_b.m_flow = 0;
  port_a.p - port_b.p = K*port_a.m_flow*abs(port_a.m_flow);
  port_a.h_outflow = inStream(port_b.h_outflow);
  port_b.h_outflow = inStream(port_a.h_outflow);
end ThermofluidResistance;
```

```modelica
model ThermalFluidLoop
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  inner Modelica.Fluid.System system(
    energyDynamics=Modelica.Fluid.Types.Dynamics.FixedInitial);
  ThermofluidResistance res(K=8e4);
  Modelica.Fluid.Vessels.OpenTank tank(
    redeclare package Medium = Medium,
    crossArea=0.5, height=1.0, level_start=0.5, nPorts=1);
  Modelica.Fluid.Sources.Boundary_pT sink(
    redeclare package Medium = Medium, nPorts=1, p=101325, T=293.15);
equation
  connect(tank.ports[1], res.port_a);
  connect(res.port_b, sink.ports[1]);
  annotation(experiment(StartTime=0, StopTime=60, Tolerance=1e-6, Interval=0.1));
end ThermalFluidLoop;
```

运行后应看到液位单调下降、流量随液位减小，且总质量变化等于流出质量积分。

## 6. 常见坑与排查

- 介质不兼容：子组件 redeclare 了不同 Medium，连接时报类型错误，应统一到顶层。
- 零流量除法：自行写比焓与流量的商会在 $\dot m\to 0$ 时发散，应改用库内正则化函数或 stream 语义。
- 奇异代数环：一串零容积阻力与理想压力源串联会形成高指标问题，应加入小容积或惯性。
- 压力过定：同时固定多个节点压力、或与闭合库存冲突，会造成初始化失败。
- 反向流被禁用：只有在工况确实单向时才用 `allowFlowReversal=false`，否则会掩盖真实物理。

## 7. 检查清单与参考

1. 每个控制体与整个系统的质量、组分、能量预算是否闭合；
2. 泵功、壁面热流与库存变化是否与独立估算一致；
3. 介质有效域、单位与参考状态是否统一；
4. 是否提供自洽初值、合理 nominal 与必要的缓升；
5. 极限工况（零流量、反向流、关阀、满罐）是否稳定。

参考：1. Modelica Standard Library, `Modelica.Fluid` 与 `Modelica.Media` UsersGuide；2. Modelica Association, *Modelica Language Specification*；3. Tiller, *Introduction to Physical Modeling with Modelica*。
