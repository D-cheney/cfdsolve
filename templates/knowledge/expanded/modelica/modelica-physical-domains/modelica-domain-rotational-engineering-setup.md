---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-rotational-engineering-setup
title: "转动机械：工程设置与参数选择"
summary: "针对 Modelica.Mechanics.Rotational 说明角度—转矩配对、惯量与扭转刚度的取值、IdealGear 的速比与功率守恒，并给出固有频率、阻尼比、加速时间的手算核对及两段可运行的传动链代码。"
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
  - "转动机械"
  - "工程设置与参数选择"
  - "Inertia"
  - "IdealGear"
seo:
  title: "转动机械：工程设置与参数选择"
  description: "针对 Modelica.Mechanics.Rotational 说明角度—转矩配对、惯量与扭转刚度的取值、IdealGear 的速比与功率守恒，并给出固有频率、阻尼比、加速时间的手算核对及两段可运行的传动链代码。"
  keywords:
    - "转动机械"
    - "工程设置与参数选择"
    - "Inertia"
    - "IdealGear"
---

# 转动机械：工程设置与参数选择

转动系统的设置核心是三个量：惯量 J、扭转刚度 c 与阻尼 d，其余参数都由它们派生。本文取 J=0.05 kg·m²、c=1200 N·m/rad、d=2.5 N·m·s/rad 的传动轴为基线，先确认角度与转矩的配对方向，再把频率、阻尼、加速时间与齿轮速比逐项算成可核对的数字。

## 角度是势变量，转矩是流变量

`Modelica.Mechanics.Rotational.Interfaces.Flange_a` 与 `Flange_b` 中，角度 `phi` 是势变量，转矩 `tau` 是带 `flow` 前缀的流变量。连接后角度相等、转矩代数和为零：

$$\sum_j \tau_j=0, \qquad \varphi_1=\varphi_2=\cdots=\varphi_n$$

`Inertia` 内部的运动方程是 $J\,d\omega/dt=\tau_a+\tau_b$，并伴随 $\omega=d\varphi/dt$。扭转弹簧与阻尼器的本构关系为

$$\tau_{spring}=c\left(\varphi_a-\varphi_b-\varphi_{rel0}\right), \qquad \tau_{damper}=d\left(\omega_a-\omega_b\right)$$

其中 `phi_rel0` 是自由角。设错 0.01 rad 相当于预加 1200×0.01=12 N·m 的常转矩，稳态角会偏 0.01 rad 而振荡频率不变，这就是区分"刚度错"与"偏置错"的判据。

## 惯量与扭转刚度的取值

惯量由几何与密度积分得到，实心圆柱 $J=\frac{1}{2}mr^2$。取直径 0.2 m、质量 10 kg 的钢制联轴器节，r=0.1 m，则 J=0.5×10×0.01=0.05 kg·m²，与基线一致。扭转刚度由轴段尺寸给出：

$$c=\frac{G I_p}{L}, \qquad I_p=\frac{\pi d^4}{32}$$

钢的 G=79.3 GPa，轴径 d=0.04 m 时 I_p=π×0.04⁴/32=2.513e-7 m⁴，取轴长 L=0.5 m，则 c=79.3e9×2.513e-7/0.5=39860 N·m/rad，远高于基线的 1200 N·m/rad——说明基线对应的是长轴或柔性联轴器，而不是短粗轴段。参数取值必须回到几何来源，否则频率会被高估数十倍。

## 频率、阻尼与加速时间的手算

二阶特征量与前两节参数直接相关：

$$\omega_0=\sqrt{\frac{c}{J}}, \qquad \zeta=\frac{d}{2\sqrt{cJ}}, \qquad \alpha=\frac{\tau}{J}$$

代入基线参数得 ω₀=√(1200/0.05)=√24000=154.9 rad/s，即 f₀=24.7 Hz；ζ=2.5/(2×√60)=2.5/15.49=0.161，属欠阻尼；欠阻尼超调约 exp(−πζ/√(1−ζ²))=exp(−0.5125)=0.599，即首次越过目标约 60%。若把 d 提到 8 N·m·s/rad，ζ=0.516，超调降到约 15%，这是调整阻尼器的直接依据。再看加速能力：3 kW 电机在 1500 r/min 时角速度 ω=2π×1500/60=157.1 rad/s，输出转矩 τ=P/ω=3000/157.1=19.1 N·m，角加速度 α=19.1/0.05=382 rad/s²，从静止升到 157.1 rad/s 需 157.1/382=0.411 s。这三个数字（19.1 N·m、382 rad/s²、0.411 s）应在仿真里一一复现。

## 齿轮速比与功率守恒

`IdealGear` 是无损理想元件，速比 `ratio=i` 时满足 $\varphi_a=i\,\varphi_b$ 与 $\tau_b=-i\,\tau_a$，功率严格守恒 $\tau_a\omega_a+\tau_b\omega_b=0$。取 i=3.5，输入 1500 r/min 时输出 428.6 r/min，输入 19.1 N·m 时输出 66.8 N·m，两侧功率都是 3.0 kW。若仿真中输出转矩不等于 66.8 N·m，先检查 `ratio` 是否写成 1/3.5；若功率不守恒，则说明混入了非理想元件而未相应调整。真实齿轮箱应改用 `Modelica.Mechanics.Rotational.Components.LossyGear` 并给出 `lossTable` 或恒定效率，此时输出转矩按效率 0.96 折减为 64.1 N·m，功率损耗 120 W 会体现为温升。

## 两段可运行的传动模型

```modelica
model TorsionalShaft "单惯量扭转振动"
  Modelica.Mechanics.Rotational.Components.Fixed fixed;
  Modelica.Mechanics.Rotational.Components.Spring spring(c=1200, phi_rel0=0);
  Modelica.Mechanics.Rotational.Components.Damper damper(d=2.5);
  Modelica.Mechanics.Rotational.Components.Inertia inertia(
    J=0.05, phi(start=0, fixed=true), w(start=0, fixed=true));
  Modelica.Mechanics.Rotational.Sources.Torque torque;
  Modelica.Blocks.Sources.Step step(height=19.1, startTime=0.2);
equation
  connect(step.y, torque.tau);
  connect(torque.flange, inertia.flange_a);
  connect(inertia.flange_b, spring.flange_a);
  connect(inertia.flange_b, damper.flange_a);
  connect(spring.flange_b, fixed.flange);
  connect(damper.flange_b, fixed.flange);
  annotation(experiment(StopTime=1.0, Tolerance=1e-9, Interval=0.0005));
end TorsionalShaft;
```

```modelica
model GearedDrive "电机 + 减速箱 + 负载惯量"
  Modelica.Mechanics.Rotational.Components.Inertia motor(J=0.02,
    phi(start=0, fixed=true), w(start=0, fixed=true));
  Modelica.Mechanics.Rotational.Components.IdealGear gear(ratio=3.5);
  Modelica.Mechanics.Rotational.Components.Inertia load(J=0.5,
    w(start=0, fixed=true));
  Modelica.Mechanics.Rotational.Sources.Torque motorTorque;
  Modelica.Blocks.Sources.Constant cmd(k=19.1);
equation
  connect(cmd.y, motorTorque.tau);
  connect(motorTorque.flange, motor.flange_a);
  connect(motor.flange_b, gear.flange_a);
  connect(gear.flange_b, load.flange_a);
end GearedDrive;
```

## 转动系统失效与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 编译报角度过定 | 同一轴上多处设 phi(fixed=true) | 只保留一处固定角，其余改 start |
| 频率为手算值的 2 倍 | 惯量 J 用的是实心圆柱公式但质量只算了一半 | 核对 J=½mr² 的 m 与几何体积是否一致 |
| 稳态角偏移而频率正常 | Spring 的 phi_rel0 不等于自由角 | 把 phi_rel0 归零，偏移应消失 |
| 齿轮两侧功率不相等 | 误用 LossyGear 却未给 lossTable | 检查是否切换了元件类型并补齐效率表 |
| 加速时间比 0.411 s 长 3 倍 | 负载惯量折算到电机侧时未乘 i² | 核对 J_eq=J_load/i²=0.5/12.25=0.0408 kg·m² |

## 转动参数的验收判据与依据

至少核对四项：一是 f₀=24.7 Hz 与仿真振荡周期的偏差，应小于 3%；二是 19.1 N·m 恒转矩下 0.411 s 升到 157.1 rad/s 的加速时间；三是 `IdealGear` 两侧功率之和的绝对值，应小于 1e-6 W；四是把负载惯量折算到电机侧后 J_eq=J_motor+J_load/i²=0.02+0.0408=0.0608 kg·m²，用这一等效值重算加速时间，应与逐元件仿真一致。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Mechanics.Rotational` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Rao S.S. *Mechanical Vibrations*, 6th ed., Pearson, 2017.
4. Shigley J.E., Budynas R.G., Nisbett J.K. *Shigley's Mechanical Engineering Design*, 11th ed., McGraw-Hill, 2020.
5. Tiller M. *Introduction to Physical Modeling with Modelica*, Kluwer Academic Publishers, 2001.
6. Otter M., Elmqvist H., Mattsson S.E. "Hybrid modeling in Modelica based on the synchronous data flow principle", *IEEE International Symposium on Computer Aided Control System Design*, 1999.
