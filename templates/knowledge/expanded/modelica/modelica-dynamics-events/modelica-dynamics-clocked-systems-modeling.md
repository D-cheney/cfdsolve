---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-clocked-systems-modeling
title: "时钟同步与采样系统：物理建模与适用边界"
summary: "说明 Modelica 时钟分区只在节拍上求解的语义、Clock 的构造与派生算子，给出零阶保持离散化系数 a=exp(-Ts/tau) 的手算验收和 60 Hz 信号在 100 Hz 采样下混叠到 40 Hz 的定量判据。"
category:
  slug: modelica-dynamics-events
  name: "Modelica 动态、初始化与事件"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 动态、初始化与事件"
  - "时钟同步与采样系统"
  - "物理建模与适用边界"
  - "Clock"
  - "零阶保持"
seo:
  title: "时钟同步与采样系统：物理建模与适用边界"
  description: "说明 Modelica 时钟分区只在节拍上求解的语义、Clock 的构造与派生算子，给出零阶保持离散化系数 a=exp(-Ts/tau) 的手算验收和 60 Hz 信号在 100 Hz 采样下混叠到 40 Hz 的定量判据。"
  keywords:
    - "时钟同步与采样系统"
    - "物理建模与适用边界"
    - "Clock"
    - "零阶保持"
    - "混叠"
---

# 时钟同步与采样系统：物理建模与适用边界

用 `when sample(0, Ts)` 也能写出采样逻辑，但它把采样方程混进连续分区，求解器仍需在每个内部步长上求值条件表达式。Modelica 3.3 引入的时钟分区把"只在节拍上求解"写成语言级语义：分区内的方程每个节拍只求值一次，节拍之间保持不动。这既让离散控制器的建模意图显式化，也让工具能在翻译期检查时钟兼容性。本文说明时钟的构造、派生算子与两条可手算的边界判据。

## 时钟分区：只在节拍上求解的方程组

时钟分区的节拍时刻为

$$ t_k=t_{start}+k\,T_c,\qquad k=0,1,2,\ldots $$

分区内所有方程只在 $t_k$ 求值，变量在 $(t_k, t_{k+1})$ 上保持。这与连续分区的区别不是精度而是语义：连续分区里求解器可以在任意内部时刻求值，时钟分区里不行。因此时钟分区内不能出现 `der()`，也不能引用另一个不同时钟分区的变量。

以 $T_c = 0.01\ \mathrm{s}$、`StopTime = 1.0` 为例，节拍数为 $1.0/0.01 + 1 = 101$。节拍数是一个可核对的量：输出变量中不同取值的个数应不超过节拍数。

## Clock 的构造与派生

`Clock(Ts)` 构造周期时钟，`Clock(1, 10)` 用有理数构造 $1/10\ \mathrm{s}$ 的时钟（推荐写法，避免浮点周期累积误差），`eventClock` 由事件触发。派生算子有四类：

- `subSample(c, n)`：每 $n$ 个节拍取一个，$T_c$ 变为 $nT_c$。基时钟 0.01 s、$n = 4$ 得到 0.04 s（25 Hz）。
- `superSample(c, n)`：把节拍加密 $n$ 倍。
- `shiftSample(c, k, n)`：把时钟整体平移 $k/n$ 个节拍。
- `backSample` 与 `shiftSample` 配合，用于把离散控制器的计算延迟显式表达出来。

派生算子的比值必须是整数或有理数。写成 `subSample(Clock(0.01), 3)` 得到 0.03 s 是合法的；写成两个浮点周期相除得到无限小数比值的组合，工具会报 `Clocks are not compatible`。

## 采样与保持的两种算子

`previous(x)` 取变量在上一个节拍的值，它只在时钟分区内可用，等价于离散时间序列里的 $x[k-1]$。`hold(x)` 把时钟变量转换成连续变量，取值等于最近一次节拍的值。二者方向相反：

$$ x_{hold}(t)=x[k],\quad t\in[t_k,t_{k+1}),\qquad x_{prev}[k]=x[k-1] $$

混用方向会触发翻译错误。在连续方程里直接用时钟变量而不加 `hold`，工具报 `Cannot mix clocked and continuous equations`；在时钟分区里对连续变量用 `previous`，则报该变量不是时钟变量。这两种报错都是结构性的，调整容差或步长无效。

## 离散化一阶滤波器的手算验收

把时间常数 $\tau = 0.1\ \mathrm{s}$ 的一阶滤波器在 $T_s = 0.01\ \mathrm{s}$ 的时钟上离散，零阶保持精确离散化给出

$$ y[k]=a\,y[k-1]+(1-a)\,u[k],\qquad a=e^{-T_s/\tau}=e^{-0.1}=0.9048 $$

系数 $a = 0.9048$、$1-a = 0.0952$。对单位阶跃 $u = 1$，第 1 个节拍 $y[1] = 0.0952$，第 2 个节拍 $y[2] = 0.9048\times0.0952 + 0.0952 = 0.1813$。连续解在同一时刻 $t = 0.02\ \mathrm{s}$ 给出 $1-e^{-0.2} = 0.18127$，两者相差 $8\times10^{-6}$，属于双精度舍入量级。

这个吻合不是巧合：零阶保持对一阶线性系统是精确离散化，所以任何偏差都来自实现错误而非离散化本身。把实测 $y[2]$ 与 0.1813 对比，偏差超过 $10^{-3}$ 就说明系数 $a$ 算错（例如误用 $a = 1 - T_s/\tau = 0.9$，那会给出 $y[2] = 0.19$，偏差 4.8%）。

```modelica
model SampledFilter
  parameter Modelica.Units.SI.Time Ts = 0.01;
  parameter Modelica.Units.SI.Time tau = 0.1;
  Clock c = Clock(1, 100) "0.01 s 有理时钟";
  Real u = 1.0;
  discrete Real y(start = 0, fixed = true);
  Real y_cont "连续对照";
equation
  when c then
    y = previous(y) + (1 - exp(-Ts/tau))*(u - previous(y));
  end when;
  tau*der(y_cont) = u - y_cont;
  annotation(experiment(StopTime = 1.0, Tolerance = 1e-6, Interval = 1e-3));
end SampledFilter;
```

`y_cont` 与 `y` 的差在稳态趋于零，在阶跃后 0.3 s 内最大，约为 $0.0952/2 = 0.048$——这是零阶保持的平均半拍延迟造成的，不是误差。

## 混叠与 Nyquist 边界

采样定理要求 $f_s > 2f_{max}$。$f_s = 100\ \mathrm{Hz}$ 时可用带宽是 50 Hz。一个 $f = 60\ \mathrm{Hz}$ 的信号被 100 Hz 采样后，观测到的频率为

$$ f_{alias}=\left|f-n f_s\right|=\left|60-100\right|=40\ \mathrm{Hz} $$

也就是说 60 Hz 的振动会伪装成 40 Hz。这条判据在诊断里极其重要：若仿真结果里出现一个 40 Hz 分量，而物理上不存在 40 Hz 的机制，第一反应应是检查采样率而不是去找 40 Hz 的源。

$f = 7\ \mathrm{Hz}$ 的信号在 100 Hz 下不混叠，但零阶保持引入平均延迟 $T_s/2 = 0.005\ \mathrm{s}$，折算相位滞后 $360\times7\times0.005 = 12.6^\circ$。若控制系统相位裕度只有 $15^\circ$，这 12.6° 就吃掉大半。判据是：把 $T_s$ 减半后相位滞后应同步减半，若不变则延迟来自别处。

## 时钟系统的建模约束

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Cannot mix clocked and continuous equations` | 连续方程里直接用了时钟变量 | 给该变量套 `hold()`，看是否通过翻译 |
| `Clocks are not compatible` | 派生比值不是有理数 | 改用 `Clock(1, 100)` 这类有理构造 |
| 阶跃响应第 2 拍为 0.19 而非 0.1813 | 误用一阶近似 $a = 1 - T_s/\tau$ | 换成 $a = e^{-T_s/\tau}$ 复跑 |
| 结果出现无物理来源的 40 Hz 分量 | 60 Hz 信号在 100 Hz 采样下混叠 | 把 $T_s$ 从 0.01 s 改到 0.001 s，看该分量是否移到 60 Hz |
| 节拍数与 $t/T_c+1$ 不符 | 时钟分区内混入了事件驱动的赋值 | 打印全部节拍时刻，检查是否为等差数列 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Chapter 16 "Synchronous Language Elements", 2023.
2. Otter, M., Elmqvist, H., Mattsson, S. E. "Hybrid modeling in Modelica based on the synchronous data flow principle." *IEEE International Symposium on Computer Aided Control System Design*, 1999, pp. 151–157.
3. Elmqvist, H., Mattsson, S. E., Otter, M. "Modelica extensions for multi-mode DAE systems." *10th International Modelica Conference*, 2014, pp. 183–193.
4. Åström, K. J., Wittenmark, B. *Computer-Controlled Systems: Theory and Design*. 3rd ed., Prentice Hall, 1997.
5. Franklin, G. F., Powell, J. D., Workman, M. L. *Digital Control of Dynamic Systems*. 3rd ed., Addison-Wesley, 1998.
6. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Blocks.Discrete`.
