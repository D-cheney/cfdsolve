---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-events-state-machines
title: Modelica 事件、when/reinit 与状态机建模
summary: 区分时间事件、状态事件与采样事件，说明 when、pre、edge、reinit、noEvent 与状态机的正确用途，推导零交叉与事件迭代机制，并给出避免抖振与事件失败的方法。
category: { slug: modelica-dynamics-events, name: Modelica 动态、初始化与事件 }
level: 进阶
reading_minutes: 16
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, 事件, when, reinit, noEvent, state machine, 状态机]
seo:
  title: Modelica 事件与状态机建模指南
  description: 正确处理时间、状态和采样事件，避免抖振、事件迭代失败与非物理状态跳变。
  keywords: [Modelica when, reinit, noEvent, state machine, edge, pre]
---

# Modelica 事件、when/reinit 与状态机建模

混合系统在连续积分与离散切换之间交替：连续时间演化由 DAE 描述，模式改变由事件驱动。事件应表达真实的物理模式变化；把每一个分段关联式都变成事件，会显著降低仿真性能并引入鲁棒性问题。

## 1. 结论与适用场景

结论：`when` 描述“条件由假变真”时的离散更新；`pre()` 读取事件前的离散值；`edge()` 检测上升沿；`reinit()` 仅用于在事件时刻重置状态。模式数量多、转换条件明确时，状态机比嵌套 `if/when` 更易审查。

适用场景：

- 阀门开闭、泵启停、保护动作等模式切换；
- 需要对状态做瞬时重置（初速度、库存突变）的物理事件；
- 控制器周期采样或模式机（启动/运行/停机/故障）。

不适用：连续可导的饱和、限幅——这些应写成连续表达式，而不是事件。

## 2. 语言机制与数学基础

事件由零交叉函数触发。对条件表达式 $g(x, t)$，工具在 $g$ 过零附近定位事件时刻：

$$ g(x(t), t) = 0 $$

事件时刻把时间轴切成若干连续段；每段内 DAE 光滑积分，段边界执行离散更新。设离散变量为 $d$，事件更新可写作

$$ d^{+} = f_{when}(x, d^{-}) $$

其中 $d^{-} = \text{pre}(d)$ 为事件前取值。事件迭代要求更新后的方程仍自洽：工具可能在同一时刻反复求解离散系统，直到不再有新的条件变为真。

对滞回逻辑，两个阈值 $T_{low} < T_{high}$ 定义带宽

$$ \Delta T = T_{high} - T_{low} > 0 $$

带宽内保持原状态，从而抑制阈值附近的抖振。

注意 `pre` 只对离散变量与离散时间表达式有意义：连续变量在事件时刻连续，不应读取其 `pre`。此外，`when` 子句只在条件由假变真的那一瞬执行一次；若条件持续为真，方程不会重复执行，因此 `when` 不能表达“持续作用”——持续作用应写成 `if` 表达式。

## 3. 关键语法与公式

`when` 支持多个触发条件组成的向量；`edge(b)` 等价于 $b \wedge \neg \text{pre}(b)$，即只在上升沿触发。周期采样用

$$ \text{sample}(t_{start}, \Delta t) $$

在 $t = t_{start} + n \Delta t$ 时刻触发。最小保持时间可用计时器实现：进入状态时记录时间戳 $t_{enter}$，仅当

$$ t - t_{enter} \geq t_{hold} $$

才允许再次切换。`noEvent()` 抑制关系表达式生成事件，仅在“忽略精确切换不改变模型语义”时使用。关键结构：

```modelica
when {cond1, cond2} then
  d = if cond1 then expr1 else pre(d);
end when;
```

在 `when` 子句内所有赋值同步执行，且只执行一次。

状态机用显式的状态与转换替代嵌套判断：每个状态是一个 `Step`，转换由 `transition(cond)` 定义，`initialStep` 指定起点，转换条件应互斥并明确优先级。

## 4. 工程做法与参数

区分事件类型：时间事件（`sample`）、状态事件（连续量过零）、离散事件（离散变量变化）。为每类指定明确语义。

离散变量必须有保持语义：每个离散变量在每个分支要么保持 `pre`，要么被唯一更新，不能悬空。

禁止用 `reinit` 做连续量限幅：`reinit` 只用于真实的瞬时状态跃变，且引起的能量/质量跳变需有物理解释。

状态机建模：用 `Modelica.StateGraph` 或 `transition` 显式定义状态、转换条件与优先级；为每个状态定义不变量与入口动作，并测试不可达状态。

求解器与容差：不要通过放大容差掩盖抖振；优先修物理逻辑（滞回、最小保持时间、正则化）。

## 5. 可复现示例

```modelica
model Thermostat
  parameter Modelica.Units.SI.Temperature T_low = 293.15;
  parameter Modelica.Units.SI.Temperature T_high = 296.15;
  Modelica.Units.SI.Temperature T(start = 294.15, fixed = true);
  Boolean heater;
equation
  der(T) = if heater then 0.05 else -0.03;
  when {T > T_high, T < T_low} then
    heater = if T > T_high then false
             else if T < T_low then true
             else pre(heater);
  end when;
end Thermostat;
```

运行 `Thermostat`，统计事件次数与相邻事件间隔；把两阈值差拉近到 0.1 K 以下，会观察到事件次数急剧上升。同一逻辑也可用状态机表达，便于审查模式与转换：

```modelica
model ModeMachine
  Modelica.StateGraph.InitialStep Off(nOut = 1);
  Modelica.StateGraph.Step Run(nIn = 1, nOut = 1);
  Modelica.StateGraph.Transition start(condition = T < T_low);
  Modelica.StateGraph.Transition stop(condition = T > T_high);
  inner Modelica.StateGraph.StateGraphRoot root;
equation
  connect(Off.outPort[1], start.inPort);
  connect(start.outPort, Run.inPort[1]);
  connect(Run.outPort[1], stop.inPort);
  connect(stop.outPort, Off.inPort[1]);
end ModeMachine;
```

## 6. 常见坑与排查

- 抖振：阈值附近反复切换。加滞回、最小保持时间或正则化。
- 漏检事件：滥用 `noEvent()` 跨过真实切换。仅在允许连续近似时使用。
- `reinit` 破坏守恒：状态被瞬时重置而无物理来源。为每次 `reinit` 给出物理解释并核算守恒量。
- 离散变量未保持：某些分支未定义值，事件迭代不收敛。
- 嵌套 `if/when` 难以审查：模式多时改为状态机。
- 用容差掩盖问题：会放大误差并拖慢仿真。

## 7. 检查清单与参考

- 事件是否对应真实模式改变；
- 每个离散变量在所有分支有明确保持或更新；
- `reinit` 均伴随守恒量核算；
- `noEvent` 的使用有依据；
- 阈值配滞回或最小保持时间；
- 状态机定义了不变量、转换优先级与不可达测试；
- 事件次数与仿真用时已统计。

参考：

1. Modelica Association, *Modelica Language Specification* — Events, Discrete-Time Expressions and State Machines.
2. Modelica Standard Library, `Modelica.StateGraph`.
3. Cellier & Kofman, *Continuous System Simulation*.
