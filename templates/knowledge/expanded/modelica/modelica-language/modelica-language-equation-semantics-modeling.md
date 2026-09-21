---
template_version: flowlab-knowledge/1.0
slug: modelica-language-equation-semantics-modeling
title: 方程式建模语义：原理与诊断验证
summary: >-
  从 equation 段的关系语义出发，给出结构平衡、二分图匹配与 connect 方程生成的判定方法，并用一个直流分压电路完成 20 变量对 20
  方程的手算核对。 全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
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
  - 方程式建模语义
  - 语言语义与适用边界
  - 结构平衡
  - connect 方程
  - 结果诊断与可信度验证
  - 指标约减
  - 结构奇异
seo:
  title: 方程式建模语义：原理与诊断验证
  description: >-
    从 equation 段的关系语义出发，给出结构平衡、二分图匹配与 connect 方程生成的判定方法，并用一个直流分压电路完成 20 变量对 20
    方程的手算核对。 全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 方程式建模语义
    - 语言语义与适用边界
    - 结构平衡
    - 二分图匹配
    - connect 方程
    - 结果诊断与可信度验证
    - 指标约减
    - 结构奇异
    - singular Jacobian
---
# 方程式建模语义：原理与诊断验证

## 原理与适用范围

Modelica 的 `equation` 段不指定计算顺序，它只声明变量之间必须同时成立的关系；工具负责展开层次、生成连接方程、做符号排序并选择状态量。判断一个模型是否正确，靠的是展开后的方程—变量配平与结构非奇异性，而不是代码能否通过语法检查。本文只讨论 equation 段的语义、平衡与 `connect` 生成规则，不涉及 Media/Fluid 的物性闭合与求解器设置。

### 关系式与赋值语句的语义分界

在 `equation` 段里，`a = b + c` 与写成 `b + c = a` 完全等价，编译器可以任意重排。`algorithm` 段则不同，`:=` 是按书写顺序执行的赋值，`x := x + 1` 有明确的前后依赖。区分方法很直接：把两条语句交换位置，若物理含义不变，它属于方程；若结果改变，它属于算法。

这一分界带来"全局责任"：局部多写一条或少写一条关系，改变的是整个系统的自由度，而不是一段代码的局部行为。`der(x)`、`pre(x)`、`reinit(x, v)` 与 `when` 条件都只能在方程语境中使用，它们把微分关系与事件关系写进同一个约束集合。

### 平衡、匹配与结构非奇异

展开后的系统必须先满足配平：

$$n_{var} - n_{eq} = 0$$

差值大于零表示欠定，缺少约束；小于零表示过定，存在冗余关系。工具报出的 `Not enough equations` 与 `Too many equations` 正对应这两种情形。

配平只是必要条件。把变量与方程排成二分图，只有当存在覆盖全部变量的完美匹配时，方程才可能对变量唯一求解：

$$|\mathcal{M}| = n, \qquad \mathrm{rank}\,\mathbf{J}(\mathbf{x}) = n$$

前者是结构判定，只依赖方程中变量是否出现；后者是数值判定，依赖当前工况下的雅可比秩。结构匹配失败在翻译阶段直接报错，而数值奇异要到初始化或仿真阶段才暴露，表现为 `singular Jacobian`。

### connect 按节点生成约束

`connect` 不复制方程，它按连接节点生成约束。对含 $k$ 个连接器的节点，势变量给出 $k-1$ 条相等关系，流变量给出 1 条代数和为零的关系：

$$\phi_1 = \phi_2 = \cdots = \phi_k, \qquad \sum_{i=1}^{k} f_i = 0$$

一个只暴露物理端口的组件，其 $n_{var} - n_{eq}$ 恰好等于端口上流变量的个数，因为流变量要由外部网络的守恒关系确定。这条性质是组件可组合的充分条件：把它接进任何结构合理的网络，连接方程数正好补齐它留下的自由度。

### 用分压电路核对配平

以 MSL 的 `Modelica.Electrical.Analog` 为例，`Interfaces.OnePort` 基类定义 `p.v, p.i, n.v, n.i, v, i` 六个变量和三条方程。`Resistor` 与 `ConstantVoltage` 各在其上再加一条方程（取 `useHeatPort = false`，条件热端口不引入变量），于是每个元件为 6 变量 4 方程；`Ground` 为 2 变量 1 方程。四个元件的变量数为 $6+6+6+2=20$，元件内方程数为 $4+4+4+1=13$。

```modelica
model VoltageDivider
  Modelica.Electrical.Analog.Basic.Resistor R1(R = 100.0);
  Modelica.Electrical.Analog.Basic.Resistor R2(R = 220.0);
  Modelica.Electrical.Analog.Basic.Ground g;
  Modelica.Electrical.Analog.Sources.ConstantVoltage src(V = 12.0);
equation
  connect(src.p, R1.p);
  connect(R1.n, R2.p);
  connect(R2.n, src.n);
  connect(R2.n, g.p);
end VoltageDivider;
```

四个 `connect` 形成三个节点：`{src.p, R1.p}` 与 `{R1.n, R2.p}` 各含 2 个连接器，贡献 2 条方程；`{R2.n, src.n, g.p}` 含 3 个连接器，贡献 3 条方程。连接方程共 $2+2+3=7$ 条，加上元件内 13 条，合计 20 条，与 20 个未知量配平。若把最后一句误写成 `connect(src.n, g.p)` 而漏掉 `R2.n`，节点退化为 2 条方程，总数变为 19，工具会报欠定。

稳态解可以手算：回路总电阻 $100.0 + 220.0 = 320.0\ \Omega$，电流 $I = 12.0/320.0 = 0.0375\ \mathrm{A} = 37.5\ \mathrm{mA}$，输出节点电压 $V_{out} = 12.0 \times 220.0/320.0 = 8.25\ \mathrm{V}$，总功率 $P = 12.0 \times 0.0375 = 0.45\ \mathrm{W}$。把仿真末值与这三个数对照，可以在不依赖任何基准文件的情况下确认方程方向没有写反。

### 高指标 DAE 与状态选择

方程系统在数学上是微分代数系统 $\mathbf{F}(t,\dot{\mathbf{x}},\mathbf{x},\mathbf{y})=\mathbf{0}$。当某个约束需要微分若干次才能解出状态导数时，系统指标大于 1，工具会做指标约减并引入人工状态。指标约减会放大初始误差，也会改变 `start` 属性对结果的影响权重。可以用 `stateSelect` 固定选择，避免同一模型在不同工具版本上得到不同状态数。

```modelica
model TankLevel
  Modelica.Units.SI.Volume V(start = 0.05, stateSelect = StateSelect.prefer);
  Modelica.Units.SI.Height h;
  parameter Modelica.Units.SI.Area A = 0.5;
equation
  V = A * h;
  der(V) = -1.0e-3;
end TankLevel;
```

`V` 与 `h` 只差一个常数因子，工具既可以选 `V` 也可以选 `h` 作状态。加上 `StateSelect.prefer` 后，状态集合被显式钉住，跨工具的复算结果才可比。

### 语义失效的典型信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Too many equations, over-determined system` | 组件内部重复书写了连接网络已生成的守恒关系 | 注释掉组件内那条冗余守恒，看报错是否消失 |
| `The following variables could not be matched` | 二分图无完美匹配，某变量只出现在被消去的方程里 | 用 `--dump` 查看展开后的变量表，定位未匹配项 |
| `singular Jacobian` 出现在 $t=0$ | 结构匹配通过但数值秩不足，典型是两个理想电压源并联 | 把其中一个源换成带内阻的 `Resistor`，重跑初始化 |
| 交换两条方程后结果改变 | 误把赋值写进 `equation` 段 | 检查该段是否出现 `:=` 或依赖书写顺序的表达式 |
| 某工况下突然欠定 | `if` 方程在不同活动配置下方程数不同 | 对每种分支配置分别统计方程数 |

### 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4 章 Classes 与第 8 章 Equations 给出方程语义、平衡与 connect 的定义。
2. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 3 章讨论声明式方程与赋值语句的语义差异。
3. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 4 章用电气与机械网络演示 acausal 建模。
4. Otter, M., Elmqvist, H., Mattsson, S. E. "Hybrid Modeling in Modelica Based on the Synchronous Data Flow Principle." *CACSD*, 1999.
5. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006 — 第 7 章给出 DAE 指标与结构奇异性分析。
6. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Electrical.Analog.Interfaces.OnePort` 与 `Basic.Resistor`, 2020.

## 诊断与可信度验证

方程类报错常被当成"编译器不听话"，实际上每一条消息都对应一个可判定的结构或数值事实。诊断的关键不是改参数，而是先把报错归到结构、数值、指标三类之一，再用最小模型复现。本文以翻译期与初始化期的真实消息为线索，给出一个指标为 3 的杆摆算例作为可复算对照。

### 从报错文本确定归属

三类报错的语义完全不同，处理顺序也不能颠倒。

- `Too many equations, over-determined system` 是结构过定：方程数多于变量数。
- `The following variables could not be matched` 是结构奇异：变量数够，但二分图没有完美匹配。
- `singular Jacobian` 是数值奇异：结构匹配成立，但当前工况下雅可比秩不足。

前两类在翻译阶段就能判定，与初值无关；第三类必须落到具体工况。把顺序搞反，会在一处结构缺陷上反复调 `start` 值，浪费掉大部分排查时间。

### 结构判定的两个必要条件

设展开后变量数为 $n_{var}$、方程数为 $n_{eq}$，配平条件写成

$$n_{var} - n_{eq} = 0$$

再设二分图的最大匹配规模为 $|\mathcal{M}|$，结构非奇异要求

$$|\mathcal{M}| = n_{var}$$

第二条比第一条更细：一个模型可以配平但仍然结构奇异，典型情形是某个变量只出现在一条与它自身线性相关的方程里。工具在匹配失败时会直接点名该变量，例如 `could not be matched: Fy`，这比看总计数快得多。

### 指标约减留下的初始化缺口

当约束需要微分才能解出状态导数时，系统指标大于 1。指标的定义是：为了让约束系统化为显式 ODE 所需的最少微分次数。指标 $i$ 的系统在指标约减后会引入 $i-1$ 组人工状态，这些状态的初值必须由被微分掉的约束重新提供。

对位置约束 $c(\mathbf{q}) = 0$，约减过程会依次产生

$$\frac{d c}{d t} = \nabla c \cdot \dot{\mathbf{q}} = 0, \qquad \frac{d^2 c}{d t^2} = \dot{\mathbf{q}}^{\top} \nabla^2 c\, \dot{\mathbf{q}} + \nabla c \cdot \ddot{\mathbf{q}} = 0$$

第一式约束速度初值，第二式约束加速度与约束力。如果只给了位置初值而没给速度初值，初始化阶段会报 `The initial conditions are not fully specified` 或直接求解失败。判定方法是数一下被微分的约束数：$i-1$ 组额外初值条件必须显式给出，不能依赖工具猜测。

### 指标为 3 的杆摆算例

下面用笛卡尔坐标描述一根刚性无质量杆连接的质点。约束力沿杆方向，因此再加一条力的方向约束，方程数才与变量数配平。

```modelica
model PendulumCartesian
  parameter Modelica.Units.SI.Length L = 0.5;
  parameter Modelica.Units.SI.Acceleration g = 9.81;
  parameter Modelica.Units.SI.Mass m = 1.0;
  Modelica.Units.SI.Position x(start = 0.5, fixed = true);
  Modelica.Units.SI.Position y(start = 0.0, fixed = true);
  Modelica.Units.SI.Velocity vx(start = 0.0, fixed = true);
  Modelica.Units.SI.Velocity vy(start = 0.0, fixed = true);
  Modelica.Units.SI.Force Fx;
  Modelica.Units.SI.Force Fy;
equation
  der(x) = vx;
  der(y) = vy;
  m * der(vx) = Fx;
  m * der(vy) = Fy - m * g;
  x * x + y * y = L * L;
  Fx * y - Fy * x = 0;
end PendulumCartesian;
```

变量为 $x, y, vx, vy, Fx, Fy$ 共 6 个，方程 6 条，配平成立。位置约束是指标 3：需要微分两次才能解出 $F_x, F_y$。第二次微分给出

$$\dot{x}^2 + \dot{y}^2 + x\frac{F_x}{m} + y\left(\frac{F_y}{m} - g\right) = 0$$

用初值 $x = 0.5\ \mathrm{m}$、$y = 0.0\ \mathrm{m}$、$v_x = v_y = 0\ \mathrm{m/s}$、$m = 1.0\ \mathrm{kg}$、$g = 9.81\ \mathrm{m/s^2}$ 代入：第一项与第二项为零，径向条件 $F_x y - F_y x = 0$ 在 $x = 0.5$ 处要求 $F_y = 0$，于是 $0.5\,F_x = 0$，得到 $F_x = 0\ \mathrm{N}$、$F_y = 0\ \mathrm{N}$，进而 $\dot{v}_y = -9.81\ \mathrm{m/s^2}$。杆水平静止时张力为零、质点自由下落，与直觉一致。这条手算结果可以直接用作初始化校验：若工具报出 $F_x \neq 0$ 或 $F_y \neq 0$，说明约束方向写错了。

### 诊断量与判定阈值

可复算的诊断不只依赖报错文本，还要固定几个量：

- 匹配规模 $|\mathcal{M}|$ 与 $n_{var}$ 的差，必须为 0；
- 初始化残差 $\|\mathbf{F}(t_0)\|_\infty$，默认容差 $10^{-6}$；
- 指标约减后新增的人工状态个数，等于约束被微分的次数；
- 约束漂移 $|c(t)|$，对 $L = 0.5\ \mathrm{m}$ 的杆，仿真 10 s 后漂移应小于 $10^{-5}\ \mathrm{m}$。

约束漂移是判断约减是否可用的关键量。若漂移随仿真时间线性增长，说明约减后的方程没有做投影修正；OpenModelica 可用 `-d=initialization` 打印初始化方程，Dymola 可用 `checkModel` 与 `translateModel` 分步定位。

### 失效信号与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 `Too many equations`，删掉一条后正常 | 组件内部写了本该由 `connect` 生成的流守恒 | 在组件里搜索 `+ 0` 形式的流量代数和 |
| 报 `could not be matched: Fy` 且总数配平 | 力的方向约束与运动方程线性相关 | 把方向约束换成 `Fx * y - Fy * x = 0` 的显式形式再试 |
| 初始化报 `singular Jacobian` 但结构匹配通过 | 初值落在约束的奇点，如杆竖直时 $x = 0, y = 0.5$ | 把初值移到水平位置重跑，看是否恢复 |
| 约束漂移 10 s 后超过 $10^{-3}\ \mathrm{m}$ | 指标约减未做投影或步长过大 | 减小 `tolerance` 到 $10^{-8}$ 并对比漂移是否同步下降 |
| 同一模型在两个工具中状态数不同 | 状态选择依赖启发式，未用 `stateSelect` 固定 | 给候选状态加 `StateSelect.prefer` 后重新对比 |

### 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4 章 Balanced Models 与第 8 章 Equation Operators 定义匹配与 connect 语义。
2. Pantelides, C. C. "The Consistent Initialization of Differential-Algebraic Systems." *SIAM J. Sci. Stat. Comput.*, 9(2), 1988.
3. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006 — 第 7 章给出指标定义与约减算法。
4. Mattsson, S. E., Söderlind, G. "Index Reduction in Differential-Algebraic Equations Using Dummy Derivatives." *SIAM J. Sci. Comput.*, 14(3), 1993.
5. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 8 章讨论翻译期结构检查。
6. OpenModelica User's Guide, v1.22, 2023 — 附录列出 `Translation Error` 与 `singular Jacobian` 消息的含义。
