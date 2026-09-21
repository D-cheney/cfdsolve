---
template_version: flowlab-knowledge/1.0
slug: modelica-language-variability-modeling
title: 常量、参数与离散变量：原理与诊断验证
summary: >-
  解释 constant、parameter、discrete 与 continuous 四种可变性构成的偏序、表达式可变性的传播规则，以及 when 与
  pre 在事件时刻的取值约定，并给出一个采样 PI 控制器的可手算算例。
category:
  slug: modelica-language
  name: Modelica 语言基础
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - MODELICA
  - Modelica 语言基础
  - 常量、参数与离散变量
  - 语言语义与适用边界
  - 可变性偏序
  - when 与 pre
  - 结果诊断与可信度验证
  - 事件抖动
  - 迟滞带
seo:
  title: 常量、参数与离散变量：原理与诊断验证
  description: >-
    解释 constant、parameter、discrete 与 continuous 四种可变性构成的偏序、表达式可变性的传播规则，以及 when 与
    pre 在事件时刻的取值约定，并给出一个采样 PI 控制器的可手算算例。
  keywords:
    - 常量、参数与离散变量
    - 语言语义与适用边界
    - 可变性偏序
    - when 与 pre
    - 事件时刻
    - 结果诊断与可信度验证
    - 事件抖动
    - 迟滞带
    - 事件迭代
---
# 常量、参数与离散变量：原理与诊断验证

Modelica 把"变量会不会变、在什么时候变"编码进声明前缀，形成一套可变性偏序。编译期就能定的量可以做数组维度，仿真前可改的量适合做设计变量，只在事件时刻跳变的量必须用 `when` 驱动。离散变量的故障很少表现为数值偏差，更多表现为求解变慢、事件数暴涨或结果在两次运行间不一致。可信度验证要回答的是三个可量化的问题：事件率是否落在物理预期内、事件迭代是否在有限步内收敛、参数取值是否经得起扰动反证。

## 基础概念与控制关系

### 从求解日志里提取离散证据

在动任何参数之前，先把四类量记下来：

- 仿真区间内的事件总数 $N_{event}$；
- 每个事件处的事件迭代次数 $k_{iter}$；
- 离散变量的首拍值与 `pre` 值；
- 参数被修改符覆盖后的实际生效值。

工具会把这些量写进日志。OpenModelica 输出 `number of events`，Dymola 在 `dslog.txt` 中给出 `Number of state events` 与 `Number of time events`。缺少这些量时，任何"结果看起来对"的判断都没有区分力，因为抖动与真实高频切换在结果曲线上长得一样。

### 可变性是一个偏序而非四个并列标签

四种可变性从"最不可变"到"最可变"排列为 `constant` < `parameter` < `discrete` < `continuous`。`constant` 在编译期求值，可以出现在数组维度、`if` 条件的结构分支里；`parameter` 在一次仿真中固定，但在编译与初始化之间可被修改符覆盖；`discrete` 是分段常数，只在事件时刻改变；`continuous` 在时间上连续可微。

这条偏序直接决定赋值合法性：把高可变性的表达式赋给低可变性的变量是非法的。写成 `parameter Real T = time;` 会得到 `Cannot assign a continuous-time expression to a parameter`，因为 `time` 的可变性高于 `parameter`。反过来永远合法：`discrete Real y = kp * u;` 中 `kp` 是参数、`u` 是连续量，只要整条语句位于 `when` 分支内即可。

### 表达式可变性的传播规则

表达式本身也有可变性，取子表达式中的最大值：

$$\mathrm{var}(e_1 \circ e_2) = \max\big(\mathrm{var}(e_1),\, \mathrm{var}(e_2)\big)$$

这条规则解释了为什么 `parameter Real A[3] = {1.0, 2.0, 3.0} * scale;` 在 `scale` 为 `parameter` 时仍然合法——右侧是参数表达式，数组维度可确定；而一旦 `scale` 变成普通 `Real`，数组维度就无法在编译期确定，报错 `Array dimension is not a parameter expression`。

`final parameter` 是在偏序上加锁：它仍然是参数，但禁止下游用修改符覆盖。库作者在基类里写 `final parameter Real k = 1.0`，可以防止使用者无意改变内部标定，同时保持参数的可见性。

### 采样 PI 控制器的可变性设计

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

## 适用边界与方案选择

### 事件时刻与 pre 的取值约定

`when` 分支内的赋值不是连续赋值，而是事件时刻的一次性更新。`pre(x)` 给出该变量在上一个事件时刻之后、当前事件之前的取值：

$$\mathrm{pre}(x)(t) = \lim_{s \to t^{-}} x(s)$$

没有 `pre()` 就无法写出带记忆的离散状态，例如 `I = pre(I) + kp * Ts / Ti * e;`。如果漏掉 `pre()` 直接写 `I = I + ...`，工具会报代数环或报 `Non-linear equation system`，因为等号两边出现同一个离散变量，构成隐式关系。

采样由内建函数触发：`when sample(0, Ts) then ... end when;` 在 $t = 0, T_s, 2T_s, \dots$ 时刻激活。仿真区间 $[0, T_{end}]$ 内的事件次数为

$$N = \left\lfloor \frac{T_{end}}{T_s} \right\rfloor + 1$$

取 $T_{end} = 10.0\ \mathrm{s}$、$T_s = 0.1\ \mathrm{s}$，得到 $N = 101$ 次采样。这个数可以与工具的 `number of events` 统计直接对照，用来确认采样逻辑没有写错。

### 迟滞带的取值下限

迟滞带不能任意取小。设求解器容差为 $10^{-6}$、温度量级为 $350\ \mathrm{K}$，相对容差对应的绝对分辨率约 $3.5 \times 10^{-4}\ \mathrm{K}$。迟滞带必须显著大于这个分辨率，否则阈值仍会被数值噪声穿越。工程上取迟滞带不低于量级分辨率的 100 倍，即

$$\Delta T \geq 100 \cdot \epsilon_{rel} \cdot T_{nom} = 100 \times 10^{-6} \times 350 = 0.035\ \mathrm{K}$$

取 $\Delta T = 2.0\ \mathrm{K}$ 有约 57 倍余量，是安全的。若实际物理迟滞只有 $0.1\ \mathrm{K}$，就应把 `tolerance` 收紧到 $10^{-8}$ 再评估，而不是把迟滞带放大到失真。

## 工程设置与实施

### 物性参数与常量表达式的边界

参数的可变性边界也体现在量纲换算上。取导热系数 $k = 0.6\ \mathrm{W/(m{\cdot}K)}$、密度 $\rho = 998.2\ \mathrm{kg/m^3}$、比热 $c_p = 4182.0\ \mathrm{J/(kg{\cdot}K)}$，三者都是 `parameter`，热扩散率

$$\alpha = \frac{k}{\rho c_p} = \frac{0.6}{998.2 \times 4182.0} = 1.437 \times 10^{-7}\ \mathrm{m^2/s}$$

因为三个输入都是参数，$\alpha$ 也是参数，可以安全地用于 `parameter Real dx = sqrt(alpha * t_end);` 这类需要在编译期定维的表达式。若把 $\rho$ 改成随温度变化的连续量，$\alpha$ 立刻升级为连续变量，上面这行会失效。

### 参数取值的反证设计

参数诊断不是重读一遍数值，而是构造能推翻结论的扰动。以比例增益 $k_p = 2.0$ 为例，做 $\pm 5\%$ 扰动（$1.9$ 与 $2.1$），若输出幅值随之变化约 $\pm 5\%$，说明系统在该工作点近似线性、参数可信；若幅值变化超过 $\pm 20\%$，说明工作点靠近饱和或分岔，原参数值不能外推。无量纲敏感度定义为

$$S = \frac{\Delta y / y}{\Delta p / p}$$

$|S| \approx 1$ 表示线性响应，$|S| \gg 1$ 表示参数不可信。把 $S$ 与事件率、迭代次数一起记录，才能说明一次离散仿真的结论覆盖了哪些工况。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Cannot assign a continuous-time expression to a parameter` | 参数初值里引用了 `time` 或连续变量 | 把该变量提到 `equation` 段，或改声明为 `discrete` |
| `Array dimension is not a parameter expression` | 数组维度依赖了非参数变量 | 用 `final parameter` 或 `constant` 重新声明维度来源 |
| 离散变量首拍结果等于稳态值 | `when` 分支内漏写 `pre()`，`I` 被当成连续量解出 | 把 `I` 的更新式改为含 `pre(I)` 的形式重跑 |
| 事件次数远多于 $T_{end}/T_s$ | `when` 条件里含连续比较，触发抖动 | 用 `sample(0, Ts)` 或加 `noEvent` 限定比较 |
| 修改子模型参数无效 | 基类中该参数被 `final` 锁定 | 用 `checkModel` 查看参数的 `final` 属性 |
| 事件数在 1 s 内超过 1000 次 | 连续比较缺迟滞，布尔量在阈值附近抖动 | 加 $\Delta T = 2.0\ \mathrm{K}$ 迟滞带，看事件率是否降到 $0.5\ \mathrm{s^{-1}}$ 量级 |
| 日志出现 `Event iteration did not converge` | 离散方程组无不动点或迭代上限过小 | 把 `when` 内赋值改写成含 `pre()` 的显式形式 |
| 两次运行结果不同 | 离散初值未固定，依赖工具默认值 | 给所有 `discrete` 变量加 `fixed = true` 与显式 `start` |
| 参数扰动 5% 引起输出变化 40% | 工作点接近饱和，敏感度 $\lvert S \rvert \gg 1$ | 把扰动缩到 $\pm 1\%$ 重测，确认是局部非线性 |
| `noEvent` 包裹后事件数归零 | 真实切换被抑制，物理行为被抹掉 | 去掉 `noEvent` 并改为迟滞实现，比较两者能量收支 |

### 恒温器的抖动诊断

下面的模型没有迟滞，`heating` 直接由连续温度比较得出：

```modelica
model ThermostatNoHysteresis
  parameter Modelica.Units.SI.Temperature Ton = 350.15;
  parameter Modelica.Units.SI.Temperature Tamb = 293.15;
  parameter Modelica.Units.SI.HeatCapacity C = 1000.0;
  parameter Modelica.Units.SI.Power Qmax = 2000.0;
  parameter Modelica.Units.SI.ThermalConductance h = 20.0;
  Modelica.Units.SI.Temperature T(start = 300.15, fixed = true);
  Boolean heating;
equation
  heating = T < Ton;
  C * der(T) = (if heating then Qmax else 0.0) - h * (T - Tamb);
end ThermostatNoHysteresis;
```

升温阶段净功率为 $Q_{max} - h(T - T_{amb})$。在 $T = 300.15\ \mathrm{K}$ 处损耗为 $20.0 \times (300.15 - 293.15) = 140.0\ \mathrm{W}$，净功率 $1860.0\ \mathrm{W}$，升温速率 $1860.0/1000.0 = 1.86\ \mathrm{K/s}$，从 $300.15\ \mathrm{K}$ 升到 $350.15\ \mathrm{K}$ 需要约 $50.0/1.86 = 26.9\ \mathrm{s}$。到达阈值后温度立即回落，条件再次为真，于是进入抖动。

加入迟滞带 $\Delta T = 2.0\ \mathrm{K}$ 后，开启阈值 $348.15\ \mathrm{K}$、关闭阈值 $350.15\ \mathrm{K}$。在 $T = 350.15\ \mathrm{K}$ 处损耗为 $20.0 \times 57.0 = 1140.0\ \mathrm{W}$，降温速率 $1140.0/1000.0 = 1.14\ \mathrm{K/s}$，降温段耗时 $2.0/1.14 = 1.75\ \mathrm{s}$；加热段净功率 $2000.0 - 1140.0 = 860.0\ \mathrm{W}$，速率 $0.86\ \mathrm{K/s}$，耗时 $2.0/0.86 = 2.33\ \mathrm{s}$。周期 $T_c \approx 4.08\ \mathrm{s}$，事件率 $2/T_c \approx 0.49\ \mathrm{s^{-1}}$。若日志里的事件率远高于 $0.5\ \mathrm{s^{-1}}$，迟滞带就没有生效。

## 验证、验收与复现

### 事件抖动与事件迭代不收敛的区分

两者的现象相似，机制不同。抖动是物理模型缺少迟滞，导致布尔条件在阈值附近反复穿越；事件迭代不收敛是离散方程组 $\mathbf{z} = \Phi(\mathbf{z}, \mathrm{pre}(\mathbf{z}))$ 本身没有不动点，或不动点迭代被限制在过少的迭代次数内。

判定迭代是否收敛，看相邻两次迭代的差：

$$\left\| \mathbf{z}^{(k+1)} - \mathbf{z}^{(k)} \right\|_\infty < \epsilon_{event}$$

OpenModelica 的默认 $\epsilon_{event}$ 与求解容差同量级，取 $10^{-6}$。若 $k_{iter}$ 打到上限（常见为 20 次）仍未满足上式，日志会出现 `Event iteration did not converge`。抖动则相反：每次迭代都迅速收敛，但事件被触发的次数远超物理预期。

区分试验很直接：把阈值比较换成带迟滞的形式。若事件数从数千降到个位数而结果形态不变，根因就是抖动；若事件数不变、只是迭代次数下降，根因在离散方程组本身。

## 参考资料

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 3.8 节 Variability of Expressions 给出四种可变性的偏序与传播规则。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 8.4 节 Events and Synchronization 规定 `when` 与 `pre` 的语义。
3. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 5 章讨论离散事件与混合系统建模。
4. Elmqvist, H., Mattsson, S. E., Otter, M. "Modelica — The New Object-Oriented Modeling Language." *ESM*, 1998.
5. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 6 章给出采样控制系统与 `pre` 的用法。
6. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Discrete` 与 `Modelica.Blocks.Interfaces.RealInput`, 2020.
7. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 8.5 节 Event Iteration 规定离散方程组不动点迭代的终止条件。
8. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 3.8 节 Variability of Expressions 界定 `discrete` 与 `continuous` 的赋值边界。
9. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006 — 第 9 章讨论混合系统的抖动与迟滞建模。
10. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 9 章给出事件迭代与 `noEvent` 的实现细节。
11. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Logical.Hysteresis` 与 `Modelica.Thermal.HeatTransfer`, 2020.
12. Mosterman, P. J. "An Overview of Hybrid Simulation Phenomena and Their Support by Simulation Packages." *HSCC*, 1999.
