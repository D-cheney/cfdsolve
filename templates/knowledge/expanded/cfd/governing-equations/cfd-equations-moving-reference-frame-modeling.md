---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-moving-reference-frame-modeling
title: "移动与旋转参考系：物理建模与适用边界"
summary: "旋转坐标系把动量方程改写为相对速度形式，代价是三项附加加速度。本文给出罗斯贝数与埃克曼数两个独立判据、地转平衡的数值算例、离心项被修正压力吸收的条件，以及分层剪切流的理查森数补充判据。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "移动与旋转参考系"
  - "物理建模与适用边界"
  - "罗斯贝数"
  - "地转平衡"
seo:
  title: "移动与旋转参考系：物理建模与适用边界"
  description: "旋转坐标系把动量方程改写为相对速度形式，代价是三项附加加速度。本文给出罗斯贝数与埃克曼数两个独立判据、地转平衡的数值算例、离心项被修正压力吸收的条件，以及分层剪切流的理查森数补充判据。"
  keywords:
    - "移动与旋转参考系"
    - "物理建模与适用边界"
    - "罗斯贝数"
    - "地转平衡"
---

# 移动与旋转参考系：物理建模与适用边界

在旋转坐标系中写动量方程并不会改变物理，但会把加速度拆成三块，其中两块是坐标系带来的。判断旋转效应是否必须保留，不能只看转速：一台 1450 rpm 的泵和地球大气在同一个判据下会给出完全不同的结论。关键是把旋转效应拆成"惯性力与科氏力之比"和"黏性力与科氏力之比"两个独立的无量纲数，再分别判断。本文给出加速度分解、两个判据的数值算例、地转平衡换算与离心项被压力吸收的条件。

## 旋转坐标系中加速度的完整分解

设旋转坐标系以角速度 $\boldsymbol{\Omega}$ 相对惯性系转动，任一矢量在惯性系中的时间导数与在旋转系中的时间导数满足

$$
\left.\frac{\mathrm{d}\mathbf{A}}{\mathrm{d}t}\right|_{I} = \left.\frac{\mathrm{d}\mathbf{A}}{\mathrm{d}t}\right|_{R} + \boldsymbol{\Omega}\times\mathbf{A}
$$

对位置矢量连续用两次，再代入 $\mathbf{u}_{abs}=\mathbf{u}_{rel}+\boldsymbol{\Omega}\times\mathbf{r}$，得到加速度的完整分解

$$
\mathbf{a}_{abs} = \mathbf{a}_{rel} + 2\boldsymbol{\Omega}\times\mathbf{u}_{rel} + \boldsymbol{\Omega}\times(\boldsymbol{\Omega}\times\mathbf{r}) + \frac{\mathrm{d}\boldsymbol{\Omega}}{\mathrm{d}t}\times\mathbf{r}
$$

四项依次是相对加速度、科氏加速度、离心加速度和欧拉加速度。稳态旋转（$\mathrm{d}\boldsymbol{\Omega}/\mathrm{d}t=0$）时最后一项为零；但启停过程、往复旋转等过程中它不能省，其量级是 $\dot\Omega r$，与角加速度成正比。把四项乘密度后移到右端当作体积力，动量方程就变成相对速度的标准形式。

## 罗斯贝数与埃克曼数：两个独立判据

惯性力与科氏力之比是罗斯贝数，黏性力与科氏力之比是埃克曼数

$$
Ro = \frac{U}{\Omega L},\qquad Ek = \frac{\nu}{\Omega L^2}
$$

两者须分别判断，因为"科氏主导"与"黏性主导"可以同时出现。三个量级差极大的例子：

| 场景 | $\Omega$ (rad/s) | $U$ (m/s) | $L$ (m) | $\nu$ (m²/s) | $Ro$ | $Ek$ |
|---|---|---|---|---|---|---|
| 中纬度天气系统 | $7.292\times10^{-5}$ | 10 | $1.0\times10^6$ | $1.5\times10^{-5}$ | 0.137 | $2.1\times10^{-13}$ |
| 转盘实验水槽 | 1.0 | 0.5 | 0.2 | $1.0\times10^{-6}$ | 2.5 | $2.5\times10^{-5}$ |
| 离心泵叶轮 | 151.84 | 15.18 | 0.1 | $1.0\times10^{-6}$ | 1.00 | $6.6\times10^{-7}$ |

$Ro<1$ 时科氏力超过惯性力，流动趋向二维柱状；$Ro>1$ 时惯性主导，旋转仅作修正。$Ek$ 很小意味着埃克曼层很薄，边界层内外的动量输运被旋转强烈限制。天气系统的 $Ro<1$ 且 $Ek\to0$，正是地转平衡的两个前提；泵叶轮 $Ro=1.00$ 则既不能当地转流也不能当无旋流处理。

## 地转平衡与泰勒—普劳德曼柱

$Ro\ll1$ 且 $Ek\ll1$ 时，动量方程中剩下的主要是科氏力与压力梯度，得到地转平衡

$$
f u_g = -\frac{1}{\rho}\frac{\partial p}{\partial y},\qquad f = 2\Omega\sin\varphi
$$

$\varphi$ 是纬度，$f$ 是科氏参数。取 $\varphi=45^\circ$，$f=2\times7.292\times10^{-5}\times0.7071=1.031\times10^{-4}\ \mathrm{s^{-1}}$。若等压线间隔给出压力梯度 $1\ \mathrm{hPa}/100\ \mathrm{km}=1.0\times10^{-3}\ \mathrm{Pa/m}$，空气密度 $1.2\ \mathrm{kg/m^3}$，则地转风 $u_g=1.0\times10^{-3}/(1.2\times1.031\times10^{-4})=8.08\ \mathrm{m/s}$。8 m/s 可直接与天气图对照，是验证旋转项实现的一个廉价检查。

同一个极限下还有泰勒—普劳德曼定理：$2\boldsymbol{\Omega}\cdot\nabla\mathbf{u}=0$，即沿转轴方向速度不变，流动呈柱状。旋转水槽的"泰勒柱"即是其可视化。其含义是：$Ro<0.1$ 的旋转流动应自动给出二维化结构；若结果出现明显轴向速度变化，多半是科氏项符号写反。

## 离心项什么时候可以被压力吸收

离心加速度可以写成标量势的梯度，因此能被并入修正压力

$$
\mathbf{a}_{cent} = -\nabla\left(\frac{1}{2}\Omega^2 r^2\right),\qquad
p^{*} = p - \frac{1}{2}\rho\Omega^2 r^2
$$

这一步成立的唯一条件是 $\Omega$ 与轴方向在空间上均匀（刚体旋转）。若旋转轴随空间变化（如螺旋桨滑流），$\boldsymbol{\Omega}\times(\boldsymbol{\Omega}\times\mathbf{r})$ 不再是某标量的梯度，吸收就会引入误差，必须作为体积力显式保留。吸收只改变压力的解释，不改变压力梯度：出口压力边界按绝对压力给定时，换算到 $p^{*}$ 要减掉该点的 $\frac{1}{2}\rho\Omega^2r^2$。

用泵叶轮核对一下量级：$\frac{1}{2}\rho\Omega^2r_2^2=0.5\times998.2\times151.84^2\times0.1^2=1.151\times10^5\ \mathrm{Pa}$，即 115.1 kPa；进口半径 0.04 m 处为 $1.151\times10^5\times(0.04/0.1)^2=1.84\times10^4\ \mathrm{Pa}$。两者之差 96.7 kPa 正是前面算出的离心压升，说明吸收这一步在数值上自洽。

## 曲率与分层：理查森数的补充判据

旋转判据只回答"旋转项要不要保留"，不回答"流动是否稳定"。流线弯曲且密度分层时还要看理查森数

$$
Ri = \frac{N^2}{(\partial u/\partial z)^2},\qquad N^2 = -\frac{g}{\rho}\frac{\partial\rho}{\partial z}
$$

取海洋上层 $N^2=1.0\times10^{-4}\ \mathrm{s^{-2}}$（对应浮力周期约 628 s）、流速梯度 $\partial u/\partial z=0.2\ \mathrm{s^{-1}}$，得 $Ri=1.0\times10^{-4}/0.04=2.5\times10^{-3}$。$Ri<0.25$ 是剪切不稳定（开尔文—亥姆霍兹）的经典阈值，这里远低于阈值，说明分层提供的稳定作用压不住剪切，湍流会持续发展。反之 $Ri>1$ 且 $Ro<1$ 时两种稳定机制叠加，各向同性湍流模型会系统性高估混合。

```python
import math
OMEGA_EARTH, NU_AIR, NU_WATER = 7.292e-5, 1.5e-5, 1.0e-6
cases = [
    ("weather",  OMEGA_EARTH,   10.0,  1.0e6, NU_AIR),
    ("rot-tank", 1.0,            0.5,  0.2,   NU_WATER),
    ("pump",     151.84,        15.18, 0.1,   NU_WATER),
]
for name, om, U, L, nu in cases:
    print(f"{name:9s} Ro={U/(om*L):8.3f}  Ek={nu/(om*L*L):.3e}")
# weather   Ro=   0.137  Ek=2.056e-13
# rot-tank  Ro=   2.500  Ek=2.500e-05
# pump      Ro=   1.000  Ek=6.586e-07
f = 2 * OMEGA_EARTH * math.sin(math.radians(45.0))
print(f"f(45deg)={f:.4e} 1/s  ug={1e-3/(1.2*f):.3f} m/s")  # 8.079 m/s
```

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 旋转槽算例中泰勒柱不出现 | 科氏项未生效或符号反了 | 检查 $Ro<0.1$，并验证科氏力方向垂直于 $\boldsymbol{\Omega}$ 与 $\mathbf{u}_{rel}$ |
| 地转风大小与天气图差 10 倍 | 压力梯度单位换算错误（hPa 与 Pa 混用） | 用 $1\ \mathrm{hPa}=100\ \mathrm{Pa}$ 重算，$u_g$ 应在 5～20 m/s 区间 |
| 叶轮出口压力偏高约 115 kPa | 出口压力边界未扣除离心势 | 输出该点 $\frac{1}{2}\rho\Omega^2r^2$，从边界值中减去后重算扬程 |
| 螺旋桨滑流区出现虚假高压带 | 旋转轴空间不均匀时仍把离心项吸收进压力 | 关闭吸收（显式保留离心体积力），比较两组的压力场差异 |
| 强分层剪切流算例保持层流 | 湍流模型未考虑浮力生成项 | 手工算 $Ri=N^2/(\partial u/\partial z)^2$，低于 0.25 时应加入浮力项 |
| 启停算例在角加速度最大处发散 | 忽略欧拉加速度 $\dot\Omega\times\mathbf{r}$ | 输出 $\dot\Omega r$ 与 $\Omega^2 r$ 之比，超过 0.1 就必须显式加入 |

## 参考文献

1. Greenspan H.P., *The Theory of Rotating Fluids*, Cambridge University Press, 1968.
2. Pedlosky J., *Geophysical Fluid Dynamics*, 2nd ed., Springer, 1987.
3. Taylor G.I., "Experiments on the motion of solid bodies in rotating fluids", *Proceedings of the Royal Society A*, 104:213–218, 1923.
4. Tritton D.J., *Physical Fluid Dynamics*, 2nd ed., Oxford University Press, 1988.
