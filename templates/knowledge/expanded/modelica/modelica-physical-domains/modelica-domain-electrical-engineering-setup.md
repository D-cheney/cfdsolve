---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-electrical-engineering-setup
title: "电气网络：工程设置与参数选择"
summary: "以 24 V RLC 回路为例说明 Modelica.Electrical.Analog 的电位—电流配对、Ground 参考点、储能元件初值与 nominal 设置，给出阻尼比与特征阻抗的换算、能量核对以及两段可运行电路代码与诊断表。"
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
  - "电气网络"
  - "工程设置与参数选择"
  - "Resistor"
  - "Capacitor"
seo:
  title: "电气网络：工程设置与参数选择"
  description: "以 24 V RLC 回路为例说明 Modelica.Electrical.Analog 的电位—电流配对、Ground 参考点、储能元件初值与 nominal 设置，给出阻尼比与特征阻抗的换算、能量核对以及两段可运行电路代码与诊断表。"
  keywords:
    - "电气网络"
    - "工程设置与参数选择"
    - "RLC 回路"
    - "阻尼比"
---

# 电气网络：工程设置与参数选择

电气网络的参数选择可以归到三件事上：把电位与电流按势变量—流变量正确配对、给储能元件指定唯一且自洽的初值、以及把 R/L/C 的取值换算成可判读的阻尼比与特征阻抗。下面用 24 V 供电的串联 RLC 回路贯穿全文，所有数字都可在运行前手算复核。

## 电位与电流的配对

`Modelica.Electrical.Analog.Interfaces.PositivePin` 与 `NegativePin` 都含两个变量：`v` 是势变量，`i` 是带 `flow` 前缀的流变量。连接后的约束是节点电位相等与基尔霍夫电流定律：

$$\sum_j i_j=0, \qquad v_1=v_2=\cdots=v_n$$

这条式子在模型里不出现，但它是检查网络是否接对的第一道工具：把任一节点相连的所有 `i` 相加，残差应比支路电流小 6 个数量级以上。元件方向靠 `p`（正）与 `n`（负）引脚区分，`Resistor` 定义的是 $v_p-v_n=R\,i$，接反只影响电流符号而不影响数值大小，因此符号核对必须与外部电路图逐支路对照。

## R、L、C 的取值与初值

基本关系式分别是

$$v=R\,i, \qquad v=L\frac{di}{dt}, \qquad i=C\frac{dv}{dt}$$

三者中只有电阻是纯代数元件，电感和电容各引入一个状态。`Inductor` 的电流与 `Capacitor` 的电压必须给初值，且同一个节点上只能有一处 `fixed=true`：例如取 R=10 Ω、L=1 mH、C=100 µF，则 `Inductor(i(start=0, fixed=true))` 与 `Capacitor(v(start=0, fixed=true))` 是合法组合；若再在电源上固定电压，就会与电容初值冲突而过定。若要做稳态初始化，把 `Inductor(i(start=2.4, fixed=true))` 与 `Capacitor(v(start=24, fixed=true))` 一起给出，并在 `experiment` 中把 `StopTime` 设为 0 先做一致性检查。

## 由 R、L、C 换算阻尼比与特征阻抗

串联 RLC 的二阶特征量可以直接由三个参数算出：

$$\omega_0=\frac{1}{\sqrt{LC}}, \qquad \zeta=\frac{R}{2}\sqrt{\frac{C}{L}}, \qquad Z_0=\sqrt{\frac{L}{C}}$$

代入 L=1e-3 H、C=1e-4 F，得 LC=1e-7，ω₀=1/3.162e-4=3162 rad/s，对应 f₀=503 Hz；Z₀=√(1e-3/1e-4)=3.16 Ω；ζ=(10/2)×√(1e-4/1e-3)=5×0.3162=1.58>1，属过阻尼，阶跃响应不会振荡。若把 R 降到 3 Ω，ζ=0.474 变为欠阻尼，超调约 18%。直流稳态下回路电流 i=24/10=2.4 A，电阻耗散 P=24×2.4=57.6 W；稳态时 L 上电压为 0、C 上电压为 24 V，电容储能 0.5×1e-4×24²=28.8 mJ，电感在达到 2.4 A 时储能 0.5×1e-3×2.4²=2.88 mJ。把这两项与电源输出功率积分对照，就能确认没有漏掉隐藏的耗散路径。

## Ground 与参考点

`Modelica.Electrical.Analog.Basic.Ground` 把节点电位钉到 0 V，任何网络必须有且仅有一个。缺它会报奇异矩阵；多接两个且中间无隔离元件会造成过定。多电压等级系统用 `Modelica.Electrical.Analog.Basic.Transformer` 或 `Modelica.Electrical.Analog.Ideal.IdealTransformer` 连接，此时两侧各自需要独立参考点。`nominal` 建议按工作点设置，例如 `Resistor(v(nominal=24))`、`Capacitor(v(nominal=24))`，避免 1e-6 A 的漏电流与 1e3 V 的电压出现在同一求解块。

## 两段可运行的电路

```modelica
model SeriesRLC "串联 RLC 阶跃响应"
  Modelica.Electrical.Analog.Sources.ConstantVoltage source(V=24);
  Modelica.Electrical.Analog.Basic.Resistor R1(R=10);
  Modelica.Electrical.Analog.Basic.Inductor L1(L=1e-3, i(start=0, fixed=true));
  Modelica.Electrical.Analog.Basic.Capacitor C1(C=1e-4, v(start=0, fixed=true));
  Modelica.Electrical.Analog.Basic.Ground ground;
  Modelica.Electrical.Analog.Sensors.VoltageSensor vC;
  Modelica.Electrical.Analog.Sensors.CurrentSensor iR;
equation
  connect(source.p, iR.p);
  connect(iR.n, R1.p);
  connect(R1.n, L1.p);
  connect(L1.n, vC.p);
  connect(vC.n, C1.p);
  connect(C1.n, source.n);
  connect(C1.n, ground.p);
  annotation(experiment(StopTime=0.01, Tolerance=1e-8, Interval=1e-5));
end SeriesRLC;
```

```modelica
model ParallelCapacitorBank "带限流电阻的并联电容充电"
  parameter Integer n = 3 "并联支路数";
  Modelica.Electrical.Analog.Sources.ConstantVoltage source(V=400);
  Modelica.Electrical.Analog.Basic.Resistor limit(R=25);
  Modelica.Electrical.Analog.Basic.Capacitor bank[n](
    each C=470e-6, each v(start=0, fixed=true));
  Modelica.Electrical.Analog.Basic.Ground ground;
equation
  connect(source.p, limit.p);
  connect(limit.n, bank[1].p);
  for k in 2:n loop
    connect(bank[k-1].p, bank[k].p);
  end for;
  connect(bank[n].n, source.n);
  connect(source.n, ground.p);
end ParallelCapacitorBank;
```

第二例的总电容量为 3×470e-6=1.41e-3 F，充电时间常数 τ=R·C=25×1.41e-3=0.0353 s，5τ≈0.18 s 后电流降到初值 400/25=16 A 的 1% 以内。

## 电路失效症状与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 编译报奇异雅可比矩阵 | 网络中没有 Ground，电位只有相对值 | 加上 Ground 后重编译，方程数应等于未知数 |
| 电感电流在 t=0 出现尖峰 | 电感未给 i(start) 初值，被当成代数量 | 显式写出 i(start=0, fixed=true) 后重算 |
| 电容电压阶跃后不衰减 | 回路总电阻为 0，ζ=0 无耗散 | 检查是否漏掉寄生电阻，给 R=0.1 Ω 后应衰减 |
| 稳态电流与手算不符 | 电源符号接反或元件 p/n 接反 | 用 CurrentSensor 读数与 24/R 对照符号 |
| 时间步被压到 1e-9 s | 理想开关与理想电压源直接串联 | 串入 1e-3 Ω 级电阻或改用 Idle 元件 |

## 电路参数的验收判据与依据

交付时至少留下三份数值证据：一是由 R、L、C 手算的 ω₀、ζ 与仿真峰值时刻的偏差（应小于 5%）；二是把电感与电容储能之和随时间积分，与电源输出能量减去电阻耗散作差，残差应小于总能量 0.1%；三是把 R 从 10 Ω 扫到 3 Ω 时超调量从 0% 升到约 18%，用这一条确认阻尼比换算式有效。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Electrical.Analog` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Nilsson J.W., Riedel S.A. *Electric Circuits*, 11th ed., Pearson, 2019.
4. Cellier F.E., Kofman E. *Continuous System Simulation*, Springer, 2006.
5. Tiller M. *Introduction to Physical Modeling with Modelica*, Kluwer Academic Publishers, 2001.
6. Otter M., Elmqvist H., Mattsson S.E. "Hybrid modeling in Modelica based on the synchronous data flow principle", *IEEE International Symposium on Computer Aided Control System Design*, 1999.
