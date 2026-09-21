---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-variability-modeling
title: "常量、参数与离散变量：语言语义与适用边界"
summary: "解释 constant、parameter、discrete 与 continuous 四种可变性构成的偏序、表达式可变性的传播规则，以及 when 与 pre 在事件时刻的取值约定，并给出一个采样 PI 控制器的可手算算例。"
category:
  slug: modelica-language
  name: "Modelica 语言基础"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MODELICA"
  - "Modelica 语言基础"
  - "常量、参数与离散变量"
  - "语言语义与适用边界"
  - "可变性偏序"
  - "when 与 pre"
seo:
  title: "常量、参数与离散变量：语言语义与适用边界"
  description: "解释 constant、parameter、discrete 与 continuous 四种可变性构成的偏序、表达式可变性的传播规则，以及 when 与 pre 在事件时刻的取值约定，并给出一个采样 PI 控制器的可手算算例。"
  keywords:
    - "常量、参数与离散变量"
    - "语言语义与适用边界"
    - "可变性偏序"
    - "when 与 pre"
    - "事件时刻"
---

# 常量、参数与离散变量：语言语义与适用边界

Modelica 把"变量会不会变、在什么时候变"编码进声明前缀，形成一套可变性偏序。编译期就能定的量可以做数组维度，仿真前可改的量适合做设计变量，只在事件时刻跳变的量必须用 `when` 驱动。本文给出这四种可变性的传播规则与越界赋值的判定方式，并用一个采样周期为 0.1 s 的 PI 控制器完成一次手算核对。

## 可变性是一个偏序而非四个并列标签

四种可变性从"最不可变"到"最可变"排列为 `constant` < `parameter` < `discrete` < `continuous`。`constant` 在编译期求值，可以出现在数组维度、`if` 条件的结构分支里；`parameter` 在一次仿真中固定，但在编译与初始化之间可被修改符覆盖；`discrete` 是分段常数，只在事件时刻改变；`continuous` 在时间上连续可微。

这条偏序直接决定赋值合法性：把高可变性的表达式赋给低可变性的变量是非法的。写成 `parameter Real T = time;` 会得到 `Cannot assign a continuous-time expression to a parameter`，因为 `time` 的可变性高于 `parameter`。反过来永远合法：`discrete Real y = kp * u;` 中 `kp` 是参数、`u` 是连续量，只要整条语句位于 `when` 分支内即可。

## 表达式可变性的传播规则

表达式本身也有可变性，取子表达式中的最大值：

$$\mathrm{var}(e_1 \circ e_2) = \max\big(\mathrm{var}(e_1),\, \mathrm{var}(e_2)\big)$$

这条规则解释了为什么 `parameter Real A[3] = {1.0, 2.0, 3.0} * scale;` 在 `scale` 为 `parameter` 时仍然合法——右侧是参数表达式，数组维度可确定；而一旦 `scale` 变成普通 `Real`，数组维度就无法在编译期确定，报错 `Array dimension is not a parameter expression`。

`final parameter` 是在偏序上加锁：它仍然是参数，但禁止下游用修改符覆盖。库作者在基类里写 `final parameter Real k = 1.0`，可以防止使用者无意改变内部标定，同时保持参数的可见性。

## 事件时刻与 pre 的取值约定

`when` 分支内的赋值不是连续赋值，而是事件时刻的一次性更新。`pre(x)` 给出该变量在上一个事件时刻之后、当前事件之前的取值：

$$\mathrm{pre}(x)(t) = \lim_{s \to t^{-}} x(s)$$

没有 `pre()` 就无法写出带记忆的离散状态，例如 `I = pre(I) + kp * Ts / Ti * e;`。如果漏掉 `pre()` 直接写 `I = I + ...`，工具会报代数环或报 `Non-linear equation system`，因为等号两边出现同一个离散变量，构成隐式关系。

采样由内建函数触发：`when sample(0, Ts) then ... end when;` 在 $t = 0, T_s, 2T_s, \dots$ 时刻激活。仿真区间 $[0, T_{end}]$ 内的事件次数为

$$N = \left\lfloor \frac{T_{end}}{T_s} \right\rfloor + 1$$

取 $T_{end} = 10.0\ \mathrm{s}$、$T_s = 0.1\ \mathrm{s}$，得到 $N = 101$ 次采样。这个数可以与工具的 `number of events` 统计直接对照，用来确认采样逻辑没有写错。

## 采样 PI 控制器的可变性设计

```modelica
block SampledPI
  parameter Real kp = 2.0 "比例增益";
  parameter Modelica.Units.SI.Time Ti = 0.5 "积分时间常数";
  parameter Modelica.Units.SI.Time Ts = 0.1 "采样周期";
  Modelica.Blocks.Interfaces.RealInput u;
  Modelica.Blocks.Interfaces.RealOutput y;
  discrete Real e;
  discrete Real I;
equation
  when sample(0, Ts) then
    e = u;
    I = pre(I) + kp * Ts / Ti * e;
  end when;
  y = kp * e + I;
end SampledPI;
```

`e` 与 `I` 声明为 `discrete Real`，因为它们的值只在采样时刻改变；`y` 是普通 `Real`，在两次采样之间保持常数但仍按连续变量参与求解。这种"离散量进入连续方程"的写法是合法的，因为分段常数在区间内部不引入新的自由度。

手算第一拍：设 $u = 1.0$（阶跃误差），初值 `I` 的 `pre` 为 0.0。采样时刻 $t = 0$ 处 $e = 1.0$，积分项 $I = 0.0 + 2.0 \times 0.1/0.5 \times 1.0 = 0.4$，输出 $y = 2.0 \times 1.0 + 0.4 = 2.4$。第二拍 $e$ 仍为 1.0 时 $I = 0.4 + 0.4 = 0.8$，$y = 2.8$。每拍积分增量恒为 $kp\,T_s/T_i = 0.4$，10 拍后 $I = 4.0$，这些整数序列可以逐拍核对仿真输出。

## 物性参数与常量表达式的边界

参数的可变性边界也体现在量纲换算上。取导热系数 $k = 0.6\ \mathrm{W/(m{\cdot}K)}$、密度 $\rho = 998.2\ \mathrm{kg/m^3}$、比热 $c_p = 4182.0\ \mathrm{J/(kg{\cdot}K)}$，三者都是 `parameter`，热扩散率

$$\alpha = \frac{k}{\rho c_p} = \frac{0.6}{998.2 \times 4182.0} = 1.437 \times 10^{-7}\ \mathrm{m^2/s}$$

因为三个输入都是参数，$\alpha$ 也是参数，可以安全地用于 `parameter Real dx = sqrt(alpha * t_end);` 这类需要在编译期定维的表达式。若把 $\rho$ 改成随温度变化的连续量，$\alpha$ 立刻升级为连续变量，上面这行会失效。

## 越界赋值与失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Cannot assign a continuous-time expression to a parameter` | 参数初值里引用了 `time` 或连续变量 | 把该变量提到 `equation` 段，或改声明为 `discrete` |
| `Array dimension is not a parameter expression` | 数组维度依赖了非参数变量 | 用 `final parameter` 或 `constant` 重新声明维度来源 |
| 离散变量首拍结果等于稳态值 | `when` 分支内漏写 `pre()`，`I` 被当成连续量解出 | 把 `I` 的更新式改为含 `pre(I)` 的形式重跑 |
| 事件次数远多于 $T_{end}/T_s$ | `when` 条件里含连续比较，触发抖动 | 用 `sample(0, Ts)` 或加 `noEvent` 限定比较 |
| 修改子模型参数无效 | 基类中该参数被 `final` 锁定 | 用 `checkModel` 查看参数的 `final` 属性 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 3.8 节 Variability of Expressions 给出四种可变性的偏序与传播规则。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 8.4 节 Events and Synchronization 规定 `when` 与 `pre` 的语义。
3. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 5 章讨论离散事件与混合系统建模。
4. Elmqvist, H., Mattsson, S. E., Otter, M. "Modelica — The New Object-Oriented Modeling Language." *ESM*, 1998.
5. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 6 章给出采样控制系统与 `pre` 的用法。
6. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Discrete` 与 `Modelica.Blocks.Interfaces.RealInput`, 2020.
