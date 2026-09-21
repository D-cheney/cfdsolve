---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-functions-modeling
title: "纯函数与算法段：语言语义与适用边界"
summary: "说明纯函数的三条硬约束、algorithm 段与 equation 段的边界、derivative 与 Inline 注解的作用，并用 Sutherland 黏度律完成 293.15 K 下 1.813e-5 Pa·s 的手算核对。"
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
  - "纯函数与算法段"
  - "语言语义与适用边界"
  - "derivative 注解"
  - "Sutherland 黏度律"
seo:
  title: "纯函数与算法段：语言语义与适用边界"
  description: "说明纯函数的三条硬约束、algorithm 段与 equation 段的边界、derivative 与 Inline 注解的作用，并用 Sutherland 黏度律完成 293.15 K 下 1.813e-5 Pa·s 的手算核对。"
  keywords:
    - "纯函数与算法段"
    - "语言语义与适用边界"
    - "derivative 注解"
    - "Sutherland 黏度律"
    - "Inline 注解"
---

# 纯函数与算法段：语言语义与适用边界

`function` 是 Modelica 里唯一允许按顺序执行的构造，它把"多输入单输出"的确定性计算封装起来供方程段调用。用得好，物性关联式可以像初等函数一样参与符号求导；用错，工具只能退回数值差分，求解速度与精度同时下降。本文给出纯函数的约束、algorithm 段与 equation 段的边界，并用 Sutherland 黏度律做一次可核对的手算。

## 函数与模型的分工

`model` 描述的是方程集合，`function` 描述的是计算过程。区别体现在三处：函数只有 `input` 与 `output`，没有跨时间的状态；函数体内不能写 `der()`、`pre()` 或 `when`；函数调用出现在方程右端时，编译器把它当作一个可求值的表达式，而不是一组待配平的关系。

正因为函数是表达式，它不参与结构平衡计数。`mu = sutherlandViscosity(T);` 只贡献一条方程、一个未知量，函数内部的局部变量在调用点被消去。这条性质让函数成为封装经验关联式的首选形式，也让函数内部的状态泄漏成为最隐蔽的一类错误。

## 纯函数的三条硬约束

纯函数要求输出只由输入决定：

$$y = f(u), \qquad f(u_1) = f(u_2) \Rightarrow u_1 = u_2 \text{ 的映射唯一}$$

由此推出三条约束。第一，函数体内不得引用 `time`、`sample()` 等全局量；需要随机数时必须显式声明 `impure function`，例如 MSL 的 `Modelica.Math.Random.Utilities.impureRandom`。第二，函数不得修改输入或外部变量，所有中间量放在 `protected` 段。第三，函数在给定输入下必须终止，`while` 循环要写可证明的退出条件。

违反第一条约后果最严重：工具无法把函数当作纯表达式，符号求导会失败，事件检测也可能漏掉。判定方法是搜索函数体里是否出现 `time`，若出现且没有 `impure` 前缀，翻译器会报 `Function is not pure` 或给出求导警告。

## algorithm 段与 equation 段的互不越界

`algorithm` 段用 `:=` 顺序赋值，`equation` 段用 `=` 声明关系。两者不能混在同一个类里描述同一个物理量。函数体必须用 `algorithm`，模型主体必须用 `equation`。

`algorithm` 段里的 `if` 是分支执行，只走一条路径；`equation` 段里的 `if` 表达式会保留两条路径并生成条件方程。把带 `if` 的物理关系写成 `algorithm` 会丢掉另一条路径的方程，使模型欠定。反过来，把顺序依赖的迭代过程写成 `equation` 会得到代数环。判定方法还是那句操作：交换两条语句，物理含义改变的是算法，不变的是方程。

## 用 derivative 注解保住符号导数

函数被求导时，工具默认走数值差分，代价是每个时间步多出若干次函数求值。提供 `derivative` 注解可以恢复符号求导：

$$\frac{d}{dt} y = \frac{\partial f}{\partial u} \frac{du}{dt}$$

下面这个二次型函数给出了完整的注解写法。$y = 0.5u^2$ 的导数应为 $\dot{y} = u\dot{u}$，可以直接核对。

```modelica
function squareLaw
  input Real u;
  output Real y;
algorithm
  y := 0.5 * u * u;
  annotation(Inline = true, derivative = squareLaw_der);
end squareLaw;

function squareLaw_der
  input Real u;
  input Real du;
  output Real dy;
algorithm
  dy := u * du;
end squareLaw_der;
```

`Inline = true` 建议编译器把函数体内联到调用点，省掉调用开销；`smoothOrder` 用于声明函数的光滑阶数，$f \in C^{k}$ 表示前 $k$ 阶导数连续。若 `smoothOrder` 声明过高而实际函数在分段点处不可导，事件的收敛阶会下降，表现为步长被反复砍小。

## Sutherland 黏度函数的可核对算例

空气动力黏度常用 Sutherland 律：

$$\mu(T) = \mu_{ref}\left(\frac{T}{T_{ref}}\right)^{3/2}\frac{T_{ref}+S}{T+S}$$

其中 $\mu_{ref} = 1.716 \times 10^{-5}\ \mathrm{Pa{\cdot}s}$、$T_{ref} = 273.15\ \mathrm{K}$、$S = 110.4\ \mathrm{K}$。把常数写成带默认值的输入，既保持函数纯净，又允许调用方覆盖：

```modelica
function sutherlandViscosity
  input Modelica.Units.SI.Temperature T;
  input Modelica.Units.SI.DynamicViscosity mu_ref = 1.716e-5;
  input Modelica.Units.SI.Temperature T_ref = 273.15;
  input Modelica.Units.SI.Temperature S = 110.4;
  output Modelica.Units.SI.DynamicViscosity mu;
algorithm
  mu := mu_ref * (T / T_ref) ^ 1.5 * (T_ref + S) / (T + S);
  annotation(Inline = true, smoothOrder = 10);
end sutherlandViscosity;
```

取 $T = 293.15\ \mathrm{K}$ 手算：温度比 $293.15/273.15 = 1.07322$，$1.07322^{1.5} = 1.11179$；第二项 $(273.15 + 110.4)/(293.15 + 110.4) = 383.55/403.55 = 0.95044$。两者相乘得 $1.05669$，于是

$$\mu = 1.716 \times 10^{-5} \times 1.05669 = 1.813 \times 10^{-5}\ \mathrm{Pa{\cdot}s}$$

取 $20\ ^\circ\mathrm{C}$ 空气密度 $\rho = 1.204\ \mathrm{kg/m^3}$，运动黏度 $\nu = \mu/\rho = 1.813 \times 10^{-5}/1.204 = 1.506 \times 10^{-5}\ \mathrm{m^2/s}$。这两个值与标准物性表一致，可作为函数实现的验收点。若函数被写成 `(T/T_ref)^2`，同温下会得到 $1.932 \times 10^{-5}\ \mathrm{Pa{\cdot}s}$，偏差约 $6.6\%$，足以被这一对照抓住。

## 失效信号与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 `Function is not pure` | 函数体引用了 `time` 或全局状态却未声明 `impure` | 搜索 `time`，或把随机源改为显式输入 |
| 求解步长被反复砍小、耗时翻倍 | 未给 `derivative` 注解，导数走数值差分 | 补上 `derivative = xxx_der` 后比较函数求值次数 |
| 某温度下黏度出现折角 | `smoothOrder` 声明高于实际光滑性 | 在折角两侧各取一点做二阶差分，检查导数跳变 |
| 函数输出在某些输入下保持上一步值 | `algorithm` 中 `if` 分支未覆盖全部路径 | 枚举所有分支条件，确认每条路径都赋值输出 |
| 调用函数后模型欠定 | 把物理关系写进 `algorithm` 丢了条件方程 | 把该段改写为 `equation` 中的 `if` 表达式 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 12 章 Functions 规定 `input`、`output`、`protected` 与 `impure` 的语义。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 12.7 节 Function Derivatives 给出 `derivative` 注解与链式法则的绑定方式。
3. Sutherland, W. "The Viscosity of Gases and Molecular Force." *Philosophical Magazine*, 36(223), 1893, pp. 507–531.
4. White, F. M. *Viscous Fluid Flow*, 3rd ed. McGraw-Hill, 2006 — 第 1 章给出空气 Sutherland 常数 $\mu_{ref}$、$T_{ref}$、$S$。
5. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 7 章讨论函数与外部函数的求导。
6. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Math.Random.Utilities.impureRandom` 与 `Modelica.Media.Interfaces.PartialMedium`, 2020.
