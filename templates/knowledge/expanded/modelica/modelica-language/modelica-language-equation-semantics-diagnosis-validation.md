---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-equation-semantics-diagnosis-validation
title: "方程式建模语义：结果诊断与可信度验证"
summary: "把翻译期的 Too many equations、variables could not be matched 与运行期的 singular Jacobian 分成结构、数值、指标三类，用一个指标为 3 的杆摆模型给出可复算的判定路径。"
category:
  slug: modelica-language
  name: "Modelica 语言基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MODELICA"
  - "Modelica 语言基础"
  - "方程式建模语义"
  - "结果诊断与可信度验证"
  - "指标约减"
  - "结构奇异"
seo:
  title: "方程式建模语义：结果诊断与可信度验证"
  description: "把翻译期的 Too many equations、variables could not be matched 与运行期的 singular Jacobian 分成结构、数值、指标三类，用一个指标为 3 的杆摆模型给出可复算的判定路径。"
  keywords:
    - "方程式建模语义"
    - "结果诊断与可信度验证"
    - "指标约减"
    - "结构奇异"
    - "singular Jacobian"
---

# 方程式建模语义：结果诊断与可信度验证

方程类报错常被当成"编译器不听话"，实际上每一条消息都对应一个可判定的结构或数值事实。诊断的关键不是改参数，而是先把报错归到结构、数值、指标三类之一，再用最小模型复现。本文以翻译期与初始化期的真实消息为线索，给出一个指标为 3 的杆摆算例作为可复算对照。

## 从报错文本确定归属

三类报错的语义完全不同，处理顺序也不能颠倒。

- `Too many equations, over-determined system` 是结构过定：方程数多于变量数。
- `The following variables could not be matched` 是结构奇异：变量数够，但二分图没有完美匹配。
- `singular Jacobian` 是数值奇异：结构匹配成立，但当前工况下雅可比秩不足。

前两类在翻译阶段就能判定，与初值无关；第三类必须落到具体工况。把顺序搞反，会在一处结构缺陷上反复调 `start` 值，浪费掉大部分排查时间。

## 结构判定的两个必要条件

设展开后变量数为 $n_{var}$、方程数为 $n_{eq}$，配平条件写成

$$n_{var} - n_{eq} = 0$$

再设二分图的最大匹配规模为 $|\mathcal{M}|$，结构非奇异要求

$$|\mathcal{M}| = n_{var}$$

第二条比第一条更细：一个模型可以配平但仍然结构奇异，典型情形是某个变量只出现在一条与它自身线性相关的方程里。工具在匹配失败时会直接点名该变量，例如 `could not be matched: Fy`，这比看总计数快得多。

## 指标约减留下的初始化缺口

当约束需要微分才能解出状态导数时，系统指标大于 1。指标的定义是：为了让约束系统化为显式 ODE 所需的最少微分次数。指标 $i$ 的系统在指标约减后会引入 $i-1$ 组人工状态，这些状态的初值必须由被微分掉的约束重新提供。

对位置约束 $c(\mathbf{q}) = 0$，约减过程会依次产生

$$\frac{d c}{d t} = \nabla c \cdot \dot{\mathbf{q}} = 0, \qquad \frac{d^2 c}{d t^2} = \dot{\mathbf{q}}^{\top} \nabla^2 c\, \dot{\mathbf{q}} + \nabla c \cdot \ddot{\mathbf{q}} = 0$$

第一式约束速度初值，第二式约束加速度与约束力。如果只给了位置初值而没给速度初值，初始化阶段会报 `The initial conditions are not fully specified` 或直接求解失败。判定方法是数一下被微分的约束数：$i-1$ 组额外初值条件必须显式给出，不能依赖工具猜测。

## 指标为 3 的杆摆算例

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

## 诊断量与判定阈值

可复算的诊断不只依赖报错文本，还要固定几个量：

- 匹配规模 $|\mathcal{M}|$ 与 $n_{var}$ 的差，必须为 0；
- 初始化残差 $\|\mathbf{F}(t_0)\|_\infty$，默认容差 $10^{-6}$；
- 指标约减后新增的人工状态个数，等于约束被微分的次数；
- 约束漂移 $|c(t)|$，对 $L = 0.5\ \mathrm{m}$ 的杆，仿真 10 s 后漂移应小于 $10^{-5}\ \mathrm{m}$。

约束漂移是判断约减是否可用的关键量。若漂移随仿真时间线性增长，说明约减后的方程没有做投影修正；OpenModelica 可用 `-d=initialization` 打印初始化方程，Dymola 可用 `checkModel` 与 `translateModel` 分步定位。

## 失效信号与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 `Too many equations`，删掉一条后正常 | 组件内部写了本该由 `connect` 生成的流守恒 | 在组件里搜索 `+ 0` 形式的流量代数和 |
| 报 `could not be matched: Fy` 且总数配平 | 力的方向约束与运动方程线性相关 | 把方向约束换成 `Fx * y - Fy * x = 0` 的显式形式再试 |
| 初始化报 `singular Jacobian` 但结构匹配通过 | 初值落在约束的奇点，如杆竖直时 $x = 0, y = 0.5$ | 把初值移到水平位置重跑，看是否恢复 |
| 约束漂移 10 s 后超过 $10^{-3}\ \mathrm{m}$ | 指标约减未做投影或步长过大 | 减小 `tolerance` 到 $10^{-8}$ 并对比漂移是否同步下降 |
| 同一模型在两个工具中状态数不同 | 状态选择依赖启发式，未用 `stateSelect` 固定 | 给候选状态加 `StateSelect.prefer` 后重新对比 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4 章 Balanced Models 与第 8 章 Equation Operators 定义匹配与 connect 语义。
2. Pantelides, C. C. "The Consistent Initialization of Differential-Algebraic Systems." *SIAM J. Sci. Stat. Comput.*, 9(2), 1988.
3. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006 — 第 7 章给出指标定义与约减算法。
4. Mattsson, S. E., Söderlind, G. "Index Reduction in Differential-Algebraic Equations Using Dummy Derivatives." *SIAM J. Sci. Comput.*, 14(3), 1993.
5. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 8 章讨论翻译期结构检查。
6. OpenModelica User's Guide, v1.22, 2023 — 附录列出 `Translation Error` 与 `singular Jacobian` 消息的含义。
