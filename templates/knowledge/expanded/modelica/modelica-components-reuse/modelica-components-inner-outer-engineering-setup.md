---
template_version: "flowlab-knowledge/1.0"
slug: modelica-components-inner-outer-engineering-setup
title: "inner/outer 环境传播：工程设置与参数选择"
summary: "inner 实例必须全模型唯一，outer 就近解析，缺失时静默退化为默认值。给出 Modelica.Fluid.System 的字段与推荐取值、静压与高差的换算算例、10 m 水柱对应 0.9777 bar 的核对值，以及环境参数设错的五类症状。"
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
  - "inner/outer 环境传播"
  - "工程设置与参数选择"
  - "Modelica.Fluid.System"
  - "重力场"
seo:
  title: "inner/outer 环境传播：工程设置与参数选择"
  description: "inner 实例必须全模型唯一，outer 就近解析，缺失时静默退化为默认值。给出 Modelica.Fluid.System 的字段与推荐取值、静压与高差的换算算例、10 m 水柱对应 0.9777 bar 的核对值，以及环境参数设错的五类症状。"
  keywords:
    - "inner/outer 环境传播"
    - "工程设置与参数选择"
    - "Modelica.Fluid.System"
    - "重力场"
    - "静压"
---

# inner/outer 环境传播：工程设置与参数选择

`inner`/`outer` 让深层组件不必逐层传参就能拿到全局环境：大气压力、环境温度、重力方向、求解器容差。工程设置的要点是保证全模型恰好一个 `inner` 实例、参数取值与物理场景一致，以及 `outer` 引用确实解析到它而不是落到默认值。环境参数设错时模型照样收敛，只是静压和重力项偏掉几个百分点。

## inner 唯一、outer 就近解析

语言规则可归纳为两条：每个 `outer` 变量必须有且仅有一个同名同类型的 `inner` 声明位于其外层作用域中；若找不到，`outer` 退化为普通变量，取声明处的默认值。

$$ N_{inner} = 1,\qquad N_{outer} \ge 0 $$

$N_{inner} > 1$ 会报 duplicate definition of inner variable，$N_{inner} = 0$ 不报错但结果是静默错误。因此交付前必须搜索全模型的 `inner` 关键字并确认计数为 1。

## Modelica.Fluid.System 的字段

MSL 的标准环境对象是 `Modelica.Fluid.System`，常用字段与推荐取值如下。

| 字段 | 推荐值 | 单位 | 说明 |
|---|---|---|---|
| p_ambient | 101325 | Pa | 海平面标准大气压 |
| T_ambient | 293.15 | K | 20 °C 环境温度 |
| g | 9.80665 | m/s^2 | 标准重力加速度 |
| energyDynamics | Dynamics.SteadyState | — | 稳态或 InitialValues |
| massDynamics | Dynamics.SteadyState | — | 与能量方程保持一致 |
| momentumDynamics | Dynamics.SteadyStateInitial | — | 稳态动量方程 |
| m_flow_small | 0.01 | kg/s | 近零流量判据，取设计流量的 1% |
| allowFlowReversal | true | — | 允许反向流动 |

`p_ambient` 取 101325 Pa 而不是 100000 Pa，差别是 1.3%；对开式储罐的液位换算，1.3% 的压力误差对应约 13.5 cm 水柱。`g` 用 9.80665 m/s²（标准重力）而非 9.81 m/s²，两者相对差 $3.4\times10^{-4}$，长管路静压累计误差不可忽略。

## 静压与参考高度的换算

环境对象最直接的物理作用是提供重力场，静压由密度、重力与高度差决定：

$$ p(z) = p_{amb} + \rho\, g\, (z_{ref} - z) $$

以 20 °C 液态水、密度 $\rho = 997\ \mathrm{kg/m^3}$、高差 10.0 m 为例：

$$ \Delta p = 997 \times 9.80665 \times 10.0 = 9.77723\times10^{4}\ \mathrm{Pa} \approx 0.9777\ \mathrm{bar} $$

即 10 m 水柱对应 0.9777 bar 静压，约为 1 个标准大气压的 96.5%。如果模型里 `g` 被默认成 0，同一段管路的压差会少掉 $9.78\times10^{4}$ Pa，泵扬程需求被低估约 10 m。

## 环境对象的装配

```modelica
model PumpingLoop
  extends Modelica.Icons.Example;
  inner Modelica.Fluid.System system(
    p_ambient = 101325,
    T_ambient = 293.15,
    g = 9.80665,
    energyDynamics = Modelica.Fluid.Types.Dynamics.SteadyState,
    massDynamics = Modelica.Fluid.Types.Dynamics.SteadyState,
    m_flow_small = 0.01);
  Modelica.Fluid.Sources.Boundary_pT tank(
    redeclare package Medium = Modelica.Media.Water.StandardWater,
    p = 101325, T = 293.15, nPorts = 1);
  Modelica.Fluid.Machines.Pump pump(
    redeclare package Medium = Modelica.Media.Water.StandardWater,
    m_flow_nominal = 1.0, dp_nominal = 10000);
  Modelica.Fluid.Pipes.StaticPipe riser(
    redeclare package Medium = Modelica.Media.Water.StandardWater,
    length = 10.0, diameter = 0.025, height_ab = 10.0);
equation
  connect(tank.ports[1], pump.port_a);
  connect(pump.port_b, riser.port_a);
end PumpingLoop;
```

`riser` 的 `height_ab = 10.0` m 会通过 `system.g` 计算静压升；`pump` 的 `dp_nominal = 10000` Pa 用于流量标度。两者都从 `inner` 实例取重力与环境压力，组件内部无需重复声明。

## 环境参数错误的判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 duplicate definition of inner variable | 容器与子模型各写了一个 inner System | 搜索 inner 关键字，只保留最外层一个 |
| 静压项恒为零 | 全模型无 inner，outer 退化为默认 g 等于 0 | 打印 system.g，确认等于 9.80665 |
| 液位换算差 13.5 cm | p_ambient 用了 100000 Pa 而非 101325 Pa | 比对环境压力与实测大气压 |
| 闭式回路压力整体偏移 0.98 bar | 高差 10 m 的静压未计入参考高度 | 检查管道 height_ab 与 system.g 是否同时生效 |
| 环境温度对结果无影响 | 组件直接用了端口温度而未引用 system.T_ambient | 把 T_ambient 改成 273.15 K，看散热项是否变化 |

## 参考

1. Modelica Association. *Modelica Language Specification, Version 3.6*. 2023. — inner/outer 声明与名字查找规则
2. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Fluid.System`. 2020. — 环境对象字段定义
3. Wetter M., et al. Modelica Buildings Library. *Journal of Building Performance Simulation*, 7(4): 253–270, 2014. — 建筑库中的环境对象用法
4. Mattsson S.E., Elmqvist H., Otter M. Physical System Modeling with Modelica. *Control Engineering Practice*, 6(4): 501–510, 1998. — 环境变量传播
5. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Fluid.Pipes.StaticPipe`. 2020.
6. Sielemann M., Casella F., Otter M., et al. Robust Initialization of Differential-Algebraic Equations Using Homotopy. *8th International Modelica Conference*, 2011. — 环境压力与初值的同伦启动
