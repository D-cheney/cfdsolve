---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-translational-engineering-setup
title: "平动机械：工程设置与参数选择"
summary: "以 1.5 kg 质量—弹簧—阻尼系统为基线，说明 Modelica.Mechanics.Translational 中位移与力的配对、正向约定、刚体限位与初值设置，给出固有频率、阻尼比与超调量的手算核对以及两段可直接运行的模型代码。"
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
  - "平动机械"
  - "工程设置与参数选择"
  - "Translational"
  - "Mass"
seo:
  title: "平动机械：工程设置与参数选择"
  description: "以 1.5 kg 质量—弹簧—阻尼系统为基线，说明 Modelica.Mechanics.Translational 中位移与力的配对、正向约定、刚体限位与初值设置，给出固有频率、阻尼比与超调量的手算核对以及两段可直接运行的模型代码。"
  keywords:
    - "平动机械"
    - "工程设置与参数选择"
    - "固有频率"
    - "阻尼比"
---

# 平动机械：工程设置与参数选择

平动机械最容易出错的地方是符号：`Flange_a` 与 `Flange_b` 谁推谁、弹簧的 `s_rel0` 以哪一端为零、外力的正方向指向哪里。本文用 1.5 kg 质量块、2000 N/m 弹簧与 15 N·s/m 阻尼器这一组具体参数，把正向约定、初值、限位与频率换算全部走一遍，所有数字都可以在运行前手算得到。

## 位移是势变量，力是流变量

`Modelica.Mechanics.Translational.Interfaces.Flange_a` 与 `Flange_b` 携带两个量：位移 `s` 是势变量，力 `f` 是带 `flow` 前缀的流变量。连接后相邻法兰位移相等，力代数和为零：

$$\sum_j f_j=0, \qquad s_1=s_2=\cdots=s_n$$

力平衡在 `Mass` 内部写成 $m\,dv/dt=f_a+f_b$，其中 `f_a`、`f_b` 是两侧法兰的流变量。由于 $v=ds/dt$，一次积分把位移与速度绑在一起，因此 `Mass` 需要且只需要两个初值。`Spring` 定义的是

$$f_{spring}=c\left(s_a-s_b-s_{rel0}\right), \qquad f_{damper}=d\left(v_a-v_b\right)$$

`s_rel0` 就是自由长度对应的相对位移；把 `s_rel0` 设错 10 mm，相当于给系统预加了 c×0.01=20 N 的常力，稳态位置会整体偏 10 mm 而频率不变——这正是用"频率对、偏置错"反推 `s_rel0` 错误的判据。

## 由参数算固有频率与阻尼比

质量—弹簧—阻尼的单自由度系统特征量为

$$\omega_0=\sqrt{\frac{c}{m}}, \qquad \zeta=\frac{d}{2\sqrt{c\,m}}, \qquad \omega_d=\omega_0\sqrt{1-\zeta^2}$$

代入 m=1.5 kg、c=2000 N/m、d=15 N·s/m：ω₀=√(2000/1.5)=√1333.3=36.51 rad/s，即 f₀=36.51/(2π)=5.81 Hz；ζ=15/(2×√3000)=15/109.54=0.137，属明显欠阻尼；ω_d=36.51×√(1−0.0188)=36.51×0.9906=36.17 rad/s。欠阻尼超调量按 $\exp(-\pi\zeta/\sqrt{1-\zeta^2})$ 估算，得 exp(−0.4345)=0.648，即首次越过稳态值约 65%。这个数字看起来很大，但 ζ=0.137 确实对应如此强的振荡，如果仿真只给出 5% 超调，说明 `Damper` 的 d 被误设成约 60 N·s/m。

静态校核同样简单：施加 10 N 恒力时稳态位移 Δs=F/c=10/2000=0.005 m，即 5 mm。若模型给出 4.5 mm，先检查 `s_rel0` 是否被写成 0.0005 m 而不是 0。把系统从 5 mm 偏置释放，弹簧储存 0.5×2000×0.005²=0.025 J，全部转为动能时速度 v=√(2×0.025/1.5)=0.183 m/s，这一对数也可用来验收能量守恒。

## 初值、限位与参考方向

位移与速度初值用 `s(start=..., fixed=true)`、`v(start=..., fixed=true)` 给出。同一串联链上只能有一处固定 `s`，因为位移是势变量，两端都固定会过定；`v` 则可以在多个质量上同时固定。竖直安装时重力不会自动加入：`Translational` 库没有内建重力，必须显式用 `Modelica.Mechanics.Translational.Sources.Force` 施加 1.5×9.81=14.7 N 的常力，并确认符号与正向一致。行程限位用 `Components.ElastoGap` 表示弹性止挡，刚度建议比主弹簧高 2～3 个数量级，例如主弹簧 2000 N/m 时取 c=5e5 N/m、d=100 N·s/m，否则限位会退化成数值上的硬不连续。

## 两段可运行的模型

```modelica
model MassSpringDamper "单自由度受迫振动"
  Modelica.Mechanics.Translational.Components.Fixed fixed;
  Modelica.Mechanics.Translational.Components.Spring spring(c=2000, s_rel0=0);
  Modelica.Mechanics.Translational.Components.Damper damper(d=15);
  Modelica.Mechanics.Translational.Components.Mass mass(
    m=1.5, s(start=0, fixed=true), v(start=0, fixed=true));
  Modelica.Mechanics.Translational.Sources.Force force;
  Modelica.Mechanics.Translational.Sensors.PositionSensor posSensor;
  Modelica.Blocks.Sources.Step step(height=10, startTime=0.5);
equation
  connect(step.y, force.f);
  connect(force.flange, mass.flange_a);
  connect(mass.flange_b, spring.flange_a);
  connect(mass.flange_b, damper.flange_a);
  connect(spring.flange_b, fixed.flange);
  connect(damper.flange_b, fixed.flange);
  connect(mass.flange_a, posSensor.flange);
  annotation(experiment(StopTime=2.0, Tolerance=1e-8, Interval=0.001));
end MassSpringDamper;
```

```modelica
model GuidedCarriage "带弹性止挡与竖直重力的滑台"
  parameter Real m = 1.5 "kg";
  Modelica.Mechanics.Translational.Components.Mass carriage(
    m=m, s(start=-0.02, fixed=true), v(start=0, fixed=true));
  Modelica.Mechanics.Translational.Components.Spring pushRod(c=2000, s_rel0=0);
  Modelica.Mechanics.Translational.Components.ElastoGap stop(
    c=5e5, d=100, s_rel0=0.05);
  Modelica.Mechanics.Translational.Components.Fixed frame;
  Modelica.Mechanics.Translational.Sources.Force gravity;
  Modelica.Blocks.Sources.Constant weight(k=-m*9.81);
equation
  connect(weight.y, gravity.f);
  connect(gravity.flange, carriage.flange_a);
  connect(carriage.flange_b, pushRod.flange_a);
  connect(pushRod.flange_b, frame.flange);
  connect(carriage.flange_b, stop.flange_a);
  connect(stop.flange_b, frame.flange);
end GuidedCarriage;
```

## 平动系统失效与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 编译报位移过定 | 串联链上多处设 s(fixed=true) | 只保留一端固定，其余改 start 后重编译 |
| 振荡频率对但稳态位置整体偏移 | Spring 的 s_rel0 不等于自由长度 | 把 s_rel0 归零，偏移应消失 |
| 超调量只有 5% 而非 65% | Damper 的 d 被高估一个量级 | 按 ζ=d/(2√(cm)) 反算 d，核对是否为 15 |
| 质量块被限位后速度不连续 | ElastoGap 刚度与主弹簧同量级 | 把限位刚度提高 100 倍，速度应连续 |
| 竖直系统不下落 | 未显式施加 m·g 的重力外力 | 加上 14.7 N 常力后位移应单调增加 |

## 平动参数的验收判据与依据

把三条数值证据写进交付记录：一是 f₀=5.81 Hz 与仿真峰间距的偏差，应小于 3%；二是 10 N 静载下 5 mm 稳态位移与 `PositionSensor` 读数的偏差；三是动能与弹簧势能之和在无阻尼工况下的漂移量，应小于峰值能量的 0.5%。这三条分别锁定刚度、静标定与能量守恒，任一不通过就不必继续加密输出步长。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Mechanics.Translational` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Rao S.S. *Mechanical Vibrations*, 6th ed., Pearson, 2017.
4. Tiller M. *Introduction to Physical Modeling with Modelica*, Kluwer Academic Publishers, 2001.
5. Otter M., Elmqvist H., Mattsson S.E. "Hybrid modeling in Modelica based on the synchronous data flow principle", *IEEE International Symposium on Computer Aided Control System Design*, 1999.
6. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*, Wiley-IEEE Press, 2015.
