---
template_version: "flowlab-knowledge/1.0"
slug: modelica-quality-tolerance-scaling-engineering-setup
title: "容差、nominal 与缩放：工程设置与参数选择"
summary: "从误差控制式与 nominal 缩放推导每个变量的有效绝对容差，用 1e5 Pa 压力与 0.1 kg/s 流量算例说明默认 atol 何时失效，并给出 Modelica.Constants.eps 决定的浮点下限。"
category:
  slug: modelica-simulation-quality
  name: "Modelica 仿真与质量"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 仿真与质量"
  - "容差、nominal 与缩放"
  - "工程设置与参数选择"
  - "atol"
  - "nominal"
seo:
  title: "容差、nominal 与缩放：工程设置与参数选择"
  description: "从误差控制式与 nominal 缩放推导每个变量的有效绝对容差，用 1e5 Pa 压力与 0.1 kg/s 流量算例说明默认 atol 何时失效，并给出 Modelica.Constants.eps 决定的浮点下限。"
  keywords:
    - "容差、nominal 与缩放"
    - "工程设置与参数选择"
    - "atol"
    - "nominal"
---

# 容差、nominal 与缩放：工程设置与参数选择

容差不是"越小越准"的旋钮，而是一个按变量量级分配误差预算的契约。同一组 `Tolerance=1e-6` 加默认绝对容差，作用在 $10^{5}\,\mathrm{Pa}$ 的压力上会得到 0.101 Pa 的允许误差，作用在 $0.1\,\mathrm{kg/s}$ 的流量上却只得到 1% 的相对精度。本文把 `nominal` 与容差的取值从物理量级反推出来，并给出浮点分辨率决定的下限。

## 误差控制式的实际含义

DASSL、IDA、CVODE 这一类变步长求解器用同一形式的加权误差范数控制步长，要求每个分量满足
$$\mathrm{err}_i=\frac{|e_i|}{\mathrm{atol}_i+\mathrm{rtol}\,|x_i|}\le1$$
其中 $e_i$ 是局部误差估计，$\mathrm{rtol}$ 由 `Tolerance` 给出，$\mathrm{atol}_i$ 是逐变量的绝对容差。由此可直接写出该变量允许的绝对误差上限
$$\Delta x_i^{\mathrm{allow}}=\mathrm{atol}_i+\mathrm{rtol}\,|x_i|$$
这个式子说明两件事：变量远离零时精度由相对容差决定，变量接近零时由绝对容差兜底；两者不能互相替代。

## 一个压力通道算例

设压力 $p=1.0\times10^{5}\,\mathrm{Pa}$，`Tolerance=1e-6`，默认 $\mathrm{atol}=1.0\times10^{-3}$：

$$\Delta p^{\mathrm{allow}}=1.0\times10^{-3}+1.0\times10^{-6}\times1.0\times10^{5}=0.101\ \mathrm{Pa}$$

相对允许误差 $0.101/1.0\times10^{5}=1.01\times10^{-6}$，与 `rtol` 基本一致，说明绝对容差项可忽略。但当压力在关阀瞬态降到 $1.0\,\mathrm{Pa}$ 时，允许误差变成 $1.0\times10^{-3}+1.0\times10^{-6}\approx1.0\times10^{-3}\,\mathrm{Pa}$，相对误差高达 0.1%。若这一瞬态是判断阀门关闭特性的依据，默认 `atol` 就明显偏松。

## 同一个默认 atol 在流量通道上失效

设质量流量峰值 $0.1\,\mathrm{kg/s}$，$\mathrm{atol}=1.0\times10^{-3}\,\mathrm{kg/s}$：

$$\Delta \dot m^{\mathrm{allow}}=1.0\times10^{-3}+1.0\times10^{-6}\times0.1=1.0001\times10^{-3}\ \mathrm{kg/s}$$

相对允许误差 $1.0001\times10^{-3}/0.1=1.0\times10^{-2}$，也就是 1%。此时求解器认为 1% 的流量误差完全合法，而工程上可能只接受 0.01%。正确做法是给流量显式声明 `nominal=0.1`，让工具按 $0.1\,\mathrm{kg/s}$ 的尺度分配绝对容差；声明后有效绝对容差降到 $10^{-6}\times0.1=1.0\times10^{-7}\,\mathrm{kg/s}$，要求收紧 10000 倍。

## nominal 与浮点下限

Modelica 规范把 `nominal` 定义为变量的典型量级，供工具做缩放，缺省为 1.0。它既是误差分配的依据，也决定了容差有意义的下界：双精度下变量 $x$ 的可分辨增量是 $|x|\,\epsilon_{\mathrm{mach}}$，其中 `Modelica.Constants.eps` $=2.220446049250313\times10^{-16}$。于是

- 对 $p=1.0\times10^{5}\,\mathrm{Pa}$，浮点下限为 $1.0\times10^{5}\times2.220\times10^{-16}=2.22\times10^{-11}\,\mathrm{Pa}$；把 `atol` 设成 $10^{-15}\,\mathrm{Pa}$ 比表示精度还小，求解器只会做无用功。
- 对 $\dot m=0.1\,\mathrm{kg/s}$，下限为 $0.1\times2.220\times10^{-16}=2.22\times10^{-17}\,\mathrm{kg/s}$。

经验规则：`atol` 取 $10^{-6}$ 到 $10^{-9}$ 倍 `nominal`，且不低于 $10\,\epsilon_{\mathrm{mach}}\times\mathrm{nominal}$。

```modelica
model ScaledPressure "带 nominal 的压力与流量通道"
  import Modelica.Constants;
  parameter Real p_amb=0.9e5 "环境压力 Pa";
  parameter Real p0=1.0e5 "初始压力 Pa";
  parameter Real V=1.0 "容积 m3";
  parameter Real R=287.0 "气体常数 J/(kg K)";
  parameter Real T=293.15 "温度 K";
  parameter Real k=1.0e-5 "阀门系数 kg/(s Pa)";
  Real p(start=p0, fixed=true, nominal=1.0e5) "压力 Pa";
  Real m_flow(start=k*(p0 - p_amb), fixed=true, nominal=0.1) "质量流量 kg/s";
  constant Real eps_mach = Modelica.Constants.eps;
equation
  V/(R*T)*der(p) = -m_flow;
  m_flow = k*(p - p_amb);
  annotation(experiment(StartTime=0, StopTime=10,
    Tolerance=1e-6, Interval=1e-3, Algorithm="Dassl"));
end ScaledPressure;
```

该模型的时间常数为 $\tau=(V/(RT))/k=(1.0/84134)/1.0\times10^{-5}=1.19\,\mathrm{s}$，初始流量 $k(p_0-p_{\mathrm{amb}})=1.0\times10^{-5}\times1.0\times10^{4}=0.10\,\mathrm{kg/s}$，与 `nominal=0.1` 一致。到 $t=5\tau=5.94\,\mathrm{s}$ 时压差降到 $1.0\times10^{4}\times e^{-5}=67.4\,\mathrm{Pa}$，流量降到 $6.74\times10^{-4}\,\mathrm{kg/s}$——此时若 `nominal` 未声明，绝对容差会完全接管精度，末段流量曲线会明显失真。

## 参数取值表

| 变量 | nominal | 建议 atol | 说明 |
|---|---|---|---|
| 压力 $p$ | `1.0e5` Pa | `1e-3` Pa | 相对精度 $10^{-8}$ |
| 质量流量 | `0.1` kg/s | `1e-8` kg/s | 末段小流量仍需分辨 |
| 温度 $T$ | `293.15` K | `1e-4` K | 与传感器分辨率同量级 |
| 电压 $u$ | `12.0` V | `1e-7` V | 避开开关瞬态的零穿越 |
| 小信号电流 | `1.0e-3` A | `1e-10` A | 必须显式声明，否则默认 atol 主导 |

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 末段流量曲线呈阶梯状 | 绝对容差主导，`nominal` 未声明 | 给流量加 `nominal=0.1` 后重跑，阶梯应消失 |
| 收紧 `Tolerance` 到 `1e-10` 结果不变 | 已低于该变量的浮点下限 $2.22\times10^{-11}\,\mathrm{Pa}$ | 检查 $\epsilon_{\mathrm{mach}}\times\mathrm{nominal}$ |
| 压力精度好但流量误差 1% | 同一个 `atol` 被两个量级差 6 个数量级的通道共用 | 逐变量列出 $\mathrm{atol}+\mathrm{rtol}|x|$ |
| 步数暴涨而目标量不变 | `atol` 设得过紧，误差预算被次要变量吃掉 | 比较各通道的 $\mathrm{err}_i$ 是否都在 0.1 到 1 之间 |
| 零穿越附近抖振 | 零穿越处相对容差失效，仅靠 atol | 在穿越段检查步长是否塌缩 |

## 参考文献

1. Modelica Association, Modelica Language Specification 3.6, Section 4.8.1 nominal attribute, 2023.
2. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
3. K. E. Brenan, S. L. Campbell and L. R. Petzold, Numerical Solution of Initial-Value Problems in Differential-Algebraic Equations, SIAM Classics in Applied Mathematics, 1996.
4. A. C. Hindmarsh, P. N. Brown, K. E. Grant, S. L. Lee, R. Serban, D. E. Shumaker and C. S. Woodward, SUNDIALS: Suite of nonlinear and differential/algebraic equation solvers, ACM Transactions on Mathematical Software, 31(3):363-396, 2005.
5. F. E. Cellier and E. Kofman, Continuous System Simulation, Springer, 2006.
6. Dassault Systèmes, Dymola User Manual Volume 1, 2023.
