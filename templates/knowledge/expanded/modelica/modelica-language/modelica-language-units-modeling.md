---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-units-modeling
title: "单位、quantity 与 nominal：语言语义与适用边界"
summary: "区分 unit、quantity、displayUnit 与 nominal 四类属性的职责，给出量纲一致性的判定形式与 nominal 决定绝对容差的定量关系，并用管道动压 135.45 Pa 完成一次可核对设置。"
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
  - "单位、quantity 与 nominal"
  - "语言语义与适用边界"
  - "量纲一致性"
  - "nominal 缩放"
seo:
  title: "单位、quantity 与 nominal：语言语义与适用边界"
  description: "区分 unit、quantity、displayUnit 与 nominal 四类属性的职责，给出量纲一致性的判定形式与 nominal 决定绝对容差的定量关系，并用管道动压 135.45 Pa 完成一次可核对设置。"
  keywords:
    - "单位、quantity 与 nominal"
    - "语言语义与适用边界"
    - "量纲一致性"
    - "nominal 缩放"
    - "displayUnit"
---

# 单位、quantity 与 nominal：语言语义与适用边界

`unit` 让编译器在翻译期检查量纲，`quantity` 记录物理量的种类名，`displayUnit` 只影响绘图与结果输出的显示，`nominal` 则是给求解器的量级提示。四者名字相近，职责完全不同：前三者影响正确性判定，最后一个影响数值稳定性。本文给出量纲一致性的判定形式与 nominal 决定绝对容差的定量关系，并用管道动压做一次可核对设置。

## unit 与 quantity 的分工

`unit` 是可参与量纲运算的单位字符串，必须能分解为 SI 基本单位的幂次积；`quantity` 是自由文本，只用于文档与工具提示，不参与任何检查。`Modelica.Units.SI.Pressure` 的定义就是

```modelica
type Pressure = Real(final quantity = "Pressure",
                     final unit = "Pa",
                     displayUnit = "Pa",
                     min = 0);
```

因为 `unit` 是 `final`，所有基于 `SI.Pressure` 声明的变量都自动获得 `Pa` 量纲，不需要逐个重写。自定义变量时若写成 `Real p(unit = "Pa")`，量纲检查同样生效，但丢失了 `quantity` 带来的可读性，也让工具的候选单位列表无法匹配。工程上优先用 `Modelica.Units.SI` 下的类型别名，只在确实需要非 SI 量时退回 `Modelica.Units.NonSI`。

## 量纲一致性的判定形式

一条方程合法的必要条件是两侧量纲相等。把每个基本单位看作独立的基向量，量纲表示为指数向量：

$$[q] = \prod_{i=1}^{7} [u_i]^{e_i}, \qquad [u_i] \in \{\mathrm{m}, \mathrm{kg}, \mathrm{s}, \mathrm{A}, \mathrm{K}, \mathrm{mol}, \mathrm{cd}\}$$

加法与减法要求两侧指数向量完全相同；乘法要求指数相加，除法相减。因此 `v = L + t` 会得到 $[v] = \mathrm{m/s}$ 与 $[\mathrm{m} + \mathrm{s}]$ 不一致的结论，工具报

```text
Error: The units of equations are inconsistent.
       The following units are not consistent: "m" and "s".
```

这类错误在翻译期就被抓住，是 Modelica 相对于纯数值工具最实用的特性之一。需要注意的是，量纲检查只保证单位正确，不保证系数正确：把 $v = L/t$ 写成 $v = 2 L/t$ 量纲完全合法，只能靠数值对照发现。

## nominal 决定求解器的绝对容差

求解器的收敛判据通常是相对的，绝对容差由相对容差与量级提示共同决定：

$$\varepsilon_{abs} = \varepsilon_{rel} \cdot \text{nominal}$$

对压力，取默认 `nominal = 1.0` 与 $\varepsilon_{rel} = 10^{-6}$ 时，绝对容差为 $10^{-6}\ \mathrm{Pa}$；而大气压量级是 $1.0 \times 10^5\ \mathrm{Pa}$，这个容差比物理上需要的精度严了 $10^5$ 倍，结果是步长被无谓地砍小。写成 `nominal = 1.0e5` 后，绝对容差变为 $10^{-6} \times 10^5 = 0.1\ \mathrm{Pa}$，与压力表分辨率相当。

温度也是典型例子：摄氏温标下数值约 $20$，开尔文下约 $293.15$。若 `nominal` 保持默认 $1.0$，绝对容差按 $10^{-6}$ 计算，而温度的物理有意义精度是 $10^{-3}\ \mathrm{K}$ 量级。给温度加 `nominal = 300.0` 能把容差放到合适量级，同时不损失有效数字。

## 带偏移的显示单位

`displayUnit` 只改变显示，不改变内部存储值。对绝对温度，摄氏与开尔文之间是仿射关系：

$$T[\mathrm{K}] = T[^\circ\mathrm{C}] + 273.15$$

因此把 `displayUnit = "degC"` 加到温度变量上，内部仍以 $\mathrm{K}$ 存储和运算，绘图时按上式换算。仿射单位不能参与乘除运算：$\mathrm{degC}$ 的零点不是绝对零度，两段摄氏温度相乘没有物理意义。若把 `displayUnit = "degC"` 误写成 `unit = "degC"`，量纲检查会失效，因为 `degC` 不是纯幂次单位，工具会报单位无法解析或直接跳过检查。

## 管道流动的可核对设置

```modelica
model DuctFlow
  parameter Modelica.Units.SI.Density rho = 1.204 "空气密度 20 摄氏度";
  parameter Modelica.Units.SI.Velocity v = 15.0 "流速";
  parameter Modelica.Units.SI.Pressure p_ref = 101325.0 "参考压力";
  Modelica.Units.SI.Pressure p_dyn(nominal = 1.0e2);
  Modelica.Units.SI.Pressure p_abs(nominal = 1.0e5);
  Modelica.Units.SI.Temperature T(displayUnit = "degC",
                                  nominal = 300.0,
                                  start = 293.15);
equation
  p_dyn = 0.5 * rho * v * v;
  p_abs = p_ref + p_dyn;
  T = 293.15;
end DuctFlow;
```

动压手算：$\rho = 1.204\ \mathrm{kg/m^3}$、$v = 15.0\ \mathrm{m/s}$，$p_{dyn} = 0.5 \times 1.204 \times 15.0^2 = 0.5 \times 1.204 \times 225.0 = 135.45\ \mathrm{Pa}$。绝压 $p_{abs} = 101325.0 + 135.45 = 101460.45\ \mathrm{Pa}$，相对偏差 $135.45/101325.0 = 1.34 \times 10^{-3}$。

量级提示要按各自量级给：$p_{dyn}$ 约 $10^2$，取 `nominal = 1.0e2`；$p_{abs}$ 约 $10^5$，取 `nominal = 1.0e5`。如果两者共用一个 `nominal = 1.0e5`，$p_{dyn}$ 的相对容差被放大到 $10^{-6} \times 10^5/135.45 = 7.4 \times 10^{-4}$，动压的有效位数只剩三位，压差类量会被数值噪声淹没。这条计算说明 nominal 不是越大越安全，而要贴着变量自身的量级。

作为交叉校验，可用声速确认温度设置：$a = \sqrt{\gamma R T} = \sqrt{1.4 \times 287.05 \times 293.15} = 343.23\ \mathrm{m/s}$，马赫数 $Ma = 15.0/343.23 = 0.0437$，属于不可压范围，因此上面用常数密度是自洽的。

## 单位与尺度配置的失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 `The units of equations are inconsistent` | 方程两侧量纲指数向量不等 | 逐个变量打印 `unit` 字符串，核对加法两侧 |
| 单位检查通过但系数差一倍 | 量纲合法而系数错误 | 用解析解或手算值对照，如动压 $135.45\ \mathrm{Pa}$ |
| 步长极小、求解缓慢 | 关键变量缺 `nominal`，绝对容差过严 | 加 `nominal = 1.0e5` 后比较步长与耗时 |
| 压差结果有效位不足 | 共用了偏大的 `nominal` | 给压差量单独设 `nominal = 1.0e2` 后重跑 |
| 绘图显示温度出现 $20$ 而非 $293.15$ | 把 `displayUnit = "degC"` 误写成 `unit = "degC"` | 检查声明，`unit` 必须是纯幂次单位 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4.9 节 Predefined Types 给出 `unit`、`quantity`、`displayUnit` 与 `min` 的语义。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 4.8 节 Attributes 说明 `nominal` 作为求解器量级提示的用途。
3. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Units.SI` 与 `Modelica.Units.NonSI` 包定义, 2020.
4. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 6 章讨论单位检查与量纲分析。
5. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 3 章给出单位声明与 `displayUnit` 的用法。
6. BIPM. *The International System of Units (SI)*, 9th ed. 2019 — 第 2 章列出七个基本单位与导出单位的量纲指数。
