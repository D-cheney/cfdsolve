---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-arrays-modeling
title: "数组、切片与向量化方程：语言语义与适用边界"
summary: "讲清数组维度在声明处确定、向量化方程按元素展开、切片与 end 的维度保持规则，以及用 for 方程连接组件数组的写法，并给出一维热链的稳态与时间常数手算。"
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
  - "数组、切片与向量化方程"
  - "语言语义与适用边界"
  - "向量化方程"
  - "切片"
seo:
  title: "数组、切片与向量化方程：语言语义与适用边界"
  description: "讲清数组维度在声明处确定、向量化方程按元素展开、切片与 end 的维度保持规则，以及用 for 方程连接组件数组的写法，并给出一维热链的稳态与时间常数手算。"
  keywords:
    - "数组、切片与向量化方程"
    - "语言语义与适用边界"
    - "向量化方程"
    - "切片"
    - "for 方程"
---

# 数组、切片与向量化方程：语言语义与适用边界

Modelica 的数组不是容器语法糖，它参与方程计数：一条数组方程会被展开成与维度同阶的多条标量方程。写错维度不会得到运行时异常，而是得到翻译期的维度不匹配或一条悄悄改变自由度的隐式方程。本文说明维度在何处确定、向量化如何展开、切片如何保持维度，并用一维热链给出可手算的稳态与时间常数。

## 维度在声明处确定

数组维度必须是可在编译期求值的表达式，通常来自 `parameter` 或 `constant`：

```modelica
parameter Integer N = 5 "节点数";
parameter Modelica.Units.SI.ThermalConductance G = 20.0;
Real T[N](each start = 293.15, each fixed = true);
```

`N = 5` 是参数，因此 `T[N]` 的维度在翻译期就固定，工具可以据此展开方程并分配内存。若维度依赖普通 `Real`，会报 `Array dimension is not a parameter expression`。`[:]` 形式把维度交给初值推断，例如 `parameter Real w[:] = {1.0, 2.0, 3.0};` 得到长度为 3 的向量；一旦初值不是参数表达式，推断同样失败。

## 向量化方程的展开规则

把数组方程写成 `A * x = b` 时，工具按左值维度展开。若 $\mathbf{A}$ 是 $n \times n$、$\mathbf{x}$ 与 $\mathbf{b}$ 是长度 $n$ 的向量，这一行产生 $n$ 条标量方程：

$$\mathbf{A}\mathbf{x} = \mathbf{b} \;\Longleftrightarrow\; \sum_{j=1}^{n} A_{ij} x_j = b_i, \quad i = 1, \dots, n$$

方程计数必须按展开后的条数统计。写 `der(T) = f(T)` 而 `T` 长度为 5 时，它贡献 5 条方程和 5 个未知量，配平关系不变，但源码只有一行。这一点是数组建模的主要收益，也是误判自由度的主要来源：阅读源码数等号会严重低估方程数。

## 切片、end 与维度保持

`T[2:4]` 取长度为 3 的切片，`T[:]` 取整条向量，`T[end]` 取最后一个元素、`T[end-1]` 取倒数第二个。切片在赋值两侧的维度必须一致，规则是矩阵乘法的维度相容条件：

$$(m \times k) \cdot (k \times p) \longrightarrow (m \times p)$$

`A * x` 中 $\mathbf{A}$ 为 $3 \times 2$、$\mathbf{x}$ 为长度 2 时结果为长度 3；而 `A .* x` 是逐元素乘法，要求两者维度完全相同。把 `.*` 误写成 `*` 是最常见的一类错误，因为两者在方阵情形下都能通过维度检查，但数值完全不同：单位阵与向量相乘保持原值，逐元素相乘则按位置缩放。

## 用 for 方程连接组件数组

组件数组的声明形式为 `Component comp[N]`，每个元素是独立实例。连接它们时用 `for` 方程，而不是手写 N 条 `connect`：

```modelica
model ThermalChain
  parameter Integer N = 5 "节点数";
  parameter Modelica.Units.SI.ThermalConductance G = 20.0;
  parameter Modelica.Units.SI.HeatCapacity C = 100.0;
  Modelica.Thermal.HeatTransfer.Components.HeatCapacitor cap[N](each C = C);
  Modelica.Thermal.HeatTransfer.Components.ThermalConductor link[N - 1](each G = G);
  Modelica.Thermal.HeatTransfer.Sources.FixedTemperature amb(T = 293.15);
  Modelica.Thermal.HeatTransfer.Sources.PrescribedHeatFlow src;
  Modelica.Blocks.Sources.Constant Q0(k = 50.0);
equation
  connect(Q0.y, src.Q_flow);
  connect(src.port, cap[1].port);
  for i in 1:N - 1 loop
    connect(cap[i].port, link[i].port_a);
    connect(link[i].port_b, cap[i + 1].port);
  end for;
  connect(cap[N].port, amb.port);
end ThermalChain;
```

`for` 方程在翻译期展开，`N = 5` 时产生 4 组、共 8 条 `connect`，等价于手写 8 行连接语句。`link[N - 1]` 的维度由参数表达式 `N - 1` 得出，长度 4，与循环范围一致。若把循环写成 `1:N`，`link[5]` 越界，报 `Index out of bounds`。

## 一维热链的稳态与时间常数

取 $G = 20.0\ \mathrm{W/K}$，每段热阻 $R = 1/G = 0.05\ \mathrm{K/W}$；$N = 5$ 个节点之间有 4 段，节点 1 到环境的总热阻 $R_{tot} = 4 \times 0.05 = 0.2\ \mathrm{K/W}$。注入功率 $Q = 50.0\ \mathrm{W}$、环境温度 $T_{amb} = 293.15\ \mathrm{K}$ 时，稳态温度按串联热阻分配：

$$T_1 = T_{amb} + Q R_{tot} = 293.15 + 50.0 \times 0.2 = 303.15\ \mathrm{K}$$

末端节点只剩一段热阻，$T_5 = 293.15 + 50.0 \times 0.05 = 295.65\ \mathrm{K}$。热容总量 $C_{tot} = 5 \times 100.0 = 500.0\ \mathrm{J/K}$，主导时间常数按集总估算

$$\tau \approx R_{tot} C_{tot} = 0.2 \times 500.0 = 100\ \mathrm{s}$$

仿真到 $t = 100\ \mathrm{s}$ 时节点 1 应达到稳态增量的约 63%，即 $293.15 + 0.63 \times 10.0 \approx 299.45\ \mathrm{K}$。这三个数与稳态解一起构成不依赖基准文件的验收点。向量化方程在这里的作用很具体：$N$ 个 `HeatCapacitor` 各贡献一条 $C\,dT_i/dt$ 方程，共 5 条，全部由一行组件声明隐式给出。

## 维度错误的典型信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Array dimension 3 and 2 are not equal` | 切片长度与赋值左侧不一致 | 打印两侧的 `size()` 结果，核对切片端点 |
| 方阵工况结果正确、非方阵报维度错 | `.*` 与 `*` 混用 | 把逐元素乘法显式写成 `.*` 后重跑 |
| `Index out of bounds` 出现在 `link[i]` | 循环上界用了 `N` 而数组长度是 `N - 1` | 把范围改成 `1:N - 1`，或给数组加 `[N]` |
| 方程计数比手算多出 $n$ 条 | 数组方程按元素展开，被当成一行统计 | 用 `--dump` 查看展开后的方程列表 |
| `Array dimension is not a parameter expression` | 维度引用了普通 `Real` | 把维度来源改成 `parameter` 或 `constant` |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 10 章 Arrays 给出维度推断、切片与 `end` 的规则。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 8.3 节 For Equations 规定 for 方程的展开语义。
3. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 6 章讨论数组运算与向量化方程。
4. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 8 章用组件数组构建传热与电气链。
5. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Thermal.HeatTransfer.Components.HeatCapacitor` 与 `ThermalConductor`, 2020.
6. Elmqvist, H., Otter, M., Cellier, F. E. "Inline Integration: A New Mixed Symbolic/Numeric Approach." *ESS*, 1995.
