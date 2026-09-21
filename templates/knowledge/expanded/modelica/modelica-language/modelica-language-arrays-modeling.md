---
template_version: flowlab-knowledge/1.0
slug: modelica-language-arrays-modeling
title: 数组、切片与向量化方程：原理与诊断验证
summary: 讲清数组维度在声明处确定、向量化方程按元素展开、切片与 end 的维度保持规则，以及用 for 方程连接组件数组的写法，并给出一维热链的稳态与时间常数手算。
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
  - 数组、切片与向量化方程
  - 语言语义与适用边界
  - 向量化方程
  - 切片
  - 结果诊断与可信度验证
  - 条件数
  - 残差范数
seo:
  title: 数组、切片与向量化方程：原理与诊断验证
  description: >-
    讲清数组维度在声明处确定、向量化方程按元素展开、切片与 end 的维度保持规则，以及用 for
    方程连接组件数组的写法，并给出一维热链的稳态与时间常数手算。
  keywords:
    - 数组、切片与向量化方程
    - 语言语义与适用边界
    - 向量化方程
    - 切片
    - for 方程
    - 结果诊断与可信度验证
    - 条件数
    - 残差范数
    - 标量参照
---
# 数组、切片与向量化方程：原理与诊断验证

Modelica 的数组不是容器语法糖，它参与方程计数：一条数组方程会被展开成与维度同阶的多条标量方程。写错维度不会得到运行时异常，而是得到翻译期的维度不匹配或一条悄悄改变自由度的隐式方程。数组类错误有一个麻烦特性：维度不匹配会在翻译期报错，而轴向写错、乘法符号写错往往能顺利通过检查，只在数值上偏离。可信度验证因此要建立两条独立证据：一条来自标量参照实现的逐元素对照，一条来自矩阵残差与条件数。

## 基础概念与控制关系

### 向量化方程的展开规则

把数组方程写成 `A * x = b` 时，工具按左值维度展开。若 $\mathbf{A}$ 是 $n \times n$、$\mathbf{x}$ 与 $\mathbf{b}$ 是长度 $n$ 的向量，这一行产生 $n$ 条标量方程：

$$\mathbf{A}\mathbf{x} = \mathbf{b} \;\Longleftrightarrow\; \sum_{j=1}^{n} A_{ij} x_j = b_i, \quad i = 1, \dots, n$$

方程计数必须按展开后的条数统计。写 `der(T) = f(T)` 而 `T` 长度为 5 时，它贡献 5 条方程和 5 个未知量，配平关系不变，但源码只有一行。这一点是数组建模的主要收益，也是误判自由度的主要来源：阅读源码数等号会严重低估方程数。

### 用 for 方程连接组件数组

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

### 维度在声明处确定

数组维度必须是可在编译期求值的表达式，通常来自 `parameter` 或 `constant`：

```modelica
parameter Integer N = 5 "节点数";
parameter Modelica.Units.SI.ThermalConductance G = 20.0;
Real T[N](each start = 293.15, each fixed = true);
```

`N = 5` 是参数，因此 `T[N]` 的维度在翻译期就固定，工具可以据此展开方程并分配内存。若维度依赖普通 `Real`，会报 `Array dimension is not a parameter expression`。`[:]` 形式把维度交给初值推断，例如 `parameter Real w[:] = {1.0, 2.0, 3.0};` 得到长度为 3 的向量；一旦初值不是参数表达式，推断同样失败。

### 切片、end 与维度保持

`T[2:4]` 取长度为 3 的切片，`T[:]` 取整条向量，`T[end]` 取最后一个元素、`T[end-1]` 取倒数第二个。切片在赋值两侧的维度必须一致，规则是矩阵乘法的维度相容条件：

$$(m \times k) \cdot (k \times p) \longrightarrow (m \times p)$$

`A * x` 中 $\mathbf{A}$ 为 $3 \times 2$、$\mathbf{x}$ 为长度 2 时结果为长度 3；而 `A .* x` 是逐元素乘法，要求两者维度完全相同。把 `.*` 误写成 `*` 是最常见的一类错误，因为两者在方阵情形下都能通过维度检查，但数值完全不同：单位阵与向量相乘保持原值，逐元素相乘则按位置缩放。

### 一维热链的稳态与时间常数

取 $G = 20.0\ \mathrm{W/K}$，每段热阻 $R = 1/G = 0.05\ \mathrm{K/W}$；$N = 5$ 个节点之间有 4 段，节点 1 到环境的总热阻 $R_{tot} = 4 \times 0.05 = 0.2\ \mathrm{K/W}$。注入功率 $Q = 50.0\ \mathrm{W}$、环境温度 $T_{amb} = 293.15\ \mathrm{K}$ 时，稳态温度按串联热阻分配：

$$T_1 = T_{amb} + Q R_{tot} = 293.15 + 50.0 \times 0.2 = 303.15\ \mathrm{K}$$

末端节点只剩一段热阻，$T_5 = 293.15 + 50.0 \times 0.05 = 295.65\ \mathrm{K}$。热容总量 $C_{tot} = 5 \times 100.0 = 500.0\ \mathrm{J/K}$，主导时间常数按集总估算

$$\tau \approx R_{tot} C_{tot} = 0.2 \times 500.0 = 100\ \mathrm{s}$$

仿真到 $t = 100\ \mathrm{s}$ 时节点 1 应达到稳态增量的约 63%，即 $293.15 + 0.63 \times 10.0 \approx 299.45\ \mathrm{K}$。这三个数与稳态解一起构成不依赖基准文件的验收点。向量化方程在这里的作用很具体：$N$ 个 `HeatCapacitor` 各贡献一条 $C\,dT_i/dt$ 方程，共 5 条，全部由一行组件声明隐式给出。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 向量化解与标量参照 $\varepsilon_{rel} \approx 10^{-3}$ | `.*` 与 `*` 混用 | 把乘法显式改成 `.*`，看 $\varepsilon_{rel}$ 是否降到 $10^{-12}$ 以下 |
| `Array dimension 3 and 2 are not equal` | 切片端点或初值长度写错 | 用 `size()` 打印两侧长度，核对 `end` 偏移 |
| `sum(A, 1)` 结果形状与预期不符 | 混淆全元素求和与按轴归约 | 对 $3 \times 3$ 阵检查：全和为 $2.0$，按轴为长度 3 向量 |
| 残差 $< 10^{-10}$ 但节点数增加后解跳变 | 矩阵条件数随规模上升 | 计算 $\kappa$ 与 $1/\kappa$，比较可用有效位数 |
| 组件数组连接报 `Index out of bounds` | `for` 上界与数组长度不一致 | 检查循环范围是否写成 `1:N` 而数组是 `[N-1]` |

### 维度错误的典型信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Array dimension 3 and 2 are not equal` | 切片长度与赋值左侧不一致 | 打印两侧的 `size()` 结果，核对切片端点 |
| 方阵工况结果正确、非方阵报维度错 | `.*` 与 `*` 混用 | 把逐元素乘法显式写成 `.*` 后重跑 |
| `Index out of bounds` 出现在 `link[i]` | 循环上界用了 `N` 而数组长度是 `N - 1` | 把范围改成 `1:N - 1`，或给数组加 `[N]` |
| 方程计数比手算多出 $n$ 条 | 数组方程按元素展开，被当成一行统计 | 用 `--dump` 查看展开后的方程列表 |
| `Array dimension is not a parameter expression` | 维度引用了普通 `Real` | 把维度来源改成 `parameter` 或 `constant` |

### 维度错误的三种不同来源

同样是"维度不对"，来源可能完全不同：

- 声明维度与初值长度不符，例如 `Real T[3] = {1.0, 2.0};`；
- 切片端点算错，`T[2:3]` 与左侧长度为 3 的数组不匹配；
- 矩阵乘法维度不相容，$(3 \times 2)$ 与 $(3 \times 2)$ 无法相乘。

前两类在翻译期报 `Array dimension ... are not equal`，第三类报 `Dimension mismatch in matrix multiplication`。真正危险的是第四类：维度恰好相容但语义错了，例如把 `A .* x` 写成 `A * x`。方阵与向量相乘时两者都合法，结果却相差一个量级。这类错误只能靠数值证据抓。

### 轴向错误：sum 与 size 的陷阱

`sum` 的默认行为是求和全部元素，带 `dim` 参数才按轴归约。对一个 $3 \times 3$ 矩阵 $\mathbf{G}$，三种写法给出完全不同的量：

```modelica
model SumAxes
  parameter Real G[3, 3] = [2.0, -1.0, 0.0; -1.0, 2.0, -1.0; 0.0, -1.0, 2.0];
  Real s_all;
  Real s_col[3];
  Real s_row[3];
equation
  s_all = sum(G);
  s_col = sum(G, 1);
  s_row = sum(G, 2);
end SumAxes;
```

$\mathbf{G}$ 的九个元素之和为 $2.0$；按列归约得 $[1.0, 0.0, 1.0]$，按行归约同样是 $[1.0, 0.0, 1.0]$（该矩阵对称）。把 `sum(G, 1)` 误写成 `sum(G)` 时，返回的是标量 $2.0$ 而非长度为 3 的向量，赋值给 `s_col` 会直接报维度错误——这是轴向错误中唯一会被抓住的情形。若左右两侧维度恰好都是标量，错误就会静默通过。

## 验证、验收与复现

### 三节点网络的逐项手算

取三节点导热网络的电导矩阵与热流向量，注意 $\mathbf{G}$ 是对称三对角阵：

```modelica
model GridNetwork
  parameter Real Gmat[3, 3] = [2.0, -1.0, 0.0;
                               -1.0, 2.0, -1.0;
                                0.0, -1.0, 2.0];
  parameter Real q[3] = {10.0, 0.0, 0.0};
  Real T[3];
equation
  Gmat * T = q;
end GridNetwork;
```

$\det(\mathbf{G}) = 2.0 \times (2.0 \times 2.0 - 1.0) - (-1.0) \times (-1.0 \times 2.0) = 6.0 - 2.0 = 4.0$。伴随矩阵为 $[[3.0, 2.0, 1.0], [2.0, 4.0, 2.0], [1.0, 2.0, 3.0]]$，逆矩阵为它除以 4.0，即 $[[0.75, 0.5, 0.25], [0.5, 1.0, 0.5], [0.25, 0.5, 0.75]]$。解为 $\mathbf{T} = \mathbf{G}^{-1}\mathbf{q} = [7.5, 5.0, 2.5]$。

回代校验：第一行 $2.0 \times 7.5 - 1.0 \times 5.0 = 10.0$；第二行 $-7.5 + 2.0 \times 5.0 - 2.5 = 0.0$；第三行 $-5.0 + 2.0 \times 2.5 = 0.0$，残差为 $0.0$，与右端项完全一致。

条件数用三对角阵的特征值公式 $\lambda_k = 2 - 2\cos(k\pi/4)$ 计算：$\lambda_{min} = 2 - 2\cos(45°) = 0.5858$，$\lambda_{max} = 2 - 2\cos(135°) = 3.4142$，$\kappa = 3.4142/0.5858 = 5.828$。这一结果说明三节点网络数值良态，解的有效位数充足；若把节点数增加到 100，$\lambda_{min}$ 会降到约 $9.7 \times 10^{-4}$，$\kappa$ 升到约 $4.1 \times 10^3$，此时就必须改用带部分主元的 `Modelica.Math.Matrices.solve` 而不是显式求逆。

### 用标量参照实现验证向量化方程

最可靠的验收方式是给同一物理关系写两份实现：一份用数组方程，一份用显式循环的标量方程，然后比较两者。差异用相对 $L_2$ 范数度量：

$$\varepsilon_{rel} = \frac{\lVert \mathbf{T}_{vec} - \mathbf{T}_{scalar} \rVert_2}{\lVert \mathbf{T}_{scalar} \rVert_2}$$

对长度为 $n$ 的向量，$\lVert \mathbf{v} \rVert_2 = \sqrt{\sum_i v_i^2}$。翻译器对数组方程的展开是逐元素的，因此两份实现应在机器精度内一致，$\varepsilon_{rel} < 10^{-12}$。若 $\varepsilon_{rel}$ 落在 $10^{-3}$ 量级，几乎可以断定是乘法符号或轴向错误，而不是浮点舍入。

### 矩阵条件数与残差的双重验收

线性方程组 $\mathbf{G}\mathbf{T} = \mathbf{q}$ 的解可信度由条件数决定：

$$\kappa(\mathbf{G}) = \lVert \mathbf{G} \rVert_2 \lVert \mathbf{G}^{-1} \rVert_2 = \frac{\lambda_{max}}{\lambda_{min}}$$

条件数放大输入扰动：相对误差的上界约为 $\kappa(\mathbf{G}) \cdot \varepsilon_{machine}$。双精度下 $\varepsilon_{machine} \approx 2.2 \times 10^{-16}$，$\kappa = 5.828$ 时解的有效位数约 15 位，非常安全。作为第二条证据，还要检查残差：

$$\lVert \mathbf{G}\mathbf{T} - \mathbf{q} \rVert_\infty < \tau_{res}$$

残差小并不等于解正确（病态矩阵可以给出小残差的错误解），但残差大一定说明解算失败。两条证据必须同时成立才能关闭结论。

## 参考资料

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 10 章 Arrays 给出维度推断、切片与 `end` 的规则。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 8.3 节 For Equations 规定 for 方程的展开语义。
3. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 6 章讨论数组运算与向量化方程。
4. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 8 章用组件数组构建传热与电气链。
5. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Thermal.HeatTransfer.Components.HeatCapacitor` 与 `ThermalConductor`, 2020.
6. Elmqvist, H., Otter, M., Cellier, F. E. "Inline Integration: A New Mixed Symbolic/Numeric Approach." *ESS*, 1995.
7. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 10 章 Arrays 定义 `sum`、`size`、`ndims` 与按轴归约语义。
8. Golub, G. H., Van Loan, C. F. *Matrix Computations*, 4th ed. Johns Hopkins University Press, 2013 — 第 2.6 节给出条件数与误差放大的界。
9. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 6 章讨论数组方程展开与标量等价性。
10. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 8 章用组件数组构造网络并校验展开结果。
11. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Math.Matrices.solve` 与 `Modelica.Math.Matrices.LU`, 2020.
12. Higham, N. J. *Accuracy and Stability of Numerical Algorithms*, 2nd ed. SIAM, 2002 — 第 1 章讨论残差与后向误差的区别。
