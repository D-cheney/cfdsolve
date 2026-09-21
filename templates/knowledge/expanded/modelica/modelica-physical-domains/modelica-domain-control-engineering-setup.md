---
template_version: "flowlab-knowledge/1.0"
slug: modelica-domain-control-engineering-setup
title: "控制系统：工程设置与参数选择"
summary: "以 K=2、T=5 s 的一阶被控对象为例，给出 Modelica.Blocks 中 PI/LimPID 的参数整定、抗积分饱和与限幅设置、采样周期选取依据，并附闭环时间常数与稳态误差的手算核对及两段可运行控制回路代码。"
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
  - "控制系统"
  - "工程设置与参数选择"
  - "LimPID"
  - "抗积分饱和"
seo:
  title: "控制系统：工程设置与参数选择"
  description: "以 K=2、T=5 s 的一阶被控对象为例，给出 Modelica.Blocks 中 PI/LimPID 的参数整定、抗积分饱和与限幅设置、采样周期选取依据，并附闭环时间常数与稳态误差的手算核对及两段可运行控制回路代码。"
  keywords:
    - "控制系统"
    - "工程设置与参数选择"
    - "LimPID"
    - "抗积分饱和"
---

# 控制系统：工程设置与参数选择

控制回路的参数设置有一个明确次序：先确认信号连线类型与反馈极性，再按被控对象的时间常数定出比例增益，最后处理执行器限幅与采样周期。本文以增益 K=2.0、时间常数 T=5 s 的一阶对象为基线，把每一步都换算成可以手算复核的数字，避免"调参靠试"。

## 信号类型与反馈极性

`Modelica.Blocks.Interfaces.RealInput` 与 `RealOutput` 是纯信号连接器，没有势变量与流变量之分，因此连线顺序决定一切。误差用 `Modelica.Blocks.Math.Feedback` 生成，其默认 `positive=false` 表示 $e=u_1-u_2$；若把参考与测量接反，闭环会变成正反馈并立即发散。被控对象用 `Modelica.Blocks.Continuous.FirstOrder(k=K, T=T)` 表示，其方程是

$$T\frac{dy}{dt}+y=K\,u$$

该元件默认 `initType=Modelica.Blocks.Types.Init.NoInit`，做阶跃测试时应改成 `Init.SteadyState`，否则初值由求解器自行选取，第一步会出现不合理的瞬态。

## 比例增益与稳态误差的手算

只加比例环节 `Modelica.Blocks.Continuous.PI` 并把积分时间 `T` 设成极大值（等效纯比例）时，闭环传递函数为一阶：

$$y_{cl}=\frac{K_pK}{Ts+1+K_pK}, \qquad \tau_{cl}=\frac{T}{1+K_pK}, \qquad e_{ss}=\frac{1}{1+K_pK}$$

取 Kp=1.25、K=2.0、T=5 s，得 KpK=2.5，τ_cl=5/3.5=1.43 s，单位阶跃的稳态误差 e_ss=1/3.5=0.286，即 28.6%。这个残差只能靠积分消除：把 PI 的 `T`（积分时间）设为 5 s，稳态误差降为 0，但超调会上升。整定可选用 IMC 规则，它把闭环目标直接写成时间常数 λ：

$$K_p=\frac{T}{K\lambda}, \qquad T_i=T$$

取 λ=2 s，则 Kp=5/(2.0×2)=1.25，Ti=5 s，与上面试算的比例增益恰好一致；闭环近似为时间常数 2 s 的一阶环节，2 s 达到 63%、6 s 达到 95%。若改用 Ziegler–Nichols 临界比例法，设临界增益 Ku=8、临界周期 Tu=6.28 s，则 PI 取 Kp=0.45×8=3.6、Ti=6.28/1.2=5.23 s，比 IMC 激进 2.9 倍，超调通常超过 20%。两者都可用，但必须在记录中写明用的是哪一套规则。

## 限幅与抗积分饱和

执行器必然有上下限，用 `Modelica.Blocks.Nonlinear.Limiter(uMax=100, uMin=0)` 或 `LimPID` 自带的 `yMax`/`yMin` 表示。饱和期间误差持续存在，积分项会持续累积，退出饱和后产生大超调，这就是积分饱和。`Modelica.Blocks.Continuous.LimPID` 在 `yMax`/`yMin` 被赋值时内部启用限幅反馈，等价于条件积分；若自行用 `Integrator` 搭 PI，则必须显式加入抗饱和逻辑。判别方法是：把 `yMax` 从 100 降到 10，若超调量显著增大而上升时间几乎不变，说明抗饱和未生效。

## 采样周期与离散化

连续控制器在数字实现中必须离散。`Modelica.Blocks.Discrete.UnitDelay(samplePeriod=Ts)` 的 `Ts` 需满足两个约束：一是远小于闭环时间常数，一般取 τ_cl/Ts≥50；二是积分时间与采样周期之比 Ti/Ts 不宜小于 5。取 Ts=0.01 s，则 τ_cl/Ts=1.43/0.01=143、Ti/Ts=5/0.01=500，均满足；采样频率 100 Hz，对应奈奎斯特频率 50 Hz，足够覆盖带宽 0.16 Hz（=1/(2π×1)）的控制回路。若把 Ts 放到 1 s，则 Ti/Ts=5 已到边界，离散化引起的相位滞后会使 ζ 明显下降。

## 两段可运行的控制回路

```modelica
model PIControlLoop "连续 PI 控制一阶对象"
  Modelica.Blocks.Sources.Step reference(height=1, startTime=1);
  Modelica.Blocks.Math.Feedback feedback;
  Modelica.Blocks.Continuous.PI controller(k=1.25, T=5);
  Modelica.Blocks.Continuous.FirstOrder plant(
    k=2.0, T=5, initType=Modelica.Blocks.Types.Init.SteadyState);
equation
  connect(reference.y, feedback.u1);
  connect(feedback.y, controller.u);
  connect(controller.y, plant.u);
  connect(plant.y, feedback.u2);
  annotation(experiment(StopTime=40, Tolerance=1e-8, Interval=0.01));
end PIControlLoop;
```

```modelica
model LimitedDiscreteLoop "带限幅与抗饱和的离散 PI"
  Modelica.Blocks.Sources.Step reference(height=1, startTime=1);
  Modelica.Blocks.Math.Feedback feedback;
  Modelica.Blocks.Continuous.LimPID pid(
    controllerType=Modelica.Blocks.Types.SimpleController.PI,
    k=1.25, Ti=5, Td=0.1,
    yMax=100, yMin=0, withFeedForward=false);
  Modelica.Blocks.Nonlinear.Limiter actuator(uMax=100, uMin=0);
  Modelica.Blocks.Continuous.FirstOrder plant(
    k=2.0, T=5, initType=Modelica.Blocks.Types.Init.SteadyState);
equation
  connect(reference.y, feedback.u1);
  connect(feedback.y, pid.u_s);
  connect(plant.y, pid.u_m);
  connect(pid.y, actuator.u);
  connect(actuator.y, plant.u);
  connect(plant.y, feedback.u2);
end LimitedDiscreteLoop;
```

## 控制回路失效与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 输出在 0.2 s 内发散到 1e6 | Feedback 的参考与测量接反，形成正反馈 | 交换 u1/u2，输出应回到有界 |
| 稳态偏差停在 28.6% | 只有比例环节，积分时间被设成极大 | 把 Ti 从 1e6 改为 5，偏差应归零 |
| 限幅后超调从 5% 涨到 40% | 积分饱和，限幅未参与积分反馈 | 用 LimPID 的 yMax/yMin 替代外部 Limiter |
| 离散化后出现 10 Hz 等幅振荡 | 采样周期过大，相位滞后压缩裕度 | 把 Ts 从 0.5 s 降到 0.01 s，振荡应消失 |
| 阶跃起点出现尖峰 | 被控对象未设 Init.SteadyState | 改成稳态初始化，尖峰应消失 |

## 控制参数的验收判据与依据

交付控制回路时给出四项证据：一是闭环时间常数 1.43 s 与仿真升到 63% 时刻的偏差，应小于 5%；二是积分投入前后稳态误差从 0.286 降到 1e-4 以下；三是把 `yMax` 从 100 降到 10 时的超调变化，用于验证抗饱和；四是离散与连续两条回路在同一参考下的输出偏差，应小于 2%。

1. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Blocks` UsersGuide, 2020.
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023.
3. Åström K.J., Hägglund T. *Advanced PID Control*, ISA — The Instrumentation, Systems, and Automation Society, 2006.
4. Rivera D.E., Morari M., Skogestad S. "Internal model control: PID controller design", *Industrial & Engineering Chemistry Process Design and Development*, 25(1):252–265, 1986.
5. Ziegler J.G., Nichols N.B. "Optimum settings for automatic controllers", *Transactions of the ASME*, 64:759–768, 1942.
6. Otter M., Elmqvist H., Mattsson S.E. "Hybrid modeling in Modelica based on the synchronous data flow principle", *IEEE International Symposium on Computer Aided Control System Design*, 1999.
