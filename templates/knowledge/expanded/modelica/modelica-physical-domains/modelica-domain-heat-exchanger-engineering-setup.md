---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-heat-exchanger-engineering-setup
title: "换热器系统模型：工程设置与参数选择"
summary: "以 41.84 kW 逆流换热器为算例，给出 Modelica.Fluid.HeatExchangers.BasicHX 与两管加壁体结构的参数设置，完成 LMTD 反算 UA=933.5 W/K 与 ε-NTU 自洽校核，并说明壁体热容与节点数选取。"
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
  - "换热器系统模型"
  - "工程设置与参数选择"
  - "BasicHX"
  - "LMTD"
seo:
  title: "换热器系统模型：工程设置与参数选择"
  description: "以 41.84 kW 逆流换热器为算例，给出 Modelica.Fluid.HeatExchangers.BasicHX 与两管加壁体结构的参数设置，完成 LMTD 反算 UA=933.5 W/K 与 ε-NTU 自洽校核，并说明壁体热容与节点数选取。"
  keywords:
    - "换热器系统模型"
    - "工程设置与参数选择"
    - "LMTD"
    - "ε-NTU"
---

# 换热器系统模型：工程设置与参数选择

换热器模型的关键参数只有传热能力 UA。两侧流量、压降、壁体热容、离散节点数都由 UA 与工况推导。本文用一台 41.84 kW 逆流换热器把这条链路走通：先由能量平衡定功率，再由 LMTD 反算 UA，最后用 ε-NTU 校核，三个数字必须同时吻合。

## 两侧能量平衡定功率

稳态下两侧热流必须相等：

$$\dot Q=\dot m_h c_{p,h}\left(T_{h,in}-T_{h,out}\right)=\dot m_c c_{p,c}\left(T_{c,out}-T_{c,in}\right)$$

取热水侧 ṁ_h=0.5 kg/s、cp=4184 J/(kg·K)、进口 353.15 K（80 ℃）、出口 333.15 K（60 ℃），得 Q=0.5×4184×20=41840 W=41.84 kW。冷水侧取 ṁ_c=1.0 kg/s、进口 293.15 K（20 ℃），则出口温升 ΔT_c=41840/(1.0×4184)=10 K，出口温度 303.15 K（30 ℃）。两侧热容流率 C_h=2092 W/K、C_c=4184 W/K，于是 C_min=2092 W/K、C_r=0.5。

## LMTD 反算 UA

逆流布置的对数平均温差为

$$\Delta T_{lm}=\frac{\Delta T_1-\Delta T_2}{\ln\left(\Delta T_1/\Delta T_2\right)}, \qquad \dot Q=UA\,\Delta T_{lm}$$

热水进口侧 ΔT₁=353.15−303.15=50 K，热水出口侧 ΔT₂=333.15−293.15=40 K。代入得 ΔT_lm=(50−40)/ln(1.25)=10/0.22314=44.82 K，于是 UA=Q/ΔT_lm=41840/44.82=933.5 W/K，这就是 `BasicHX` 的 `hA` 取值。改顺流布置则 ΔT₁=60 K、ΔT₂=30 K，ΔT_lm=43.28 K，UA 需升到 966.7 W/K，多用 3.6% 面积。

## ε-NTU 自洽校核

效能法提供独立的第二条关系，用于验证 LMTD 结果：

$$\varepsilon=\frac{\dot Q}{C_{min}\left(T_{h,in}-T_{c,in}\right)}, \qquad NTU=\frac{UA}{C_{min}}$$

代入得 Q_max=2092×60=125520 W，ε=41840/125520=0.3333，NTU=933.5/2092=0.4462。逆流 ε-NTU 关系式为

$$\varepsilon=\frac{1-e^{-NTU\left(1-C_r\right)}}{1-C_r\,e^{-NTU\left(1-C_r\right)}}$$

代入 C_r=0.5、NTU=0.4462：NTU(1−C_r)=0.2231，e^(−0.2231)=0.8000，ε=(1−0.8)/(1−0.5×0.8)=0.2000/0.6000=0.3333，与能量平衡得到的 0.3333 完全一致。ε 一致才说明 UA、流量与四个温度自洽。

## 壁体热容与节点数

壁体蓄热决定瞬态响应。取换热面积 5 m²、壁厚 4 mm、钢密度 7850 kg/m³、cp=500 J/(kg·K)，则壁体质量 157 kg，热容 C_wall=157×500=78500 J/K，时间常数 τ_wall=C_wall/UA=78500/933.5=84.1 s。只关心分钟级过程时可设为 `SteadyState`；研究启停或负荷突变必须保留热容，否则出口温度会瞬时跳变。

离散节点数由 NTU_node=UA/(nNodes·C_min) 决定。nNodes=10 时 NTU_node=933.5/(10×2092)=0.0446，单节点温差仅几 K；nNodes=1 时 NTU_node=0.446，逆流被算成集中参数，出口温度偏高约 4 K。取 NTU_node<0.1 对应 nNodes≥5。

## 两段可运行的换热器模型

```modelica
model BasicHXSetup "用 BasicHX 设置逆流换热器"
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  inner Modelica.Fluid.System system;
  Modelica.Fluid.Sources.MassFlowSource_T hotIn(
    redeclare package Medium = Medium, nPorts=1, m_flow=0.5, T=353.15);
  Modelica.Fluid.Sources.MassFlowSource_T coldIn(
    redeclare package Medium = Medium, nPorts=1, m_flow=1.0, T=293.15);
  Modelica.Fluid.Sources.Boundary_pT outlet(
    redeclare package Medium = Medium, nPorts=2, p=200000);
  Modelica.Fluid.HeatExchangers.BasicHX hx(
    redeclare package Medium = Medium, nNodes=10, hA=933.5,
    use_T_start=true, T_start=333.15);
equation
  connect(hotIn.ports[1], hx.port_a1);
  connect(coldIn.ports[1], hx.port_a2);
  connect(hx.port_b1, outlet.ports[1]);
  connect(hx.port_b2, outlet.ports[2]);
  annotation(experiment(StopTime=200, Tolerance=1e-6, Interval=0.5));
end BasicHXSetup;
```

```modelica
model CounterFlowHX "两管 + 壁体：对应 Modelica.Fluid.Examples.HeatExchanger"
  replaceable package Medium = Modelica.Media.Water.StandardWater;
  inner Modelica.Fluid.System system;
  Modelica.Fluid.Sources.MassFlowSource_T hotIn(
    redeclare package Medium = Medium, nPorts=1, m_flow=0.5, T=353.15);
  Modelica.Fluid.Sources.MassFlowSource_T coldIn(
    redeclare package Medium = Medium, nPorts=1, m_flow=1.0, T=293.15);
  Modelica.Fluid.Pipes.DynamicPipe hotPipe(
    redeclare package Medium = Medium, length=5, diameter=0.02, nNodes=10,
    p_a_start=200000, p_b_start=195000, T_start=353.15);
  Modelica.Fluid.Pipes.DynamicPipe coldPipe(
    redeclare package Medium = Medium, length=5, diameter=0.02, nNodes=10,
    p_a_start=200000, p_b_start=195000, T_start=293.15);
  Modelica.Fluid.Sources.Boundary_pT outlet(
    redeclare package Medium = Medium, nPorts=2, p=195000);
  Modelica.Thermal.HeatTransfer.Components.ThermalConductor wall[10](
    each G=93.35);
equation
  connect(hotIn.ports[1], hotPipe.port_a);
  connect(coldIn.ports[1], coldPipe.port_a);
  connect(hotPipe.port_b, outlet.ports[1]);
  connect(coldPipe.port_b, outlet.ports[2]);
  connect(hotPipe.heatPorts, wall.port_a);
  connect(wall.port_b, coldPipe.heatPorts);
end CounterFlowHX;
```

壁体导热热导按 UA/nNodes=93.35 W/K 分配，串联后总热导仍为 933.5 W/K。

## 换热器失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 两侧热流差超过 5% | 一侧用固定压力边界导致流量漂移 | 读出两侧 ṁ·cp·ΔT，差值应小于 Q 的 1% |
| 出口温度比手算高 4 K | nNodes=1，逆流被算成集中参数 | nNodes 提到 10，出口温度应向 333.15 K 收敛 |
| 出口温度瞬时跳变 | 壁体热容被设为零 | 打开热容，τ_wall 应为 84.1 s 量级 |
| 顺流逆流结果相同 | 两管流向未设置成相反 | 检查 port_a/port_b 接法是否同向 |
| 换热功率随迭代振荡 | hA 与流量不匹配，接近夹点 | 核对 ε=0.3333，逼近 1 即进入夹点区 |

## 换热器验收判据

交付时给出四项证据：两侧能量平衡残差 |Q_h−Q_c|/Q<1%；LMTD 反算的 UA=933.5 W/K 与 ε-NTU 回算的 ε 都应为 0.3333；节点数从 5 加密到 20 时出口温度变化小于 1%；壁体时间常数 84.1 s 与出口温度阶跃响应 63% 时刻对照。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Fluid.HeatExchangers` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Kays W.M., London A.L. *Compact Heat Exchangers*, 3rd ed., McGraw-Hill, 1984.
4. Shah R.K., Sekulić D.P. *Fundamentals of Heat Exchanger Design*, John Wiley & Sons, 2003.
5. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S. *Fundamentals of Heat and Mass Transfer*, 7th ed., Wiley, 2011.
