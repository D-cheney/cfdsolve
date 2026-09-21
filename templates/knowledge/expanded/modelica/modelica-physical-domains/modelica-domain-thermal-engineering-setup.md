---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-thermal-engineering-setup
title: "热网络建模：工程设置与参数选择"
summary: "把热网络拆成导热热导、热容、对流与辐射四类 MSL 元件，给出 G、C、Gc、Gr 的取值依据与手算过程，说明温度—热流的端口配对、初值与 nominal 设置，并附两段可运行代码与失败模式判定试验。"
category:
  slug: modelica-physical-domains
  name: "Modelica 物理域建模"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 物理域建模"
  - "热网络建模"
  - "工程设置与参数选择"
  - "ThermalConductor"
  - "HeatCapacitor"
seo:
  title: "热网络建模：工程设置与参数选择"
  description: "把热网络拆成导热热导、热容、对流与辐射四类 MSL 元件，给出 G、C、Gc、Gr 的取值依据与手算过程，说明温度—热流的端口配对、初值与 nominal 设置，并附两段可运行代码与失败模式判定试验。"
  keywords:
    - "热网络建模"
    - "工程设置与参数选择"
    - "ThermalConductor"
    - "HeatCapacitor"
---

# 热网络建模：工程设置与参数选择

热网络把连续温度场压缩成若干等温节点，节点之间用热导连接、节点自身用热容蓄热，用来回答"某部件多久升到稳态""峰值温度是否越限"这类系统级问题。本文按 `Modelica.Thermal.HeatTransfer` 的真实元件，逐项给出 `G`、`C`、`Gc`、`Gr` 四个参数的取值方法，说明温度—热流的配对规则，并附薄板热节点的手算与两段可直接运行的代码。

## 端口配对：T 是势变量，Q_flow 是流变量

`HeatPort_a` 与 `HeatPort_b` 的变量集合完全一致：`T` 是势变量，`Q_flow` 是带 `flow` 前缀的流变量。连接后同一节点温度强制相等，热流代数和归零：

$$\sum_j Q_{flow,j}=0, \qquad T_1=T_2=\cdots=T_n$$

这条约束本身就是检查手段：把任一内部节点上相连的所有 `Q_flow` 相加，残差应比该节点热流小 4 个数量级以上；若残差与热流同量级，多半是某个端口悬空，或 `HeatPort_a` 与 `HeatPort_b` 的接线方向被接错导致符号相反。

## 导热热导 G：由几何与材料反算

`ThermalConductor` 只暴露一个参数 `G`，单位 W/K，代表单位温差下的热流：

$$G=\frac{\lambda A}{L}$$

取 3 mm 厚、0.25 m² 的铝合金板，λ=237 W/(m·K)、L=0.003 m，则 G=237×0.25/0.003=19750 W/K。也就是说每 1 K 温差可通 19.75 kW 热流；若该板上只有 50 W 的扰动，稳态温差仅 50/19750=2.5e-3 K。结论很直接：这种薄板在大面积传热路径上应写成纯热导，不必单独占一个温度状态。

## 热容 C 与热时间常数：判断蓄热能否忽略

`HeatCapacitor` 的参数 `C` 单位 J/K，由质量乘比热得到，并与热导一起决定时间常数：

$$C=m c_p, \qquad \tau=\frac{C}{G}$$

上例中 ρ=2700 kg/m³、V=0.25×0.003=7.5e-4 m³，得 m=2.025 kg；取 c_p=900 J/(kg·K)，C=1822.5 J/K。若板背面靠自然对流与 293.15 K 环境耦合，h=8 W/(m²·K) 时对流热导为 2.0 W/K，等效 G≈19750×2.0/(19750+2.0)=2.0 W/K，于是 τ=1822.5/2.0=911 s。与前一节的 2.5e-3 K 相比，是否保留热容完全取决于耦合路径：板内导热可当准稳态，板与环境之间则必须保留，否则 15 min 量级的升温会被算成瞬间完成。

## 对流与辐射的接入方式

`Convection` 的 `Gc` 是 `RealInput`，必须由 `Modelica.Blocks.Sources` 驱动，不能把常数直接写在参数位上；自然对流取 h=5~10 W/(m²·K)，强制风冷取 25~100 W/(m²·K)。`BodyRadiation` 的参数则是热导型系数：

$$G_r=\varepsilon\sigma A, \qquad \dot Q_{rad}=G_r\left(T_1^4-T_2^4\right)$$

取 σ=5.670374419e-8 W/(m²·K⁴)、ε=0.9、A=0.25 m²，得 G_r=1.276e-8 W/K⁴。当 T₁=350 K、T₂=300 K 时，Q=1.276e-8×(1.5006e10−8.1000e9)=1.276e-8×6.906e9=88.1 W，与同一表面 h=8 W/(m²·K)、ΔT=50 K 时的对流 100 W 已经同量级，所以 80 ℃ 以上工况不能只留对流项。辐射是四次方关系，只有在 |T₁−T₂|≪T 时才可用线性化近似。

## 初值与 nominal

温度初值用 `T(start=..., fixed=true)` 给出，但只允许在少数节点上设 `fixed=true`：全网络都固定会过定，全部不固定则初始方程秩亏。热流与温度的 nominal 建议按工况量级设置，例如 `T(nominal=300)`、`Q_flow(nominal=100)`，避免 1e5 与 1e-3 混在一个求解块里导致容差失衡。稳态问题应把 `energyDynamics` 设为 `SteadyState` 并去掉 `fixed=true`，让求解器直接解代数平衡，而不是让积分器跑几千秒去逼近。

## 可运行的两段代码

```modelica
model PlateThermalNode "薄板节点：导热 + 漏热 + 热容"
  Modelica.Thermal.HeatTransfer.Components.ThermalConductor cond(G=19750) "板内导热";
  Modelica.Thermal.HeatTransfer.Components.ThermalConductor leak(G=2.0) "对环境漏热";
  Modelica.Thermal.HeatTransfer.Components.HeatCapacitor cap(
    C=1822.5, T(start=293.15, fixed=true));
  Modelica.Thermal.HeatTransfer.Sources.PrescribedTemperature hot;
  Modelica.Thermal.HeatTransfer.Sources.FixedTemperature amb(T=293.15);
  Modelica.Thermal.HeatTransfer.Sensors.TemperatureSensor Tnode;
  Modelica.Blocks.Sources.Ramp ramp(offset=293.15, height=60, duration=10);
equation
  connect(ramp.y, hot.T);
  connect(hot.port, cond.port_a);
  connect(cond.port_b, cap.port);
  connect(cap.port, leak.port_a);
  connect(leak.port_b, amb.port);
  connect(cap.port, Tnode.port);
  annotation(experiment(StopTime=3000, Tolerance=1e-6, Interval=1));
end PlateThermalNode;
```

```modelica
model RadiativeSurface "对流与辐射并联的表面"
  Modelica.Thermal.HeatTransfer.Components.Convection conv;
  Modelica.Thermal.HeatTransfer.Components.BodyRadiation rad(Gr=1.276e-8);
  Modelica.Thermal.HeatTransfer.Components.HeatCapacitor cap(
    C=4200, T(start=300, fixed=true));
  Modelica.Thermal.HeatTransfer.Sources.FixedTemperature sur(T=300);
  Modelica.Thermal.HeatTransfer.Sensors.HeatFlowSensor qRad;
  Modelica.Blocks.Sources.Constant hConst(k=8.0);
equation
  connect(hConst.y, conv.Gc);
  connect(cap.port, conv.port_a);
  connect(conv.port_b, sur.port);
  connect(cap.port, rad.port_a);
  connect(rad.port_b, qRad.port_a);
  connect(qRad.port_b, sur.port);
end RadiativeSurface;
```

## 热网络失效症状与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 节点温度在 0.1 s 内跳到热源温度 | 热容被写成 C=0，或漏热热导远大于内部热导 | 把 C 提高 10 倍重算，时间常数应同比放大 |
| 稳态温度比手算高 30 K 以上 | 用线性化代替 T⁴ 而实际 ΔT 达 50 K | 关闭 BodyRadiation 只留对流，偏差应消失 |
| 温度解出负值或超过 1000 K | 辐射四次方在大温差下失去稳定性 | 把 T⁴ 在 300 K 附近线性化后重算并对比 |
| 初始化报方程过定 | 多个节点同时设 T(fixed=true) | 只保留一个固定初值，其余改用 start |
| 能量残差随步长变化 | 端口悬空或有节点只连了一个端口 | 逐个检查 cap.port 与 cond.port 的连接数是否 ≥2 |

## 热网络的验收判据与依据

每篇热网络模型至少要留下三项可核对记录：一是把某个内部节点的所有热流求和，给出最大残差的绝对值与单位；二是把 `τ=C/G` 的手算值与仿真升到 63.2% 稳态温升的时刻对照；三是给出辐射与对流项在峰值温度下的比值。以下资料给出元件定义、端口语义与物性数据的原始出处。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Thermal.HeatTransfer` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S. *Fundamentals of Heat and Mass Transfer*, 7th ed., Wiley, 2011.
4. Tiller M. *Introduction to Physical Modeling with Modelica*, Kluwer Academic Publishers, 2001.
5. Mattsson S.E., Elmqvist H., Otter M. "Physical system modeling with Modelica", *Control Engineering Practice*, 6(4):501–510, 1998.
6. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*, Wiley-IEEE Press, 2015.
