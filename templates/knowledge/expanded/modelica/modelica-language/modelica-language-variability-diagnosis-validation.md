---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-variability-diagnosis-validation
title: "常量、参数与离散变量：结果诊断与可信度验证"
summary: "区分事件抖动、事件迭代不收敛与参数取值错误三类离散问题，给出事件率、迟滞带与参数敏感度的量化阈值，并用一个 1000 J/K 热容的恒温器完成周期手算。"
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
  - "常量、参数与离散变量"
  - "结果诊断与可信度验证"
  - "事件抖动"
  - "迟滞带"
seo:
  title: "常量、参数与离散变量：结果诊断与可信度验证"
  description: "区分事件抖动、事件迭代不收敛与参数取值错误三类离散问题，给出事件率、迟滞带与参数敏感度的量化阈值，并用一个 1000 J/K 热容的恒温器完成周期手算。"
  keywords:
    - "常量、参数与离散变量"
    - "结果诊断与可信度验证"
    - "事件抖动"
    - "迟滞带"
    - "事件迭代"
---

# 常量、参数与离散变量：结果诊断与可信度验证

离散变量的故障很少表现为数值偏差，更多表现为求解变慢、事件数暴涨或结果在两次运行间不一致。可信度验证要回答的是三个可量化的问题：事件率是否落在物理预期内、事件迭代是否在有限步内收敛、参数取值是否经得起扰动反证。本文用一个热容为 $1000\ \mathrm{J/K}$ 的恒温器把这三问拆开。

## 从求解日志里提取离散证据

在动任何参数之前，先把四类量记下来：

- 仿真区间内的事件总数 $N_{event}$；
- 每个事件处的事件迭代次数 $k_{iter}$；
- 离散变量的首拍值与 `pre` 值；
- 参数被修改符覆盖后的实际生效值。

工具会把这些量写进日志。OpenModelica 输出 `number of events`，Dymola 在 `dslog.txt` 中给出 `Number of state events` 与 `Number of time events`。缺少这些量时，任何"结果看起来对"的判断都没有区分力，因为抖动与真实高频切换在结果曲线上长得一样。

## 事件抖动与事件迭代不收敛的区分

两者的现象相似，机制不同。抖动是物理模型缺少迟滞，导致布尔条件在阈值附近反复穿越；事件迭代不收敛是离散方程组 $\mathbf{z} = \Phi(\mathbf{z}, \mathrm{pre}(\mathbf{z}))$ 本身没有不动点，或不动点迭代被限制在过少的迭代次数内。

判定迭代是否收敛，看相邻两次迭代的差：

$$\left\| \mathbf{z}^{(k+1)} - \mathbf{z}^{(k)} \right\|_\infty < \epsilon_{event}$$

OpenModelica 的默认 $\epsilon_{event}$ 与求解容差同量级，取 $10^{-6}$。若 $k_{iter}$ 打到上限（常见为 20 次）仍未满足上式，日志会出现 `Event iteration did not converge`。抖动则相反：每次迭代都迅速收敛，但事件被触发的次数远超物理预期。

区分试验很直接：把阈值比较换成带迟滞的形式。若事件数从数千降到个位数而结果形态不变，根因就是抖动；若事件数不变、只是迭代次数下降，根因在离散方程组本身。

## 恒温器的抖动诊断

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

## 迟滞带的取值下限

迟滞带不能任意取小。设求解器容差为 $10^{-6}$、温度量级为 $350\ \mathrm{K}$，相对容差对应的绝对分辨率约 $3.5 \times 10^{-4}\ \mathrm{K}$。迟滞带必须显著大于这个分辨率，否则阈值仍会被数值噪声穿越。工程上取迟滞带不低于量级分辨率的 100 倍，即

$$\Delta T \geq 100 \cdot \epsilon_{rel} \cdot T_{nom} = 100 \times 10^{-6} \times 350 = 0.035\ \mathrm{K}$$

取 $\Delta T = 2.0\ \mathrm{K}$ 有约 57 倍余量，是安全的。若实际物理迟滞只有 $0.1\ \mathrm{K}$，就应把 `tolerance` 收紧到 $10^{-8}$ 再评估，而不是把迟滞带放大到失真。

## 参数取值的反证设计

参数诊断不是重读一遍数值，而是构造能推翻结论的扰动。以比例增益 $k_p = 2.0$ 为例，做 $\pm 5\%$ 扰动（$1.9$ 与 $2.1$），若输出幅值随之变化约 $\pm 5\%$，说明系统在该工作点近似线性、参数可信；若幅值变化超过 $\pm 20\%$，说明工作点靠近饱和或分岔，原参数值不能外推。无量纲敏感度定义为

$$S = \frac{\Delta y / y}{\Delta p / p}$$

$|S| \approx 1$ 表示线性响应，$|S| \gg 1$ 表示参数不可信。把 $S$ 与事件率、迭代次数一起记录，才能说明一次离散仿真的结论覆盖了哪些工况。

## 失效信号与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 事件数在 1 s 内超过 1000 次 | 连续比较缺迟滞，布尔量在阈值附近抖动 | 加 $\Delta T = 2.0\ \mathrm{K}$ 迟滞带，看事件率是否降到 $0.5\ \mathrm{s^{-1}}$ 量级 |
| 日志出现 `Event iteration did not converge` | 离散方程组无不动点或迭代上限过小 | 把 `when` 内赋值改写成含 `pre()` 的显式形式 |
| 两次运行结果不同 | 离散初值未固定，依赖工具默认值 | 给所有 `discrete` 变量加 `fixed = true` 与显式 `start` |
| 参数扰动 5% 引起输出变化 40% | 工作点接近饱和，敏感度 $\lvert S \rvert \gg 1$ | 把扰动缩到 $\pm 1\%$ 重测，确认是局部非线性 |
| `noEvent` 包裹后事件数归零 | 真实切换被抑制，物理行为被抹掉 | 去掉 `noEvent` 并改为迟滞实现，比较两者能量收支 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 8.5 节 Event Iteration 规定离散方程组不动点迭代的终止条件。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 3.8 节 Variability of Expressions 界定 `discrete` 与 `continuous` 的赋值边界。
3. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006 — 第 9 章讨论混合系统的抖动与迟滞建模。
4. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 9 章给出事件迭代与 `noEvent` 的实现细节。
5. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Logical.Hysteresis` 与 `Modelica.Thermal.HeatTransfer`, 2020.
6. Mosterman, P. J. "An Overview of Hybrid Simulation Phenomena and Their Support by Simulation Packages." *HSCC*, 1999.
