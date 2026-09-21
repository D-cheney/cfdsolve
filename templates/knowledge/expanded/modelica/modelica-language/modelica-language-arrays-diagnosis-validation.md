---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-arrays-diagnosis-validation
title: "数组、切片与向量化方程：结果诊断与可信度验证"
summary: "把数组类故障分成维度不匹配、轴向错误与矩阵病态三类，给出用标量参照实现和残差范数验收向量化方程的方法，并用一个三节点网络完成逆矩阵与条件数手算。"
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
  - "数组、切片与向量化方程"
  - "结果诊断与可信度验证"
  - "条件数"
  - "残差范数"
seo:
  title: "数组、切片与向量化方程：结果诊断与可信度验证"
  description: "把数组类故障分成维度不匹配、轴向错误与矩阵病态三类，给出用标量参照实现和残差范数验收向量化方程的方法，并用一个三节点网络完成逆矩阵与条件数手算。"
  keywords:
    - "数组、切片与向量化方程"
    - "结果诊断与可信度验证"
    - "条件数"
    - "残差范数"
    - "标量参照"
---

# 数组、切片与向量化方程：结果诊断与可信度验证

数组类错误有一个麻烦特性：维度不匹配会在翻译期报错，而轴向写错、乘法符号写错往往能顺利通过检查，只在数值上偏离。可信度验证因此要建立两条独立证据：一条来自标量参照实现的逐元素对照，一条来自矩阵残差与条件数。本文用一个三节点网络的 $3 \times 3$ 方程组把这两条证据都算出来。

## 维度错误的三种不同来源

同样是"维度不对"，来源可能完全不同：

- 声明维度与初值长度不符，例如 `Real T[3] = {1.0, 2.0};`；
- 切片端点算错，`T[2:3]` 与左侧长度为 3 的数组不匹配；
- 矩阵乘法维度不相容，$(3 \times 2)$ 与 $(3 \times 2)$ 无法相乘。

前两类在翻译期报 `Array dimension ... are not equal`，第三类报 `Dimension mismatch in matrix multiplication`。真正危险的是第四类：维度恰好相容但语义错了，例如把 `A .* x` 写成 `A * x`。方阵与向量相乘时两者都合法，结果却相差一个量级。这类错误只能靠数值证据抓。

## 用标量参照实现验证向量化方程

最可靠的验收方式是给同一物理关系写两份实现：一份用数组方程，一份用显式循环的标量方程，然后比较两者。差异用相对 $L_2$ 范数度量：

$$\varepsilon_{rel} = \frac{\lVert \mathbf{T}_{vec} - \mathbf{T}_{scalar} \rVert_2}{\lVert \mathbf{T}_{scalar} \rVert_2}$$

对长度为 $n$ 的向量，$\lVert \mathbf{v} \rVert_2 = \sqrt{\sum_i v_i^2}$。翻译器对数组方程的展开是逐元素的，因此两份实现应在机器精度内一致，$\varepsilon_{rel} < 10^{-12}$。若 $\varepsilon_{rel}$ 落在 $10^{-3}$ 量级，几乎可以断定是乘法符号或轴向错误，而不是浮点舍入。

## 轴向错误：sum 与 size 的陷阱

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

## 矩阵条件数与残差的双重验收

线性方程组 $\mathbf{G}\mathbf{T} = \mathbf{q}$ 的解可信度由条件数决定：

$$\kappa(\mathbf{G}) = \lVert \mathbf{G} \rVert_2 \lVert \mathbf{G}^{-1} \rVert_2 = \frac{\lambda_{max}}{\lambda_{min}}$$

条件数放大输入扰动：相对误差的上界约为 $\kappa(\mathbf{G}) \cdot \varepsilon_{machine}$。双精度下 $\varepsilon_{machine} \approx 2.2 \times 10^{-16}$，$\kappa = 5.828$ 时解的有效位数约 15 位，非常安全。作为第二条证据，还要检查残差：

$$\lVert \mathbf{G}\mathbf{T} - \mathbf{q} \rVert_\infty < \tau_{res}$$

残差小并不等于解正确（病态矩阵可以给出小残差的错误解），但残差大一定说明解算失败。两条证据必须同时成立才能关闭结论。

## 三节点网络的逐项手算

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

## 失效信号与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 向量化解与标量参照 $\varepsilon_{rel} \approx 10^{-3}$ | `.*` 与 `*` 混用 | 把乘法显式改成 `.*`，看 $\varepsilon_{rel}$ 是否降到 $10^{-12}$ 以下 |
| `Array dimension 3 and 2 are not equal` | 切片端点或初值长度写错 | 用 `size()` 打印两侧长度，核对 `end` 偏移 |
| `sum(A, 1)` 结果形状与预期不符 | 混淆全元素求和与按轴归约 | 对 $3 \times 3$ 阵检查：全和为 $2.0$，按轴为长度 3 向量 |
| 残差 $< 10^{-10}$ 但节点数增加后解跳变 | 矩阵条件数随规模上升 | 计算 $\kappa$ 与 $1/\kappa$，比较可用有效位数 |
| 组件数组连接报 `Index out of bounds` | `for` 上界与数组长度不一致 | 检查循环范围是否写成 `1:N` 而数组是 `[N-1]` |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 10 章 Arrays 定义 `sum`、`size`、`ndims` 与按轴归约语义。
2. Golub, G. H., Van Loan, C. F. *Matrix Computations*, 4th ed. Johns Hopkins University Press, 2013 — 第 2.6 节给出条件数与误差放大的界。
3. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 6 章讨论数组方程展开与标量等价性。
4. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 8 章用组件数组构造网络并校验展开结果。
5. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Math.Matrices.solve` 与 `Modelica.Math.Matrices.LU`, 2020.
6. Higham, N. J. *Accuracy and Stability of Numerical Algorithms*, 2nd ed. SIAM, 2002 — 第 1 章讨论残差与后向误差的区别。
