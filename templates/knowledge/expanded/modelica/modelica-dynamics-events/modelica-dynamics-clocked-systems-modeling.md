---
template_version: flowlab-knowledge/1.0
slug: modelica-dynamics-clocked-systems-modeling
title: 时钟同步与采样系统：原理与诊断验证
summary: >-
  说明 Modelica 时钟分区只在节拍上求解的语义、Clock 的构造与派生算子，给出零阶保持离散化系数 a=exp(-Ts/tau) 的手算验收和 60
  Hz 信号在 100 Hz 采样下混叠到 40 Hz 的定量判据。
category:
  slug: modelica-dynamics-events
  name: Modelica 动态、初始化与事件
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - Modelica
  - Modelica 动态、初始化与事件
  - 时钟同步与采样系统
  - 物理建模与适用边界
  - Clock
  - 零阶保持
  - 结果诊断与可信度验证
  - 节拍计数
  - 相位滞后
seo:
  title: 时钟同步与采样系统：原理与诊断验证
  description: >-
    说明 Modelica 时钟分区只在节拍上求解的语义、Clock 的构造与派生算子，给出零阶保持离散化系数 a=exp(-Ts/tau) 的手算验收和
    60 Hz 信号在 100 Hz 采样下混叠到 40 Hz 的定量判据。
  keywords:
    - 时钟同步与采样系统
    - 物理建模与适用边界
    - Clock
    - 零阶保持
    - 混叠
    - 结果诊断与可信度验证
    - 节拍计数
    - 相位滞后
---
# 时钟同步与采样系统：原理与诊断验证

用 `when sample(0, Ts)` 也能写出采样逻辑，但它把采样方程混进连续分区，求解器仍需在每个内部步长上求值条件表达式。Modelica 3.3 引入的时钟分区把"只在节拍上求解"写成语言级语义：分区内的方程每个节拍只求值一次，节拍之间保持不动。这既让离散控制器的建模意图显式化，也让工具能在翻译期检查时钟兼容性。时钟系统的结果有两类难以察觉的错误：节拍数与预期不符（多算或少算一个拍），以及混叠造成的假频率。前者让控制器相位整体偏移，后者让结果里出现物理上不存在的分量，而两者都不会让求解器报错。可复算的验收方式是四步：数节拍、逐拍对解析解、把采样率加倍看频率是否移动、测零阶保持的相位滞后。

## 基础概念与控制关系

### 时钟分区：只在节拍上求解的方程组

时钟分区的节拍时刻为

$$ t_k=t_{start}+k\,T_c,\qquad k=0,1,2,\ldots $$

分区内所有方程只在 $t_k$ 求值，变量在 $(t_k, t_{k+1})$ 上保持。这与连续分区的区别不是精度而是语义：连续分区里求解器可以在任意内部时刻求值，时钟分区里不行。因此时钟分区内不能出现 `der()`，也不能引用另一个不同时钟分区的变量。

以 $T_c = 0.01\ \mathrm{s}$、`StopTime = 1.0` 为例，节拍数为 $1.0/0.01 + 1 = 101$。节拍数是一个可核对的量：输出变量中不同取值的个数应不超过节拍数。

### 离散滤波器与连续解的逐拍对照

一阶滤波器在 $T_s = 0.01\ \mathrm{s}$、$\tau = 0.1\ \mathrm{s}$ 下用零阶保持离散，系数 $a = e^{-T_s/\tau} = 0.9048$，阶跃响应为

$$ y[k]=1-a^{k}=1-e^{-kT_s/\tau}=y_{cont}(kT_s) $$

最后一步是关键：零阶保持对一阶线性系统的离散解在节拍时刻与连续解**精确相等**，不是近似。所以 $y[1] = 1-0.9048 = 0.0952$，$y[2] = 1-0.8187 = 0.1813$，而连续解在 $t = 0.02\ \mathrm{s}$ 处为 $1-e^{-0.2} = 0.18127$，二者在双精度下一致。

这条性质给出一个极干净的验收阈值：任何逐拍偏差超过 $10^{-6}$ 都不是离散化误差，而是实现错误。最常见的实现错误是用一阶近似 $a = 1 - T_s/\tau = 0.9$，它给出 $y[2] = 1-0.81 = 0.19$，相对偏差 4.8%——远超阈值，一眼可辨。

```modelica
model ClockAudit
  parameter Modelica.Units.SI.Time Ts = 0.01, tau = 0.1;
  Clock c = Clock(1, 100);
  discrete Real y(start = 0, fixed = true);
  discrete Integer k(start = 0, fixed = true);
  Real y_cont;
equation
  when c then
    y = previous(y) + (1 - exp(-Ts/tau))*(1 - previous(y));
    k = previous(k) + 1;
  end when;
  tau*der(y_cont) = 1 - y_cont;
  annotation(experiment(StopTime = 1.0, Tolerance = 1e-6, Interval = 1e-3));
end ClockAudit;
```

`k` 在 `StopTime = 1.0` 时应达到 100（从 0 开始计 100 次节拍），`y` 在第 2 拍应为 0.1813，`y_cont` 在 $t = 0.02\ \mathrm{s}$ 处应为 0.18127。三个数构成一组互相独立的验收点。

### 采样与保持的两种算子

`previous(x)` 取变量在上一个节拍的值，它只在时钟分区内可用，等价于离散时间序列里的 $x[k-1]$。`hold(x)` 把时钟变量转换成连续变量，取值等于最近一次节拍的值。二者方向相反：

$$ x_{hold}(t)=x[k],\quad t\in[t_k,t_{k+1}),\qquad x_{prev}[k]=x[k-1] $$

混用方向会触发翻译错误。在连续方程里直接用时钟变量而不加 `hold`，工具报 `Cannot mix clocked and continuous equations`；在时钟分区里对连续变量用 `previous`，则报该变量不是时钟变量。这两种报错都是结构性的，调整容差或步长无效。

### 混叠与 Nyquist 边界

采样定理要求 $f_s > 2f_{max}$。$f_s = 100\ \mathrm{Hz}$ 时可用带宽是 50 Hz。一个 $f = 60\ \mathrm{Hz}$ 的信号被 100 Hz 采样后，观测到的频率为

$$ f_{alias}=\left|f-n f_s\right|=\left|60-100\right|=40\ \mathrm{Hz} $$

也就是说 60 Hz 的振动会伪装成 40 Hz。这条判据在诊断里极其重要：若仿真结果里出现一个 40 Hz 分量，而物理上不存在 40 Hz 的机制，第一反应应是检查采样率而不是去找 40 Hz 的源。

$f = 7\ \mathrm{Hz}$ 的信号在 100 Hz 下不混叠，但零阶保持引入平均延迟 $T_s/2 = 0.005\ \mathrm{s}$，折算相位滞后 $360\times7\times0.005 = 12.6^\circ$。若控制系统相位裕度只有 $15^\circ$，这 12.6° 就吃掉大半。判据是：把 $T_s$ 减半后相位滞后应同步减半，若不变则延迟来自别处。

### 时钟系统的建模约束

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Cannot mix clocked and continuous equations` | 连续方程里直接用了时钟变量 | 给该变量套 `hold()`，看是否通过翻译 |
| `Clocks are not compatible` | 派生比值不是有理数 | 改用 `Clock(1, 100)` 这类有理构造 |
| 阶跃响应第 2 拍为 0.19 而非 0.1813 | 误用一阶近似 $a = 1 - T_s/\tau$ | 换成 $a = e^{-T_s/\tau}$ 复跑 |
| 结果出现无物理来源的 40 Hz 分量 | 60 Hz 信号在 100 Hz 采样下混叠 | 把 $T_s$ 从 0.01 s 改到 0.001 s，看该分量是否移到 60 Hz |
| 节拍数与 $t/T_c+1$ 不符 | 时钟分区内混入了事件驱动的赋值 | 打印全部节拍时刻，检查是否为等差数列 |

## 适用边界与方案选择

### 节拍计数与输出采样率的区分

时钟节拍数由时钟周期唯一确定：

$$ N_{tick}=\left\lfloor\frac{T_{end}-t_{start}}{T_c}\right\rfloor+1 $$

$T_c = 0.01\ \mathrm{s}$、从 0 跑到 1.0 s 应得到 $\lfloor100\rfloor + 1 = 101$ 个节拍。诊断时统计时钟变量取值发生变化的次数，它必须等于 $N_{tick}$ 减 1（第一次变化前的初始值不算变化）。

这里最容易混淆的是输出 `Interval` 与时钟周期。把 `Interval` 设成 1e-3 s 会得到 1001 个输出点，但时钟变量只在 101 个时刻变化，中间 900 个输出点是重复值。若统计"取值变化次数"得到 1000 而不是 100，说明该变量其实在连续分区里被重新计算了——多半是漏了 `previous`，或者方程被工具判成了连续方程。

## 工程设置与实施

### Clock 的构造与派生

`Clock(Ts)` 构造周期时钟，`Clock(1, 10)` 用有理数构造 $1/10\ \mathrm{s}$ 的时钟（推荐写法，避免浮点周期累积误差），`eventClock` 由事件触发。派生算子有四类：

- `subSample(c, n)`：每 $n$ 个节拍取一个，$T_c$ 变为 $nT_c$。基时钟 0.01 s、$n = 4$ 得到 0.04 s（25 Hz）。
- `superSample(c, n)`：把节拍加密 $n$ 倍。
- `shiftSample(c, k, n)`：把时钟整体平移 $k/n$ 个节拍。
- `backSample` 与 `shiftSample` 配合，用于把离散控制器的计算延迟显式表达出来。

派生算子的比值必须是整数或有理数。写成 `subSample(Clock(0.01), 3)` 得到 0.03 s 是合法的；写成两个浮点周期相除得到无限小数比值的组合，工具会报 `Clocks are not compatible`。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 时钟变量变化 1000 次而非 100 次 | 漏 `previous`，方程被判为连续 | 统计取值变化次数，与 $N_{tick}-1 = 100$ 对比 |
| $y[2]$ 为 0.19 而非 0.1813 | 用 $a = 1-T_s/\tau$ 代替 $e^{-T_s/\tau}$ | 换成指数系数复跑，偏差应降到 $10^{-6}$ 以下 |
| 结果出现 40 Hz 无源分量 | 60 Hz 在 100 Hz 下混叠 | $T_s$ 改 0.001 s，看是否移到 60 Hz |
| 相位滞后测得 0.010 s 而非 0.005 s | 控制器自带一拍延迟 | 查是否经过 `UnitDelay` 或漏 `previous` |
| 子时钟节拍数约为主时钟 4 倍 | `subSample` 与 `superSample` 用反 | 对比 26 与 101 两个节拍数 |
| 换 `Interval` 后时钟变量轨迹改变 | 输出采样与时钟耦合 | 固定时钟，只改 `Interval`，轨迹应逐点相同 |

## 验证、验收与复现

### 离散化一阶滤波器的手算验收

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

### 混叠的识别与采样率加倍试验

采样率 $f_s = 100\ \mathrm{Hz}$ 时，$f = 60\ \mathrm{Hz}$ 的信号会落在 $|60-100| = 40\ \mathrm{Hz}$。诊断动作是把 $T_s$ 从 0.01 s 改成 0.001 s（$f_s = 1000\ \mathrm{Hz}$）重跑：

- 若那个分量从 40 Hz 移到 60 Hz，确认为混叠，物理上不存在 40 Hz 机制；
- 若分量仍在 40 Hz 不动，它是真实的物理频率，需要去模型里找来源。

这个"采样率加倍"试验比频域分析更可靠，因为它不依赖窗函数与泄漏处理。判据可以量化为：混叠频率随 $f_s$ 变化的规律是 $f_{alias} = |f - n f_s|$，$f_s$ 从 100 变到 1000 时 $n$ 从 1 变到 0，观测频率应从 40 Hz 变到 60 Hz，变化量 20 Hz。

另一个反向陷阱是把真实高频误判为混叠。$f = 7\ \mathrm{Hz}$ 在 100 Hz 下不混叠，把采样率提到 1000 Hz 后频率仍是 7 Hz，这就排除混叠。

### 零阶保持相位滞后的测量

零阶保持的平均延迟为 $T_s/2$，折算相位滞后

$$ \phi_{ZOH}=360\,f\,\frac{T_s}{2}=360\times7\times0.005=12.6^\circ $$

测量方法：给控制器输入一个 7 Hz 正弦，把输出与输入做互相关，峰值位置对应的时间延迟应为 0.005 s。若测得 0.010 s，说明系统里多了一个采样周期的额外延迟——常见根因是控制器在时钟分区内读到了未经 `previous` 的当前值，或者信号经过了 `Modelica.Blocks.Discrete.UnitDelay` 而作者没意识到它自带一拍延迟。

判据是把 $T_s$ 减半后滞后是否同步减半。$T_s$ 从 0.01 s 改到 0.005 s，滞后应从 12.6° 降到 6.3°；若不变，延迟来自离散控制器自身的算法（例如带积分的控制器），与采样无关。

### 子时钟比值的核对

`subSample(c, 4)` 在基时钟 0.01 s 上产生 0.04 s 的子时钟，对应 25 Hz。跑 1.0 s 应得到 26 个节拍（$0, 0.04, \ldots, 1.00$）。核对方式与主时钟一致：数子时钟变量的取值变化次数，应为 25 次。

比值的常见错误是把 `subSample` 与 `superSample` 用反。前者让时钟变慢（周期乘 $n$），后者让时钟变快（周期除 $n$）。判据是节拍数：$n = 4$ 时子时钟节拍数应约为主时钟的 $1/4$（101 对 26），反了则约为 4 倍。工具不会对此报错，只会安静地给出错误的时间尺度。

## 参考资料

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Chapter 16 "Synchronous Language Elements", 2023.
2. Otter, M., Elmqvist, H., Mattsson, S. E. "Hybrid modeling in Modelica based on the synchronous data flow principle." *IEEE International Symposium on Computer Aided Control System Design*, 1999, pp. 151–157.
3. Elmqvist, H., Mattsson, S. E., Otter, M. "Modelica extensions for multi-mode DAE systems." *10th International Modelica Conference*, 2014, pp. 183–193.
4. Åström, K. J., Wittenmark, B. *Computer-Controlled Systems: Theory and Design*. 3rd ed., Prentice Hall, 1997.
5. Franklin, G. F., Powell, J. D., Workman, M. L. *Digital Control of Dynamic Systems*. 3rd ed., Addison-Wesley, 1998.
6. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Blocks.Discrete`.
8. Oppenheim, A. V., Schafer, R. W. *Discrete-Time Signal Processing*. 3rd ed., Pearson, 2010.
