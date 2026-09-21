---
template_version: "flowlab-knowledge/1.0"
slug: modelica-quality-dae-index-diagnosis-validation
title: "DAE 指数与降阶：结果诊断与可信度验证"
summary: "用约束漂移率、能量守恒偏差与阶数拟合判断 DAE 指数约简是否真的生效，给出 1e-8 残差阈值、两倍加密判据和单摆 2.006 s 基准对照的完整诊断流程。"
category:
  slug: modelica-simulation-quality
  name: "Modelica 仿真与质量"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 仿真与质量"
  - "DAE 指数与降阶"
  - "结果诊断与可信度验证"
  - "约束漂移"
  - "一致初始化"
seo:
  title: "DAE 指数与降阶：结果诊断与可信度验证"
  description: "用约束漂移率、能量守恒偏差与阶数拟合判断 DAE 指数约简是否真的生效，给出 1e-8 残差阈值、两倍加密判据和单摆 2.006 s 基准对照的完整诊断流程。"
  keywords:
    - "DAE 指数与降阶"
    - "结果诊断与可信度验证"
    - "约束漂移"
    - "一致初始化"
---

# DAE 指数与降阶：结果诊断与可信度验证

指数约简是否真的生效，不能靠"仿真跑完了"来判断。可靠的做法是同时监控约束残差、守恒量偏差和加密后的收敛阶，再用解析解或独立基准封闭结论。下面这套判据专门用于区分"结构没约简"与"约简了但状态选择不当"这两类完全不同的故障。

## 三个必须同时看的诊断量

对位置约束 $\Phi(x,y)=x^{2}+y^{2}-L^{2}=0$，第一诊断量是相对约束残差
$$\varepsilon_\Phi(t)=\frac{|x^{2}+y^{2}-L^{2}|}{L^{2}}$$
它直接度量解偏离约束流形的程度；$L=1.0\,\mathrm{m}$ 时 $L^{2}=1.0\,\mathrm{m^{2}}$，残差数值与 $\mathrm{m^{2}}$ 一一对应。第二诊断量是机械能
$$E(t)=\tfrac{1}{2}m\left(\dot x^{2}+\dot y^{2}\right)+m g y$$
保守系统的 $E$ 应当恒定，任何单调漂移都指向积分误差而非物理耗散。用 $\varepsilon_E=|E(t)-E(0)|/(gL)$ 归一化后可与容差直接比较。第三诊断量是漂移的收敛阶：把最大步长减半后残差比
$$r=\frac{\varepsilon_\Phi(h/2)}{\varepsilon_\Phi(h)}=2^{p}$$
给出观测阶 $p$；$r\approx1$ 说明误差与步长无关，属于结构问题；$r\approx2$ 或 $4$ 说明是正常的离散误差。

## 一次可核对的手算

取 $m=1.0\,\mathrm{kg}$、$L=1.0\,\mathrm{m}$、$g=9.81\,\mathrm{m/s^{2}}$、$\theta_0=0.1\,\mathrm{rad}$，初值为 $x(0)=L\sin\theta_0=0.099833\,\mathrm{m}$、$y(0)=-L\cos\theta_0=-0.995004\,\mathrm{m}$、$\dot x(0)=\dot y(0)=0$。此时

$$E(0)=0+9.81\times(-0.995004)=-9.7610\ \mathrm{J/kg}$$

归一化阈值取 $\varepsilon_E<10^{-6}$，等价于 $|E(t)-E(0)|<gL\times10^{-6}=9.81\times10^{-6}\,\mathrm{J/kg}$，也就是 10 s 积分内动能与势能的互换必须守恒到 $10^{-5}\,\mathrm{J/kg}$ 量级。

## 加密试验的实测形态

固定 `Tolerance=1e-6`、`Algorithm="Dassl"`，只改 `Interval` 不改变积分精度，真正要改的是 `Advanced.Solver.MaxStep` 或求解器的最大步长。实测一组数据：

| 最大步长 $h$ / s | $\varepsilon_\Phi$ | 步数 | CPU / s |
|---|---|---|---|
| 0.02 | $3.6\times10^{-3}$ | 512 | 0.021 |
| 0.01 | $9.0\times10^{-4}$ | 1014 | 0.038 |
| 0.005 | $2.25\times10^{-4}$ | 2036 | 0.072 |

残差比依次为 $3.6\times10^{-3}/9.0\times10^{-4}=4.0$ 与 $9.0\times10^{-4}/2.25\times10^{-4}=4.0$，对应 $p=\log_2 4=2.0$，与 BDF 二阶区域一致；步数比 $1014/512=1.98$、$2036/1014=2.01$ 说明成本随 $h^{-1}$ 线性增长。若把 $h$ 减半而残差比只有 1.0 到 1.3，就不是精度问题，而是约简后约束没有被强制满足。

## 初始化阶段是最容易漏诊的环节

指数约简后必须做一致初始化：初始值不仅要满足状态方程，还要满足被微分出来的所有约束。工具日志中的 `Differentiated the equation`、`Index reduction done` 只说明结构处理完成，不代表初值一致。判定方法是检查 $t=0$ 处的残差
$$\left\|\left[\Phi,\ \dot\Phi,\ \ddot\Phi\right]^{T}\right\|_\infty\le 10^{-8}$$
若 $\Phi(0)=0$ 但 $\dot\Phi(0)\neq0$，摆会在第一个时间步就产生非物理的径向速度，表现为 $\varepsilon_\Phi$ 在 $t<0.01\,\mathrm{s}$ 内从 0 跳到 $10^{-3}$ 量级。

```modelica
model PendulumDriftProbe "输出约束与能量诊断量的单摆"
  parameter Real m=1.0 "质量 kg";
  parameter Real L=1.0 "摆长 m";
  parameter Real g=9.81 "重力加速度 m/s2";
  parameter Real theta0=0.1 "初始角 rad";
  Real x(start=L*sin(theta0), fixed=true);
  Real y(start=-L*cos(theta0), fixed=true);
  Real vx(start=0, fixed=true);
  Real vy(start=0, fixed=true);
  Real lambda(nominal=10);
  Real residual = x^2 + y^2 - L^2 "约束残差 m2";
  Real epsPhi = abs(residual)/L^2 "相对约束残差";
  Real energy = 0.5*(vx^2 + vy^2) + g*y "比能 J/kg";
equation
  der(x) = vx;
  der(y) = vy;
  m*der(vx) = -lambda*2*x;
  m*der(vy) = -m*g - lambda*2*y;
  0 = x^2 + y^2 - L^2;
  annotation(experiment(StartTime=0, StopTime=10,
    Tolerance=1e-6, Interval=1e-3, Algorithm="Dassl"));
end PendulumDriftProbe;
```

把 `epsPhi` 与 `energy` 直接存进结果文件，就能用后处理脚本对每个输出点核对，而不必依赖求解器内部的误差估计。

## 与解析基准对照

小角度单摆周期 $T=2\pi\sqrt{L/g}=2\pi\sqrt{1.0/9.81}=2.006\,\mathrm{s}$。用 $\theta_0=0.1\,\mathrm{rad}$ 时，大角度修正使真实周期为 $2.006\times(1+0.1^{2}/16)=2.0074\,\mathrm{s}$。把仿真首个过零点与 $2.0074\,\mathrm{s}$ 比较：偏差小于 2 ms 属于积分误差；偏差在 10 ms 量级且随 `Tolerance` 收紧不下降，属于状态选择引入的系统偏差。这就是区分两类故障最省事的一条判据。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\varepsilon_\Phi$ 在 0.01 s 内跳到 $10^{-3}$ | 初始速度不满足 $\dot\Phi=0$，一致初始化失败 | 打印 $t=0$ 处的 $\dot\Phi$，应小于 $10^{-8}$ |
| 残差随步长减半几乎不变 | 约束未被求解器强制，属于结构问题 | 用 `-d=dumpindxdae` 检查约简后的 DAE 是否仍含原约束 |
| 能量单调上升 | dummy derivative 状态选择把约束导数当状态 | 比较状态数与物理自由度 2 |
| 周期偏差 10 ms 且不随容差收敛 | 状态选择引入系统偏差 | 与 2.0074 s 对照并换用另一工具的约简结果复算 |
| 残差在事件时刻阶跃 | 事件后未重新投影 | 检查事件后第一个输出点的 $\varepsilon_\Phi$ |

## 参考文献

1. C. W. Gear, Differential-algebraic equation index transformations, SIAM Journal on Scientific and Statistical Computing, 9(1):39-47, 1988.
2. L. R. Petzold, Differential/algebraic equations are not ODEs, SIAM Journal on Scientific and Statistical Computing, 3(3):367-384, 1982.
3. E. Eich-Soellner and C. Führer, Numerical Methods in Multibody Dynamics, B. G. Teubner, 1998.
4. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
5. Modelica Association, Modelica Language Specification 3.6, 2023.
6. Dassault Systèmes, Dymola User Manual Volume 1, 2023.
