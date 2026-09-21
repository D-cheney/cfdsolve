---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-equation-semantics-modeling
title: "方程式建模语义：语言语义与适用边界"
summary: "从 equation 段的关系语义出发，给出结构平衡、二分图匹配与 connect 方程生成的判定方法，并用一个直流分压电路完成 20 变量对 20 方程的手算核对。"
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
  - "方程式建模语义"
  - "语言语义与适用边界"
  - "结构平衡"
  - "connect 方程"
seo:
  title: "方程式建模语义：语言语义与适用边界"
  description: "从 equation 段的关系语义出发，给出结构平衡、二分图匹配与 connect 方程生成的判定方法，并用一个直流分压电路完成 20 变量对 20 方程的手算核对。"
  keywords:
    - "方程式建模语义"
    - "语言语义与适用边界"
    - "结构平衡"
    - "二分图匹配"
    - "connect 方程"
---

# 方程式建模语义：语言语义与适用边界

Modelica 的 `equation` 段不指定计算顺序，它只声明变量之间必须同时成立的关系；工具负责展开层次、生成连接方程、做符号排序并选择状态量。判断一个模型是否正确，靠的是展开后的方程—变量配平与结构非奇异性，而不是代码能否通过语法检查。本文只讨论 equation 段的语义、平衡与 `connect` 生成规则，不涉及 Media/Fluid 的物性闭合与求解器设置。

## 关系式与赋值语句的语义分界

在 `equation` 段里，`a = b + c` 与写成 `b + c = a` 完全等价，编译器可以任意重排。`algorithm` 段则不同，`:=` 是按书写顺序执行的赋值，`x := x + 1` 有明确的前后依赖。区分方法很直接：把两条语句交换位置，若物理含义不变，它属于方程；若结果改变，它属于算法。

这一分界带来"全局责任"：局部多写一条或少写一条关系，改变的是整个系统的自由度，而不是一段代码的局部行为。`der(x)`、`pre(x)`、`reinit(x, v)` 与 `when` 条件都只能在方程语境中使用，它们把微分关系与事件关系写进同一个约束集合。

## 平衡、匹配与结构非奇异

展开后的系统必须先满足配平：

$$n_{var} - n_{eq} = 0$$

差值大于零表示欠定，缺少约束；小于零表示过定，存在冗余关系。工具报出的 `Not enough equations` 与 `Too many equations` 正对应这两种情形。

配平只是必要条件。把变量与方程排成二分图，只有当存在覆盖全部变量的完美匹配时，方程才可能对变量唯一求解：

$$|\mathcal{M}| = n, \qquad \mathrm{rank}\,\mathbf{J}(\mathbf{x}) = n$$

前者是结构判定，只依赖方程中变量是否出现；后者是数值判定，依赖当前工况下的雅可比秩。结构匹配失败在翻译阶段直接报错，而数值奇异要到初始化或仿真阶段才暴露，表现为 `singular Jacobian`。

## connect 按节点生成约束

`connect` 不复制方程，它按连接节点生成约束。对含 $k$ 个连接器的节点，势变量给出 $k-1$ 条相等关系，流变量给出 1 条代数和为零的关系：

$$\phi_1 = \phi_2 = \cdots = \phi_k, \qquad \sum_{i=1}^{k} f_i = 0$$

一个只暴露物理端口的组件，其 $n_{var} - n_{eq}$ 恰好等于端口上流变量的个数，因为流变量要由外部网络的守恒关系确定。这条性质是组件可组合的充分条件：把它接进任何结构合理的网络，连接方程数正好补齐它留下的自由度。

## 用分压电路核对配平

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

## 高指标 DAE 与状态选择

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

## 语义失效的典型信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Too many equations, over-determined system` | 组件内部重复书写了连接网络已生成的守恒关系 | 注释掉组件内那条冗余守恒，看报错是否消失 |
| `The following variables could not be matched` | 二分图无完美匹配，某变量只出现在被消去的方程里 | 用 `--dump` 查看展开后的变量表，定位未匹配项 |
| `singular Jacobian` 出现在 $t=0$ | 结构匹配通过但数值秩不足，典型是两个理想电压源并联 | 把其中一个源换成带内阻的 `Resistor`，重跑初始化 |
| 交换两条方程后结果改变 | 误把赋值写进 `equation` 段 | 检查该段是否出现 `:=` 或依赖书写顺序的表达式 |
| 某工况下突然欠定 | `if` 方程在不同活动配置下方程数不同 | 对每种分支配置分别统计方程数 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4 章 Classes 与第 8 章 Equations 给出方程语义、平衡与 connect 的定义。
2. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 3 章讨论声明式方程与赋值语句的语义差异。
3. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 4 章用电气与机械网络演示 acausal 建模。
4. Otter, M., Elmqvist, H., Mattsson, S. E. "Hybrid Modeling in Modelica Based on the Synchronous Data Flow Principle." *CACSD*, 1999.
5. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006 — 第 7 章给出 DAE 指标与结构奇异性分析。
6. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Electrical.Analog.Interfaces.OnePort` 与 `Basic.Resistor`, 2020.
